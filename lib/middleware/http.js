'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/29
 */
const url = require('url');
const lib = require('../util/lib.js');

/**
 * 
 * 
 * @param {any} ctx 
 */
const trace = function (ctx) {
    // next-tick
    process.nextTick(() => {
        //
        think.logs(`${ctx.method.toUpperCase()}  ${ctx.status}  ${ctx.originalPath || '/'}`, 'HTTP', ctx.startTime);
    });
    return;
};

/**
 * default options
 */
const defaultOptions = {
    cookie: {
        domain: '',
        path: '/',
        timeout: 0
    }
};

module.exports = function (options) {
    options = options ? lib.extend(defaultOptions, options, true) : defaultOptions;
    return function* (ctx, next) {
        //set http start time
        lib.define(ctx, 'startTime', Date.now());
        //http version
        lib.define(ctx, 'version', ctx.req.httpVersion);
        //originalPath
        lib.define(ctx, 'originalPath', ctx.path);

        //assign method
        /**
         * check http method is get
         * 
         * @returns 
         */
        lib.define(ctx, 'isGet', function () {
            return ctx.method === 'GET';
        });
        /**
         * check http method is post
         * 
         * @returns 
         */
        lib.define(ctx, 'isPost', function () {
            return ctx.method === 'POST';
        });
        /**
         * is ajax request
         * 
         * @returns 
         */
        lib.define(ctx, 'isAjax', function () {
            return ctx.headers['x-requested-with'] === 'XMLHttpRequest';
        });
        /**
         * is pjax request
         * 
         * @returns 
         */
        lib.define(ctx, 'isPjax', function () {
            return ctx.headers['x-pjax'] || false;
        });
        /**
         * is jsonp request
         * 
         * @param {any} name 
         * @returns 
         */
        lib.define(ctx, 'isJsonp', function (name) {
            name = name || 'jsonpcallback';
            return !!ctx.get(name);
        });
        /**
         * get page request referrer
         * 
         * @param {any} host 
         * @returns 
         */
        lib.define(ctx, 'referer', function (host) {
            let ref = ctx.headers.referer || ctx.headers.referrer || '';
            if (!ref || !host) {
                return ref;
            }
            return url.parse(host).hostname || '';
        });
        /**
         * get or set header
         * 
         * @param {any} name 
         * @param {any} value 
         * @returns 
         */
        lib.define(ctx, 'header', function (name, value) {
            if (name === undefined) {
                return ctx.headers;
            }
            name = name.toLowerCase();
            if (value === undefined) {
                return ctx.headers[name] || '';
            }
            //set header
            if (!ctx.res.headersSent) {
                ctx.set(name, value);
            }
            return null;
        });
        /**
         * get or set content type
         * 
         * @param {any} contentType 
         * @param {any} encoding 
         */
        lib.define(ctx, 'types', function (contentType, encoding) {
            if (!contentType) {
                return (ctx.headers['content-type'] || '').split(';')[0].trim();
            }
            if (encoding !== false && contentType.toLowerCase().indexOf('charset=') === -1) {
                contentType += '; charset=' + (encoding || lib.config('encoding'));
            }
            ctx.set('Content-Type', contentType);
            return null;
        });
        /**
         * 
         * 
         * @param {number} [code=403] 
         * @returns 
         */
        lib.define(ctx, 'deny', function (code = 403) {
            return ctx.throw(code);
        });
        /**
         * send execute time
         * 
         * @param {any} name 
         */
        lib.define(ctx, 'sendTime', function (name) {
            let time = Date.now() - ctx.startTime;
            ctx.set('X-' + (name || 'EXEC-TIME'), time + 'ms');
            return null;
        });
        /**
         * set cache-control and expires header
         * 
         * @param {any} time 
         */
        lib.define(ctx, 'expires', function (time) {
            if (lib.isNumber(time)) {
                time = 30;
            }
            time = lib.toNumber(time) * 1000;
            let date = new Date(Date.now() + time);
            ctx.set('Cache-Control', `max-age=${time}`);
            ctx.set('Expires', date.toUTCString());
            return null;
        });
        /**
         * get or set cookie
         * @param {String} name
         * @param {String} value
         * @param {Object} options
         */
        lib.define(ctx, 'cookie', function (name, value, option = {}) {
            if (!lib.isString(name)) {
                ctx.throw('cookie.name must be a string');
                return null;
            }
            //get cookie
            if (value === undefined) {
                return ctx.cookies.get(name, option);
            }
            option = (0, _assign2.default)({}, options.cookie || {}, option);
            //remove cookie
            if (value === null) {
                return ctx.cookies.set(name, '', {
                    maxAge: -1
                });
            }
            if (!lib.isString(value)) {
                ctx.throw('cookie value must be a string');
                return null;
            }
            //http://browsercookielimits.squawky.net/
            if (value.length >= 4094) {
                ctx.throw('cookie limit has error length');
                return null;
            }
            //set cookie
            return ctx.cookies.set(name, value, option);
        });
        /**
         * 
         * 
         * @param {any} content 
         * @param {any} contentType 
         * @param {any} encoding 
         * @returns 
         */
        lib.define(ctx, 'echo', function (content, contentType, encoding) {
            contentType = contentType || 'text/plain';
            encoding = encoding || lib.config('encoding');
            ctx.types(contentType, encoding);
            ctx.body = content;
            return null;
        });

        //auto send header
        ctx.set('X-Powered-By', 'ThinkKoa');
        ctx.set('X-Content-Type-Options', 'nosniff');
        ctx.set('X-XSS-Protection', '1;mode=block');

        //执行后续中间件
        yield next();
        return trace(ctx);
    };
};