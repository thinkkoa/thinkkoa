'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/5/27
 */
const base = require('../base.js');

module.exports = class extends base {
    init(http) {
        this.ctx = http;
        this.http = http;
    }

    /**
     * 
     * 
     * @returns 
     */
    __empty() {
        return this.http.throw(404);
    }

    /**
     * 是否是GET请求
     * @return {Boolean} [description]
     */
    isGet() {
        return this.http.isGet();
    }

    /**
     * 是否是POST请求
     * @return {Boolean} [description]
     */
    isPost() {
        return this.http.isPost();
    }

    /**
     * 是否是特定METHOD请求
     * @param  {[type]}  method [description]
     * @return {Boolean}        [description]
     */
    isMethod(method) {
        return this.http.method === method.toUpperCase();
    }

    /**
     * 是否是AJAX请求
     * @return {Boolean} [description]
     */
    isAjax() {
        return this.http.isAjax();
    }

    /**
     * 是否是PJAX请求
     * @return {Boolean} [description]
     */
    isPjax() {
        return this.http.isPjax();
    }

    /**
     * 是否是jsonp接口
     * @param name
     * @returns {Boolean}
     */
    isJsonp(name) {
        return this.http.isJsonp(name);
    }

    /**
     * 获取及构造QUERY参数
     * @param name
     * @param value
     * @returns {*}
     */
    get(name, value) {
        return this.http.get(name, value);
    }

    /**
     * 获取及构造POST参数
     * @param name
     * @param value
     * @returns {Object|String|type[]|*}
     */
    post(name, value) {
        return this.http.post(name, value);
    }

    /**
     * 获取post或get参数,post优先
     * @param name
     * @returns {type[]|*|Object|String}
     */
    param(name) {
        return this.http.param(name);
    }

    /**
     * 获取及构造上传的文件
     * @param name
     * @param value
     * @returns {*}
     */
    file(name, value) {
        return this.http.file(name, value);
    }

    /**
     * content-type 操作
     * 
     * @param {any} contentType 
     * @param {any} encoding 
     * @returns 
     */
    types(contentType, encoding) {
        return this.http.types(contentType, encoding);
    }

    /**
     * header操作
     * @param name
     * @param value
     * @returns {type[]}
     */
    headers(name, value) {
        return this.http.headers(name, value);
    }

    /**
     * 获取referrer
     * @param host
     * @returns {String|*}
     */
    referer(host) {
        return this.http.referrer(host);
    }

    /**
     * 
     * 
     * @param {any} urls 
     * @param {any} code 
     * @returns 
     */
    redirect(urls, code) {
        return this.http.redirect(urls, code);
    }

    /**
     * 
     * 
     * @returns 
     */
    deny() {
        return this.http.deny();
    }

    /**
     * 
     * 
     * @param {any} name 
     * @param {any} value 
     * @param {any} option 
     * @returns 
     */
    cookies(name, value, option) {
        return this.http.cookies(name, value, option);
    }

    /**
     * 
     * 
     * @param {any} data 
     * @param {any} contentType 
     * @param {any} encoding 
     * @returns 
     */
    echo(data, contentType, encoding) {
        return this.http.echo(data, contentType, encoding);
    }

    /**
     * 
     * 
     * @param {any} data 
     * @returns 
     */
    json(data) {
        return this.http.echo((0, _stringify2.default)(data), 'application/json');
    }

    /**
     * 
     * 
     * @param {any} data 
     * @returns 
     */
    jsonp(data) {
        let callback = this.get('callback');
        //过滤callback值里的非法字符
        callback = callback.replace(/[^\w\.]/g, '');
        if (callback) {
            data = `${callback}(${data !== undefined ? data : ''})`;
        }
        return this.http.echo((0, _stringify2.default)(data), 'application/json');
    }

    /**
     * 
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
        return this.http.echo(obj, 'application/json');
    }

    /**
     * 
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
     * 
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
        return this.http.echo(obj, 'application/json');
    }

    /**
     * 
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
     * 
     * 
     * @param {any} name 
     * @param {any} value 
     * @returns 
     */
    set(name, value) {
        !this.tVar && (this.tVar = {});
        if (name === undefined) {
            return this.tVar;
        }
        if (think.isString(name) && arguments.length === 1) {
            return this.tVar[name];
        }
        if (think.isObject(name)) {
            for (let key in name) {
                this.tVar[key] = name[key];
            }
        } else {
            this.tVar[name] = value;
        }
        return null;
    }

    /**
     * 
     * 
     * @param {any} name 
     * @param {any} value 
     * @returns 
     */
    assign(name, value) {
        return this.set(name, value);
    }

    /**
     * 
     * 
     * @param {any} templateFile 
     * @param {any} charset 
     * @param {any} contentType 
     */
    render(templateFile, charset, contentType) {
        if (!this.http.render) {
            return this.http.throw(500, 'please install think_view middleware');
        }
        return this.http.render(templateFile, charset, contentType);
    }

    /**
     * 
     * 
     * @param {any} templateFile 
     * @param {any} charset 
     * @param {any} contentType 
     * @returns 
     */
    display(templateFile, charset, contentType) {
        return this.render(templateFile, charset, contentType);
    }

    /**
     * 
     * 
     * @param {any} name 
     * @param {any} value 
     * @param {any} timeout 
     * @returns 
     */
    session(name, value, timeout) {
        if (!this.http.session) {
            return this.http.throw(500, 'please install think_session middleware');
        }
        return this.http.session(name, value, timeout);
    }

};