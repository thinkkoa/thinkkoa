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
    init(ctx, app) {
        super.init(ctx, app);
        try {
            //resource id
            this.id = this.get('id') || '';
            this.model = this.ctx.group ? (think.model(`${this.ctx.group}/${this.ctx.controller}`, {}) || think.model(`common/${this.ctx.controller}`, {})) : think.model(this.ctx.controller, {});
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
            if (think.isEmpty(data)) {
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
            if (think.isEmpty(data)) {
                return this.error('data is empty');
            }
            let rows = await this.model.where({ [pk]: this.id }).update(data);
            return this.success('', rows);
        } catch (e) {
            return this.error(e.message);
        }
    }

};