/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/3
 */

const http = require('http');
const lib = require('think_lib');

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
        if(this.server) {
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
        let now = lib.datetime('', '');
        console.log('  ________    _       __   __ \n /_  __/ /_  (_)___  / /__/ /______  ____ _\n  / / / __ \\/ / __ \\/ //_/ //_/ __ \\/ __ `/\n / / / / / / / / / / ,< / /,</ /_/ / /_/ /\n/_/ /_/ /_/_/_/ /_/_/|_/_/ |_\\____/\\__,_/');
        console.log(`                     http://thinkkoa.org/`);
        console.log(` \x1B[34m[${now}] [THINK] ====================================\x1B[39m`);
        console.log(` \x1B[34m[${now}] [THINK] Server running at http://127.0.0.1:${this.options.port}/\x1B[39m`);
        console.log(` \x1B[34m[${now}] [THINK] Nodejs Version: ${process.version}\x1B[39m`);
        console.log(` \x1B[34m[${now}] [THINK] ThinkKoa Version: v${think.version}\x1B[39m`);
        console.log(` \x1B[34m[${now}] [THINK] App Enviroment: ${(think.app_debug ? 'debug mode' : 'production mode')}\x1B[39m`);
        console.log(` \x1B[34m[${now}] [THINK] ====================================\x1B[39m`);
        think.app_debug && console.log(` \x1B[33m[${now}] [THINK] Debugging mode is running, if the production environment, please modify the app_debug value to false\x1B[39m`);
    }

};