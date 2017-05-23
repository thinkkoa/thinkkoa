/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/5/2
 */

module.exports = function (options) {
    return function (ctx, next) {
       echo('test')
    //    think.addLogs('aa', '发送了一个致命错误');
    //    echo('aaa')
        // return next();
    };
};