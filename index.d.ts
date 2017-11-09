// Type definitions for ThinkKoa
// Project: https://thinkkoa.org
// Definitions by: richen <https://github.com/richenlin>,
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/* =================== USAGE ===================

    const path = require('path');
    const thinkkoa = require('thinkkoa');

    //thinkkoa instantiation
    const instance = new thinkkoa({
        root_path: __dirname,
        app_path: __dirname + path.sep + 'app',
        app_debug: true //in production env turn false
    });

    //... instance.app = koa


    //app run
    instance.run();

 =============================================== */
/// <reference types="node" />

import koa from "koa";
import http from "http";
import think_lib from "think_lib";
/**
 * 
 * 
 * @interface plainObject
 */
interface plainObject { };
/**
 * 
 * 
 * @interface server
 */
interface server {
  /**
   * 
   * 
   * @type {plainObject}
   * @memberof server
   */
  options: plainObject;
  /**
   * Creates an instance of server.
   * @param {plainObject} options 
   * @memberof server
   */
  new(options: plainObject): server;
  /**
   * 
   * 
   * @returns {http.Server} 
   * @memberof server
   */
  getServer(): http.Server;
  /**
   * 
   * 
   * @memberof server
   */
  start(): void;
  /**
   * 
   * 
   * @memberof server
   */
  started(): void;

}
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
 * @interface Base
 */
interface base {
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
interface baseController extends base {
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
   * @returns {Promise.reject} 
   * @memberof baseController
   */
  __empty(): Promise.reject;
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
   * @returns {Promise.reject} 
   * @memberof baseController
   */
  redirect(urls: string, alt: string): Promise.reject;
  /**
   * Block access
   * 
   * @param {number} code 
   * @returns {Promise.reject} 
   * @memberof baseController
   */
  deny(code: number): Promise.reject;
  /**
   * Set response Body content
   * 
   * @param {*} data 
   * @param {string} [contentType] 
   * @param {string} [encoding] 
   * @returns {Promise.reject} 
   * @memberof baseController
   */
  write(data: any, contentType?: string, encoding?: string): Promise.reject;
  /**
   * Respond to json formatted content
   * 
   * @param {*} data 
   * @returns {Promise.reject} 
   * @memberof baseController
   */
  json(data: any): Promise.reject;
  /**
   * Respond to jsonp formatted content
   * 
   * @param {*} data 
   * @returns {Promise.reject} 
   * @memberof baseController
   */
  jsonp(data: any): Promise.reject;
  /**
   * Response to normalize json format content for success
   * 
   * @param {string} errmsg 
   * @param {*} [data] 
   * @param {number} [code] 
   * @param {plainObject} [options] 
   * @returns {Promise.reject} 
   * @memberof baseController
   */
  success(errmsg: string, data?: any, code?: number, options?: plainObject): Promise.reject;
  /**
   * 
   * 
   * @param {string} errmsg 
   * @param {*} [data] 
   * @param {number} [code] 
   * @param {plainObject} [options] 
   * @returns {Promise.reject} 
   * @memberof baseController
   */
  ok(errmsg: string, data?: any, code?: number, options?: plainObject): Promise.reject;
  /**
   * 
   * 
   * @param {string} errmsg 
   * @param {*} [data] 
   * @param {number} [code] 
   * @param {plainObject} [options] 
   * @returns {Promise.reject} 
   * @memberof baseController
   */
  fail(errmsg: string, data?: any, code?: number, options?: plainObject): Promise.reject;
  /**
   * 
   * 
   * @param {string} errmsg 
   * @param {*} [data] 
   * @param {number} [code] 
   * @param {plainObject} [options] 
   * @returns {Promise.reject} 
   * @memberof baseController
   */
  error(errmsg: string, data?: any, code?: number, options?: plainObject): Promise.reject;
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
   * @returns {Promise} 
   * @memberof baseController
   */
  session(name: string, value?: any, timeout?: number): Promise;
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
   * @returns {Promise.reject} 
   * @memberof baseController
   */
  render(templateFile: string, data: plainObject, charset?: string, contentType?: string): Promise.reject;
  /**
   * Positioning, rendering, output templates, relying on middleware think_view
   * 
   * @param {string} templateFile 
   * @param {plainObject} data 
   * @param {string} [charset] 
   * @param {string} [contentType] 
   * @returns {Promise.reject} 
   * @memberof baseController
   */
  display(templateFile: string, data: plainObject, charset?: string, contentType?: string): Promise.reject;
}
/**
 * 
 * 
 * @interface restfulController
 * @extends {baseController}
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
 * @interface controller
 */
interface controller {
  /**
   * Gets or instantiates the controller
   */
  (name: string, ctx?: koa.Context): null | plainObject;
  /**
   * baseController
   */
  base: baseController;
  /**
   * restfulController
   */
  restful: restfulController;
}


declare namespace thinkkoa {
  /**
   * koa 
   * 
   * @interface app
   * @extends {koa}
   */
  interface app extends koa { }

