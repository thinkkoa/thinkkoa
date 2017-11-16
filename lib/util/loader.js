/**
 * loader class
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const lib = require('think_lib');
const logger = require('think_logger');

//cache 
// Object.defineProperty(global, '__thinkcache', {
//     value: {},
//     writable: true,
//     configurable: false,
//     enumerable: false
// });

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

/**
 * 
 * 
 * @param {any} loadPath 
 * @param {any} options 
 * @param {any} skip 
 * @returns 
 */
const loader = function (loadPath, options, skip) {
    let items = {};
    if (lib.isArray(options)) {
        for (let option of options) {
            option.skip = skip || false;
            items = lib.extend(items, load(loadPath, option) || {});
        }
    } else {
        options.skip = skip || false;
        items = load(loadPath, options) || {};
    }
    return items;
};

/**
 * loop load
 * 
 * @param {any} loadPath 
 * @param {any} dir 
 * @param {boolean} [skip=false] 
 * @returns 
 */
const walk = function (loadPath, dir, skip = false) {
    dir = path.resolve(loadPath, dir);
    const exist = fs.existsSync(dir);
    let list = [];
    if (!exist) {
        return list;
    }
    const files = fs.readdirSync(dir);
    let p;
    for (let file of files) {
        p = fs.statSync(path.resolve(dir, file));
        if (!skip && p.isFile()) {
            list.push(path.resolve(dir, file));
        } else if (p.isDirectory()) {
            list = list.concat(walk(loadPath, path.resolve(dir, file), false));
        }
    }
    return list;
};

/**
 * clear require cache
 * 
 * @param {any} modulePath 
 */
const cleanCache = function (modulePath) {
    try {
        // let module = require.cache[modulePath];
        // remove reference in module.parent
        // if (module && module.parent) {
        //     module.parent.children.splice(module.parent.children.indexOf(module), 1);
        // }
        // require.cache[modulePath] = null;
        delete require.cache[modulePath];
    } catch (e) {
        return;
    }
};

/**
 * load files
 * 
 * @param {any} loadPath 
 * @param {any} [options={}] 
 * @returns 
 */
const load = function (loadPath, options = {}) {
    assert(typeof options.root === 'string', 'root must be specified');

    options.suffix = options.suffix || '.js';
    options.filter = options.filter || [];
    options.skip = options.prefix === '/' ? true : (options.skip || false);

    let loaders = {};

    let paths = walk(loadPath, options.root, options.skip);
    if (!paths) {
        return loaders;
    }
    let name = '', tempPath = '', regExp = new RegExp(`${options.suffix}$`);
    for (let key in paths) {
        tempPath = paths[key].replace(/(\\|\/\/)/g, '/');
        name = path.relative(path.resolve(loadPath, options.root), tempPath);
        if (regExp.test(name)) {
            name = name.slice(0, name.lastIndexOf(options.suffix));
            /*eslint-disable no-loop-func */
            options.filter.map(v => {
                name = name.replace(v, '');
            });
            if (name) {
                //clear require cache
                cleanCache(tempPath);
                loaders[name] = lib.require(tempPath);
            }
        }
    }

    return loaders;
};

/**
 * Load configuration
 * 
 * @param {any} app 
 */
loader.loadConfigs = function (app) {
    let configs = loader(app.think_path + '/lib', loaderConf.configs);
    configs = lib.extend(configs, loader(app.app_path, loaderConf.configs), true);
    //触发记录日志
    if (configs.config) {
        app.emit('logs', [configs.config.logs, configs.config.logs_path, configs.config.logs_level]);
    }
    app.configs = configs;
    // __thinkcache && (__thinkcache.configs = configs);
};

/**
 * Load middleware
 * 
 * @param {any} app 
 * @param {boolean} [run=true] 
 */
loader.loadMiddlewares = function (app, run = true) {
    app.middlewares = loader(app.think_path + '/lib', loaderConf.middlewares);
    //The default loading order for middleware
    app.middleware_list = ['trace', 'static', 'cookie', 'payload'];
    //Load the application middleware
    app.middlewares = lib.extend(app.middlewares, loader(app.app_path, loaderConf.middlewares));
    //Mount application middleware
    if (app.configs.middleware.list && app.configs.middleware.list.length > 0) {
        app.configs.middleware.list.forEach(item => {
            if (!(app.middleware_list).includes(item)) {
                (app.middleware_list).push(item);
            }
        });
    }
    //Mount routing middleware
    (app.middleware_list).push('router');
    //Mount the controller middleware
    (app.middleware_list).push('controller');

    // __thinkcache && (__thinkcache.middlewares = app.middlewares) && (__thinkcache.middleware_list = app.middleware_list);

    //Automatically call middleware 
    if (run) {
        app.middleware_list.forEach(key => {
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
};

/**
 * Load the controller
 * 
 * @param {any} app 
 */
loader.loadControllers = function (app) {
    // app controller
    app.controllers = loader(app.app_path, loaderConf.controllers);
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
        app.modules = Array.from(unionSet);
    }
    // __thinkcache && (__thinkcache.modules = app.modules);
};

/**
 * Load the application module
 * 
 * @param {any} app 
 */
loader.loadModules = function (app) {
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
        __thinkcache && (__thinkcache[key] = loader(app.app_path, loaderConf[key]));
    }
};

module.exports = loader;