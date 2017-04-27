/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */

const fs = require('fs');
const co = require('co');
const path = require('path');
const util = require('util');
const crypto = require('crypto');

var lib = {
    sep: path.sep,
    isArray: Array.isArray,
    isBuffer: Buffer.isBuffer,
    isDate: util.isDate,
    isRegexp: util.isRegExp,
    isSymbol: util.isSymbol,
    isError: util.isError
};

/**
 * 是否是字符串
 *
 * @param {any} obj
 * @returns
 */
lib.isString = function (obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
};

/**
 * 是否是数值
 *
 * @param {any} obj
 * @returns
 */
lib.isNumber = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Number]';
};

/**
 *
 *
 * @param {any} obj
 * @returns
 */
lib.isBoolean = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Boolean]';
};

/**
 * 是否是对象
 *
 * @param  {[type]}
 * @return {Boolean}
 */
lib.isObject = function (obj) {
    if (Buffer.isBuffer(obj)) {
        return false;
    }
    return Object.prototype.toString.call(obj) === '[object Object]';
};

/**
 * 是否是函数
 *
 * @param {any} obj
 * @returns
 */
lib.isFunction = function (obj) {
    return typeof obj === 'function';
};

/**
 * 
 *
 * @param {*} obj
 * @returns {boolean}
 */
lib.isScalar = function (obj) {
    let _obj = Object.prototype.toString.call(obj);
    return _obj === '[object Boolean]' || _obj === '[object Number]' || _obj === '[object String]';
};

/**
 * 是否是仅包含数字的字符串
 *
 * @param {*} obj
 * @returns {boolean}
 */
