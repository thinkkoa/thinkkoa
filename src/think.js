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
const assert = require('assert');
const lodash = require('lodash');
const convert = require('koa-convert');
const debug = require('debug')('ThinkKoa');

const lib = require('./util/lib.js');
const pkg = require('../package.json');
const loader = require('./util/loader.js');
const config = require('./conf/config.js');
const controller = require('./controller/base.js');
const middleware = require('./middleware/base.js');

//define think object
global.think = Object.create(lib);

module.exports = class {
    constructor(options = {}) {
        this.options = options;
        // instances koa
        this.koa = new koa();
        this.init();
    }

    init() {
        // check env
        this.checkNodeVersion();
        this.checkDependencies();

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
        if ((process.execArgv.indexOf('--production') > -1) || (process.env.NODE_ENV === 'production')) {
            think.app_debug = false;
        }

        // app
        think.app = this.koa;
        // constroller
        think.controller = controller;
        // caches
        think._caches = {};

        // koa middleware
        think.use = fn => {
            if (lib.isGenerator(fn)){
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
            think.log(`ThinkKoa need node version > ${think.node_engines}, current version is ${nodeVersion}, please upgrade it.`, 'error');
            process.exit();
        }
    }

    /**
     * check dependencies is installed before server start
     * @return {} []
     */
    checkDependencies() {
        for (let p in pkg.dependencies) {
            if (!think.isDir(`${think.root_path}${think.sep}node_modules${think.sep}${p}`)) {
                think.log(` package \`${p}\` is not installed. please run 'npm install' command before start server.`, 'error');
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
            think.log(err);
        });

        //promise reject错误
        process.on('unhandledRejection', (reason, promise) => {
            think.log(reason);
        });

        //未知错误
        process.on('uncaughtException', err => {
            think.log(err);
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
        think._caches.configs = new loader(__dirname, config.loader.configs);
        think._caches.configs = lodash.mergeWith(think._caches.configs, new loader(think.app_path, config.loader.configs), lib.arrCustomizer);
    }

    /**
     * 加载中间件
     * 
     */
    loadMiddlewares() {
        think._caches.middlewares = new loader(__dirname, think.config('loader').middlewares);
        think._caches.middlewares = lodash.mergeWith(think._caches.middlewares, new loader(think._caches.app_path, think.config('loader').middlewares), lib.arrCustomizer);

        //中间件排序
        for (let key in think._caches.configs.middleware) {
            if (!lodash.includes(think._caches.configs.middleware['middleware'], key) && key !== 'middleware') {
                think._caches.configs.middleware['middleware'].push(key);
            }
        }
        // 自动加载中间件
        for (let key of think._caches.configs.middleware['middleware']) {
            if (!think._caches.configs.middleware[key]) {
                continue;
            }
            if (!think._caches.middlewares[key]) {
                throw new Error(`middleware ${key} not found, please export the middleware`);
                continue;
            }
            if (think._caches.configs.middleware[key] === true) {
                this.use(think._caches.middlewares[key]());
                continue;
            }
            this.use(think._caches.middlewares[key](think._caches.configs.middleware[key]));
        }
    }

    /**
     * 加载模块
     * 
     */
    loadModules() {
        for (let key in think.config('loader')) {
            // 移除重复加载
            if (key === 'configs' || key === 'middlewares') {
                continue;
            }
            think._caches[key] = new loader(think._caches.app_path, think.config('loader')[key]);
        }

        let modules = [], deny_list = think.config('deny_modules') || [];
        for (let key in think._caches.controllers) {
            let paths = key.split('/');
            if (paths.length < 3) {
                continue;
            }
            modules.push(paths[1]);
        }
        think._caches.modules = lodash.union(modules).filter(x => deny_list.indexOf(x) === -1);
    }

    /**
     * debug模式文件自动重载
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

    server() {
        if (!this.server) {
            const server = http.Server(this.koa.callback());
            this.server = server;
        }
        let port = think.config('app_port') || 3000;
        this.server.listen(port);
    }


};