'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const lib = require('./lib.js');

/*eslint-disable consistent-return */
module.exports = class {
    constructor(app_path, options, skip) {
        // 启动目录
        this.app_path = app_path;
        let loaders = {};
        if (options instanceof Array) {
            for (var _iterator = options, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
                var _ref;

                if (_isArray) {
                    if (_i >= _iterator.length) break;
                    _ref = _iterator[_i++];
                } else {
                    _i = _iterator.next();
                    if (_i.done) break;
                    _ref = _i.value;
                }

                let option = _ref;

                option.skip = skip || false;
                loaders = lib.extend(loaders, this.load(option) || {});
            }
        } else {
            options.skip = skip || false;
            loaders = this.load(options) || {};
        }
        return loaders;
    }

    /**
     * 
     * 
     * @param {any} dir 
     * @param {boolean} [skip=false] 
     * @returns 
     */
    walk(dir, skip = false) {
        dir = path.resolve(this.app_path, dir);
        const exist = fs.existsSync(dir);
        if (!exist) {
            return;
        }

        const files = fs.readdirSync(dir);
        let list = [],
            p;

        for (var _iterator2 = files, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
            var _ref2;

            if (_isArray2) {
                if (_i2 >= _iterator2.length) break;
                _ref2 = _iterator2[_i2++];
            } else {
                _i2 = _iterator2.next();
                if (_i2.done) break;
                _ref2 = _i2.value;
            }

            let file = _ref2;

            p = fs.statSync(path.resolve(dir, file));
            if (!skip && p.isFile()) {
                list.push(path.resolve(dir, file));
            } else if (p.isDirectory()) {
                list = list.concat(this.walk(path.resolve(dir, file), false));
            }
        }

        return list;
    }

    /**
     * 
     * 
     * @param {any} [options={}] 
     * @param {boolean} [skip=false] 
     * @returns 
     */
    load(options = {}) {
        assert(typeof options.root === 'string', 'root must be specified');

        options.suffix = options.suffix || '.js';
        options.filter = options.filter || [];
        options.skip = options.prefix === '/' ? true : options.skip || false;

        let loaders = {};

        let paths = this.walk(options.root, options.skip);
        if (!paths) {
            return;
        }
        let name = '',
            group = '',
            tempPath = '',
            tempGroup = '',
            regExp = new RegExp(`${options.suffix}$`);
        for (let key in paths) {
            tempPath = paths[key].replace(new RegExp(lib.sep, 'g'), '/');
            name = path.relative(path.resolve(this.app_path, options.root), tempPath);
            if (regExp.test(name)) {
                name = name.slice(0, name.lastIndexOf(options.suffix));
                options.filter.forEach(function (v, i) {
                    name = name.replace(v, '');
                });
                name && (loaders[name] = lib.require(tempPath));
            }
        }

        return loaders;
    }
};