"use strict";

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/6/1
 */

module.exports = function (options) {
    return function (ctx, next) {
        return next();
    };
};