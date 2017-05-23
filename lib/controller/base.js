'use strict';

exports.__esModule = true;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class {
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
  _init() {}

  /**
   * get current class filename
   * @returns {*}
   */
  _filename() {
    let fname = this.__filename || __filename;
    return _path2.default.basename(fname, '.js');
  }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    12/5/27
    */