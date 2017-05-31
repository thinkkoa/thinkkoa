'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
};

/**
 * 配置读取
 * 
 * @param {any} name 
 * @param {string} [type='config'] 
 * @returns 
 */
lib.config = function (name, type = 'config') {
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
};

lib.controller = function () {};

lib.action = function () {};

lib.statusAction = function (ctx, status = 200, msg = '') {
    ctx.status = status;
    if (status > 399) {
        let controller = null;
        if (ctx.isStatusAction) {
            controller = '';
        }
    }
};

module.exports = lib;