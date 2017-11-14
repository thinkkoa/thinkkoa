/*eslint-disable*/
const path = require('path');
// const test = require('ava');
const assert = require('assert');
const lib = require('../../lib/util/helper.js');
const thinkkoa = require('../../lib/think.js');

// // 这个会在所有测试前运行
// let app;
// test.before(t => {
//     app = new thinkkoa({
//         root_path: path.resolve('./test'),
//         app_path: path.resolve('./test') + path.sep + 'app',
//         app_debug: false
//     });
//     app.loadConfigs();
//     app.loadModules();
// });


// test('think.config: read project config', t => {
//     t.is(think.config('app_port'), 3000);
// });

// test('think.config: read middleware config', t => {
//     t.deepEqual(think.config('list', 'middleware'), []);
// });

// test('think.controller: get base controller', t => {
//     t.deepEqual(think.controller(), think.controller.base);
// });

// test('think.controller: get controller class', t => {
//     t.is(lib.isFunction(think.controller('index')), true);
// });

// test('think.controller: get controller instance', t => {
//     t.is(lib.isFunction(think.model('user'), {}), true);
// });

// test('think.model: get base model', t => {
//     t.deepEqual(think.model(), think.model.base);
// });

// test('think.model: get model class', t => {
//     t.is(lib.isFunction(think.model('user')), true);
// });

// test('think.model: get model instance', t => {
//     t.is(lib.isFunction(think.model('user'), {}), true);
// });

// test('think.model: get service class', t => {
//     t.is(lib.isFunction(think.model('user')), true);
// });

// test('think.model: get service instance', t => {
//     t.is(lib.isFunction(think.model('user'), {}), true);
// });

describe('util lib', () => {

    let app;
    app = new thinkkoa({
        root_path: path.resolve('./test'),
        app_path: path.resolve('./test') + path.sep + 'app',
        app_debug: false
    });

    describe('think.config', () => {
        think.loader.loadConfigs();
        it('read project config', () => {
            assert.equal(think.config('app_port'), 3000);
        });

        it('read middleware config', () => {
            assert.deepEqual(think.config('list', 'middleware'), []);
        });
    });

    describe('think.controller', () => {
        think.loader.loadConfigs();
        think.loader.loadModules();
        it('get base controller', () => {
            assert.deepEqual(think.controller(), think.controller.base);
        });
        it('get controller class', () => {
            assert.equal(lib.isFunction(think.controller('index')), true);
        });
        it('get controller instance', () => {
            assert.equal(lib.isFunction(think.controller('index'), {}), true);
        });
    });

    // describe('think.model', () => {
    //     think.loader.loadConfigs();
    //     think.loader.loadModules();
    //     it('get base model', () => {
    //         assert.deepEqual(think.model(), think.model.base);
    //     });
    //     it('get model class', () => {
    //         assert.equal(lib.isFunction(think.model('user')), true);
    //     });
    //     it('get model instance', () => {
    //         assert.equal(lib.isFunction(think.model('user'), {}), true);
    //     });
    // });

    describe('think.service', () => {
        think.loader.loadConfigs();
        think.loader.loadModules();

        it('get service class', () => {
            assert.equal(lib.isFunction(think.service('user')), true);
        });
        it('get service instance', () => {
            assert.equal(lib.isFunction(think.service('user'), {}), true);
        });
    });
});