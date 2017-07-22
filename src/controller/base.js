/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/5/27
 */
const base = require('../base.js');

module.exports = class extends base {
    init(ctx) {
        this.ctx = ctx;
        //别名,兼容之前的用法
        this.http = this.ctx;
    }

    /**
     * 
     * 
     * @returns 
     */
    __empty() {
        return this.ctx.throw(404);
    }

    /**
     * 是否是GET请求
     * @return {Boolean} [description]
     */
    isGet() {
        return this.ctx.isGet();
    }

    /**
     * 是否是POST请求
     * @return {Boolean} [description]
     */
    isPost() {
        return this.ctx.isPost();
    }

    /**
     * 是否是特定METHOD请求
     * @param  {[type]}  method [description]
     * @return {Boolean}        [description]
     */
    isMethod(method) {
        return this.ctx.method === method.toUpperCase();
    }

    /**
     * 是否是AJAX请求
     * @return {Boolean} [description]
     */
    isAjax() {
        return this.ctx.isAjax();
    }

    /**
     * 是否是PJAX请求
     * @return {Boolean} [description]
     */
    isPjax() {
        return this.ctx.isPjax();
    }

    /**
     * 是否是jsonp接口
     * @param name
     * @returns {Boolean}
     */
    isJsonp(name) {
        return this.ctx.isJsonp(name);
    }

    /**
     * 获取headers
     * @param name
     * @returns {*}
     */
    get(name) {
        return this.ctx.get(name);
    }

    /**
     * 设置headers
     * 
     * @param {any} name 
     * @param {any} value 
     * @returns 
     */
    set(name, value){
        return this.ctx.set(name, value);
    }

    /**
     * 获取及构造querystring参数
     * 
     * @param {any} name 
     * @param {any} value 
     * @returns 
     */
    querys(name, value){
        return this.ctx.querys(name, value);
    }

    /**
     * 获取及构造POST参数
     * @param name
     * @param value
     * @returns {Object|String|type[]|*}
     */
    post(name, value) {
        return this.ctx.post(name, value);
    }

    /**
     * 获取post或get参数,post优先
     * @param name
     * @returns {type[]|*|Object|String}
     */
    param(name) {
        return this.ctx.param(name);
    }

    /**
     * 获取及构造上传的文件
     * @param name
     * @param value
     * @returns {*}
     */
    file(name, value) {
        return this.ctx.file(name, value);
    }


    /**
     * content-type 操作
     * 
     * @param {any} contentType 
     * @param {any} encoding 
     * @returns 
     */
    types(contentType, encoding) {
        return this.ctx.types(contentType, encoding);
    }

    /**
     * 获取referrer
     * @param host
     * @returns {String|*}
     */
    referer(host) {
        return this.ctx.referer(host);
    }

    /**
     * 
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
     * 
     * 
     * @returns 
     */
    deny(code = 403) {
        this.ctx.throw(code);
        return think.prevent();
    }

    /**
     * 
     * 
     * @param {any} name 
     * @param {any} value 
     * @param {any} option 
     * @returns 
     */
    cookie(name, value, option) {
        return this.ctx.cookie(name, value, option);
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
        if (!this.ctx.session) {
            return this.ctx.throw(500, 'please install think_session middleware');
        }
        return this.ctx.session(name, value, timeout);
    }

    /**
     * 
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
     * 
     * 
     * @param {any} data 
     * @returns 
     */
    json(data) {
        return this.write(data, 'application/json');
    }

    /**
     * 
     * 
     * @param {any} data 
     * @returns 
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
            [(options.error_no_key || 'errno')]: code,
            [(options.error_msg_key || 'errmsg')]: (think.isError(errmsg) ? errmsg.message : errmsg) || 'error'
        };
        if (data !== undefined) {
            obj.data = data;
        } else {
            obj.data = {};
        }
        return this.write(obj, 'application/json');
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
     * 模板赋值,依赖中间件think_view
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
     * 渲染模板并返回内容,依赖中间件think_view
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
     * 定位、渲染、输出模板,依赖中间件think_view
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
     * 
     * 
     * @param {any} templateFile 
     * @param {any} charset 
     * @param {any} contentType 
     */
    display(templateFile, charset, contentType) {
        return this.render(templateFile, charset, contentType);
    }
};