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
            for (let option of options) {
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
     * loop load
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
        let list = [], p;

        for (let file of files) {
            p = fs.statSync(path.resolve(dir, file));
            if (!skip && p.isFile()) {
                list.push(path.resolve(dir, file));
            } else if (p.isDirectory()){
                list = list.concat(this.walk(path.resolve(dir, file), false));
            }
        }

        return list;
    }

    /**
     * load files
     * 
     * @param {any} [options={}] 
     * @param {boolean} [skip=false] 
     * @returns 
     */
    load(options = {}) {
        assert(typeof options.root === 'string', 'root must be specified');

        options.suffix = options.suffix || '.js';
        options.filter = options.filter || [];
        options.skip = options.prefix === '/' ? true : (options.skip || false);

        let loaders = {};

        let paths = this.walk(options.root, options.skip);
        if (!paths) {
            return;
        }
        let name = '', group = '', tempPath = '', tempGroup = '', regExp = new RegExp(`${options.suffix}$`);
        for (let key in paths) {
            tempPath = paths[key].replace(new RegExp(lib.sep, 'g'), '/');
            name = path.relative(path.resolve(this.app_path, options.root), tempPath);
            if (regExp.test(name)) {
                name = name.slice(0, name.lastIndexOf(options.suffix));
                /*eslint-disable no-loop-func */
                options.filter.forEach( (v, i) => {
                    name = name.replace(v, '');
                });
                if (name) {
                    //clear require cache
                    this.cleanCache(tempPath);
                    loaders[name] = lib.require(tempPath);
                }
            }
        }

        return loaders;
    }

    /**
     * clear require cache
     * 
     * @param {any} modulePath 
     */
    cleanCache(modulePath) {
        let module = require.cache[modulePath];
        // remove reference in module.parent
        if (module.parent) {
            module.parent.children.splice(module.parent.children.indexOf(module), 1);
        }
        require.cache[modulePath] = null;
    }

};