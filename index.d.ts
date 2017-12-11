// Type definitions for ThinkKoa
// Project: https://thinkkoa.org
// Definitions by: richen <https://github.com/richenlin>,
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/* =================== USAGE ===================

    const path = require('path');
    const thinkkoa = require('thinkkoa');

    //thinkkoa instantiation
    const app = new thinkkoa({
        root_path: __dirname,
        app_path: __dirname + path.sep + 'app',
        app_debug: true //in production env turn false
    });

    //app run
    app.listen();

 =============================================== */
/// <reference types="node" />

import koa from "koa";
import lib from "think_lib";
import { Server } from "http";
/**
 * 
 * 
 * @interface plainObject
 */
interface plainObject {

}
/**
 * Prevent next process
 * 
 * @interface prevent
 */
interface prevent extends PromiseRejectionEvent {
    
}
/**
 * 
 * 
 * @interface options
 */
interface options {
    /**
     * defined project root path.
     * 
     * @type {string}
     * @memberof options
     */
    root_path: string,
    /**
     * defined project app path.
     * 
     * @type {string}
     * @memberof options
     */
    app_path: string,
    /**
     * defined project env.
     * 
     * @type {boolean}
     * @memberof options
     */
    app_debug: boolean

}
/**
 * 
 * 
 * @interface Base
 */
interface Base {
    new(...arg: any[])
    /**
     * 
     * 
     * @returns {*} 
     * 
     * @memberOf Base
     */
    init(...arg: any[]): any;
    /**
     * 
     * 
     * @returns {string} 
     * 
     * @memberOf Base
     */
    _filename(): string;
}
/**
 * 
 * 
 * @interface baseController
 * @extends {base}
 */
