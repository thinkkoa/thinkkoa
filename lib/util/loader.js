/**
 * loader
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */
const lib = require('think_lib');
const loader = require('think_loader');
const logger = require('think_logger');

//cache 
// Object.defineProperty(global, '__thinkcache', {
//     value: {},
//     writable: true,
//     configurable: false,
//     enumerable: false
// });

//default middleware list
const defaultMiddlewares = ['trace', 'static', 'cookie', 'payload'];
//auto load config
const loaderConf = {
    'configs': {
        root: 'config',
        prefix: '',
    },
    'controllers': {
        root: 'controller',
        prefix: '',
    },
    'middlewares': {
        root: 'middleware',
        prefix: '',
    },
    'models': {
        root: 'model',
        prefix: '',
    },
    'services': {
        root: 'service',
        prefix: '',
    }
};

module.exports = {
    /**
     * Load configuration
     * 
     * @param {any} app 
     */
    loadConfigs: function (app) {
        let configs = loader(app.think_path + '/lib', loaderConf.configs);
        configs = lib.extend(configs, loader(app.app_path, loaderConf.configs), true);
        //触发记录日志
        if (configs.config) {
            app.emit('logs', [configs.config.logs, configs.config.logs_path, configs.config.logs_level]);
        }
        // app.configs = configs;
        lib.define(app, 'configs', configs);
        // __thinkcache && (__thinkcache.configs = configs);
    },
    /**
     * Load middleware
     * 
     * @param {any} app 
     * @param {boolean} [run=true] 
     */
    loadMiddlewares: function (app, run = true) {
        let middlewares = loader(app.think_path + '/lib', loaderConf.middlewares);
        //Load the application middleware
        middlewares = lib.extend(middlewares, loader(app.app_path, loaderConf.middlewares));
        lib.define(app, 'middlewares', middlewares);
        //Mount application middleware
        if (app.configs.middleware.list && app.configs.middleware.list.length > 0) {
            app.configs.middleware.list.forEach(item => {
                if (!defaultMiddlewares.includes(item)) {
                    defaultMiddlewares.push(item);
                }
            });
        }
        //Mount routing middleware
        defaultMiddlewares.push('router');
        //Mount the controller middleware
        defaultMiddlewares.push('controller');
        // __thinkcache && (__thinkcache.middlewares = app.middlewares) && (__thinkcache.middleware_list = defaultMiddlewares);

        //Automatically call middleware 
        if (run) {
            defaultMiddlewares.forEach(key => {
                if (!key || !lib.isFunction(app.middlewares[key])) {
                    logger.error(`middleware ${key} load error, please check the middleware`);
                    return;
                }
                if (app.configs.middleware.config[key] === false) {
                    return;
                }
                if (app.configs.middleware.config[key] === true) {
                    app.use(app.middlewares[key]({}, app));
                    return;
                }
                app.use(app.middlewares[key](app.configs.middleware.config[key] || {}, app));
            });
        }
    },
    /**
     * Load the controller
     * 
     * @param {any} app 
     */
    loadControllers: function (app) {
        // app controller
        // app.controllers = loader(app.app_path, loaderConf.controllers);
        lib.define(app, 'controllers', loader(app.app_path, loaderConf.controllers));
        // __thinkcache && (__thinkcache.controllers = controllers);
        // muilte modules
        app.modules = [];
        if (app.controllers) {
            let modules = [];
            for (let key in app.controllers) {
                let paths = key.split('/');
                if (paths.length < 2) {
                    continue;
                }
                modules.push(paths[0]);
            }
            let unionSet = new Set([...modules]);
            // app.modules = Array.from(unionSet);
            lib.define(app, 'modules', Array.from(unionSet));
        }
        // __thinkcache && (__thinkcache.modules = app.modules);
    },
    /**
     * Load the application module
     * 
     * @param {any} app 
     */
    loadModules: function (app) {
        for (let key in loaderConf) {
            // Avoid repeated loading
            if (['configs', 'controllers', 'middlewares'].indexOf(key) > -1) {
                continue;
            }
            // Keep keywords
            if (key.indexOf('_') === 0) {
                logger.error('Reserved keywords are used in the load configuration');
                continue;
            }
            lib.define(app, key, loader(app.app_path, loaderConf[key]));
            // __thinkcache && (__thinkcache[key] = loader(app.app_path, loaderConf[key]));
        }
    }
};