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
const path = require('path');
const http = require('http');
const koa = require('koa');
const convert = require('koa-convert');

const lib = require('./util/lib.js');
const pkg = require('../package.json');
const base = require('./base.js');
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
        think.app_debug = this.options.app_debug || true;

        //debug模式 node --debug index.js
        if (think.app_debug || process.execArgv.indexOf('--debug') > -1) {
            think.app_debug = true;
            process.env.NODE_ENV = 'development';
        }
        //生产环境
        if (process.execArgv.indexOf('--production') > -1 || process.env.NODE_ENV === 'production') {
            think.app_debug = false;
            process.env.NODE_ENV = 'production';
        }

        // check env
        this.checkEnv();
        think.version = pkg.version;

        // app
        think.app = this.koa;
        think.loader = loader;
        // caches
        think._caches = {};
        think._caches.base = base;
        think._caches.controller = controller;

        // koa middleware
        think.use = fn => {
            if (think.isGenerator(fn)) {
                fn = convert(fn);
            }
            think.app.use(fn);
        };
        //express middleware
        think.useExp = fn => {
            fn = think.parseExpMiddleware(fn);
            think.use(fn);
        };
    }

    /**
     * check node version
     * @return {} []
     */
    checkEnv() {
        think.node_engines = pkg.engines.node.slice(1) || '6.0.0';
        let nodeVersion = process.version;
        if (nodeVersion[0] === 'v') {
            nodeVersion = nodeVersion.slice(1);
        }
        if (think.node_engines > nodeVersion) {
            think.log(`ThinkKoa need node version > ${think.node_engines}, current version is ${nodeVersion}, please upgrade it.`, 'ERROR');
            process.exit();
        }
    }

    /**
     * 注册异常处理
     * 
     */
    captureError() {
        //koa 错误
        think.app.on('error', (err, ctx) => {
            think.log(err, 'ERROR');
        });

        //promise reject错误
        process.on('unhandledRejection', (reason, promise) => {
            think.log(reason, 'ERROR');
        });

        //未知错误
        process.on('uncaughtException', err => {
            think.log(err, 'ERROR');
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
        think._caches.configs = new loader(__dirname, { root: 'config', prefix: '' });
        think._caches.configs = think.extend(think._caches.configs, new loader(think.app_path, { root: 'config', prefix: '' }), true);
    }

    /**
     * 加载中间件
     * 
     */
    loadMiddlewares() {
        think._caches.middlewares = new loader(__dirname, config.loader.middlewares);
        //框架默认顺序加载的中间件
        think._caches.middleware_list = ['logger', 'http', 'error', 'static', 'payload', 'router'];
        //加载应用中间件
        let loader_config = think._caches.configs.config.loader.middlewares || '';
        if (loader_config) {
            let app_middlewares = new loader(think.app_path, loader_config);
            think._caches.middlewares = think.extend(app_middlewares, think._caches.middlewares);
        }
        //挂载应用中间件
        if (think._caches.configs.middleware.list && think._caches.configs.middleware.list.length > 0) {
            think._caches.configs.middleware.list.forEach(item => {
                if (!think._caches.middleware_list.includes(item)) {
                    think._caches.middleware_list.push(item);
                }
            });
        }
        //挂载控制器中间件
        think._caches.middleware_list.push('controller');

        // 自动调用中间件
        think._caches.middleware_list.forEach(key => {
            if (!think._caches.middlewares[key]) {
                think.log(`middleware ${key} not found, please export the middleware`, 'ERROR');
                return;
            }
            if (think._caches.configs.middleware.config[key] === false) {
                return;
            }
            if (think._caches.configs.middleware.config[key] === true) {
                think.use(think._caches.middlewares[key]());
                return;
            }
            think.use(think._caches.middlewares[key](think._caches.configs.middleware.config[key] || {}));
        });
    }

    /**
     * 加载模块
     * 
     */
    loadModules() {
        let app_config = think._caches.configs.config || {};
        for (let key in app_config.loader) {
            // 保留关键字
            if (['configs', 'middlewares', 'middleware_list', 'modules', 'controller', 'model', 'service'].indexOf(key) > -1) {
                continue;
            }
            think._caches[key] = new loader(think.app_path, app_config.loader[key]);
        }

        think._caches.modules = [];
        if (think._caches.controllers) {
            let modules = [];
            for (let key in think._caches.controllers) {
                let paths = key.split('/');
                if (paths.length < 2) {
                    continue;
                }
                modules.push(paths[0]);
            }
            let unionSet = new _set2.default([...modules]);
            think._caches.modules = (0, _from2.default)(unionSet);
        }
    }

    /**
     * 自动重载
     * 
     */
    autoReLoad() {
        if (think.app_debug) {
            setInterval(() => {
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
            const server = http.createServer(think.app.callback());
            this.server = server;
        }
        let port = think._caches.configs.config.app_port || 3000;
        this.server.listen(port);
        think.log(`Server running at http://127.0.0.1:${port}/`, 'THINK');
    }

    /**
     * 
     * 
     */
    run() {
        this.loadConfigs();
        this.loadMiddlewares();
        this.loadModules();
        this.captureError();
        //自动重载
        this.autoReLoad();
        //emit app ready
        think.app.emit('appReady');
        //v8优化
        think.toFastProperties(think);

        think.log('====================================', 'THINK');
        // start webserver
        this.createServer();
        think.log(`Node.js Version: ${process.version}`, 'THINK');
        think.log(`ThinkKoa Version: ${think.version}`, 'THINK');
        think.log(`App File Auto Reload: ${think.app_debug ? 'open' : 'closed'}`, 'THINK');
        think.log(`App Enviroment: ${think.app_debug ? 'debug mode' : 'production mode'}`, 'THINK');
        think.log('====================================', 'THINK');
        think.app_debug && think.log('Debugging mode is running, if the production environment, please modify the APP_DEBUG value to false', 'WARNING');
    }

};