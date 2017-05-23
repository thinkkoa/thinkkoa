/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/5/2
 */

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const crypto = require('crypto');
const mime = require('mime-types');
const compressible = require('compressible');
const lib = require('../util/lib.js');

const safeDecodeURIComponent = function (text) {
    try {
        return decodeURIComponent(text);
    } catch (e) {
        return text;
    }
};

/**
 * load file and add file content to cache
 *
 * @param {String} name
 * @param {String} dir
 * @param {Object} option
 * @param {Object} files
 * @return {Object}
 * @api private
 */

const loadFile = function (name, dir, option, files) {
    let pathname = path.normalize(path.join(option.prefix, name));
    let obj = files[pathname] = files[pathname] ? files[pathname] : {};
    let filename = obj.path = path.join(dir, name);
    let stats = fs.statSync(filename);
    let buffer = fs.readFileSync(filename);

    obj.maxAge = obj.maxAge ? obj.maxAge : option.maxAge || 0;
    obj.type = obj.mime = mime.lookup(pathname) || 'application/octet-stream';
    obj.mtime = stats.mtime;
    obj.length = stats.size;
    obj.md5 = crypto.createHash('md5').update(buffer).digest('base64');

    if (option.buffer) {
        obj.buffer = buffer;
    }

    buffer = null;
    return obj;
};

/**
 * options = {
 *    prefix: '/static',
 *    gzip: true,
 *    filter: [Function],
 *    maxAge: 30,
 *    buffer: ...,
 *    alias: {key: value}, 
 *    preload: false
 * }
 * @param {any} options 
 * @returns 
 */
module.exports = function (options) {
    options = options || {};

    // prefix must be ASCII code
    options.prefix = (options.prefix || '').replace(/\/*$/, '/');
    // custom files list
    let files = options.files || Object.create(null);
    let filePrefix = path.normalize(options.prefix.replace(/^\//, ''));

    // option.filter
    let fileFilter = function () {
        return true;
    };
    if (typeof options.filter === 'function') {
        fileFilter = options.filter;
    }
    if (Array.isArray(options.filter)) {
        fileFilter = function (file) {
            return ~options.filter.indexOf(file);
        };
    }
    // static path
    const dir = options.dir ? path.normalize(`${think.root_path}${options.dir}`) : path.normalize(`${think.root_path}/static`);

    // preload files
    if (options.preload !== false) {
        lib.readDir(dir).filter(fileFilter).forEach(function (name) {
            loadFile(name, dir, options, files);
        });
    }
    // alias files
    if (options.alias) {
        Object.keys(options.alias).forEach(function (key) {
            let value = options.alias[key];
            if (files[value]) {
                files[key] = files[value];
            }
        });
    }
    /*eslint-disable consistent-return */
    return async function (ctx, next) {
        // only accept HEAD and GET
        if (ctx.method !== 'HEAD' && ctx.method !== 'GET') {
            return next();
        }

        let pathname = ctx.path;
        // ctx.path must be defined
        if (!pathname || pathname === '/') {
            return next();
        }
        // regexp
        if (!/[^\/]+\.+\w+$/.test(pathname)) {
            return next();
        }

        // decode for `/%E4%B8%AD%E6%96%87`
        // normalize for `//index`
        let filename = '';
        try {
            filename = path.normalize(safeDecodeURIComponent(path.normalize(ctx.path)).replace(/\\/g, '/'));
        } catch (e) {
            return next();
        }
        // check prefix first to avoid calculate
        if (filename.indexOf(options.prefix) !== 0) {
            return next();
        }

        let file = files[filename];
        // try to load file
        if (!file) {
            if (path.basename(filename)[0] === '.') {
                return next();
            }
            if (filename.charAt(0) === path.sep) {
                filename = filename.slice(1);
            }
            // trim prefix
            if (options.prefix !== '/') {
                if (filename.indexOf(filePrefix) !== 0) {
                    return next();
                }
                filename = filename.slice(filePrefix.length);
            }

            let s;
            try {
                s = fs.statSync(path.join(dir, filename));
            } catch (err) {
                return next();
            }
            if (!s.isFile()) {
                return next();
            }
            file = loadFile(filename, dir, options, files);
        }

        ctx.status = 200;
        if (options.gzip) {
            ctx.vary('Accept-Encoding');
        }
        // statss
        if (!file.buffer) {
            let stats = fs.statSync(file.path);
            if (stats.mtime > file.mtime) {
                file.mtime = stats.mtime;
                file.md5 = null;
                file.length = stats.size;
            }
        }
        // 304
        ctx.response.lastModified = file.mtime;
        if (file.md5) {
            ctx.response.etag = file.md5;
        }
        if (ctx.fresh) {
            ctx.status = 304;
            return;
        }

        ctx.type = file.type;
        ctx.length = file.zipBuffer ? file.zipBuffer.length : file.length;
        ctx.set('cache-control', 'public, max-age=' + file.maxAge);
        if (file.md5) {
            ctx.set('content-md5', file.md5);
        }
        if (ctx.method === 'HEAD') {
            return;
        }

        let acceptGzip = ctx.acceptsEncodings('gzip') === 'gzip';
        if (file.zipBuffer) {
            if (acceptGzip) {
                ctx.set('content-encoding', 'gzip');
                ctx.body = file.zipBuffer;
            } else {
                ctx.body = file.buffer;
            }
            return;
        }

        let shouldGzip = options.gzip && file.length > 1024 && acceptGzip && compressible(file.type);
        if (file.buffer) {
            if (shouldGzip) {
                let gzFile = files[filename + '.gz'];
                if (options.usePrecompiledGzip && gzFile && gzFile.buffer) { // if .gz file already read from disk
                    file.zipBuffer = gzFile.buffer;
                } else {
                    file.zipBuffer = await zlib.gzip(file.buffer);
                }
                ctx.set('content-encoding', 'gzip');
                ctx.body = file.zipBuffer;
            } else {
                ctx.body = file.buffer;
            }
            return;
        }

        let stream = fs.createReadStream(file.path);
        // update file hash
        if (!file.md5) {
            let hash = crypto.createHash('md5');
            stream.on('data', hash.update.bind(hash));
            stream.on('end', function () {
                file.md5 = hash.digest('base64');
            });
        }
        ctx.body = stream;
        // enable gzip will remove content length
        if (shouldGzip) {
            ctx.remove('content-length');
            ctx.set('content-encoding', 'gzip');
            ctx.body = stream.pipe(zlib.createGzip());
        }
    };
};