/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    12/5/27
 */
import path from 'path';

export default class {
    /**
     * constructor
     * @param args
     */
    constructor(...args) {
        this._init(...args);
    }

    /**
     * init
     */
    _init() {

    }

    /**
     * get current class filename
     * @returns {*}
     */
    _filename() {
        let fname = this.__filename || __filename;
        return path.basename(fname, '.js');
    }
}