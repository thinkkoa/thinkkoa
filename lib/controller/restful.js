/**
 * Restful controller
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/17
 */
const lib = require('think_lib');
const base = require('./base.js');

module.exports = class restController extends base {

    /**
     * constructor
     * 
     * @param {Mixed} ctx 
     * @param {Mixed} app 
     */
    init(ctx, app) {
        try {
            //resource id
            this.id = this.get('id') || '';
            let cls;
            if (this.ctx.group) {
                if (lib.isFile(`${this.app.app_path}/model/${this.ctx.group}/${this.ctx.controller}.js`)) {
                    cls = require(`${this.app.app_path}/model/${this.ctx.group}/${this.ctx.controller}.js`);
                } else {
                    cls = require(`${this.app.app_path}/model/common/${this.ctx.controller}.js`);
                }
            } else {
                cls = require(`${this.app.app_path}/model/${this.ctx.controller}.js`);
            }
            this.model = new cls(this.app.config('model', 'middleware'));
        } catch (e) {
            this.model = null;
        }
    }

    /**
     * Prefabrication method
     * 
     * @returns 
     */
    __before() {
        //access ctrl
    }

    __empty() {
        return this.fail('The URL format must be a resource_name/ID');
    }

    /**
     * 
     * 
     * @returns 
     */
    async getAction() {
        if (!this.model) {
            return this.fail('resource not found');
        }
        if (this.id) {
            try {
                let pk = await this.model.getPk();
                let data = await this.model.where({ [pk]: this.id }).find();
                return this.success('', data);
            } catch (e) {
                return this.error(e.message);
            }
        } else {
            try {
                let data = await this.model.select();
                return this.success('', data);
            } catch (e) {
                return this.error(e.message);
            }
        }
    }

    /**
     * 
     * 
     * @returns 
     */
    async postAction() {
        if (!this.model) {
            return this.fail('resource not found');
        }
        try {
            let pk = await this.model.getPk();
            let data = this.post();
            data[pk] && delete data[pk];
            if (lib.isEmpty(data)) {
                return this.error('data is empty');
            }
            let rows = await this.model.add(data);
            return this.success('', rows);
        } catch (e) {
            return this.error(e.message);
        }
    }

    /**
     * 
     * 
     * @returns 
     */
    async deleteAction() {
        if (!this.model) {
            return this.fail('resource not found');
        }
        if (!this.id) {
            return this.error('params error');
        }
        try {
            let pk = await this.model.getPk();
            let rows = await this.model.where({ [pk]: this.id }).delete();
            return this.success('', rows);
        } catch (e) {
            return this.error(e.message);
        }
    }

    /**
     * 
     * 
     * @returns 
     */
    async putAction() {
        if (!this.model) {
            return this.fail('resource not found');
        }
        if (!this.id) {
            return this.error('params error');
        }
        try {
            let pk = await this.model.getPk();
            let data = this.post();
            data[pk] && delete data[pk];
            if (lib.isEmpty(data)) {
                return this.error('data is empty');
            }
            let rows = await this.model.where({ [pk]: this.id }).update(data);
            return this.success('', rows);
        } catch (e) {
            return this.error(e.message);
        }
    }

};