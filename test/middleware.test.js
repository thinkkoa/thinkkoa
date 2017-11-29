/*eslint-disable*/
const path = require('path');
const assert = require('assert');
const request = require('supertest');
const lib = require('think_lib');
const thinkkoa = require('../lib/thinkkoa.js');

describe('exec middleware', () => {
    let app;
    beforeEach(() => {
        app = new thinkkoa({
            root_path: path.resolve('./test'),
            app_path: path.resolve('./test') + path.sep + 'app',
            app_debug: false
        });
        process.setMaxListeners(0);
        app.use((ctx, next) => {
            ctx.status = 404;
            ctx.body = 'Original';
            return next();
        });
    })

    it('works with a single noop express middleware', (done) => {

        app.useExp(function noop(req, res, next) {
            next();
        })
        request(app.callback())
            .get('/')
            .expect('Original')
            .end(done);
    })

    it('works with two noop express middleware', (done) => {
        function noop(req, res, next) {
            next();
        }

        app.useExp(noop)
        app.useExp(noop)
        request(app.callback())
            .get('/')
            .expect('Original')
            .end(done);
    })

    it('passes correctly to downstream Koa middlewares', (done) => {
        function noop(req, res, next) {
            next();
        }

        function goodStatusSetter(ctx) {
            ctx.status = 200;
        }

        app.useExp(noop);
        app.use(goodStatusSetter);
        request(app.callback())
            .get('/')
            .expect(200)
            .end(done);
    })

    it('bubbles back to earlier middleware', (done) => {
        let callOne = false;
        let callTwo = false;
        app.use((ctx, next) => {
            return next().then(() => {
                    callTwo = true;
            });
        })

        app.useExp((req, res) => {
            res.statusCode = 200;
            callOne = true;
        });

        request(app.callback())
            .get('/')
            .expect(200)
            .then(() => {
                assert(callOne === true, 'Second middleware never called');
                assert(callTwo === true, 'Never bubbled back to first middleware');
                done();
            })
    })

    it('receives errors from express middleware', (done) => {
        app.use((ctx, next) => {
            next().catch((err) => ctx.status = 505);
        });

        app.useExp((req, res, next) => {
            next(new Error('How express does error handling'));
        });

        app.use((ctx) => {
            // Fail the test if this is reached
            done(new Error('Improper error handling'));
        });

        request(app.callback())
            .get('/')
            .expect(505)
            .end(done);
    });

    it('Setting the body or status in Koa middlewares does not do anything if res.end was used in a express middleware', (done) => {
        const message = 'The message that makes it'
        app.use((ctx, next) => {
            next()
                .then(() => {
                    if (ctx.status !== 200) {
                        done(new Error('Never reached connect middleware'));
                    }

                    try {
                        // These calls won't end up doing anything
                        ctx.status = 500;
                        ctx.body = 'A story already written';
                    } catch (err) {

                    }
                });
        });

        app.useExp((req, res) => {
            res.statusCode = 200;
            res.setHeader('Content-Length', message.length);
            res.end(message);
        });

        request(app.callback())
            .get('/')
            .expect(200)
            .expect(message)
            .end(done);
    });
})