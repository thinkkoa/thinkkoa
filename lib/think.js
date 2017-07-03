'use strict';

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */
const path = require('path');
const koa = require('koa');

const lib = require('./util/lib.js');
const pkg = require('../package.json');
const base = require('./base.js');
const loader = require('./util/loader.js');
const server = require('./util/server.js');

//define think object
global.think = lib;

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
        loader.loadConfigs();
        loader.loadMiddlewares();
        loader.loadModules();

        //catch error
        this.captureError();
        //emit app ready
        think.app.emit('appReady');

        // start webserver
        lib.define(think, 'server', new server({
            port: think._caches.configs.config.app_port || 3000,
            callback: this.koa.callback()
        }));
        //v8优化
        lib.toFastProperties(think);
        think.server.start();
    }

};