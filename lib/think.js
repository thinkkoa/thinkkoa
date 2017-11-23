/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */
// rewite promise, bluebird is much faster
global.Promise = require('bluebird');
const koa = require('koa');
const path = require('path');
const lib = require('think_lib');
const logger = require('think_logger');
const pkg = require('../package.json');
const base = require('./util/base.js');
const loader = require('./util/loader.js');
const baseController = require('./controller/base.js');
const restController = require('./controller/restful.js');
const preventMessage = 'PREVENT_NEXT_PROCESS';

/**
 * check node version
 * @return {} []
 */
const checkEnv = function () {
    let node_engines = pkg.engines.node.slice(1) || '8.0.0';
    let nodeVersion = process.version;
    if (nodeVersion[0] === 'v') {
        nodeVersion = nodeVersion.slice(1);
    }
    if (node_engines > nodeVersion) {
        logger.error(`ThinkKoa need node version > ${node_engines}, current version is ${nodeVersion}, please upgrade it.`);
        process.exit();
    }
};

/**
 * Convert express middleware for koa
 * 
 * @param {any} fn 
 */
const parseExpMiddleware = function (fn) {
    return function (ctx, next) {
        if (fn.length < 3) {
            fn(ctx.req, ctx.res);
            return next();
        } else {
            return new Promise((resolve, reject) => {
                fn(ctx.req, ctx.res, err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(next());
                    }
                });
            });
        }
    };
};

//class
class ThinkKoa extends koa {
    constructor(options = {}) {
        super();
        // check env
        checkEnv();
        // initialize
        this.init(options);
    }

    /**
     * initialize env
     * 
     * @param {any} options 
     * @memberof ThinkKoa
     */
    init(options) {
        // define path        
        let root_path = options.root_path || process.env.root_path || process.cwd();
        let app_path = path.resolve(root_path, options.app_path || process.env.app_path || 'app');
        let think_path = path.dirname(__dirname);
        this.root_path = this.app_path = this.think_path = '';
        lib.define(this, 'root_path', root_path);
        lib.define(this, 'app_path', app_path);
        lib.define(this, 'think_path', think_path);
        
        process.env.ROOT_PATH = this.root_path;
        process.env.APP_PATH = this.app_path;
        process.env.THINK_PATH = this.think_path;

        //production env is default
        process.env.NODE_ENV = 'production';
        // if ((process.execArgv.indexOf('--production') > -1) || (process.env.NODE_ENV === 'production')) {
        //     this.app_debug = false;
        //     process.env.NODE_ENV = 'production';
        // }
        //debug mode: node --debug index.js
        this.app_debug = options.app_debug || false;
        if (this.app_debug || process.execArgv.indexOf('--debug') > -1) {
            this.app_debug = true;
            process.env.NODE_ENV = 'development';
        }

        // caches handle
        Object.defineProperty(this, '_caches', {
            value: {},
            writable: true,
            configurable: false,
            enumerable: false
        });
    }

    /**
     * Use the given middleware `fn`.
     * support generatro func
     * @param {any} fn 
     * @returns 
     * @memberof ThinkKoa
     */
    use(fn) {
        if (lib.isGenerator(fn)) {
            fn = lib.generatorToPromise(fn);
        }
        return super.use(fn);
    }

    /**
     * Use the given Express middleware `fn`.
     * 
     * @param {any} fn 
     * @returns 
     * @memberof ThinkKoa
     */
    useExp(fn) {
        fn = parseExpMiddleware(fn);
        return this.use(fn);
    }
    /**
     * Prevent next process
     * 
     * @returns 
     * @memberof ThinkKoa
     */
    prevent() {
        return Promise.reject(new Error(preventMessage));
    }
    
    /**
     * Check is prevent error
     * 
     * @param {any} err 
     * @returns 
     * @memberof ThinkKoa
     */
    isPrevent(err) {
        return lib.isError(err) && err.message === preventMessage;
    }

    /**
     * Read configuration
     * 
     * @param {any} name 
     * @param {string} [type='config'] 
     * @memberof ThinkKoa
     */
    config(name, type = 'config') {
        try {
            let caches = this.configs || {};
            caches[type] || (caches[type] = {});
            if (name === undefined) {
                return caches[type];
            }
            if (lib.isString(name)) {
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
            logger.error(err);
            return null;
        }
    }

    /**
     * registration exception handling
     * 
     * @memberof ThinkKoa
     */
    captureError() {
        // event logs
        this.on('logs', (args) => {
            process.env.LOGS = args[0] || false;
            process.env.LOGS_PATH = args[1] || this.root_path + '/logs';
            process.env.LOGS_LEVEL = args[2] || [];
        });
        //koa error
        this.on('error', (err) => {
            if (!this.isPrevent(err)) {
                logger.error(err);
            }
        });
        //promise reject error
        process.removeAllListeners('unhandledRejection');
        process.on('unhandledRejection', (reason) => {
            if (!this.isPrevent(reason)) {
                logger.error(reason);
            }
        });
        //ubcaugth exception
        process.on('uncaughtException', err => {
            if (!this.isPrevent(err)) {
                logger.error(err);
            }
            if (err.message.indexOf('EADDRINUSE') > -1) {
                process.exit();
            }
        });
    }

    /**
     * Shorthand for:
     * http.createServer(app.callback()).listen(...)
     */
    listen() {
        //catch error
        this.captureError();
        //AutoLoader
        loader.loadConfigs(this);
        loader.loadControllers(this);
        loader.loadMiddlewares(this);

        //emit app ready
        this.emit('appReady');

        //start server
        //port?: number, hostname?: string, backlog?: number, listeningListener?: Function
        let port = this.config('app_port') || 3000,
            hostname = this.config('app_hostname') || '127.0.0.1',
            app_debug = this.app_debug || false;
        return super.listen({
            port: port,
            hostname: hostname,
            backlog: this.config('app_backlog') || undefined
        }, function () {
            console.log('  ________    _       __   __ \n /_  __/ /_  (_)___  / /__/ /______  ____ _\n  / / / __ \\/ / __ \\/ //_/ //_/ __ \\/ __ `/\n / / / / / / / / / / ,< / /,</ /_/ / /_/ /\n/_/ /_/ /_/_/_/ /_/_/|_/_/ |_\\____/\\__,_/');
            console.log(`                     https://ThinkKoa.org/`);
            logger.custom('think', '', '====================================');
            logger.custom('think', '', `Server running at http://${hostname}:${port}/`);
            logger.custom('think', '', `Nodejs Version: ${process.version}`);
            logger.custom('think', '', `ThinkKoa Version: v${pkg.version}`);
            logger.custom('think', '', `App Enviroment: ${app_debug ? 'debug mode' : 'production mode'}`);
            logger.custom('think', '', '====================================');
            app_debug && logger.warn(`Running in debug mode, please modify the app_debug value to false when production env.`);
        });
    }
}

//propertys
ThinkKoa.base = base;
ThinkKoa.helper = lib;
ThinkKoa.logger = logger;
ThinkKoa.loader = loader;
ThinkKoa.version = pkg.version;
baseController.restful = restController;
ThinkKoa.controller = baseController;

module.exports = ThinkKoa;