lib.isNumberString = function (obj) {
    let numberReg = /^((\-?\d*\.?\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
    return numberReg.test(obj);
};

/**
 * 是否是标准JSON对象
 * 必须是对象或数组
 * @param {*} obj
 * @returns {boolean}
 */
lib.isJSONObj = function (obj) {
    return lib.isObject(obj) || lib.isArray(obj);
};

/**
 * 是否是标准的JSON字符串
 * 必须是字符串，且可以被反解为对象或数组
 * @param {*} obj
 * @returns {boolean}
 */
lib.isJSONStr = function (obj) {
    if (!lib.isString(obj)) {
        return false;
    }
    try {
        return lib.isJSONObj(JSON.parse(obj));
    } catch (e) {
        return false;
    }
};

/**
 * 检查对象是否为空
 * undefined,null,'',NaN,[],{}和任何空白字符，包括空格、制表符、换页符等等，均返回true
 * @param {*} obj
 * @returns {boolean}
 */
lib.isEmpty = function (obj) {
    if (obj === undefined || obj === null || obj === '') {
        return true;
    } else if (lib.isString(obj)) {
        //\s 匹配任何空白字符，包括空格、制表符、换页符等等。等价于 [ \f\n\r\t\v]。
        return obj.replace(/(^\s*)|(\s*$)/g, '').length === 0;
    } else if (lib.isNumber(obj)) {
        return isNaN(obj);
    } else if (lib.isArray(obj)) {
        return obj.length === 0;
    } else if (lib.isObject(obj)) {
        for (let key in obj) {
            return !key && !0;
        }
        return true;
    }
    return false;
};

/**
 * 强制转换为字符串
 * 跟.toString不同的是可以转换undefined和null
 * @param {*} obj
 * @returns {string}
 */
lib.toString = function (obj) {
    if (obj === undefined || obj === null) {
        return '';
    }
    return String(obj);
};

/**
 * 强制转换为整型
 *
 * @param {*} obj
 * @returns {number}
 */
lib.toInt = function (obj) {
    return isNaN(obj) ? 0 : parseInt(obj);
};

/**
 * 强制转换为浮点型
 *
 * @param {*} obj
 * @returns {number}
 */
lib.toFloat = function (obj) {
    return isNaN(obj) ? 0 : parseFloat(obj);
};

/**
 * 强制转换为数值
 *
 * @param {*} obj
 * @returns {number}
 */
lib.toNumber = function (obj) {
    return isNaN(obj) ? 0 : Number(obj);
};

/**
 * 强制转换为布尔值
 *
 * @param {*} obj
 * @returns {boolean}
 */
lib.toBoolen = function (obj) {
    return Boolean(obj);
};

/**
 * 字符转义实体
 *
 * @param {string} str
 * @returns {string}
 */
lib.escapeHtml = function (str) {
    const htmlMaps = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quote;',
        '\'': '&#39;'
    };
    return (str + '').replace(/[<>'"]/g, function (a) {
        return htmlMaps[a];
    });
};

/**
 * 实体转义字符
 *
 * @param {string} str
 * @returns {string}
 */
lib.escapeSpecial = function (str) {
    const specialMaps = {
        '&lt;': '<',
        '&gt;': '>',
        '&quote;': '"',
        '&#39;': '\''
    };
    for (let n in specialMaps) {
        str = str.replace(new RegExp(n, 'g'), specialMaps[n]);
    }
    return str;
};

/**
 * md5
 *
 * @param {string} str
 * @returns {string}
 */
lib.md5 = function (str) {
    let ins = crypto.createHash('md5');
    ins.update(str + '', 'utf8');
    return ins.digest('hex');
};

/**
 * rand
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
lib.rand = function (min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
};

/**
 * AES字符串加密
 *
 * @param {string} data 需要加密的字符串
 * @param {string} key 密钥 (必须为16位字符串)
 * @returns {string}
 */
lib.encryption = function (data, key) {
    try {
        let iv = '0000000000000000';
        // let clearEncoding = 'utf8';
        // let cipherEncoding = 'base64';
        let cipherChunks = [];
        let cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        cipher.setAutoPadding(true);
        cipherChunks.push(cipher.update(data, 'utf8', 'base64'));
        cipherChunks.push(cipher.final('base64'));
        return encodeURIComponent(cipherChunks.join(''));
    } catch (e) {
        return '';
    }
};

/**
 * AES字符串解密
 *
 * @param {string} data 需要解密的字符串
 * @param {string} key 密钥 (必须为16位字符串)
 * @returns {string}
 */
lib.decryption = function (data, key) {
    try {
        let iv = '0000000000000000';
        // let clearEncoding = 'utf8';
        // let cipherEncoding = 'base64';
        let cipherChunks = [];
        let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        decipher.setAutoPadding(true);
        cipherChunks.push(decipher.update(decodeURIComponent(data), 'base64', 'utf8'));
        cipherChunks.push(decipher.final('utf8'));
        return cipherChunks.join('');
    } catch (e) {
        return '';
    }
};

/**
 * 日期时间戳及格式化
 *
 * @param {any} date
 * @param {any} format
 * @returns
 */
lib.datetime = function (date, format) {
    if (format === undefined) {
        //datetime() => now timestamp
        if (date === undefined) {
            return Math.floor(Date.now() / 1000);
        } else if (lib.isString(date)) { //datetime('2017-01-01') => timestamp
            date = date || new Date();
            return Math.floor(new Date(date).getTime() / 1000);
        }
        return NaN;
    } else {
        format = format || 'yyyy-mm-dd hh:mi:ss';
        let fn = function (d, f) {
            let Week = ['日', '一', '二', '三', '四', '五', '六'];
            f = f.replace(/yyyy|YYYY/, d.getFullYear());
            f = f.replace(/yy|YY/, d.getYear() % 100 > 9 ? (d.getYear() % 100).toString() : '0' + d.getYear() % 100);
            f = f.replace(/mi|MI/, d.getMinutes() > 9 ? d.getMinutes().toString() : '0' + d.getMinutes());
            f = f.replace(/mm|MM/, d.getMonth() + 1 > 9 ? (d.getMonth() + 1).toString() : '0' + (d.getMonth() + 1));
            f = f.replace(/m|M/g, d.getMonth() + 1);
            f = f.replace(/w|W/g, Week[d.getDay()]);
            f = f.replace(/dd|DD/, d.getDate() > 9 ? d.getDate().toString() : '0' + d.getDate());
            f = f.replace(/d|D/g, d.getDate());
            f = f.replace(/hh|HH/, d.getHours() > 9 ? d.getHours().toString() : '0' + d.getHours());
            f = f.replace(/h|H/g, d.getHours());
            f = f.replace(/ss|SS/, d.getSeconds() > 9 ? d.getSeconds().toString() : '0' + d.getSeconds());
            return f;
        };
        if (date && lib.isNumber(date)) {
            let newDate = new Date();
            newDate.setTime(date * 1000);
            return fn(newDate, format);
        }
        if (date && lib.isString(date)) {
            return fn(new Date(Date.parse(date)), format);
        }
        return fn(new Date(), format);
    }
};

/**
 * 判断值是否为数组的元素
 * 非严格匹配
 * @param {*} value
 * @param {any[]} arr
 * @returns {boolean}
 */
lib.inArray = function (value, arr) {
    let len = arr.length;
    for (let i = 0; i < len; i++) {
        if (arr[i] == value) {
            return true;
        }
    }
    return false;
};

/**
 * 数组去重
 *
 * @param {any[]} arr
 * @returns {*}
 */
lib.arrUnique = function (arr) {
    let ret = [], json = {}, len = arr.length, val;
    for (let i = 0; i < len; i++) {
        val = arr[i];
        if (!json[val]) {
            json[val] = 1;
            ret.push(val);
        }
    }
    return ret;
};

/**
 * 数组删除元素
 * indexs为需要删除的下标数组
 * @param {any[]} arr
 * @param {any[]} indexs
 * @returns {*}
 */
lib.arrRemove = function (arr, indexs) {
    let result = [], len = arr.length, need;
    for (let i = 0; i < len; i++) {
        need = false;
        for (let j = 0; j < indexs.length; j++) {
            if (i == indexs[j]) {
                need = true;
                break;
            }
        }
        if (!need) {
            result.push(arr[i]);
        }
    }
    return result;
};

/**
 * 
 * 
 * @param {any} objValue 
 * @param {any} srcValue 
 * @returns 
 */
/*eslint-disable consistent-return */
lib.arrCustomizer = function (objValue, srcValue) {
    if (lib.isArray(objValue)) {
        return objValue.concat(srcValue);
    }
};

/**
 * 
 *
 * @param {string} p
 * @returns {boolean}
 */
lib.isFile = function (p) {
    if (!fs.existsSync(p)) {
        return false;
    }
    try {
        let stats = fs.statSync(p);
        return stats.isFile();
    } catch (e) {
        return false;
    }
};

/**
 * 
 *
 * @param {string} p
 * @returns {boolean}
 */
lib.isDir = function (p) {
    if (!fs.existsSync(p)) {
        return false;
    }
    try {
        let stats = fs.statSync(p);
        return stats.isDirectory();
    } catch (e) {
        return false;
    }
};

/**
 * 
 *
 * @param {*} obj
 * @returns {boolean}
 */
lib.isPromise = function (obj) {
    return !!(obj && obj.catch && typeof obj.then === 'function');
};

/**
 * 将callback风格的函数转换为Promise
 *
 * @param {Function} fn
 * @param {object} receiver
 * @returns {*}
 */
lib.promisify = function (fn, receiver) {
    return function (...args) {
        return new Promise(function (resolve, reject) {
            fn.apply(receiver, [...args, function (err, res) {
                return err ? reject(err) : resolve(res);
            }]);
        });
    };
};

/**
 * 
 * 
 * @param {any} obj 
 * @returns 
 */
lib.isGenerator = function (obj) {
    return !!(obj && typeof obj === 'function' && obj.constructor && obj.constructor.name === 'GeneratorFunction');
};

/**
 * 将generator函数通过co转换为promise
 * 
 * @param {any} instance 
 * @param {any} method 
 */
lib.generatorToPromise = function (instance, method) {
    if (this.isGenerator(instance[method])) {
        return co.wrap(instance[method]).bind(instance);
    }
    return instance[method].bind(instance);
};

/**
 * console format
 * 
 * @param {any} log 
 * @param {string} [type='log'] 
 */
lib.log = function (log, type = 'log') {
    if (lib.isString(log)) {
        console[type](`[${lib.datetime('', '')}] [ThinkKoa] ${log}`);
    } else {
        console[type](log);
    }
};

/**
 * 加载文件
 * 
 * @param {string} file
 * @returns {*}
 */
lib.require = function (file) {
    try {
        let obj = require(file);
        return (obj && obj.__esModule && obj.default) ? obj.default : obj;
    } catch (e) {
        return null;
    }
};

/**
 * 转换express的middleware为koa使用
 * 
 * @param {any} fn 
 */
lib.parseExpMiddleware = function (fn) {
    return function (ctx, next) {
        if (fn.length < 3) {
            fn(ctx.req, ctx.res);
            return next();
        } else {
            return new Promise((resolve, reject) => {
                fn(ctx.req, ctx.res, err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(next());
                    }
                });
            });
        }
    };
};

/**
 * v8引擎优化
 *
 * @param {object} obj
 */
lib.toFastProperties = function (obj) {
    let f = function f() { };
    f.prototype = obj;
    /*eslint-disable no-new*/
    new f();
};

/**
 * 配置读取
 *
 * @param {string} name
 * @returns {*}
 */
lib.config = function (name) {
    if (name === undefined) {
        return think._caches.configs;
    }
    if (lib.isString(name)) {
        //name不含. 一级
        if (name.indexOf('.') === -1) {
            return think._caches.configs[name];
        } else { //name包含. 二级
            let keys = name.split('.');
            let value = think._caches.configs[keys[0]] || {};
            return value[keys[1]];
        }
    } else {
        return think._caches.configs[name];
    }
};