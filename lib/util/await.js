"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/14
 */

module.exports = class {
    constructor() {
        this.queue = {};
    }

    run(key, fn) {
        if (!(key in this.queue)) {
            this.queue[key] = [];
            return _promise2.default.resolve(fn()).then(data => {
                process.nextTick(() => {
                    this.queue[key].forEach(deferred => deferred.resolve(data));
                    delete this.queue[key];
                });
                return data;
            }).catch(err => {
                process.nextTick(() => {
                    this.queue[key].forEach(deferred => deferred.reject(err));
                    delete this.queue[key];
                });
                return _promise2.default.reject(err);
            });
        } else {
            let deferred = {};
            deferred.promise = new _promise2.default(function (resolve, reject) {
                deferred.resolve = resolve;
                deferred.reject = reject;
            });
            this.queue[key].push(deferred);
            return deferred.promise;
        }
    }
};