'use strict';

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */
const koa = require('koa');
const path = require('path');
const helper = require('./util/helper.js');
const loader = require('./util/loader.js');
const server = require('./util/server.js');
const compatible = require('./util/compatible.js');
const controller = require('./controller/base.js');
const restController = require('./controller/restful.js');
const pkg = require('../package.json');
const base = require('./base.js');

//class
class thinkkoa {
    constructor(options = {}) {
        // instances koa
        helper.define(this, 'koa', new koa());
        this.init(options);
    }

    init(options) {
        // app path
        this.root_path = options.root_path || process.env.root_path || process.cwd();
        this.app_path = path.resolve(this.root_path, options.app_path || process.env.app_path || 'app');
        this.think_path = path.dirname(__dirname);
        process.env.ROOT_PATH = this.root_path;
        process.env.APP_PATH = this.app_path;
        process.env.THINK_PATH = this.think_path;

        //debug模式 node --debug index.js
        this.app_debug = options.app_debug || false;
        if (this.app_debug || process.execArgv.indexOf('--debug') > -1) {
            this.app_debug = true;
            process.env.NODE_ENV = 'development';
        }
        //生产环境
        if (process.execArgv.indexOf('--production') > -1 || process.env.NODE_ENV === 'production') {
            this.app_debug = false;
            process.env.NODE_ENV = 'production';
        }
        // check env
        this.checkEnv();
        //compatible with old editions
        compatible(this);
    }

    /**
     * check node version
     * @return {} []
     */
    checkEnv() {
        this.node_engines = pkg.engines.node.slice(1) || '8.0.0';
        let nodeVersion = process.version;
        if (nodeVersion[0] === 'v') {
            nodeVersion = nodeVersion.slice(1);
        }
        if (this.node_engines > nodeVersion) {
            helper.logger.error(`ThinkKoa need node version > ${this.node_engines}, current version is ${nodeVersion}, please upgrade it.`);
            process.exit();
        }
    }

    /**
     * registration exception handling
     * 
     */
    captureError() {
        // event logs
        this.koa.on('logs', args => {
            process.env.LOGS = args[0] || false;
            process.env.LOGS_PATH = args[1] || this.root_path + '/logs';
            process.env.LOGS_LEVEL = args[2] || [];
        });
        //koa error
        this.koa.on('error', (err, ctx) => {
            if (!helper.isPrevent(err)) {
                helper.logger.error(err);
            }
        });
        //promise reject error
        process.removeAllListeners('unhandledRejection');
        process.on('unhandledRejection', (reason, promise) => {
            if (!helper.isPrevent(reason)) {
                helper.logger.error(reason);
            }
        });
        //ubcaugth exception
        process.on('uncaughtException', err => {
            if (!helper.isPrevent(err)) {
                helper.logger.error(err);
            }
            if (err.message.indexOf(' EADDRINUSE ') > -1) {
                process.exit();
            }
        });
    }

    /**
     * run app
     * 
     */
    run() {
        //catch error
        this.captureError();
        //loader
        loader.loadConfigs(this);
        loader.loadControllers(this);
        loader.loadMiddlewares(this);

        //emit app ready
        this.koa.emit('appReady');
        //define server
        this.server = new server({
            port: this.app_port || 3000,
            callback: this.koa.callback()
        });

        //start server
        this.server.start();
    }
}

//propertys
thinkkoa.base = base;
thinkkoa.helper = helper;
thinkkoa.version = pkg.version;
thinkkoa.controller = controller;
thinkkoa.restController = restController;

module.exports = thinkkoa;