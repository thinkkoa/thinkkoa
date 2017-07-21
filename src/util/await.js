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

    run(key, fn){
        if(!(key in this.queue)){
            this.queue[key] = [];
            return Promise.resolve(fn()).then(data => {
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
                return Promise.reject(err);
            });
        } else {
            let deferred = {};
            deferred.promise = new Promise(function (resolve, reject) {
                deferred.resolve = resolve;
                deferred.reject = reject;
            });
            this.queue[key].push(deferred);
            return deferred.promise;
        }
    }
};