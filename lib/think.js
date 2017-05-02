'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const koa = require('koa');
const convert = require('koa-convert');
const debug = require('debug')('ThinkKoa');

const lib = require('./util/lib.js');
const pkg = require('../package.json');
const loader = require('./util/loader.js');
const config = require('./config/config.js');
const controller = require('./controller/base.js');

//define think object
global.think = (0, _create2.default)(lib);

module.exports = class {
    constructor(options = {}) {
        this.options = options;
        // instances koa
        this.koa = new koa();
        this.init();
    }

    init() {
        // app path
        const root_path = this.options.root_path || process.env.root_path || process.cwd();
        const app_path = path.resolve(root_path, this.options.app_path || process.env.app_path || 'app');
        const think_path = path.dirname(__dirname);
        think.app_path = app_path;
        think.root_path = root_path;
        think.think_path = think_path;
        think.app_debug = this.options.app_debug || false;

        //debug模式 node --debug index.js
        if (think.app_debug || process.execArgv.indexOf('--debug') > -1) {
            think.app_debug = true;
        }
        //生产环境
        if (process.execArgv.indexOf('--production') > -1 || process.env.NODE_ENV === 'production') {
            think.app_debug = false;
        }

        // check env
        this.checkNodeVersion();
        this.checkDependencies();
        think.version = pkg.version;

        // app
        think.app = this.koa;
        // constroller
        think.controller = controller;
        // caches
        think._caches = {};

        // koa middleware
        think.use = fn => {
            if (lib.isGenerator(fn)) {
                fn = convert(fn);
            }
            this.koa.use(fn);
        };
        //express middleware
        think.useExp = fn => {
            fn = lib.parseExpMiddleware(fn);
            think.use(fn);
        };
    }

    /**
     * check node version
     * @return {} []
     */
    checkNodeVersion() {
        think.node_engines = pkg.engines.node.slice(1) || '6.0.0';
        let nodeVersion = process.version;
        if (nodeVersion[0] === 'v') {
            nodeVersion = nodeVersion.slice(1);
        }
        if (think.node_engines > nodeVersion) {
            lib.log(`ThinkKoa need node version > ${think.node_engines}, current version is ${nodeVersion}, please upgrade it.`, 'error');
            process.exit();
        }
    }

    /**
     * check dependencies is installed before server start
     * @return {} []
     */
    checkDependencies() {
        for (let p in pkg.dependencies) {
            if (!lib.isDir(`${think.root_path}${lib.sep}node_modules${lib.sep}${p}`)) {
                lib.log(` package \`${p}\` is not installed. please run 'npm install' command before start server.`, 'error');
                process.exit();
            }
        }
    }

    /**
     * 注册异常处理
     * 
     */
    captureError() {
        //koa 错误
        this.koa.on('error', (err, ctx) => {
            lib.log(err, 'error');
        });

        //promise reject错误
        process.on('unhandledRejection', (reason, promise) => {
            lib.log(reason, 'error');
        });

        //未知错误
        process.on('uncaughtException', err => {
            lib.log(err, 'error');
            if (err.message.indexOf(' EADDRINUSE ') > -1) {
                process.exit();
            }
        });
    }

    /**
     * 加载配置
     * 
     */
    loadConfigs() {
        think._caches.configs = lib.extend(false, config, new loader(__dirname, config.loader.configs));
    }

    /**
     * 加载中间件
     * 
     */
    loadMiddlewares() {
        think._caches.middlewares = new loader(__dirname, { root: 'middleware', prefix: '' });

        //框架默认顺序加载的中间件
        think._caches.middleware_list = ['logger', 'static'];
        think._caches.configs.middleware = think._caches.configs.middleware || { list: [], config: {} };

        if (think._caches.configs.loader && think._caches.configs.loader.middlewares) {
            think._caches.middlewares = lib.extend(false, think._caches.middlewares, new loader(think.app_path, think._caches.configs.loader.middlewares));
        }

        if (think._caches.configs.middleware.list && think._caches.configs.middleware.list.length > 0) {
            think._caches.configs.middleware.list.forEach(item => {
                if (!think._caches.middleware_list.includes(item)) {
                    think._caches.middleware_list.push(item);
                }
            });
        }

        // 自动加载中间件
        think._caches.middleware_list.forEach(key => {
            if (!think._caches.middlewares[key]) {
                throw new Error(`middleware ${key} not found, please export the middleware`);
                return;
            }
            if (think._caches.configs.middleware.config[key] === true) {
                think.use(think._caches.middlewares[key]());
                return;
            }
            think.use(think._caches.middlewares[key](think._caches.configs.middleware.config[key]));
        });
    }

    /**
     * 加载模块
     * 
     */
    loadModules() {
        let modules = [],
            deny_list = think._caches.configs.deny_modules || [];
        if (think._caches.configs.loader) {
            for (let key in think._caches.configs.loader) {
                // 移除重复加载
                if (key === 'configs' || key === 'middlewares') {
                    continue;
                }
                think._caches[key] = new loader(think.app_path, lib.config('loader')[key]);
            }
            for (let key in think._caches.controllers) {
                let paths = key.split('/');
                if (paths.length < 3) {
                    continue;
                }
                modules.push(paths[1]);
            }
            let unionSet = new _set2.default([...modules]);
            modules = (0, _from2.default)(unionSet);
        }
        think._caches.modules = modules.filter(x => deny_list.indexOf(x) === -1);
    }

    /**
     * 文件自动重载
     * 
     */
    autoReload() {
        if (think.app_debug) {
            setInterval(() => {
                this.loadConfigs();
                this.loadMiddlewares();
                this.loadModules();
            }, 2000);
        }
    }

    /**
     * 
     * 
     */
    createServer() {
        if (!this.server) {
            const server = http.createServer(this.koa.callback());
            this.server = server;
        }
        let port = lib.config('app_port') || 3000;
        this.server.listen(port);
        lib.log(`Server running at http://127.0.0.1:${port}/`);
    }

    /**
     * 
     * 
     */
    run() {
        this.captureError();
        this.loadConfigs();
        this.loadMiddlewares();
        this.loadModules();
        //debug模式文件自动重载
        this.autoReload();
        //v8优化
        lib.toFastProperties(think);

        lib.log('====================================');
        this.createServer();
        lib.log(`Node.js Version: ${process.version}`);
        lib.log(`ThinkKoa Version: ${think.version}`);
        lib.log(`App File Auto Reload: ${think.app_debug ? 'open' : 'closed'}`);
        lib.log(`App Enviroment: ${think.app_debug ? 'debug mode' : 'production mode'}`);
        lib.log('====================================');
        think.app_debug && lib.log('Debugging mode is running, if the production environment, please modify the APP_DEBUG value to false', 'warn');
    }

};