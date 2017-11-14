/**
 * compatible with old editions < @1.11.0
 * 
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    11/11/27
 */
const pkg = require('../../package.json');
const base = require('../base.js');
const helper = require('./helper.js');
const loader = require('./loader.js');
const baseController = require('../controller/base.js');
const restfulController = require('../controller/restful.js');

/**
    * Gets or instantiates the controller
    * 
    * @param {any} name 
    * @param {any} ctx 
    * @returns 
    */
const controller = function (name, ctx) {
    try {
        if (!name) {
            return base;
        }
        let cls, caches = think._caches.controllers || {};
        if (helper.isObject(name) && name.__filename) {
            cls = helper.require(name.__filename);
        } else if (caches[name]) {
            cls = caches[name];
        }
        if (!cls) {
            throw Error(`Controller ${name} is undefined`);
        }
        if (ctx && ctx.req) {
            return new cls(ctx);
        }
        return cls;
    } catch (err) {
        helper.logger.error(err);
        return null;
    }
};

/**
 * Configuration read
 * 
 * @param {any} name 
 * @param {string} [type='config']
 * @returns 
 */
const config = function (name, type = 'config') {
    try {
        let caches = think._caches.configs || {};
        caches[type] || (caches[type] = {});
        if (name === undefined) {
            return caches[type];
        }
        if (helper.isString(name)) {
            //name不含. 一级
            if (name.indexOf('.') === -1) {
                return caches[type][name];
            } else { //name包含. 二级
                let keys = name.split('.');
                let value = caches[type][keys[0]] || {};
                return value[keys[1]];
            }
        } else {
            return caches[type][name];
        }
    } catch (err) {
        helper.logger.error(err);
        return null;
    }
};


/**
 * Gets or instantiates a service class
 * 
 * @param {any} name 
 * @param {any} params 
 */
const service = function (name, params) {
    try {
        let cls, caches = think._caches.services || {};
        if (helper.isObject(name) && name.__filename) {
            cls = helper.require(name.__filename);
        } else if (caches[name]) {
            cls = caches[name];
        }
        if (!cls) {
            throw Error(`Service ${name} is undefined`);
        }
        if (params === undefined) {
            return cls;
        }
        return new cls(params || {});
    } catch (err) {
        helper.logger.error(err);
        return null;
    }
};

module.exports = function (app) {
    //define think object
    global.think = Object.create(helper);
    
    think.app = app;
    think.config = config;
    think.controller = controller;
    think.controller.base = baseController;
    think.controller.restful = restfulController;
    think.service = service;

    think.root_path = app.root_path;
    think.think_path = app.think_path;
    think.app_path = app.app_path;
    think.app_debug = app.app_debug || false;

    think.version = pkg.version;
    think.base = base;
    think.loader = loader;
    think.node_engines = pkg.engines.node.slice(1) || '6.0.0';
    // caches
    Object.defineProperty(think, '_caches', {
        value: {},
        writable: true,
        configurable: false,
        enumerable: false
    });

    return think;
};