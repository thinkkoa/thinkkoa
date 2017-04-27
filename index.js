/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */
'use strict';
//rewite promise, bluebird is much faster
global.Promise = require('bluebird');
require('babel-runtime/core-js/promise').default = Promise;
//define think object
global.think = Object.create(require('./lib/util/lib.js'));

//export framework
module.exports = require('./lib/think.js');