interface baseController extends Base {
    /**
     * Gets or instantiates the controller
     */
    (name: string, ctx?: koa.Context): null | plainObject;
    /**
     * 
     *  
     * @type {koa.Context}
     * @memberof baseController
     */
    ctx: koa.Context;
    /**
     * Call if the action is not found
     * 
     * @returns {prevent} 
     * @memberof baseController
     */
    __empty(): prevent;
    /**
     * Whether it is a GET request
     * 
     * @returns {boolean} 
     * @memberof baseController
     */
    isGet(): boolean;
    /**
     * Whether it is a POST request
     * 
     * @returns {boolean} 
     * @memberof baseController
     */
    isPost(): boolean;
    /**
     * Determines whether the METHOD request is specified
     * 
     * @param {string} method 
     * @returns {boolean} 
     * @memberof baseController
     */
    isMethod(method: string): boolean;
    /**
     * Whether it is an AJAX request
     * 
     * @returns {boolean} 
     * @memberof baseController
     */
    isAjax(): boolean;
    /**
     * Whether it is a PJAX request
     * 
     * @returns {boolean} 
     * @memberof baseController
     */
    isPjax(): boolean;
    /**
     * Whether it is jsonp call
     * 
     * @param {string} [name] 
     * @returns {boolean} 
     * @memberof baseController
     */
    isJsonp(name?: string): boolean;
    /**
     * Get and construct querystring parameters
     * 
     * @param {any} name 
     * @param {*} [value]  
     * @returns {*} 
     * @memberof baseController
     */
    get(name: string, value?: any): any;
    /**
     * Get and construct POST parameters
     * 
     * @param {string} name 
     * @param {*} [value] 
     * @returns {*} 
     * @memberof baseController
     */
    post(name: string, value?: any): any;
    /**
     * Get post or get parameters, post priority
     * 
     * @param {string} name 
     * @returns {*} 
     * @memberof baseController
     */
    param(name: string): any;
    /**
     * Obtain and construct uploaded files
     * 
     * @param {string} name 
     * @param {*} [value] 
     * @returns {*} 
     * @memberof baseController
     */
    file(name: string, value?: any): any;
    /**
     * Get or set headers.
     * 
     * @param {string} name 
     * @param {*} [value] 
     * @returns {*} 
     * @memberof baseController
     */
    header(name: string, value?: any): any;
    /**
     * Content-type operation
     * 
     * @param {string} [contentType] 
     * @param {string} [encoding] 
     * @returns {*} 
     * @memberof baseController
     */
    types(contentType?: string, encoding?: string): any;
    /**
     * Get referrer
     * 
     * @param {string} [host] 
     * @returns {*} 
     * @memberof baseController
     */
    referer(host?: string): any;
    /**
     * set cache-control and expires header
     * 
     * @param {number} timeout 
     * @returns {null} 
     * @memberof baseController
     */
    expires(timeout: number): null;
    /**
     * 
     * 
     * @param {string} urls 
     * @param {string} alt 
     * @returns {prevent} 
     * @memberof baseController
     */
    redirect(urls: string, alt: string): prevent;
    /**
     * Block access
     * 
     * @param {number} code 
     * @returns {prevent} 
     * @memberof baseController
     */
    deny(code: number): prevent;
    /**
     * Set response Body content
     * 
     * @param {*} data 
     * @param {string} [contentType] 
     * @param {string} [encoding] 
     * @returns {prevent} 
     * @memberof baseController
     */
    write(data: any, contentType?: string, encoding?: string): prevent;
    /**
     * Respond to json formatted content
     * 
     * @param {*} data 
     * @returns {prevent} 
     * @memberof baseController
     */
    json(data: any): prevent;
    /**
     * Respond to jsonp formatted content
     * 
     * @param {*} data 
     * @returns {prevent} 
     * @memberof baseController
     */
    jsonp(data: any): prevent;
    /**
     * Response to normalize json format content for success
     * 
     * @param {string} errmsg 
     * @param {*} [data] 
     * @param {number} [code] 
     * @param {plainObject} [options] 
     * @returns {prevent} 
     * @memberof baseController
     */
    success(errmsg: string, data?: any, code?: number, options?: plainObject): prevent;
    /**
     * 
     * 
     * @param {string} errmsg 
     * @param {*} [data] 
     * @param {number} [code] 
     * @param {plainObject} [options] 
     * @returns {prevent} 
     * @memberof baseController
     */
    ok(errmsg: string, data?: any, code?: number, options?: plainObject): prevent;
    /**
     * 
     * 
     * @param {string} errmsg 
     * @param {*} [data] 
     * @param {number} [code] 
     * @param {plainObject} [options] 
     * @returns {prevent} 
     * @memberof baseController
     */
    fail(errmsg: string, data?: any, code?: number, options?: plainObject): prevent;
    /**
     * 
     * 
     * @param {string} errmsg 
     * @param {*} [data] 
     * @param {number} [code] 
     * @param {plainObject} [options] 
     * @returns {prevent} 
     * @memberof baseController
     */
    error(errmsg: string, data?: any, code?: number, options?: plainObject): prevent;
    /**
     * Cookie operation
     * 
     * @param {string} name 
     * @param {*} [value] 
     * @param {plainObject} [option] 
     * @returns {*} 
     * @memberof baseController
     */
    cookie(name: string, value?: any, option?: plainObject): any;
    /**
     * Session operation
     * 
     * @param {string} name 
     * @param {*} [value] 
     * @param {number} [timeout] 
     * @returns {PromiseConstructor} 
     * @memberof baseController
     */
    session(name: string, value?: any, timeout?: number): PromiseConstructor;
    /**
     * Template assignment, dependent on middleware think_view
     * 
     * @param {string} name 
     * @param {*} [value] 
     * @returns {*} 
     * @memberof baseController
     */
    assign(name: string, value?: string | boolean | number | any[] | plainObject): any;
    /**
     * Render the template and return the content, relying on the middleware think_view
     * 
     * @param {string} templateFile 
     * @param {plainObject} data 
     * @returns {*} 
     * @memberof baseController
     */
    compile(templateFile: string, data: plainObject): any;
    /**
     * Positioning, rendering, output templates, relying on middleware think_view
     * 
     * @param {string} templateFile 
     * @param {plainObject} data 
     * @param {string} [charset] 
     * @param {string} [contentType] 
     * @returns {prevent} 
     * @memberof baseController
     */
    render(templateFile: string, data: plainObject, charset?: string, contentType?: string): prevent;
    /**
     * Positioning, rendering, output templates, relying on middleware think_view
     * 
     * @param {string} templateFile 
     * @param {plainObject} data 
     * @param {string} [charset] 
     * @param {string} [contentType] 
     * @returns {prevent} 
     * @memberof baseController
     */
    display(templateFile: string, data: plainObject, charset?: string, contentType?: string): prevent;
}
/**
 * 
 * 
 * @interface restfulController
 */
