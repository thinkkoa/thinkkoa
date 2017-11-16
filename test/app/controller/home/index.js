const {controller, helper} = require('../../../../index.js');

module.exports = class extends controller {
    init(args){
        super.init(args);
        this.test = 'test';
    }

    indexAction() {
        return this.write('hello world');
    }
};