  /**
   * 
   * 
   * @interface think
   */
  export interface think extends think_lib {
    /**
     * project path
     * 
     * @type {string}
     * @memberof think
     */
    root_path: string;
    /**
     * app path
     * 
     * @type {string}
     * @memberof think
     */
    app_path: string;
    /**
     * thinkkoa framework path
     * 
     * @type {string}
     * @memberof think
     */
    think_path: string;
    /**
     * application run mode
     * 
     * @type {boolean}
     * @memberof think
     */
    app_debug: boolean;
    /**
     * thinkkoa version
     * 
     * @type {string}
     * @memberof think
     */
    readonly version: string;
    /**
     * koa
     * 
     * @type {app}
     * @memberof think
     */
    readonly app: app;
    /**
     * 
     * 
     * @type {server}
     * @memberof think
     */
    readonly server: server;
    /**
     * 
     * 
     * @type {loader}
     * @memberof think
     */
    readonly loader: loader;
    /**
     * use mikkleware
     * 
     * @param {Function} fn 
     * @memberof think
     */
    use(fn: Function): any;
    /**
     * Convert express middleware for koa
     * 
     * @param {Function} fn 
     * @returns {*} 
     * @memberof think
     */
    useExp(fn: Function): any;
    /**
     * 
     * 
     * @type {logger}
     * @memberof think
     */
    logger: logger;
    /**
     * Custom record log
     * 
     * @param {string} name 
     * @param {*} msgs 
     * @param {string} [path] 
     * @memberof think
     */
    addLogs(name: string, msgs: any, path?: string);
    /**
     * 
     * 
     * @param {Function} fn 
     * @memberof think
     */
    parseExpMiddleware(fn: Function): Function;
    /**
     * prevent next process
     * 
     * @returns {Promise.reject} 
     * @memberof think
     */
    prevent(): Promise.reject;
    /**
     * check is prevent error
     * 
     * @returns {boolean} 
     * @memberof think
     */
    isPrevent(): boolean;
    /**
     * 
     * 
     * @param {string} name 
     * @param {string} [type] 
     * @memberof think
     */
    config(name: string, type?: string);
    /**
     * 
     * 
     * @type {base}
     * @memberof think
     */
    base: base;
    /**
     * 
     * 
     * @type {baseController}
     * @memberof think
     */
    controller: controller;
    /**
     * Gets or instantiates a service class
     * 
     * @param {string} name 
     * @param {plainObject} [params]
     * @returns {(null | plainObject)} 
     * @memberof think
     */
    service(name: string, params?: plainObject): null | plainObject;
    /**
     * Gets or instantiates a model class
     * 
     * @param {string} name 
     * @param {plainObject} [config] 
     * @returns {(null | plainObject)} 
     * @memberof think
     */
    model(name: string, config?: plainObject): null | plainObject;
    /**
     * exec some controller's method
     * 
     * @param {string} name 
     * @param {koa.Context} [ctx] 
     * @returns {(null | plainObject)} 
     * @memberof think
     */
    action(name: string, ctx?: koa.Context): null | plainObject;

  }



}

export = thinkkoa;