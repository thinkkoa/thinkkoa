'use strict';

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/5/29
 */
const base = require('../controller/base.js');

const getController = function getController() {};

const execController = function execController() {};

const execAction = function execAction() {};

module.exports = function (options) {
    think.controller = base;
    return (() => {
        var _ref = (0, _asyncToGenerator3.default)(function* (ctx, next) {
            echo('controller');
            return next();
        });

        function error(_x, _x2) {
            return _ref.apply(this, arguments);
        }

        return error;
    })();
};