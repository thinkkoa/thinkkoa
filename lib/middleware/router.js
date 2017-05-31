'use strict';

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/5/2
 */

module.exports = function (options) {
    return function (ctx, next) {
        echo('router');
        //    think.addLogs('aa', '发送了一个致命错误');
        //    echo('aaa')

        //过滤禁止访问的模块
        let modules = think._caches.modules || [];
        if (modules.length < 1) {} else {
            let deny_list = options.deny_modules || [];
            think._caches.modules = modules.filter(x => deny_list.indexOf(x) === -1);
        }
        return next();
    };
};