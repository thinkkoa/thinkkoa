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

const lib = require('./util/lib.js');
const pkg = require('../package.json');
const loader = require('./util/loader.js');
const config = require('./config/config.js');

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
        if ((process.execArgv.indexOf('--production') > -1) || (process.env.NODE_ENV === 'production')) {
            think.app_debug = false;
            process.env.NODE_ENV = 'production';
        }

        // check env
        this.checkEnv();
        think.version = pkg.version;

        // app
        think.app = this.koa;
        // caches
        think._caches = {};

        // koa middleware
        think.use = fn => {
            if (lib.isGenerator(fn)) {
                fn = convert(fn);
            }
            think.app.use(fn);
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
    checkEnv() {
        think.node_engines = pkg.engines.node.slice(1) || '6.0.0';
        let nodeVersion = process.version;
        if (nodeVersion[0] === 'v') {
            nodeVersion = nodeVersion.slice(1);
        }
        if (think.node_engines > nodeVersion) {
            lib.log(`ThinkKoa need node version > ${think.node_engines}, current version is ${nodeVersion}, please upgrade it.`, 'ERROR');
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
            lib.log(err, 'ERROR');
        });

        //promise reject错误
        process.on('unhandledRejection', (reason, promise) => {
            lib.log(reason, 'ERROR');
        });

        //未知错误
        process.on('uncaughtException', err => {
            lib.log(err, 'ERROR');
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
        think._caches.configs = lib.extend(think._caches.configs, new loader(think.app_path, { root: 'config', prefix: '' }));
    }

    /**
     * 加载中间件
     * 
     */
    loadMiddlewares() {
        think._caches.middlewares = new loader(__dirname, config.loader.middlewares);
        //框架默认顺序加载的中间件
        think._caches.middleware_list = ['logger', 'http', 'static', 'payload'];
        //加载应用中间件
        let loader_config = think._caches.configs.config.loader.middlewares || '';
        if (loader_config) {
            let app_middlewares = new loader(think.app_path, loader_config);
            think._caches.middlewares = lib.extend(app_middlewares, think._caches.middlewares);
        }
        //挂载应用中间件
        if (think._caches.configs.middleware.list && think._caches.configs.middleware.list.length > 0) {
            think._caches.configs.middleware.list.forEach(item => {
                if (!(think._caches.middleware_list).includes(item)) {
                    (think._caches.middleware_list).push(item);
                }
            });
        }
        //加载路由中间件
        (think._caches.middleware_list).push('router');

        // 自动调用中间件
        think._caches.middleware_list.forEach(key => {
            if (!think._caches.middlewares[key]) {
                lib.log(`middleware ${key} not found, please export the middleware`, 'ERROR');
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
     * 加载控制器
     * 
     */
    loadControllers() {
        think._caches.controllers = new loader(__dirname, config.loader.controllers);
        think._caches.controllers.base && (think.controller = think._caches.controllers.base);
        think._caches.controllers = lib.extend(new loader(think.app_path, think._caches.configs.config.loader.controllers), think._caches.controllers);
    }

    /**
     * 加载模块
     * 
     */
    loadModules() {
        let app_config = think._caches.configs.config || {};
        let modules = [], deny_list = app_config.deny_modules || [];
        for (let key in think._caches.controllers) {
            let paths = key.split('/');
            if (paths.length < 3) {
                continue;
            }
            modules.push(paths[1]);
        }
        let unionSet = new Set([...modules]);
        modules = Array.from(unionSet);
        think._caches.modules = modules.filter(x => deny_list.indexOf(x) === -1);
    }

    /**
     * 自动重载
     * 
     */
    autoReLoad() {
        if (think.app_debug) {
            setInterval(() => {
                this.loadConfigs();
                this.loadMiddlewares();
                this.loadControllers();
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
        lib.log(`Server running at http://127.0.0.1:${port}/`, 'THINK');
    }

    /**
     * 
     * 
     */
    run() {
        this.loadConfigs();
        this.loadMiddlewares();
        this.loadControllers();
        //自动重载
        this.autoReLoad();
        //v8优化
        lib.toFastProperties(think);

        lib.log('====================================', 'THINK');
        // start webserver
        this.createServer();
        lib.log(`Node.js Version: ${process.version}`, 'THINK');
        lib.log(`ThinkKoa Version: ${think.version}`, 'THINK');
        lib.log(`App File Auto Reload: ${(think.app_debug ? 'open' : 'closed')}`, 'THINK');
        lib.log(`App Enviroment: ${(think.app_debug ? 'debug mode' : 'production mode')}`, 'THINK');
        lib.log('====================================', 'THINK');
        think.app_debug && lib.log('Debugging mode is running, if the production environment, please modify the APP_DEBUG value to false', 'WARNING');
    }


};