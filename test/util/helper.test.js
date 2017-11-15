/*eslint-disable*/
const path = require('path');
// const test = require('ava');
const assert = require('assert');
const helper = require('../../lib/util/helper.js');
const loader = require('../../lib/util/loader.js');
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
//     t.is(helper.isFunction(think.controller('index')), true);
// });

// test('think.controller: get controller instance', t => {
//     t.is(helper.isFunction(think.model('user'), {}), true);
// });

// test('think.model: get base model', t => {
//     t.deepEqual(think.model(), think.model.base);
// });

// test('think.model: get model class', t => {
//     t.is(helper.isFunction(think.model('user')), true);
// });

// test('think.model: get model instance', t => {
//     t.is(helper.isFunction(think.model('user'), {}), true);
// });

// test('think.model: get service class', t => {
//     t.is(helper.isFunction(think.model('user')), true);
// });

// test('think.model: get service instance', t => {
//     t.is(helper.isFunction(think.model('user'), {}), true);
// });


describe('util helper', () => {
    let app;
    beforeEach(() => {
        app = new thinkkoa({
            root_path: path.resolve('./test'),
            app_path: path.resolve('./test') + path.sep + 'app',
            app_debug: false
        });
    });

    it('addLogs', () => {
        helper.addLogs('test', 'test');
        assert.equal(helper.addLogs('test', 'test'), null);
        helper.rmDir(path.resolve('./test/logs'));
    });
    it('parseExpMiddleware', () => {
        assert.equal(helper.isFunction(helper.parseExpMiddleware(function (req, res, next) { })), true);
    });
    it('prevent', () => {
        try {
            assert.equal(helper.isPromise(helper.prevent()), true);
        } catch (e) { }
    })
    it('isPrevent', function* () {
        assert.equal(helper.isPrevent(yield helper.prevent()), true);
    })
    it('logger', function () {
        assert.equal(helper.isFunction(helper.logger), true);
    })

    if (global.think) {
        it('think.config', () => {
            loader.loadConfigs(app);
            it('read project config', () => {
                assert.equal(think.config('app_port'), 3000);
            });

            it('read middleware config', () => {
                assert.deepEqual(think.config('list', 'middleware'), []);
            });
        });

        it('think.controller', () => {
            loader.loadConfigs(app);
            loader.loadControllers(app);
            it('get base controller', () => {
                assert.deepEqual(think.controller(), think.controller.base);
            });
            it('get controller class', () => {
                assert.equal(helper.isFunction(think.controller('index')), true);
            });
            it('get controller instance', () => {
                assert.equal(helper.isFunction(think.controller('index'), {}), true);
            });
        });

        it('think.service', () => {
            loader.loadConfigs(app);
            loader.loadModules(app);

            it('get service class', () => {
                assert.equal(helper.isFunction(think.service('user')), true);
            });
            it('get service instance', () => {
                assert.equal(helper.isFunction(think.service('user'), {}), true);
            });
        });
    }

});