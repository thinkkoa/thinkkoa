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
        msgs = JSON.stringify(msgs);
    }
    path = path || process.env.LOGS_PATH || think.root_path + '/logs';
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
 * exec middleware
 * 
 * @param {any} fn 
 * @param {any} app 
 * @returns 
 */
const use = function(fn, app){
    if (thinklib.isGenerator(fn)) {
        fn = thinklib.generatorToPromise(fn);
    }
    return app.use(fn);
};

/**
 * exec express middleware
 * 
 * @param {any} fn 
 * @param {any} app 
 * @returns 
 */
const useExp = function(fn, app){
    fn = parseExpMiddleware(fn);
    return app.use(fn);
};

/**
 * prevent next process
 * @return {Promise} []
 */
const preventMessage = 'PREVENT_NEXT_PROCESS';
const prevent = function() {
    let err = new Error(preventMessage);
    return Promise.reject(err);
};
/**
 * check is prevent error
 * @param  {Error}  err [error message]
 * @return {Boolean}     []
 */
const isPrevent = function(err) {
    return thinklib.isError(err) && err.message === preventMessage;
};

let helper = Object.assign({
    logger: thinklogger,
    addLogs: addLogs,
    parseExpMiddleware: parseExpMiddleware,
    use: use,
    useExp: useExp,
    prevent: prevent,
    isPrevent: isPrevent
}, thinklib);

module.exports = new Proxy(helper, {
    set: function (target, key, value, receiver) {
        if (Reflect.get(target, key, receiver) === undefined) {
            return Reflect.set(target, key, value, receiver);
        } else {
            throw Error('Cannot redefine getter-only property');
        }
    },
    deleteProperty: function (target, key) {
        throw Error('Cannot delete getter-only property');
    }
});