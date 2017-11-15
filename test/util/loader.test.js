/*eslint-disable*/
// const test = require('ava');
const path = require('path');
const assert = require('assert');
const request = require('supertest');
const lib = require('../../lib/util/helper.js');
const loader = require('../../lib/util/loader.js');
const thinkkoa = require('../../lib/think.js');

// 这个会在所有测试前运行
// let app;
// let app_path = path.resolve('./test') + path.sep + 'app';
// test.before(t => {
//     app = new thinkkoa({
//         root_path: path.resolve('./test'),
//         app_path: path.resolve('./test') + path.sep + 'app',
//         app_debug: false
//     });
// });

// test('loader files: loade home/index class file', async function (t) {
//     let files = await loader(app_path, {root: 'controller', prefix: ''});
//     t.is(lib.isFunction(files['home/index']), true);
// });

// test('loader files: loade index class file', async function (t) {
//     let files = await loader(app_path, {root: 'controller', prefix: ''});
//     t.is(lib.isFunction(files['index']), true);
// });

// test('loader files on multi mod: loade home/index class file', async function (t) {
//     let files = await loader(app_path, {root: 'controller', prefix: '/'});
//     t.is(lib.isFunction(files['home/index']), true);
// });

// test('loader files on multi mod: loade index class file', async function (t) {
//     let files = await loader(app_path, {root: 'controller', prefix: '/'});
//     t.is(lib.isFunction(files['index']), false);
// });


describe('loader', () => {
    let app;
    beforeEach(() => {
        app = new thinkkoa({
            root_path: path.resolve('./test'),
            app_path: path.resolve('./test') + path.sep + 'app',
            app_debug: false
        });
    });
    it('use', (done) => {
        loader.loadConfigs(app);
        loader.loadMiddlewares(app, false);
        
        app.use((ctx, next) => {
            ctx.status = 404;
            ctx.body = 'Original';
            return next();
        });
        request(app.koa.callback())
        .get('/')
        .expect('Original')
        .end(done);
    });
    it('useExp', (done) => {
        loader.loadConfigs(app);
        loader.loadMiddlewares(app, false);
        app.use((ctx, next) => {
            ctx.status = 404;
            ctx.body = 'Original';
            return next();
        });
        app.useExp(function (req, res, next) {
            next();
        });
        request(app.koa.callback())
        .get('/')
        .expect('Original')
        .end(done);
    });
    it('config', () => {
        loader.loadConfigs(app);
        assert.equal(app.config('app_port'), 3001);
    });

    it('loader files', () => {
        loader.loadControllers(app);
        let files = loader(app.app_path, { root: 'controller', prefix: '' });
        it('loade home/index class file', () => {
            assert.equal(lib.isFunction(files['home/index']), true);
        });
        it('loade index class file', () => {
            assert.equal(lib.isFunction(files['index']), true);
        });
    });

    it('loader files on multi mod', () => {
        loader.loadControllers(app);
        let files = loader(app.app_path, { root: 'controller', prefix: '/' });
        it('loade home/index class file', () => {
            assert.equal(lib.isFunction(files['home/index']), true);
        });
        it('loade index class file', () => {
            assert.equal(lib.isFunction(files['index']), false);
        });
    });
});