/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */

const thinklib = require('think_lib');
let lib = thinklib;

/**
 * 转换express的middleware为koa使用
 * 
 * @param {any} fn 
 */
thinklib.define(lib, 'parseExpMiddleware', function (fn) {
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
});

/**
 * 配置读取
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
            } else { //name包含. 二级
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
 * 获取或实例化控制器
 * 
 * @param {any} name 
 * @param {any} http 
 * @returns 
 */
thinklib.define(lib, 'controller', function (name, http) {
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
        if (http && http.req) {
            return new cls(http);
        }
        return cls;
    } catch (err) {
        think.logger ? think.logger.error(err) : console.error(err);
        return null;
    }
});

/**
 * 执行控制器某个方法
 * 
 * @param {any} name 
 * @param {any} http 
 */
thinklib.define(lib, 'action', function (name, http) {
    name = name.split('/');
    if (name.length < 2 || !name[0]) {
        return http.throw(404, `When call think.action, controller is undefined,  `);
    }
    let cls = lib.controller(`${name[1] ? (name[0] + '/' + name[1]) : name[0]}`, http);
    if (!cls) {
        return http.throw(404, `When call think.action, controller ${name[1] ? (name[0] + '/' + name[1]) : name[0]} is undefined`);
    }
    let act = name[2] ? name[2] : name[1];
    if (!act) {
        return http.throw(404, `When call think.action, action ${act} is undefined`);
    }
    return cls[act]();
});

/**
 * 获取或实例化模型类
 * 
 * @param {any} name 
 * @param {any} config 
 * @returns 
 */
thinklib.define(lib, 'model', function (name, config) {
    try {
        if (!name) {
            return think.model.base;
        }
        let cls;
        if (!lib.isString(name) && name.__filename) {
            cls = lib.require(name.__filename);
        } else if (think._caches.models[name]) {
            cls = think._caches.models[name];
        }
        if (!cls) {
            throw Error(`Model ${name} is undefined`);
        }
        if (config === undefined) {
            return cls;
        }
        config = lib.extend(think._caches.configs.middleware.config['model'] || {}, config);
        //print sql
        config.db_ext_config && (config.db_ext_config.db_log_sql = think.app_debug || false);
        return new cls(config || {});
    } catch (err) {
        think.logger ? think.logger.error(err) : console.error(err);
        return null;
    }
});

/**
 * 获取或实例化服务类
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
            throw Error(`Controller ${name} is undefined`);
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
    return Promise.reject(err);
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