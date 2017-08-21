'use strict';

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Restful controller
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/17
 */
const base = require('./base.js');

module.exports = class extends base {

    /**
     * constructor
     * 
     * @param {any} ctx 
     */
    init(ctx) {
        super.init(ctx);
    }

    /**
     * Prefabrication method
     * 
     * @returns 
     */
    _before() {
        //resource id
        this.id = this.querys('id') || '';

        try {
            this.model = this.ctx.group ? think.model(`${this.ctx.group}/${this.ctx.controller}`, {}) || think.model(`common/${this.ctx.controller}`, {}) : think.model(this.ctx.controller, {});
        } catch (e) {
            this.model = null;
        }
        if (!this.model) {
            return this.fail('resource not found');
        }
        return null;
    }

    /**
     * 
     * 
     * @returns 
     */
    getAction() {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this.id) {
                try {
                    let pk = yield _this.model.getPk();
                    let data = yield _this.model.where({ [pk]: _this.id }).find();
                    return _this.success('', data);
                } catch (e) {
                    return _this.error(e.message);
                }
            } else {
                try {
                    let data = yield _this.model.select();
                    return _this.success('', data);
                } catch (e) {
                    return _this.error(e.message);
                }
            }
        })();
    }

    /**
     * 
     * 
     * @returns 
     */
    postAction() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                let pk = yield _this2.model.getPk();
                let data = _this2.post();
                data[pk] && delete data[pk];
                if (think.isEmpty(data)) {
                    return _this2.error('data is empty');
                }
                let rows = yield _this2.model.add(data);
                return _this2.success('', rows);
            } catch (e) {
                return _this2.error(e.message);
            }
        })();
    }

    /**
     * 
     * 
     * @returns 
     */
    deleteAction() {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                if (!_this3.id) {
                    return _this3.error('params error');
                }
                let pk = yield _this3.model.getPk();
                let rows = yield _this3.model.where({ [pk]: _this3.id }).delete();
                return _this3.success('', rows);
            } catch (e) {
                return _this3.error(e.message);
            }
        })();
    }

    /**
     * 
     * 
     * @returns 
     */
    putAction() {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                if (!_this4.id) {
                    return _this4.error('params error');
                }
                let pk = yield _this4.model.getPk();
                let data = _this4.post();
                data[pk] && delete data[pk];
                if (think.isEmpty(data)) {
                    return _this4.error('data is empty');
                }
                let rows = yield _this4.model.where({ [pk]: _this4.id }).update(data);
                return _this4.success('', rows);
            } catch (e) {
                return _this4.error(e.message);
            }
        })();
    }

};