interface restfulController extends baseController {
    /**
     * 
     * 
     * @memberof restfulController
     */
    getAction();
    /**
     * 
     * 
     * @memberof restfulController
     */
    postAction();
    /**
     * 
     * 
     * @memberof restfulController
     */
    deleteAction();
    /**
     * 
     * 
     * @memberof restfulController
     */
    putAction();
}

/**
 * 
 * 
 * @class ThinkKoa
 * @extends {koa}
 */
declare class ThinkKoa extends koa {
    /**
     * Gets or instantiates the controller
     */
    constructor(options: options);
    /**
     * initialize ThinkKoa env
     * 
     * @param {options} options 
     * @memberof ThinkKoa
     */
    init(options: options): void;
    /**
     * Use the given koa middleware `fn`.
     * 
     * @param {koa.Middleware} middleware 
     * @returns {this} 
     * @memberof ThinkKoa
     */
    use(fn: koa.Middleware): this;
    /**
     * Use the given Express middleware `fn`.
     * 
     * @param {GeneratorFunction} fn 
     * @returns {this} 
     * @memberof ThinkKoa
     */
    useExp(fn: GeneratorFunction): this;
    /**
     * Prevent next process
     * 
     * @returns {prevent} 
     * @memberof ThinkKoa
     */
    prevent(): prevent;
    /**
     * Check is prevent error
     * 
     * @param {ErrorEvent} err 
     * @returns {boolean} 
     * @memberof ThinkKoa
     */
    isPrevent(err: ErrorEvent): boolean;
    /**
     * Read configuration
     * 
     * @param {string} name 
     * @param {string} type 
     * @returns {*} 
     * @memberof ThinkKoa
     */
    config(name: string, type: string): any;
    /**
     * registration exception handling
     * 
     * @memberof ThinkKoa
     */
    captureError(): void;
    /**
     * Shorthand for:
     * http.createServer(app.callback()).listen(...)
     * 
     * @returns {Server} 
     * @memberof ThinkKoa
     */
    listen(): Server;

}

declare namespace ThinkKoa {
    type version = string;
    /**
     * 
     * 
     * @interface loader
     */
    interface loader {
        loadPath: string;

        /**
         * Creates an instance of loader.
         * @param {string} loadPath 
         * @param {plainObject} options 
         * @param {boolean} [skip] 
         * @memberof loader
         */
        new(loadPath: string, options: plainObject, skip?: boolean): loader;
        /**
         * loop load
         * 
         * @param {string} dir 
         * @param {boolean} [skip] 
         * @memberof loader
         */
        walk(dir: string, skip?: boolean);
        /**
         * load files
         * 
         * @param {plainObject} options 
         * @memberof loader
         */
        load(options: plainObject);
        /**
         * clear require cache
         * 
         * @param {string} modulePath 
         * @memberof loader
         */
        cleanCache(modulePath: string);
    }
    /**
     * 
     * 
     * @interface logger
     */
    interface logger {
        (type: string, options: plainObject, ...args: any[]): void;
        /**
         * 
         * 
         * @param {...any[]} arg 
         * @memberof logger
         */
        info(...arg: any[]);
        /**
         * 
         * 
         * @param {...any[]} arg 
         * @memberof logger
         */
        warn(...arg: any[]);
        /**
         * 
         * 
         * @param {...any[]} arg 
         * @memberof logger
         */
        error(...arg: any[]);
        /**
         * 
         * 
         * @param {...any[]} arg 
         * @memberof logger
         */
        success(...arg: any[]);
        /**
         * write log file
         * 
         * @param {string} path 
         * @param {string} name 
         * @param {string} msgs 
         * @memberof logger
         */
        write(path: string, name: string, msgs: string);
    }
    /**
     * 
     * 
     * @interface controller
     * @extends {baseController}
     */
    interface controller extends baseController {
        /**
         * restfulController
         */
        restful: restfulController;
    }
    /**
     * 
     * 
     * @interface base
     * @extends {Base}
     */
    interface base extends Base { }
    /**
     * 
     * 
     * @interface helper
     * @extends {lib}
     */
    interface helper { }
}



export = ThinkKoa;