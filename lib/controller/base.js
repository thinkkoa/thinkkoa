'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * base controller
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/5/27
 */
const base = require('../base.js');

module.exports = class extends base {

    /**
     * constructor
     * 
     * @param {any} ctx 
     */
    init(ctx) {
        this.ctx = ctx;
        //Ctx alias, compatible with previous usage
        this.http = this.ctx;
    }

    /**
     * Call if the action is not found
     * 
     * @returns 
     */
    __empty() {
        return this.ctx.throw(404);
    }

    /**
     * Whether it is a GET request
     * @return {Boolean} [description]
     */
    isGet() {
        return this.ctx.isGet();
    }

    /**
     * Whether it is a POST request
     * @return {Boolean} [description]
     */
    isPost() {
        return this.ctx.isPost();
    }

    /**
     * Determines whether the METHOD request is specified
     * @param  {[type]}  method [description]
     * @return {Boolean}        [description]
     */
    isMethod(method) {
        return this.ctx.method === method.toUpperCase();
    }

    /**
     * Whether it is an AJAX request
     * @return {Boolean} [description]
     */
    isAjax() {
        return this.ctx.isAjax();
    }

    /**
     * Whether it is a PJAX request
     * @return {Boolean} [description]
     */
    isPjax() {
        return this.ctx.isPjax();
    }

    /**
     * Whether it is jsonp call
     * @param name
     * @returns {Boolean}
     */
    isJsonp(name) {
        return this.ctx.isJsonp(name);
    }

    /**
     * Get headers
     * @param name
     * @returns {*}
     */
    get(name) {
        return this.ctx.get(name);
    }

    /**
     * Set headers
     * 
     * @param {any} name 
     * @param {any} value 
     * @returns 
     */
    set(name, value) {
        return this.ctx.set(name, value);
    }

    /**
     * Get and construct querystring parameters
     * 
     * @param {any} name 
     * @param {any} value 
     * @returns 
     */
    querys(name, value) {
        return this.ctx.querys(name, value);
    }

    /**
     * Get and construct POST parameters
     * @param name
     * @param value
     * @returns {Object|String|type[]|*}
     */
    post(name, value) {
        return this.ctx.post(name, value);
    }

    /**
     * Get post or get parameters, post priority
     * @param name
     * @returns {type[]|*|Object|String}
     */
    param(name) {
        return this.ctx.param(name);
    }

    /**
     * Obtain and construct uploaded files
     * @param name
     * @param value
     * @returns {*}
     */
    file(name, value) {
        return this.ctx.file(name, value);
    }

    /**
     * Content-type operation
     * 
     * @param {any} contentType 
     * @param {any} encoding 
     * @returns 
     */
    types(contentType, encoding) {
        return this.ctx.types(contentType, encoding);
    }

    /**
     * Get referrer
     * @param host
     * @returns {String|*}
     */
    referer(host) {
        return this.ctx.referer(host);
    }

    /**
     * Url redirect
     * 
     * @param {any} urls 
     * @param {any} alt 
     * @returns 
     */
    redirect(urls, alt) {
        this.ctx.redirect(urls, alt);
        // this.ctx.res.end();
        return think.prevent();
    }

    /**
     * Block access
     * 
     * @returns 
     */
    deny(code = 403) {
        this.ctx.throw(code);
        return think.prevent();
    }

    /**
     * Cookie operation
     * 
     * @param {any} name 
     * @param {any} value 
     * @param {any} option 
     * @returns 
     */
    cookie(name, value, option) {
        if (!this.ctx.cookie) {
            return this.ctx.throw(500, 'please install think_cookie middleware');
        }
        return this.ctx.cookie(name, value, option);
    }

    /**
     * Session operation
     * 
     * @param {any} name 
     * @param {any} value 
     * @param {any} timeout 
     * @returns 
     */
    session(name, value, timeout) {
        if (!this.ctx.session) {
            return this.ctx.throw(500, 'please install think_session middleware');
        }
        return this.ctx.session(name, value, timeout);
    }

    /**
     * Set response Body content
     * 
     * @param {any} data 
     * @param {any} contentType 
     * @param {any} encoding 
     * @returns 
     */
    write(data, contentType, encoding) {
        this.ctx.write(data, contentType, encoding);
        return think.prevent();
    }

    /**
     * Respond to json formatted content 
     * 
     * @param {any} data 
     * @returns 
     */
    json(data) {
        return this.write(data, 'application/json');
    }

    /**
     * Respond to jsonp formatted content
     * 
     * @param {any} data 
     * @returns 
     */
    jsonp(data) {
        let callback = this.ctx.querys('callback') || 'callback';
        //过滤callback值里的非法字符
        callback = callback.replace(/[^\w\.]/g, '');
        if (callback) {
            data = `${callback}(${data !== undefined ? (0, _stringify2.default)(data) : ''})`;
        }
        return this.write(data, 'application/json');
    }

    /**
     * Response to normalize json format content for success
     * 
     * @param {any} errmsg 
     * @param {any} data 
     * @param {number} [code=200] 
     * @param {any} [options={}] 
     * @returns 
     */
    success(errmsg, data, code = 200, options = {}) {
        let obj = {
            'status': 1,
            [options.error_no_key || 'errno']: code,
            [options.error_msg_key || 'errmsg']: errmsg || ''
        };
        if (data !== undefined) {
            obj.data = data;
        } else {
            obj.data = {};
        }
        return this.write(obj, 'application/json');
    }

    /**
     * Response to normalize json format content for success
     * 
     * @param {any} errmsg 
     * @param {any} data 
     * @param {number} [code=200] 
     * @param {any} [options={}] 
     * @returns 
     */
    ok(errmsg, data, code = 200, options = {}) {
        return this.success(errmsg, data, code, options);
    }

    /**
     * Response to normalize json format content for fail
     * 
     * @param {any} errmsg 
     * @param {any} data 
     * @param {number} [code=500] 
     * @param {any} [options={}] 
     * @returns 
     */
    error(errmsg, data, code = 500, options = {}) {
        let obj = {
            'status': 0,
            [options.error_no_key || 'errno']: code,
            [options.error_msg_key || 'errmsg']: (think.isError(errmsg) ? errmsg.message : errmsg) || 'error'
        };
        if (data !== undefined) {
            obj.data = data;
        } else {
            obj.data = {};
        }
        return this.write(obj, 'application/json');
    }

    /**
     * Response to normalize json format content for fail
     * 
     * @param {any} errmsg 
     * @param {any} data 
     * @param {number} [code=500] 
     * @param {any} [options={}] 
     * @returns 
     */
    fail(errmsg, data, code = 500, options = {}) {
        return this.error(errmsg, data, code, options);
    }

    /**
     * Template assignment, dependent on middleware think_view
     * 
     * @param {any} name 
     * @param {any} value 
     * @returns 
     */
    assign(name, value) {
        if (!this.ctx.assign) {
            return this.ctx.throw(500, 'please install think_view middleware');
        }
        return this.ctx.assign(name, value);
    }

    /**
     * Render the template and return the content, relying on the middleware think_view
     * 
     * @param {any} templateFile 
     * @param {any} charset 
     * @param {any} contentType 
     */
    compile(templateFile, data) {
        if (!this.ctx.compile) {
            return this.ctx.throw(500, 'please install think_view middleware');
        }
        return this.ctx.compile(templateFile, data);
    }

    /**
     * Positioning, rendering, output templates, relying on middleware think_view
     * 
     * @param {any} templateFile 
     * @param {any} data 
     * @param {any} charset 
     * @param {any} contentType 
     * @returns 
     */
    render(templateFile, data, charset, contentType) {
        if (!this.ctx.render) {
            return this.ctx.throw(500, 'please install think_view middleware');
        }
        return this.ctx.render(templateFile, data, charset, contentType);
    }

    /**
     * Positioning, rendering, output templates, relying on middleware think_view
     * 
     * @param {any} templateFile 
     * @param {any} charset 
     * @param {any} contentType 
     */
    display(templateFile, charset, contentType) {
        return this.render(templateFile, charset, contentType);
    }
};