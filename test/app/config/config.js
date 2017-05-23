/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */

module.exports = {
    /*auto-load config*/
    loader: {
        'controllers': {
            root: 'controller',
            prefix: '/', //支持子目录
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