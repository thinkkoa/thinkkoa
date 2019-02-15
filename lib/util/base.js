/**
 * base class
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/5/27
 */
const path = require('path');

module.exports = class Base {
    /**
     * constructor
     * @param {Mixed} args
     */
    constructor(...args) {
        try {
            this.init(...args);
        } catch (e){
            throw Error(e.stack);
        }
    }

    /**
     * init
     */
    init() {

    }

    /**
     * get current class filename
     * @returns {*}
     */
    _filename() {
        let fname = this.__filename || __filename;
        return path.basename(fname, '.js');
    }
};