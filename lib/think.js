'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

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

const lib = require('./util/lib.js');
const pkg = require('../package.json');
const base = require('./base.js');
const loader = require('./util/loader.js');
const controller = require('./controller/base.js');

//define think object
global.think = lib;

//auto load config
const loaderConf = {
    'configs': {
        root: 'config',
        prefix: ''
    },
    'controllers': {
        root: 'controller',
        prefix: ''
    },
    'middlewares': {
        root: 'middleware',
        prefix: ''
    },
    'models': {
        root: 'model',
        prefix: ''
    },
    'services': {
        root: 'service',
        prefix: ''
    }
};

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
        lib.define(think, 'root_path', root_path);
        lib.define(think, 'think_path', think_path);
        lib.define(think, 'app_path', app_path);

        think.app_debug = this.options.app_debug || false;

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
        lib.define(think, 'version', pkg.version);

        // app
        lib.define(think, 'app', this.koa);
        lib.define(think, 'base', base);
        lib.define(think, 'loader', loader);
        lib.define(think.controller, 'base', controller);

        // caches
        Object.defineProperty(think, '_caches', {
            value: {},
            writable: true,
            configurable: false,
            enumerable: false
        });

        // koa middleware
        lib.define(think, 'use', fn => {
            if (lib.isGenerator(fn)) {
                fn = lib.generatorToPromise(fn);
            }
            think.app.use(fn);
        });
        //express middleware
        lib.define(think, 'useExp', fn => {
            fn = lib.parseExpMiddleware(fn);
            think.use(fn);
        });
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
            lib.logs(new Error(`ThinkKoa need node version > ${think.node_engines}, current version is ${nodeVersion}, please upgrade it.`));
            process.exit();
        }
    }

    /**
     * 加载配置
     * 
     */
    loadConfigs() {
        think._caches.configs = new loader(__dirname, loaderConf.configs);
        think._caches.configs = lib.extend(think._caches.configs, new loader(think.app_path, loaderConf.configs), true);
    }

    /**
     * 加载中间件
     * 
     */
    loadMiddlewares() {
        think._caches.middlewares = new loader(__dirname, loaderConf.middlewares);
        //框架默认顺序加载的中间件
        think._caches._middleware_list = ['logger', 'http', 'error', 'static', 'payload', 'router'];
        //加载应用中间件
        let app_middlewares = new loader(think.app_path, loaderConf.middlewares);
        think._caches.middlewares = lib.extend(app_middlewares, think._caches.middlewares);
        //挂载应用中间件
        if (think._caches.configs.middleware.list && think._caches.configs.middleware.list.length > 0) {
            think._caches.configs.middleware.list.forEach(item => {
                if (!think._caches._middleware_list.includes(item)) {
                    think._caches._middleware_list.push(item);
                }
            });
        }
        //挂载控制器中间件
        think._caches._middleware_list.push('controller');

        // 自动调用中间件
        think._caches._middleware_list.forEach(key => {
            if (!key || !think._caches.middlewares[key]) {
                lib.logs(new Error(`middleware ${key} load error, please check the middleware`));
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
        for (let key in loaderConf) {
            // 避免重复加载
            if (['configs', 'middlewares'].indexOf(key) > -1) {
                continue;
            }
            // 保留关键字
            if (key.indexOf('_') === 0) {
                lib.logs('Reserved keywords are used in the load configuration', 'WARNING');
                continue;
            }
            think._caches[key] = new loader(think.app_path, loaderConf[key]);
        }

        think._caches._modules = [];
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
            think._caches._modules = (0, _from2.default)(unionSet);
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
        lib.logs(`Server running at http://127.0.0.1:${port}/`, 'THINK');
    }

    /**
     * 注册异常处理
     * 
     */
    captureError() {
        //koa 错误
        think.app.on('error', (err, ctx) => {
            lib.logs(err, 'ERROR');
        });

        //promise reject错误
        process.on('unhandledRejection', (reason, promise) => {
            lib.logs(reason, 'ERROR');
        });

        //未知错误
        process.on('uncaughtException', err => {
            lib.logs(err, 'ERROR');
            if (err.message.indexOf(' EADDRINUSE ') > -1) {
                process.exit();
            }
        });
    }

    /**
     * 
     * 
     */
    run() {
        this.loadConfigs();
        this.loadMiddlewares();
        this.loadModules();
        //emit app ready
        think.app.emit('appReady');
        //catch error
        this.captureError();
        //v8优化
        lib.toFastProperties(think);

        lib.logs('====================================', 'THINK');
        // start webserver
        this.createServer();
        lib.logs(`Node.js Version: ${process.version}`, 'THINK');
        lib.logs(`ThinkKoa Version: ${think.version}`, 'THINK');
        lib.logs(`App File Auto Reload: ${think.app_debug ? 'open' : 'closed'}`, 'THINK');
        lib.logs(`App Enviroment: ${think.app_debug ? 'debug mode' : 'production mode'}`, 'THINK');
        lib.logs('====================================', 'THINK');
        think.app_debug && lib.logs('Debugging mode is running, if the production environment, please modify the APP_DEBUG value to false', 'WARNING');
    }

};