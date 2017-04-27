/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */
import path from 'path';

export default class {
    /**
     * constructor
     * @param args
     */
    constructor(...args) {
        this.init(...args);
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
    filename() {
        let fname = this.__filename || __filename;
        return path.basename(fname, '.js');
    }
}