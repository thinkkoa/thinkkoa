'use strict';

/**
 * http server 
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/3
 */

const http = require('http');
const lib = require('think_lib');
const logger = require('think_logger');

module.exports = class {
    constructor(options) {
        this.options = options;
    }

    /**
     * create http server
     * 
     * @returns 
     */
    getServer() {
        if (this.server) {
            return this.server;
        }
        const server = http.Server(this.options.callback);
        this.server = server;
        return this.server;
    }

    /**
     * http server listening
     * 
     */
    start() {
        if (this.server) {
            this.server.listen(this.options.port, this.started());
        } else {
            this.getServer().listen(this.options.port, this.started());
        }
    }

    /**
     * console log
     * 
     */
    started() {
        let now = lib.datetime('', '');
        console.log('  ________    _       __   __ \n /_  __/ /_  (_)___  / /__/ /______  ____ _\n  / / / __ \\/ / __ \\/ //_/ //_/ __ \\/ __ `/\n / / / / / / / / / / ,< / /,</ /_/ / /_/ /\n/_/ /_/ /_/_/_/ /_/_/|_/_/ |_\\____/\\__,_/');
        console.log(`                     https://thinkkoa.org/`);
        logger.custom('think', '', '====================================');
        logger.custom('think', '', `Server running at http://127.0.0.1:${this.options.port}/`);
        logger.custom('think', '', `Nodejs Version: ${process.version}`);
        logger.custom('think', '', `ThinkKoa Version: v${think.version}`);
        logger.custom('think', '', `App Enviroment: ${think.app_debug ? 'debug mode' : 'production mode'}`);
        logger.custom('think', '', '====================================');
        think.app_debug && logger.warn(`Running in debug mode, please modify the app_debug value to false when production env.`);
    }

};