/*eslint-disable*/
const path = require('path');
const assert = require('assert');
const helper = require('think_lib');
const pkg = require('../package.json');
const thinkkoa = require('../lib/thinkkoa.js');

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
        node_engines = node_engines.slice(0, node_engines.lastIndexOf('.'));
        let nodeVersion = process.version;
        if (nodeVersion[0] === 'v') {
            nodeVersion = nodeVersion.slice(1);
        }
        nodeVersion = nodeVersion.slice(0, nodeVersion.lastIndexOf('.'));

        assert.equal(helper.toNumber(nodeVersion) > helper.toNumber(node_engines), true);
    });

    // it('prevent', (done) => {
    //     app.prevent().catch(e => {
    //         assert.equal(app.isPrevent(e), true);
    //         done();
    //     })
    // });

    // it('config', () => {
    //     thinkkoa.loader.loadConfigs(app);
    //     assert.equal(app.config('app_port'), 3000);
    // });

    // it('captureError', () => {
    //     app.captureError();
    //     app.emit('error', new Error('ddd'))
    // })


});