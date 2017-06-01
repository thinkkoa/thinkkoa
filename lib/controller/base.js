'use strict';

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
     * header操作
     * @param name
     * @param value
     * @returns {type[]}
     */
    header(name, value) {
        return this.http.set(name, value);
    }

    /**
     * 获取userAgent
     * @returns {String|type[]|*}
     */
    userAgent() {
        return this.http.userAgent();
    }

    /**
     * 获取referrer
     * @param host
     * @returns {String|*}
     */
    referer(host) {
        return this.http.referrer(host);
    }
};