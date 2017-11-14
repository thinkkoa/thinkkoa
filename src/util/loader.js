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
const helper = require('./helper.js');
// caches
let thinkkoa_caches = {};
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

/*eslint-disable consistent-return */
module.exports = class {
    constructor(loadPath, options, skip) {
        // 启动目录
        this.loadPath = loadPath;
        let loaders = {};
        if (options instanceof Array) {
            for (let option of options) {
                option.skip = skip || false;
                loaders = helper.extend(loaders, this.load(option) || {});
            }
        } else {
            options.skip = skip || false;
            loaders = this.load(options) || {};
        }
        return loaders;
    }

    /**
     * loop load
     * 
     * @param {any} dir 
     * @param {boolean} [skip=false] 
     * @returns 
     */
    walk(dir, skip = false) {
        dir = path.resolve(this.loadPath, dir);
        const exist = fs.existsSync(dir);
        if (!exist) {
            return;
        }

        const files = fs.readdirSync(dir);
        let list = [], p;

        for (let file of files) {
            p = fs.statSync(path.resolve(dir, file));
            if (!skip && p.isFile()) {
                list.push(path.resolve(dir, file));
            } else if (p.isDirectory()) {
                list = list.concat(this.walk(path.resolve(dir, file), false));
            }
        }

        return list;
    }

    /**
     * load files
     * 
     * @param {any} [options={}] 
     * @param {boolean} [skip=false] 
     * @returns 
     */
    load(options = {}) {
        assert(typeof options.root === 'string', 'root must be specified');

        options.suffix = options.suffix || '.js';
        options.filter = options.filter || [];
        options.skip = options.prefix === '/' ? true : (options.skip || false);

        let loaders = {};

        let paths = this.walk(options.root, options.skip);
        if (!paths) {
            return;
        }
        let name = '', tempPath = '', regExp = new RegExp(`${options.suffix}$`);
        for (let key in paths) {
            tempPath = paths[key].replace(/(\\|\/\/)/g, '/');
            name = path.relative(path.resolve(this.loadPath, options.root), tempPath);
            if (regExp.test(name)) {
                name = name.slice(0, name.lastIndexOf(options.suffix));
                /*eslint-disable no-loop-func */
                options.filter.forEach((v, i) => {
                    name = name.replace(v, '');
                });
                if (name) {
                    //clear require cache
                    this.cleanCache(tempPath);
                    loaders[name] = helper.require(tempPath);
                }
            }
        }

        return loaders;
    }

    /**
     * clear require cache
     * 
     * @param {any} modulePath 
     */
    cleanCache(modulePath) {
        try {
            // let module = require.cache[modulePath];
            // remove reference in module.parent
            // if (module && module.parent) {
            //     module.parent.children.splice(module.parent.children.indexOf(module), 1);
            // }
            // require.cache[modulePath] = null;
            delete require.cache[modulePath];
        } catch (e) { }
    }

    /**
     * Load configuration
     * 
     * @static
     * @memberof loader
     */
    static loadConfigs(app) {
        let configs = new this(app.think_path + '/lib', loaderConf.configs);
        configs = helper.extend(configs, new this(app.app_path, loaderConf.configs), true);
        //触发记录日志
        if (configs.config) {
            app.emit('logs', [configs.config.logs, configs.config.logs_path, configs.config.logs_level]);
        }
        think._caches && (think._caches.configs = configs);
        app.configs = configs;
        app.app_port = app.configs.config && app.configs.config.app_port ? app.configs.config.app_port : 3000;
    }

    /**
     * Load middleware
     * 
     * @static
     * @memberof loader
     */
    static loadMiddlewares(app) {
        app.middlewares = new this(app.think_path + '/lib', loaderConf.middlewares);
        //The default loading order for middleware
        app.middleware_list = ['trace', 'static', 'cookie', 'payload'];
        //Load the application middleware
        let app_middlewares = new this(app.app_path, loaderConf.middlewares);
        app.middlewares = helper.extend(app_middlewares, app.middlewares);
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

        think._caches && (think._caches.middlewares = app.middlewares);
        think._caches && (think._caches.middleware_list = app.middleware_list);

        //Automatically call middleware 
        app.middleware_list.forEach(key => {
            if (!key || !app.middlewares[key]) {
                helper.logger.error(`middleware ${key} load error, please check the middleware`);
                return;
            }
            if (app.configs.middleware.config[key] === false) {
                return;
            }
            if (app.configs.middleware.config[key] === true) {
                helper.use(app.middlewares[key]({}, app), app);
                return;
            }
            helper.use(app.middlewares[key](app.configs.middleware.config[key] || {}, app), app);
        });
    }

    /**
     * Load the controller
     * 
     * @static
     * @memberof loader
     */
    static loadControllers(app) {
        // app controller
        app.controllers = new this(app.app_path, loaderConf.controllers);
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
        think._caches && (think._caches.modules = app.modules);
    }

    /**
     * Load the application module
     * 
     * @static
     * @memberof loader
     */
    static loadModules(app) {
        for (let key in loaderConf) {
            // Avoid repeated loading
            if (['configs', 'controllers', 'middlewares'].indexOf(key) > -1) {
                continue;
            }
            // Keep keywords
            if (key.indexOf('_') === 0) {
                helper.logger.error('Reserved keywords are used in the load configuration');
                continue;
            }
            think._caches && (think._caches[key] = new this(app.app_path, loaderConf[key]));
        }
    }

};