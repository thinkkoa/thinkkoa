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
module.exports = class Loader {
    constructor(app_path, options) {
        // 启动目录
        this.app_path = app_path;
        let loaders = [];
        if (options instanceof Array) {
            for (let option of options) {
                loaders = this.concat(loaders, this.loader(option));
            }
        } else {
            loaders = this.loader(options);
        }

        return loaders;
    }

    /**
     * 
     * 
     * @param {any} dir 
     * @returns 
     */
    walk(dir) {
        dir = path.resolve(this.app_path, dir);
        const exist = fs.existsSync(dir);
        if (!exist) {
            return;
        }

        const files = fs.readdirSync(dir);
        let list = [];

        for (let file of files) {
            if (fs.statSync(path.resolve(dir, file)).isDirectory()) {
                list = list.concat(this.walk(path.resolve(dir, file)));
            } else {
                list.push(path.resolve(dir, file));
            }
        }

        return list;
    }

    /**
     * 
     * 
     * @param {any} [options={}] 
     * @returns 
     */
    loader(options = {}) {

        assert(typeof options.root === 'string', 'root must be specified');

        options.suffix = options.suffix || '.js';
        options.prefix = options.prefix || '';
        options.filter = options.filter || [];

        let loaders = [];
        let paths = this.walk(options.root);
        if (!paths) {
            return;
        }

        for (let key in paths) {

            let name = path.relative(path.resolve(this.app_path, options.root), paths[key]);
            let regExp = new RegExp(`${options.suffix}$`);

            if (regExp.test(name)) {
                name = name.slice(0, name.lastIndexOf(options.suffix));

                options.filter.forEach(function (v, i) {
                    name = name.replace(v, '');
                });

                name = options.prefix + name;
                name = name.replace(/\\/g, '/');

                loaders[name] = lib.require(paths[key]);
            }
        }

        return loaders;
    }

    /**
     * 
     * 
     * @param {any} arr1 
     * @param {any} arr2 
     * @returns 
     */
    concat(arr1, arr2) {
        let arr = arr1;
        for (let key in arr2) {
            arr[key] = arr2[key];
        }

        return arr;
    }
};