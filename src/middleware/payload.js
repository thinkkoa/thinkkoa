/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/5/2
 */
const fs = require('fs');
const qs = require('querystring');
const raw = require('raw-body');
const inflate = require('inflation');
const lib = require('../util/lib.js');
const formidable = require('formidable');
const fs_unlink = lib.promisify(fs.unlink, fs);
const fs_access = lib.promisify(fs.access, fs);
const parseString = require('xml2js').parseString;
const parseStringP = lib.promisify(parseString, parseString);

// default json types
const jsonTypes = ['application/json'];
// default form types
const formTypes = ['application/x-www-form-urlencoded'];
// default text types
const textTypes = ['text/plain'];
// default multipart-form types
const multipartTypes = ['multipart/form-data'];
// default xml types
const xmlTypes = ['text/xml'];
const parse = {
    form: function (ctx, opts = {}) {
        const req = ctx.req;
        // defaults
        let len = req.headers['content-length'];
        const encoding = req.headers['content-encoding'] || 'identity';
        if (len && encoding === 'identity') {
            opts.length = ~~len;
        }
        opts.encoding = opts.encoding || 'utf8';
        opts.limit = opts.limit || '1mb';

        return raw(inflate(req), opts).then(str => qs.parse(str));
    },
    json: function (ctx, opts = {}) {
        const req = ctx.req;
        // defaults
        let len = req.headers['content-length'];
        const encoding = req.headers['content-encoding'] || 'identity';
        if (len && encoding === 'identity') {
            opts.length = ~~len;
        }
        opts.encoding = opts.encoding || 'utf8';
        opts.limit = opts.limit || '1mb';

        return raw(inflate(req), opts).then(str => JSON.parse(str));
    },
    multipart: function (ctx, opts = {}) {
        const req = ctx.req;
        const form = new formidable.IncomingForm();

        ctx.res.once('finish', () => {
            const files = ctx.request.body.file;
            const unlinks = Object.keys(files).map(key => {
                return fs_access(files[key].path).then(() => fs_unlink(files[key].path)).catch(() => { });
            });
            Promise.all(unlinks);
        });

        return new Promise((resolve, reject) => {
            form.parse(req, function (err, fields, files) {
                if (err) {
                    return reject(err);
                }
                return resolve({
                    post: fields,
                    file: files
                });
            });
        });
    },
    text: function (ctx, opts = {}) {
        const req = ctx.req;
        // defaults
        let len = req.headers['content-length'];
        const encoding = req.headers['content-encoding'] || 'identity';
        if (len && encoding === 'identity') {
            opts.length = ~~len;
        }
        opts.encoding = opts.encoding || 'utf8';
        opts.limit = opts.limit || '1mb';
        return raw(inflate(req), opts);
    },
    xml: function (ctx, opts = {}) {
        return parse.text(ctx, opts).then(parseStringP);
    }
};
/**
 * 
 * 
 * @param {any} ctx 
 * @param {any} options 
 * @returns 
 */
const parsePayload = function (ctx, options) {
    let extTypes = {
        json: jsonTypes,
        form: formTypes,
        text: textTypes,
        multipart: multipartTypes,
        xml: xmlTypes
    };
    options.extTypes && (extTypes = lib.extend(extTypes, options.extTypes));

    if (ctx.request.is(extTypes.json)) {
        return parse.json(ctx, options);
    }
    if (ctx.request.is(extTypes.form)) {
        return parse.form(ctx, options);
    }
    if (ctx.request.is(extTypes.text)) {
        return parse.text(ctx, options);
    }
    if (ctx.request.is(extTypes.multipart)) {
        return parse.multipart(ctx, options);
    }
    if (ctx.request.is(extTypes.xml)) {
        return parse.xml(ctx, options);
    }

    return Promise.resolve({});
};

module.exports = function (options) {
    return async function (ctx, next) {
        echo('payload')
        ctx._get = ctx.query;
        // parse payload
        ctx.request.body = await parsePayload(ctx, options);
        if (ctx.request.body.post) {
            ctx._post = ctx.request.body.post;
        } else {
            ctx._post = ctx.request.body;
        }
        if (ctx.request.body.file) {
            ctx._file = ctx.request.body.file;
        }

        /**
         * get or set query params
         * 
         * @param {any} name 
         * @param {any} value 
         * @returns 
         */
        ctx.get = function (name, value) {
            if (value === undefined) {
                if (name === undefined) {
                    return ctx._get;
                }
                if (think.isString(name)) {
                    return think.isTrueEmpty(ctx._get[name]) ? '' : ctx._get[name];
                }
                ctx._get = think.extend(ctx._get, name);
            } else {
                ctx._get[name] = value;
            }
            return null;
        };

        /**
         * get or set body params
         * 
         * @param {any} name 
         * @param {any} value 
         * @returns 
         */
        ctx.post = function (name, value) {
            if (value === undefined) {
                if (name === undefined) {
                    return ctx._post;
                }
                if (think.isString(name)) {
                    return think.isTrueEmpty(ctx._post[name]) ? '' : ctx._post[name];
                }
                ctx._post = think.extend(ctx._post, name);
            } else {
                ctx._post[name] = value;
            }
            return null;
        };

        /**
         * 
         * 
         * @param {any} name 
         * @returns 
         */
        ctx.param = function (name) {
            if (name === undefined) {
                return lib.extend(this._get, this._post);
            } else {
                if (lib.isTrueEmpty(this._post[name])) {
                    return lib.isTrueEmpty(this._get[name]) ? '' : this._get[name];
                } else {
                    return ctx.post(name);
                }
            }
        };

        /**
         * get or set files
         * 
         * @param {any} name 
         * @param {any} value 
         * @returns 
         */
        ctx.file = function (name, value) {
            if (value === undefined) {
                if (name === undefined) {
                    return ctx._file;
                }
                return think.isTrueEmpty(ctx._file[name]) ? {} : ctx._file[name];
            }
            ctx._file[name] = value;
            return null;
        };

        return next();
    };
};