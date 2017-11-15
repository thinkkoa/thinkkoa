'use strict';

var _set = require('babel-runtime/core-js/reflect/set');

var _set2 = _interopRequireDefault(_set);

var _get = require('babel-runtime/core-js/reflect/get');

var _get2 = _interopRequireDefault(_get);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

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

/**
 * Custom record log
 * 
 * @param {any} name log files name
 * @param {any} msgs message
 * @param {any} path log files path
 * @returns 
 */
const addLogs = function (name, msgs, path) {
    if (typeof msgs === 'object') {
        msgs = (0, _stringify2.default)(msgs);
    }
    path = path || process.env.LOGS_PATH;
    return thinklogger.write(path, name, msgs);
};

/**
 * Convert express middleware for koa
 * 
 * @param {any} fn 
 */
const parseExpMiddleware = function (fn) {
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
 * prevent next process
 * @return {Promise} []
 */
const preventMessage = 'PREVENT_NEXT_PROCESS';
const prevent = function () {
    return _promise2.default.reject(new Error(preventMessage));
};
/**
 * check is prevent error
 * @param  {Error}  err [error message]
 * @return {Boolean}     []
 */
const isPrevent = function (err) {
    return thinklib.isError(err) && err.message === preventMessage;
};

let helper = (0, _assign2.default)({
    logger: thinklogger,
    addLogs: addLogs,
    parseExpMiddleware: parseExpMiddleware,
    prevent: prevent,
    isPrevent: isPrevent
}, thinklib);

module.exports = new Proxy(helper, {
    set: function (target, key, value, receiver) {
        if ((0, _get2.default)(target, key, receiver) === undefined) {
            return (0, _set2.default)(target, key, value, receiver);
        } else {
            throw Error('Cannot redefine getter-only property');
        }
    },
    deleteProperty: function (target, key) {
        throw Error('Cannot delete getter-only property');
    }
});