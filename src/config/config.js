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
            prefix: '/', //支持子目录
        },
        'configs': {
            root: 'config',
            prefix: '',
        },
        'middlewares': {
            root: 'middleware',
            prefix: '',
        },
        'models': {
            root: 'model',
            prefix: '/',
        }
    }

};