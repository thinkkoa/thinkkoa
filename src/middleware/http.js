/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/29
 */
const fs = require('fs');
const lib = require('../util/lib.js');


const getController = function () {

};

const execController = function () {

};

const execAction = function () {

};

/**
 * 
 * 
 * @param {any} ctx 
 * @param {number} [status=200] 
 * @param {string} [msg=''] 
 */
const afterEnd = function (ctx, status = 200, msg = '') {
    echo('http afterEnd')
    process.nextTick(() => {
        try {
            clearTimeout(ctx.timeoutTimer);
            lib.log(`${(ctx.method).toUpperCase()}  ${ctx.status}  ${ctx.url || '/'}`, 'HTTP', ctx.startTime);
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
    return async function (ctx, next) {
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
            ctx.timeoutTimer = ctx.res.setTimeout(timeout * 1000, () => think.statusAction(ctx, 504));

            ctx.group = '';
            ctx.controller = '';
            ctx.action = '';

            ctx.afterEnd = afterEnd;


            echo('http start')
            //执行后续中间件
            await next();
            echo('http end')
        } catch (e) {
            ctx.status = 500;
            endMsg = e;
        } finally {
            ctx.afterEnd(ctx, ctx.status, endMsg);
        }
    };
};

