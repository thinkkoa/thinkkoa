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

module.exports = function (options) {
    return async function (ctx, next) {

        //set http start time
        ctx.startTime = Date.now();
        //http version
        ctx.version = ctx.req.httpVersion;

        // set timeout
        let timeout = options.timeout || 30;
        ctx.timeoutTimer = ctx.res.setTimeout(timeout * 1000, () => ctx.throw(504));

        ctx.group = '';
        ctx.controller = '';
        ctx.action = '';

        ctx.afterEnd = afterEnd;

        //assign method
        /**
         * check http method is get
         * 
         * @returns 
         */
        ctx.isGet = function () {
            return ctx.method === 'GET';
        };
        /**
         * check http method is post
         * 
         * @returns 
         */
        ctx.isPost = function () {
            return ctx.method === 'POST';
        };
        /**
         * is ajax request
         * 
         * @returns 
         */
        ctx.isAjax = function () {
            return ctx.header['x-requested-with'] === 'XMLHttpRequest';
        };
        /**
         * is pjax request
         * 
         * @returns 
         */
        ctx.isPjax = function () {
            return ctx.header['x-pjax'] || false;
        };
        /**
         * is jsonp request
         * 
         * @param {any} name 
         * @returns 
         */
        ctx.isJsonp = function (name) {
            name = name || 'jsonpcallback';
            return !!ctx.get(name);
        };
        /**
         * get user agent
         * 
         * @returns 
         */
        ctx.userAgent = function () {
            return ctx.header['user-agent'] || '';
        };
        /**
         * get page request referrer
         * 
         * @param {any} host 
         * @returns 
         */
        ctx.referer = function (host) {
            let ref = ctx.header.referer || ctx.header.referrer || '';
            if (!ref || !host) {
                return ref;
            }
            return url.parse(ref).hostname || '';
        };

        /**
         * get or set header
         * 
         * @param {any} name 
         * @param {any} value 
         * @returns 
         */
        Object.defineProperty(ctx, 'header', { writable: true });
        ctx.header = function (name, value) {
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
        };

        /**
         * get or set content type
         * 
         * @param {any} contentType 
         * @param {any} encoding 
         */
        Object.defineProperty(ctx, 'type', { writable: true });
        ctx.type = function (contentType, encoding) {
            if (!contentType) {
                ctx.types = ctx.types || (ctx.header['content-type'] || '').split(';')[0].trim();
                return ctx.types;
            }
            if (encoding !== false && contentType.toLowerCase().indexOf('charset=') === -1) {
                contentType += '; charset=' + (encoding || lib.config('encoding'));
            }
            ctx.set('Content-Type', contentType);
            return null;
        };

        /**
         * 
         * 
         * @param {number} [code=403] 
         * @returns 
         */
        ctx.deny = function (code = 403) {
            return ctx.throw(code);
        };

        /**
         * send execute time
         * 
         * @param {any} name 
         */
        ctx.sendTime = function (name) {
            let time = Date.now() - ctx.startTime;
            ctx.set('X-' + (name || 'EXEC-TIME'), time + 'ms');
            return null;
        };

        /**
         * set cache-control and expires header
         * 
         * @param {any} time 
         */
        ctx.expires = function (time) {
            if (think.isNumber(time)) {
                time = 30;
            }
            time = think.toNumber(time) * 1000;
            let date = new Date(Date.now() + time);
            ctx.set('Cache-Control', `max-age=${time}`);
            ctx.set('Expires', date.toUTCString());
            return null;
        };

        /**
         * get or set cookie
         * @param {String} name
         * @param {String} value
         * @param {Object} options
         */
        ctx.cookie = function (name, value, option = {}) {
            if (!lib.isString(name)) {
                think.log('cookie.name must be a string', 'ERROR');
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
                think.log('cookie value must be a string', 'ERROR');
                return null;
            }
            //http://browsercookielimits.squawky.net/
            if (value.length >= 4094) {
                think.log('cookie limit has error length', 'ERROR');
                return null;
            }
            //set cookie
            return ctx.cookies.set(name, value, option);

            // const cookies = require('cookies');
            // const instance = new cookies(ctx.req, ctx.res, {
            //     keys: option.keys,
            //     secure: ctx.req.secure
            // });
            // //get cookie
            // if (value === undefined) {
            //     return instance.get(name, option);
            // }
            // //remove cookie
            // if (value === null) {
            //     return instance.set(name, '', {
            //         maxAge: -1
            //     });
            // }
            // if (!lib.isString(value)) {
            //     think.log('cookie value must be a string', 'ERROR');
            //     return null;
            // }
            // //http://browsercookielimits.squawky.net/
            // if (value.length >= 4094) {
            //     think.log('cookie limit has error length', 'ERROR');
            //     return null;
            // }
            // //set cookie
            // return instance.set(name, value, option);
        };

        /**
         * 
         * 
         * @param {any} content 
         * @param {any} contentType 
         * @param {any} encoding 
         * @returns 
         */
        ctx.echo = function (content, contentType, encoding) {
            contentType = contentType || 'text/plain';
            encoding = encoding || lib.config('encoding');
            ctx.type(contentType, encoding);
            ctx.body = content;
            return null;
        };

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

