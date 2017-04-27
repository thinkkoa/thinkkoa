/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const koa = require('koa');
const assert = require('assert');
const lodash = require('lodash');
const convert = require('koa-convert');
const debug = require('debug')('ThinkKoa');

const lib = require('./util/lib.js');
const pkg = require('../package.json');