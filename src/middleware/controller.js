/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    31/5/29
 */
const base = require('../controller/base.js');

const getController = function () {

};

const execController = function () {

};

const execAction = function () {

};

module.exports = function (options) {
    think.controller = base;
    return async function error(ctx, next) {
        echo('controller')
        return next();
    };
};