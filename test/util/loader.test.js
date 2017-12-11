/*eslint-disable*/
const path = require('path');
const assert = require('assert');
const request = require('supertest');
const lib = require('think_lib');
const thinkloader = require('think_loader');
const loader = require('../../lib/util/loader.js');
const thinkkoa = require('../../lib/thinkkoa.js');


describe('loader', () => {
    let app;
    beforeEach(() => {
        app = new thinkkoa({
            root_path: path.resolve('./test'),
            app_path: path.resolve('./test') + path.sep + 'app',
            app_debug: false
        });
        process.setMaxListeners(0);
    });
    it('config', () => {
        loader.loadConfigs(app);
        assert.equal(app.config('app_port'), 3000);
    });

    it('loader files', () => {
        loader.loadControllers(app);
        let files = thinkloader(app.app_path, { root: 'controller', prefix: '' });
        it('loade home/index class file', () => {
            assert.equal(lib.isFunction(files['home/index']), true);
        });
        it('loade index class file', () => {
            assert.equal(lib.isFunction(files['index']), true);
        });
    });

    it('loader files on multi mod', () => {
        loader.loadControllers(app);
        let files = thinkloader(app.app_path, { root: 'controller', prefix: '/' });
        it('loade home/index class file', () => {
            assert.equal(lib.isFunction(files['home/index']), true);
        });
        it('loade index class file', () => {
            assert.equal(lib.isFunction(files['index']), false);
        });
    });
});