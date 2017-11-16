/**
 * loader
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/11/16
 */

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const lib = require('think_lib');

/**
 * 
 * 
 * @param {any} loadPath 
 * @param {any} options 
 * @param {any} skip 
 * @returns 
 */
const loader = function (loadPath, options, skip) {
    let items = {};
    if (lib.isArray(options)) {
        for (let option of options) {
            option.skip = skip || false;
            items = lib.extend(items, load(loadPath, option) || {});
        }
    } else {
        options.skip = skip || false;
        items = load(loadPath, options) || {};
    }
    return items;
};

/**
 * loop load
 * 
 * @param {any} loadPath 
 * @param {any} dir 
 * @param {boolean} [skip=false] 
 * @returns 
 */
const walk = function (loadPath, dir, skip = false) {
    dir = path.resolve(loadPath, dir);
    const exist = fs.existsSync(dir);
    let list = [];
    if (!exist) {
        return list;
    }
    const files = fs.readdirSync(dir);
    let p;
    for (let file of files) {
        p = fs.statSync(path.resolve(dir, file));
        if (!skip && p.isFile()) {
            list.push(path.resolve(dir, file));
        } else if (p.isDirectory()) {
            list = list.concat(walk(loadPath, path.resolve(dir, file), false));
        }
    }
    return list;
};

/**
 * clear require cache
 * 
 * @param {any} modulePath 
 */
const cleanCache = function (modulePath) {
    try {
        // let module = require.cache[modulePath];
        // remove reference in module.parent
        // if (module && module.parent) {
        //     module.parent.children.splice(module.parent.children.indexOf(module), 1);
        // }
        // require.cache[modulePath] = null;
        delete require.cache[modulePath];
    } catch (e) {
        return;
    }
};

/**
 * load files
 * 
 * @param {any} loadPath 
 * @param {any} [options={}] 
 * @returns 
 */
const load = function (loadPath, options = {}) {
    assert(typeof options.root === 'string', 'root must be specified');

    options.suffix = options.suffix || '.js';
    options.filter = options.filter || [];
    options.skip = options.prefix === '/' ? true : (options.skip || false);

    let items = {};

    let paths = walk(loadPath, options.root, options.skip);
    if (!paths) {
        return items;
    }
    let name = '', tempPath = '', regExp = new RegExp(`${options.suffix}$`);
    for (let key in paths) {
        tempPath = paths[key].replace(/(\\|\/\/)/g, '/');
        name = path.relative(path.resolve(loadPath, options.root), tempPath);
        if (regExp.test(name)) {
            name = name.slice(0, name.lastIndexOf(options.suffix));
            /*eslint-disable no-loop-func */
            options.filter.map(v => {
                name = name.replace(v, '');
            });
            if (name) {
                //clear require cache
                cleanCache(tempPath);
                items[name] = lib.require(tempPath);
            }
        }
    }

    return items;
};

module.exports = loader;