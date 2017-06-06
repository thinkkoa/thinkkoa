/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/5/2
 */
const { parse } = require('url');
const pathToRegexp = require('path-to-regexp');
const lib = require('../util/lib.js');

/**
 * 
 * 
 * @param {any} ctx 
 * @param {any} options 
 * @returns 
 */
const getPathname = function (ctx, options) {
    let pathname = ctx.path || '';
    const prefix = options.prefix;
    //remove prefix in pathname
    if (prefix && prefix.length) {
        prefix.some(item => {
            if (lib.isString(item) && pathname.indexOf(item) === 0) {
                pathname = pathname.slice(item.length);
                return true;
            }
            if (lib.isRegexp(item) && item.test(pathname)) {
                pathname = pathname.replace(item, '');
                return true;
            }
            return false;
        });
    }
    //remove suffix in pathname
    const suffix = options.suffix || '';
    if (suffix && suffix.length) {
        suffix.some(item => {
            if (lib.isString(item) && pathname.endsWith(item)) {
                pathname = pathname.slice(0, pathname.length - item.length);
                return true;
            }
            if (lib.isRegexp(item) && item.test(pathname)) {
                pathname = pathname.replace(item, '');
                return true;
            }
            return false;
        });
    }
    //deal subdomain
    let subdomain = options.subdomain || '';
    if (!lib.isEmpty(subdomain)) {
        if (options.subdomain_offset) {
            think.app.subdomainOffset = options.subdomain_offset;
        }
        let subdomainStr = ctx.subdomains().join(',');
        if (subdomainStr && subdomain[subdomainStr]) {
            if (pathname[0] === '/') {
                pathname = '/' + subdomain[subdomainStr] + pathname;
            } else {
                pathname = subdomain[subdomainStr] + '/' + pathname;
            }
        }
    }
    return pathname;
};

/**
 * 
 * 
 * @param {any} pathname 
 * @returns 
 */
const cleanPathname = function (pathname) {
    if (pathname === '/') {
        return '';
    }
    if (pathname[0] === '/') {
        pathname = pathname.slice(1);
    }
    if (pathname.slice(-1) === '/') {
        pathname = pathname.slice(0, -1);
    }
    return pathname;
};

/**
 * 
 * 
 * @param {any} ctx 
 * @param {any} pathname 
 * @param {any} options 
 * @param {boolean} [multi=false] 
 * @returns 
 */
const parsePathname = function (ctx, pathname, options, multi = false) {
    if (pathname) {
        pathname = cleanPathname(pathname);
        let paths = pathname.split('/') || [], modules = think._caches.modules || [], group = '';
        if (multi) {
            if (paths[0] && modules.indexOf(paths[0]) > -1) {
                group = paths.shift();
            }
            ctx.group = parseGroup(group, options.default_module);
        }
        ctx.controller = parseController(paths.shift(), options.default_controller);
        ctx.action = parseAction(paths.shift(), options.default_action);
        // parse params
        if (paths.length) {
            for (let i = 0, length = Math.ceil(paths.length) / 2; i < length; i++) {
                ctx._get[paths[i * 2]] = paths[i * 2 + 1] || '';
            }
        }
    }
    return ctx;
};
/**
 * 检测Group,Controller和Action是否合法
 * @type {RegExp}
 */
const nameReg = /^[A-Za-z\_0-9]\w*$/;

/**
 * 
 * 
 * @param {any} group 
 * @param {string} [value='home'] 
 * @returns 
 */
const parseGroup = function (group, value = 'home') {
    if (!group) {
        return value || 'home';
    }
    if (!nameReg.test(group)) {
        return null;
    }
    return group;
};

/**
 * 
 * 
 * @param {any} controller 
 * @param {string} [value='index'] 
 * @returns 
 */
const parseController = function (controller, value = 'index') {
    if (!controller) {
        return value || 'index';
    }
    if (!nameReg.test(controller)) {
        return null;
    }
    return controller;
};

/**
 * 
 * 
 * @param {any} action 
 * @param {string} [value='index'] 
 * @returns 
 */
const parseAction = function (action, value = 'index') {
    if (!action) {
        return value || 'index';
    }
    if (!nameReg.test(action)) {
        return null;
    }
    return action;
};

/**
 * 
 * ['/product', {
        get: "/home/product/index"
    }],
    ['/product/:id', {
        get: "/home/product/detail",
        post: "/home/product/add",
        put: "/home/product/update",
        delete: "/home/product/delete",
    }],
    ['/product', "/home/product/index"]
 * 
 * @param {any} ctx 
 * @param {any} routers 
 * @param {any} options 
 */
const parseRoute = function (ctx, routers, options) {
    let keys, regexp, regres, index, url, path, query, method = ctx.method;
    if (routers && routers.length) {
        for (let r in routers) {
            keys = [];
            regexp = pathToRegexp(routers[r][0], keys, { strict: true, sensitive: true });
            regres = regexp.exec(ctx.path);
            if (regres) {
                for (let k in keys) {
                    ctx._get[keys[k].name] = regres[parseInt(k) + 1];
                }
                index = r;
                break;
            }
        }
        if (index) {
            const router = routers[index][1];
            if (lib.isString(router)) {
                path = router;
                query = parse(ctx.url).search || '';
                url = path + query;
            } else {
                const routerMethod = router[method.toLowerCase()];
                if (routerMethod) {
                    path = routerMethod;
                    query = parse(ctx.url).search || '';
                    url = path + query;
                } else {
                    ctx.throw(403, 'Not Found Router');
                    return null;
                }
            }
            ctx.path = path;
            ctx.url = url;
        }
    }
    return ctx;
};

module.exports = function (options) {
    return function (ctx, next) {
        ctx.routers = think._caches.configs.router;
        if (ctx.routers) {
            parseRoute(ctx, ctx.routers, options);
        }

        const pathname = getPathname(ctx, options);
        ctx.originalPath = ctx.path;
        ctx.path = pathname;

        let modules = think._caches.modules || [];
        if (modules.length) {
            if (!ctx.denyModules) {
                //过滤禁止访问的模块
                ctx.denyModules = options.deny_modules || [];
                think._caches.modules = modules.filter(x => ctx.denyModules.indexOf(x) === -1);
            }
            parsePathname(ctx, pathname, options, true);
        } else {
            parsePathname(ctx, pathname, options);
        }

        return next();
    };
};