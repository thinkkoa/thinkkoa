/*eslint-disable*/
// const test = require('ava');
const path = require('path');
const assert = require('assert');
const lib = require('../../lib/util/lib.js');
const loader = require('../../lib/loader.js');
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
//     let files = await new loader(app_path, {root: 'controller', prefix: ''});
//     t.is(lib.isFunction(files['home/index']), true);
// });

// test('loader files: loade index class file', async function (t) {
//     let files = await new loader(app_path, {root: 'controller', prefix: ''});
//     t.is(lib.isFunction(files['index']), true);
// });

// test('loader files on multi mod: loade home/index class file', async function (t) {
//     let files = await new loader(app_path, {root: 'controller', prefix: '/'});
//     t.is(lib.isFunction(files['home/index']), true);
// });

// test('loader files on multi mod: loade index class file', async function (t) {
//     let files = await new loader(app_path, {root: 'controller', prefix: '/'});
//     t.is(lib.isFunction(files['index']), false);
// });



let app;
let app_path = path.resolve('./test') + path.sep + 'app';

describe('loader', () => {

    before(() => {
        if (!think || !think.app) {
            app = new thinkkoa({
                root_path: path.resolve('./test'),
                app_path: path.resolve('./test') + path.sep + 'app',
                app_debug: false
            });
        }
    });

    describe('loader files', () => {
        loader.loadController();
        let files = new loader(app_path, { root: 'controller', prefix: '' });
        it('loade home/index class file', () => {
            assert.equal(lib.isFunction(files['home/index']), true);
        });
        it('loade index class file', () => {
            assert.equal(lib.isFunction(files['index']), true);
        });
    });

    describe('loader files on multi mod', () => {
        loader.loadController();
        let files = new loader(app_path, { root: 'controller', prefix: '/' });
        it('loade home/index class file', () => {
            assert.equal(lib.isFunction(files['home/index']), true);
        });
        it('loade index class file', () => {
            assert.equal(lib.isFunction(files['index']), false);
        });
    });
});