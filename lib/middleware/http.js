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
const lib = require('../util/lib.js');

const getController = function getController() {};

const execController = function execController() {};

const execAction = function execAction() {};

/**
 * 
 * 
 * @param {any} ctx 
 * @param {number} [status=200] 
 * @param {string} [msg=''] 
 */
const afterEnd = function afterEnd(ctx, status = 200, msg = '') {
    echo('http afterEnd');
    process.nextTick(() => {
        try {
            clearTimeout(ctx.timeoutTimer);
            lib.log(`${ctx.method.toUpperCase()}  ${ctx.status}  ${ctx.url || '/'}`, 'HTTP', ctx.startTime);
            if (lib.isError(msg)) {
                think.app.emit('error', msg, ctx);
            }
            //remove temp upload file
            if (lib.config('post_file_autoremove') && !lib.isEmpty(this.file)) {
                let key, path;
                for (key in ctx.file) {
                    path = ctx.file[key].path;
                    if (lib.isFile(path)) {
                        lib.rmFile(path);
                    }
                }
            }
        } catch (err) {
            lib.log(err, 'ERROR');
        }
    });
};

module.exports = function (options) {
    return (() => {
        var _ref = (0, _asyncToGenerator3.default)(function* (ctx, next) {
            let endMsg = '';
            try {
                //content type is send
                ctx.isTypeSend = false;

                //set http start time
                ctx.startTime = Date.now();
                //http version
                ctx.version = ctx.req.httpVersion;

                // set timeout
                let timeout = think._caches.configs.http_timeout || 30;
                ctx.timeoutTimer = ctx.res.setTimeout(timeout * 1000, function () {
                    return think.statusAction(ctx, 504);
                });

                ctx.group = '';
                ctx.controller = '';
                ctx.action = '';

                ctx.afterEnd = afterEnd;

                echo('http start');
                //执行后续中间件
                yield next();
                echo('http end');
            } catch (e) {
                ctx.status = 500;
                endMsg = e;
            } finally {
                ctx.afterEnd(ctx, ctx.status, endMsg);
            }
        });

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    })();
};