/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/5/29
 */

module.exports = function (options) {
    return async function error(ctx, next) {
        try {
            echo('error')
            await next();
            //404 error
            if (!ctx.response.body) {
                ctx.throw(404, ctx.url);
            }
            if (ctx.response.status >= 400) {
                ctx.throw(ctx.response.status, ctx.url);
            }
        } catch (err) {
            ctx.status = typeof err.status === 'number' ? err.status : (options.error_code || 500);

            // accepted types
            switch (ctx.accepts('html', 'text', 'json')) {
                case 'json':
                    ctx.type = 'application/json';
                    ctx.body = `{"status": 0,"${options.error_no_key || 'errno'}": ${ctx.status},"${options.error_msg_key || 'errmsg'}":"${err.message || ''}","data":{}}`;
                    break;
                case 'html':
                    ctx.type = 'text/html';
                    ctx.body = `<!DOCTYPE html><html><head><title>ThinkKoa Error - ${ctx.status}</title><meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1.0, maximum-scale=1.0">
            <style>body {padding: 50px 80px;font: 14px "Helvetica Neue", Helvetica, sans-serif;}h1, h2 {margin: 0;padding: 10px 0;}h1 {font-size: 2em;}h2 {font-size: 1.2em;font-weight: 200;color: #aaa;}pre {font-size: .8em;}</style>
            </head><body><div id="error"><h1>ThinkKoa Error</h1><p>Looks like something broke!</p><h2>Message:</h2><pre><code>${err.message || ''}</code></pre>`;
                    if (think.app_debug || err.expose) {
                        ctx.body += `<h2>Stack:</h2><pre><code>${err.stack || ''}</code></pre>`;
                    }
                    ctx.body += '</div></body></html>';
                    break;
                case 'text':
                default:
                    ctx.type = 'text/plain';
                    ctx.body = `ThinkKoa Error: ${err.message || ''}`;
                    break;
            }
            think.app.emit('error', err, ctx);
        }
    };
};