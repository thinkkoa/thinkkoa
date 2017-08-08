/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const lib = require('think_lib');

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
                loaders = lib.extend(loaders, this.load(option) || {});
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
                    loaders[name] = lib.require(tempPath);
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
     * 加载配置
     * 
     * @static
     * @memberof loader
     */
    static loadConfigs() {
        think._caches.configs = new this(think.think_path + '/lib', loaderConf.configs);
        think._caches.configs = lib.extend(think._caches.configs, new this(think.app_path, loaderConf.configs), true);
    }

    /**
     * 加载中间件
     * 
     * @static
     * @memberof loader
     */
    static loadMiddlewares() {
        think._caches.middlewares = new this(think.think_path + '/lib', loaderConf.middlewares);
        //框架默认顺序加载的中间件
        think._caches._middleware_list = ['trace', 'context', 'cookie', 'static', 'payload'];
        //加载应用中间件
        let app_middlewares = new this(think.app_path, loaderConf.middlewares);
        think._caches.middlewares = lib.extend(app_middlewares, think._caches.middlewares);
        //挂载应用中间件
        if (think._caches.configs.middleware.list && think._caches.configs.middleware.list.length > 0) {
            think._caches.configs.middleware.list.forEach(item => {
                if (!(think._caches._middleware_list).includes(item)) {
                    (think._caches._middleware_list).push(item);
                }
            });
        }
        //挂载路由中间件
        (think._caches._middleware_list).push('router');
        //挂载控制器中间件
        (think._caches._middleware_list).push('controller');

        // 自动调用中间件
        think._caches._middleware_list.forEach(key => {
            if (!key || !think._caches.middlewares[key]) {
                console.error(`middleware ${key} load error, please check the middleware`);
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
     * @static
     * @memberof loader
     */
    static loadControllers() {
        !think.controller && (lib.define(think, 'controller', {}, 1));
        let controllers = new this(think.think_path + '/lib', loaderConf.controllers);
        for (let n in controllers) {
            // base controller
            !think.controller[n] && (lib.define(think.controller, n, controllers[n]));
        }
        // app controller
        think._caches.controllers = new this(think.app_path, loaderConf.controllers);
    }

    /**
     * 加载模块
     * 
     * @static
     * @memberof loader
     */
    static loadModules() {
        for (let key in loaderConf) {
            // 避免重复加载
            if (['configs', 'controllers', 'middlewares'].indexOf(key) > -1) {
                continue;
            }
            // 保留关键字
            if (key.indexOf('_') === 0) {
                console.error('Reserved keywords are used in the load configuration');
                continue;
            }
            think._caches[key] = new this(think.app_path, loaderConf[key]);
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
            let unionSet = new Set([...modules]);
            think._caches._modules = Array.from(unionSet);
        }
    }

};