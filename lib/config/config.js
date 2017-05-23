'use strict';

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */

module.exports = {
    /*app config*/
    app_port: 3000,
    http_timeout: 30, //http超时时间,30 seconds
    encoding: 'utf-8', //输出数据的编码

    /*groups and controller*/
    deny_modules: ['common'],
    default_module: 'home',
    default_controller: 'index',
    default_action: 'index',
    url_suffix: '',

    /*auto-load config*/
    loader: {
        'controllers': {
            root: 'controller',
            prefix: '' },
        'middlewares': {
            root: 'middleware',
            prefix: ''
        }
    }

};