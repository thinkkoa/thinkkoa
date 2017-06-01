'use strict';

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/29
 */
const fs = require('fs');
const url = require('url');
const mime = require('mime-types');
const lib = require('../util/lib.js');

/**
 * 
 * 
 * @param {any} ctx 
 * @param {number} [status=200] 
 * @param {any} [msg={}] 
 */
const afterEnd = function afterEnd(ctx, status = 200, msg = {}) {
    // next-tick
    process.nextTick(() => {
        try {
            clearTimeout(ctx.timeoutTimer);
            lib.log(`${ctx.method.toUpperCase()}  ${ctx.status}  ${ctx.originalPath || '/'}`, 'HTTP', ctx.startTime);
            if (lib.isError(msg)) {
                think.app.emit('error', msg, ctx);
            }
        } catch (err) {
            lib.log(err, 'ERROR');
        }
    });
};

module.exports = function (options) {
    return (() => {
        var _ref = (0, _asyncToGenerator3.default)(function* (ctx, next) {
            let endMsg = {};
            try {
                //content type is send
                ctx._typeSend = false;
                ctx._sendType = '';

                //set http start time
                ctx.startTime = Date.now();
                //http version
                ctx.version = ctx.req.httpVersion;

                // set timeout
                let timeout = options.timeout || 30;
                ctx.timeoutTimer = ctx.res.setTimeout(timeout * 1000, function () {
                    return ctx.throw(504);
                });

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
                ctx.set = function (name, value) {
                    if (name === undefined) {
                        return ctx.header;
                    }
                    name = name.toLowerCase();
                    if (value === undefined) {
                        return ctx.header[name] || '';
                    }
                    //set content-type
                    if (name === 'content-type') {
                        if (ctx._typeSend) {
                            return null;
                        }
                        ctx._typeSend = true;
                    }
                    //set header
                    if (!ctx.res.headersSent) {
                        ctx.res.setHeader(name, value);
                    }
                    return null;
                };

                /**
                 * get or set content type
                 * 
                 * @param {any} contentType 
                 * @param {any} encoding 
                 */
                ctx.type = function (contentType, encoding) {
                    if (!contentType) {
                        return (ctx.header['content-type'] || '').split(';')[0].trim();
                    }
                    if (ctx._typeSend) {
                        return null;
                    }
                    if (contentType.indexOf('/') === -1) {
                        contentType = mime.lookup(contentType);
                    }
                    ctx._sendType = contentType;
                    if (encoding !== false && contentType.toLowerCase().indexOf('charset=') === -1) {
                        contentType += '; charset=' + (encoding || think.config('encoding'));
                    }
                    ctx.set('Content-Type', contentType);
                    return null;
                };

                /**
                 * redirect
                 * 
                 * @param {any} urls 
                 * @param {number} [code=302] 
                 */
                ctx.redirect = function (urls, code = 302) {
                    ctx.set('Location', urls || '/');
                    return think.statusAction(ctx, code || 302);
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

                //auto send header
                ctx.set('X-Powered-By', 'ThinkKoa');
                ctx.set('X-Content-Type-Options', 'nosniff');
                ctx.set('X-XSS-Protection', '1;mode=block');

                echo('http');
                //执行后续中间件
                yield next();
            } catch (err) {
                ctx.status = lib.isNumber(err.status) ? err.status : 500;
                endMsg = err;
            } finally {
                echo('afterEnd');
                ctx.afterEnd(ctx, ctx.status, endMsg);
            }
        });

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    })();
};