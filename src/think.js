/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */
const path = require('path');
const koa = require('koa');

//define think object
global.think = require('./util/lib.js');
const loader = require('./util/loader.js');
const server = require('./util/server.js');
const pkg = require('../package.json');
const base = require('./base.js');

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
        think.define(think, 'root_path', root_path);
        think.define(think, 'think_path', think_path);
        think.define(think, 'app_path', app_path);

        think.app_debug = this.options.app_debug || false;

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
        think.define(think, 'version', pkg.version);

        // app
        think.define(think, 'app', this.koa);
        // base class
        think.define(think, 'base', base);
        // loader class
        think.define(think, 'loader', loader);

        // caches
        Object.defineProperty(think, '_caches', {
            value: {},
            writable: true,
            configurable: false,
            enumerable: false
        });

        // koa middleware
        think.define(think, 'use', fn => {
            if (think.isGenerator(fn)) {
                fn = think.generatorToPromise(fn);
            }
            think.app.use(fn);
        });
        //express middleware
        think.define(think, 'useExp', fn => {
            fn = think.parseExpMiddleware(fn);
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
            console.error(`ThinkKoa need node version > ${think.node_engines}, current version is ${nodeVersion}, please upgrade it.` );
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
            if(!think.isPrevent(err)) {
                console.error(err);
            }
        });

        //promise reject错误
        process.removeAllListeners('unhandledRejection');
        process.on('unhandledRejection', (reason, promise) => {
            if(!think.isPrevent(reason)) {
                console.error(reason);
            }
        });

        //未知错误
        process.on('uncaughtException', err => {
            if(!think.isPrevent(err)) {
                console.error(err);
            }
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
        loader.loadConfigs();
        loader.loadMiddlewares();
        loader.loadControllers();
        loader.loadModules();
        
        //catch error
        this.captureError();
        //emit app ready
        think.app.emit('appReady');

        // start webserver
        think.define(think, 'server', new server({
            port: think._caches.configs.config.app_port || 3000,
            callback: this.koa.callback()
        }));

        //v8优化
        think.toFastProperties(think);
        think.server.start();
    }

};