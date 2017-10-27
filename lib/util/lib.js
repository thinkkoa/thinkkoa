'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */

const thinklib = require('think_lib');
const thinklogger = require('think_logger');
let lib = thinklib;

/**
 * logger
 */
thinklib.define(lib, 'logger', thinklogger);

/**
 * Custom record log
 * 
 * @param {any} name log files name
 * @param {any} msgs message
 * @param {any} path log files path
 * @returns 
 */
thinklib.define(lib, 'addLogs', function (name, msgs, path) {
    if (typeof msgs === 'object') {
        msgs = (0, _stringify2.default)(msgs);
    }
    path = path || process.env.LOGS_PATH || think.root_path + '/logs';
    return thinklogger.write(path, name, msgs);
});
/**
 * Convert express middleware for koa
 * 
 * @param {any} fn 
 */
thinklib.define(lib, 'parseExpMiddleware', function (fn) {
    return function (ctx, next) {
        if (fn.length < 3) {
            fn(ctx.req, ctx.res);
            return next();
        } else {
            return new _promise2.default((resolve, reject) => {
                fn(ctx.req, ctx.res, err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(next());
                    }
                });
            });
        }
    };
});

/**
 * Configuration read
 * 
 * @param {any} name 
 * @param {string} [type='config'] 
 * @returns 
 */
thinklib.define(lib, 'config', function (name, type = 'config') {
    try {
        think._caches.configs[type] || (think._caches.configs[type] = {});
        if (name === undefined) {
            return think._caches.configs[type];
        }
        if (lib.isString(name)) {
            //name不含. 一级
            if (name.indexOf('.') === -1) {
                return think._caches.configs[type][name];
            } else {
                //name包含. 二级
                let keys = name.split('.');
                let value = think._caches.configs[type][keys[0]] || {};
                return value[keys[1]];
            }
        } else {
            return think._caches.configs[type][name];
        }
    } catch (err) {
        think.logger ? think.logger.error(err) : console.error(err);
        return null;
    }
});

/**
 * Gets or instantiates the controller
 * 
 * @param {any} name 
 * @param {any} ctx 
 * @returns 
 */
thinklib.define(lib, 'controller', function (name, ctx) {
    try {
        if (!name) {
            return think.controller.base;
        }
        let cls;
        if (lib.isObject(name) && name.__filename) {
            cls = lib.require(name.__filename);
        } else if (think._caches.controllers[name]) {
            cls = think._caches.controllers[name];
        }
        if (!cls) {
            throw Error(`Controller ${name} is undefined`);
        }
        if (ctx && ctx.req) {
            return new cls(ctx);
        }
        return cls;
    } catch (err) {
        think.logger ? think.logger.error(err) : console.error(err);
        return null;
    }
});

/**
 * Gets or instantiates a service class
 * 
 * @param {any} name 
 * @param {any} params 
 */
thinklib.define(lib, 'service', function (name, params) {
    try {
        let cls;
        if (lib.isObject(name) && name.__filename) {
            cls = lib.require(name.__filename);
        } else if (think._caches.services[name]) {
            cls = think._caches.services[name];
        }
        if (!cls) {
            throw Error(`Service ${name} is undefined`);
        }
        if (params === undefined) {
            return cls;
        }
        return new cls(params || {});
    } catch (err) {
        think.logger ? think.logger.error(err) : console.error(err);
        return null;
    }
});

/**
 * prevent next process
 * @return {Promise} []
 */
const preventMessage = 'PREVENT_NEXT_PROCESS';
thinklib.define(lib, 'prevent', () => {
    let err = new Error(preventMessage);
    return _promise2.default.reject(err);
});
/**
 * check is prevent error
 * @param  {Error}  err [error message]
 * @return {Boolean}     []
 */
thinklib.define(lib, 'isPrevent', err => {
    return think.isError(err) && err.message === preventMessage;
});

module.exports = lib;