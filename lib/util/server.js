'use strict';

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/3
 */

const http = require('http');
const lib = require('./lib.js');

module.exports = class {
    constructor(options) {
        this.options = options;
    }

    /**
     * 
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
     * 
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
     * 
     * 
     */
    started() {
        lib.logs('====================================', 'THINK');
        lib.logs(`Server running at http://127.0.0.1:${this.options.port}/`, 'THINK');
        lib.logs(`Nodejs Version: ${process.version}`, 'THINK');
        lib.logs(`ThinkKoa Version: v${think.version}`, 'THINK');
        lib.logs(`App Enviroment: ${think.app_debug ? 'debug mode' : 'production mode'}`, 'THINK');
        lib.logs('====================================', 'THINK');
        think.app_debug && lib.logs('Debugging mode is running, if the production environment, please modify the APP_DEBUG value to false', 'WARNING');
    }

};