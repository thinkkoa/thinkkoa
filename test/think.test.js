/*eslint-disable*/
const path = require('path');
const assert = require('assert');
const helper = require('think_lib');
const pkg = require('../package.json');
const thinkkoa = require('../lib/think.js');

describe('think class', () => {
    let app;
    beforeEach(() => {
        app = new thinkkoa({
            root_path: path.resolve('./test'),
            app_path: path.resolve('./test') + path.sep + 'app',
            app_debug: false
        });
        process.setMaxListeners(0);
    });

    it('checkEnv', () => {
        let node_engines = pkg.engines.node.slice(1) || '8.0.0';
        let nodeVersion = process.version;
        if (nodeVersion[0] === 'v') {
            nodeVersion = nodeVersion.slice(1);
        }
        assert.equal(nodeVersion > node_engines, true);
    });

    it('prevent', (done) => {
        app.prevent().catch(e => {
            assert.equal(app.isPrevent(e), true);
            done();
        })
    });

    it('config', () => {
        thinkkoa.loader.loadConfigs(app);
        assert.equal(app.config('app_port'), 3000);
    });

    it('captureError', () => {
        app.emit('error', new Error('ddd'))
    })


});