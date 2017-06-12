/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */

const thinklib = require('think_lib');

var lib = thinklib;

/**
 * 转换express的middleware为koa使用
 * 
 * @param {any} fn 
 */
lib.parseExpMiddleware = function (fn) {
    return function (ctx, next) {
        if (fn.length < 3) {
            fn(ctx.req, ctx.res);
            return next();
        } else {
            return new Promise((resolve, reject) => {
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
};

/**
 * 配置读取
 * 
 * @param {any} name 
 * @param {string} [type='config'] 
 * @returns 
 */
lib.config = function (name, type = 'config') {
    try {
        think._caches.configs[type] || (think._caches.configs[type] = {});
        if (name === undefined) {
            return think._caches.configs[type];
        }
        if (lib.isString(name)) {
            //name不含. 一级
            if (name.indexOf('.') === -1) {
                return think._caches.configs[type][name];
            } else { //name包含. 二级
                let keys = name.split('.');
                let value = think._caches.configs[type][keys[0]] || {};
                return value[keys[1]];
            }
        } else {
            return think._caches.configs[type][name];
        }
    } catch (e) {
        think.log(e);
        return null;
    }
};

/**
 * console format
 * 
 * @param {any} msg 
 * @param {any} type 
 * @param {any} showTime 
 * @param {any} debug 
 */
lib.log = function (msg, type, showTime, debug) {
    debug = debug || think.app_debug || false;
    let dateTime = `[${lib.datetime('', '')}] `;
    let message = msg;
    if (lib.isError(msg)) {
        type = 'ERROR';
        message = msg.stack;
        ('prototype' in console.error) && console.error(msg.stack);
    } else if (type === 'ERROR') {
        type = 'ERROR';
        if (!lib.isString(msg)) {
            message = JSON.stringify(msg);
        }
        ('prototype' in console.error) && console.error(message);
    } else if (type === 'WARNING') {
        type = 'WARNING';
        if (!lib.isString(msg)) {
            message = JSON.stringify(msg);
        }
        ('prototype' in console.warn) && console.warn(message);
    } else {
        if (!lib.isString(msg)) {
            message = JSON.stringify(msg);
        }
        if (lib.isNumber(showTime)) {
            let _time = Date.now() - showTime;
            message += '  ' + `${_time}ms`;
        }
        type = type || 'INFO';
        //判断console.info是否被重写
        ('prototype' in console.info) && console.info(message);
    }
    (debug || type === 'THINK') && console.log(`${dateTime}[${type}] ${message}`);
};

/**
 * 获取或实例化控制器
 * 
 * @param {any} name 
 * @param {any} http 
 * @returns 
 */
lib.controller = function (name, http) {
    try {
        if (!name && !http) {
            return think.controller.base;
        }
        let cls;
        if (lib.isObject(name) && name.__filename) {
            cls = lib.require(name.__filename);
        } else if (think._caches.controllers[name]) {
            cls = think._caches.controllers[name];
        }
        if (!cls) {
            return think.log(`Controller ${name} is undefined`, 'ERROR');
        }
        if (http && http.req) {
            return new cls(http);
        }
        return cls;
    } catch (e) {
        think.log(e);
        return null;
    }
};

/**
 * 执行控制器某个方法
 * 
 * @param {any} name 
 * @param {any} http 
 */
lib.action = function (name, http) {
    name = name.split('/');
    if (name.length < 2 || !name[0]) {
        return http.throw(`When call think.action, controller is undefined,  `, 'ERROR');
    }
    let cls = lib.controller(`${name[1] ? (name[0] + '/' + name[1]) : name[0]}`, http);
    if (!cls) {
        return http.throw(`When call think.action, controller ${name[1] ? (name[0] + '/' + name[1]) : name[0]} is undefined`, 'ERROR');
    }
    let act = name[2] ? name[2] : name[1];
    if (!act) {
        return http.throw(`When call think.action, action ${act} is undefined`, 'ERROR');
    }
    return cls[act]();
};

/**
 * 获取或实例化模型类
 * 
 * @param {any} name 
 * @param {any} config 
 * @returns 
 */
lib.model = function (name, config) {
    try {
        let cls;
        if (!lib.isString(name) && name.__filename) {
            cls = lib.require(name.__filename);
        } else if (think._caches.models[name]) {
            cls = think._caches.models[name];
        }
        if (!cls) {
            return lib.log(`Model ${name} is undefined`, 'ERROR');
        }
        if (config === undefined) {
            return cls;
        }
        config = lib.extend(think._caches.configs.middleware.config['model'] || {}, config);
        //print sql
        config.db_ext_config && (config.db_ext_config.db_log_sql = think.app_debug || false);
        return new cls(config || {});
    } catch (e) {
        lib.log(e);
        return null;
    }
};

/**
 * 获取或实例化服务类
 * 
 * @param {any} name 
 * @param {any} params 
 */
lib.service = function (name, params) {
    try {
        let cls;
        if (lib.isObject(name) && name.__filename) {
            cls = lib.require(name.__filename);
        } else if (think._caches.services[name]) {
            cls = think._caches.services[name];
        }
        if (!cls) {
            return think.log(`Controller ${name} is undefined`, 'ERROR');
        }
        if (params === undefined) {
            return cls;
        }
        return new cls(params || {});
    } catch (e) {
        think.log(e);
        return null;
    }
};

module.exports = lib;