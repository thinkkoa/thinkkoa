/**
 * base controller
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/5/27
 */
const url = require('url');
const lib = require('think_lib');
const base = require('../util/base.js');

module.exports = class baseController extends base {

    /**
     * constructor
     * 
     * @param {Mixed} ctx 
     * @param {Mixed} app 
     */
    init(ctx, app) {
        this.ctx = ctx || {};
        this.app = app || {};
    }
    /**
     * Call if the action is not found
     * 
     * @returns {any}
     */
    __empty() {
        return this.ctx.throw(404);
    }

    /**
     * Whether it is a GET request
     * @return {boolean} [description]
     */
    isGet() {
        return this.ctx.method === 'GET';
    }

    /**
     * Whether it is a POST request
     * @return {boolean} [description]
     */
    isPost() {
        return this.ctx.method === 'POST';
    }

    /**
     * Determines whether the METHOD request is specified
     * @param  {[string]}  method [description]
     * @return {boolean}        [description]
     */
    isMethod(method) {
        return this.ctx.method === method.toUpperCase();
    }

    /**
     * Whether it is an AJAX request
     * @return {boolean} [description]
     */
    isAjax() {
        return this.ctx.headers['x-requested-with'] === 'XMLHttpRequest';
    }

    /**
     * Whether it is a PJAX request
     * @return {boolean} [description]
     */
    isPjax() {
        return this.ctx.headers['x-pjax'] || this.ctx.headers['X-Pjax'] || false;
    }

    /**
     * Whether it is jsonp call
     * @param {[string]} name
     * @returns {boolean}
     */
    isJsonp(name = 'jsonpcallback') {
        return !!this.ctx.query[name];
    }

    /**
     * Get and construct querystring parameters
     * 
     * @param {string} name 
     * @param {[any]} value 
     * @returns {any}
     */
    get(name, value) {
        return this.ctx.querys(name, value);
    }

    /**
     * Get and construct POST parameters
     * @param {string} name
     * @param {[any]} value
     * @returns {any}
     */
    post(name, value) {
        return this.ctx.post(name, value);
    }

    /**
     * Get post or get parameters, post priority
     * @param {string} name
     * @returns {any}
     */
    param(name) {
        return this.ctx.param(name);
    }

    /**
     * Obtain and construct uploaded files
     * @param {string} name
     * @param {[any]} value
     * @returns {any}
     */
    file(name, value) {
        return this.ctx.file(name, value);
    }

    /**
     * Get or set headers.
     * 
     * @param {string} name 
     * @param {[string]} value 
     * @returns {any}
     */
    header(name, value) {
        if (name === undefined) {
            return this.ctx.headers;
        }
        if (value === undefined) {
            return this.ctx.get(name);
        }
        return this.ctx.set(name, value);
    }

    /**
     * Content-type operation
     * 
     * @param {string} contentType 
     * @param {[string]} encoding 
     * @returns {any}
     */
    types(contentType, encoding) {
        if (!contentType) {
            return (this.ctx.headers['content-type'] || '').split(';')[0].trim();
        }
        if (encoding !== false && contentType.toLowerCase().indexOf('charset=') === -1) {
            contentType += '; charset=' + (encoding || this.app.config('encoding'));
        }
        this.ctx.type = contentType;
        return null;
    }

    /**
     * Get referrer
     * @param {string} host
     * @returns {string}
     */
    referer(host) {
        let ref = this.ctx.headers.referer || this.ctx.headers.referrer || '';
        if (!ref || !host) {
            return ref;
        }
        return url.parse(host).hostname || '';
    }

    /**
     * set cache-control and expires header
     * 
     * @param {number} timeout 
     * @returns {null}
     */
    expires(timeout) {
        if (lib.isNumber(timeout)) {
            timeout = 30;
        }
        timeout = lib.toNumber(timeout) * 1000;
        let date = new Date(Date.now() + timeout);
        this.ctx.set('Cache-Control', `max-age=${timeout}`);
        this.ctx.set('Expires', date.toUTCString());
        return null;
    }

    /**
     * Url redirect
     * 
     * @param {string} urls 
     * @param {[string]} alt
     * @returns {any}
     */
    redirect(urls, alt) {
        this.ctx.redirect(urls, alt);
        // this.ctx.res.end();
        return this.app.prevent();
    }

    /**
     * Block access
     * 
     * @param {[number]} [code=403] 
     * @returns {any}
     */
    deny(code = 403) {
        this.ctx.throw(code);
        return this.app.prevent();
    }

    /**
     * Set response Body content
     * 
     * @param {any} data 
     * @param {[string]} [contentType='text/plain'] 
     * @param {[string]} [encoding='utf-8'] 
     * @returns {any}
     */
    write(data, contentType, encoding) {
        contentType = contentType || 'text/plain';
        encoding = encoding || this.app.config('encoding');
        this.types(contentType, encoding);
        this.ctx.body = data;
        return this.app.prevent();
    }

    /**
     * Respond to json formatted content 
     * 
     * @param {any} data 
     * @returns {any}
     */
    json(data) {
        return this.write(data, 'application/json');
    }

    /**
     * Respond to jsonp formatted content
     * 
     * @param {any} data 
     * @returns {any}
     */
    jsonp(data) {
        let callback = this.ctx.querys('callback') || 'callback';
        //过滤callback值里的非法字符
        callback = callback.replace(/[^\w\.]/g, '');
        if (callback) {
            data = `${callback}(${(data !== undefined ? JSON.stringify(data) : '')})`;
        }
        return this.write(data, 'application/json');
    }

    /**
     * Response to normalize json format content for success
     * 
     * @param {string} errmsg 
     * @param {any} data 
     * @param {[number]} [code=200] 
     * @param {[any]} [options={}] 
     * @returns {any}
     */
    success(errmsg, data, code = 200, options = {}) {
        let obj = {
            'status': 1,
            [(options.error_no_key || 'errno')]: code,
            [(options.error_msg_key || 'errmsg')]: errmsg || ''
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
     * @param {string} errmsg 
     * @param {any} data 
     * @param {[number]} [code=200] 
     * @param {[any]} [options={}] 
     * @returns {any}
     */
    ok(errmsg, data, code = 200, options = {}) {
        return this.success(errmsg, data, code, options);
    }

    /**
     * Response to normalize json format content for fail
     * 
     * @param {any} errmsg 
     * @param {any} data 
     * @param {[number]} [code=500] 
     * @param {[any]} [options={}] 
     * @returns {any}
     */
    error(errmsg, data, code = 500, options = {}) {
        let obj = {
            'status': 0,
            [(options.error_no_key || 'errno')]: code,
            [(options.error_msg_key || 'errmsg')]: (lib.isError(errmsg) ? errmsg.message : errmsg) || 'error'
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
     * @param {[number]} [code=500] 
     * @param {[any]} [options={}] 
     * @returns {any}
     */
    fail(errmsg, data, code = 500, options = {}) {
        return this.error(errmsg, data, code, options);
    }

    /**
     * Cookie operation, dependent on middleware `think_cookie`
     * 
     * @param {any} name 
     * @param {[any]} value 
     * @param {[any]} option 
     * @returns {any}
     */
    cookie(name, value, option) {
        if (!this.ctx.cookie) {
            return this.ctx.throw(500, 'The think_cookie middleware is not installed or configured incorrectly.');
        }
        return this.ctx.cookie(name, value, option);
    }

    /**
     * Session operation, dependent on middleware `think_session`
     * 
     * @param {any} name 
     * @param {[any]} value 
     * @param {[any]} timeout 
     * @returns {any}
     */
    session(name, value, timeout) {
        if (!this.ctx.session) {
            return this.ctx.throw(500, 'The think_session middleware is not installed or configured incorrectly.');
        }
        return this.ctx.session(name, value, timeout);
    }

    /**
     * Template assignment, dependent on middleware `think_view`
     * 
     * @param {string} name 
     * @param {any} value 
     * @returns {any}
     */
    set(name, value) {
        return this.assign(name, value);
    }

    /**
     * Template assignment, dependent on middleware `think_view`
     * 
     * @param {string} name 
     * @param {any} value 
     * @returns {any}
     */
    assign(name, value) {
        if (!this.ctx.assign) {
            return this.ctx.throw(500, 'The think_view middleware is not installed or configured incorrectly.');
        }
        return this.ctx.assign(name, value);
    }

    /**
     * Render the template and return the content, dependent on middleware `think_view`
     * 
     * @param {string} templateFile 
     * @param {any} data 
     * @returns {any}
     */
    compile(templateFile, data) {
        if (!this.ctx.compile) {
            return this.ctx.throw(500, 'The think_view middleware is not installed or configured incorrectly.');
        }
        return this.ctx.compile(templateFile, data);
    }

    /**
     * Positioning, rendering, output templates, dependent on middleware `think_view`
     * 
     * @param {string} templateFile 
     * @param {[any]} data 
     * @param {[string]} charset 
     * @param {[string]} contentType 
     * @returns {any}
     */
    display(templateFile, data, charset, contentType) {
        return this.render(templateFile, data, charset, contentType);
    }

    /**
     * Positioning, rendering, output templates, dependent on middleware `think_view`
     * 
     * @param {string} templateFile 
     * @param {[any]} data 
     * @param {[string]} charset 
     * @param {[string]} contentType 
     * @returns {any}
     */
    render(templateFile, data, charset, contentType) {
        if (!this.ctx.render) {
            return this.ctx.throw(500, 'The think_view middleware is not installed or configured incorrectly.');
        }
        return this.ctx.render(templateFile, data, charset, contentType);
    }
};