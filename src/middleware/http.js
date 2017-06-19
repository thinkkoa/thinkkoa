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
 * @param {number} [status=200] 
 * @param {any} [msg={}] 
 */
const afterEnd = function (ctx, status = 200, msg = {}) {
    // next-tick
    process.nextTick(() => {
        try {
            clearTimeout(ctx.timeoutTimer);
            think.log(`${(ctx.method).toUpperCase()}  ${ctx.status}  ${ctx.originalPath || '/'}`, 'HTTP', ctx.startTime);
            if (lib.isError(msg)) {
                think.app.emit('error', msg, ctx);
            }
        } catch (err) {
            think.log(err, 'ERROR');
        }
    });
};

/**
 * default options
 */
const defaultOptions = {
    timeout: 30, //http超时时间,30 seconds
    cookie: {
        domain: '',
        path: '/',
        timeout: 0
    }
};

module.exports = function (options) {
    options = options ? lib.extend(defaultOptions, options, true) : defaultOptions;
    return async function (ctx, next) {
        //set http start time
        lib.define(ctx, 'startTime', Date.now());
        //http version
        lib.define(ctx, 'version', ctx.req.httpVersion);
        //originalPath
        lib.define(ctx, 'originalPath', ctx.path);

        // set timeout
        lib.define(ctx, 'timeoutTimer', ctx.res.setTimeout((options.timeout || 30) * 1000, function () {
            return ctx.throw(504);
        }));
        //afterEnd
        lib.define(ctx, 'afterEnd', afterEnd);

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
        lib.define(ctx, 'types', (ctx.headers['content-type'] || '').split(';')[0].trim());
        lib.define(ctx, 'type', function (contentType, encoding) {
            if (!contentType) {
                // ctx.types = ctx.types || (ctx.headers['content-type'] || '').split(';')[0].trim();
                return ctx.types;
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
            option = Object.assign({}, options.cookie || {}, option);
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
            ctx.type(contentType, encoding);
            ctx.body = content;
            return null;
        });

        //auto send header
        ctx.set('X-Powered-By', 'ThinkKoa');
        ctx.set('X-Content-Type-Options', 'nosniff');
        ctx.set('X-XSS-Protection', '1;mode=block');


        let endMsg = {};
        try {
            //执行后续中间件
            await next();
        } catch (err) {
            ctx.status = lib.isNumber(err.status) ? err.status : 500;
            endMsg = err;
        } finally {
            ctx.afterEnd(ctx, ctx.status, endMsg);
        }
    };
};

