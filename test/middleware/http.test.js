// /*eslint-disable*/
// const path = require('path');
// const lib = require('think_lib');
// const assert = require('assert');
// const request = require('supertest');
// const payload = require('../../lib/middleware/payload');
// const http = require('../../lib/middleware/http');
// const asyncToGenerator = require('babel-runtime/helpers/asyncToGenerator').default;

// const thinkkoa = require('../../lib/thinkkoa.js');
// // global.think = {};
// // let app = new thinkkoa({
// //     root_path: path.resolve('./test'),
// //     app_path: path.resolve('./test') + path.sep + 'app',
// //     app_debug: false
// // });

// let midd = function (options) {
//     // return (() => {
//     //     var _ref = asyncToGenerator(function* (ctx, next) {
//     //         assert.equal(lib[options.type](ctx[options.name]), true);
//     //         if (options.value) {
//     //             assert.equal(ctx[options.name], options.value);
//     //         }
//     //         ctx.status = 200;
//     //         ctx.body = lib[options.type](ctx[options.name]);
//     //         return;
//     //     });
//     //     return function (_x, _x2) {
//     //         return _ref.apply(this, arguments);
//     //     };
//     // })();
//     return function (ctx, next) {
//         assert.equal(lib[options.type](ctx[options.name]), true);
//         if (options.value) {
//             assert.equal(ctx[options.name], options.value);
//         }
//         ctx.status = 200;
//         ctx.body = lib[options.type](ctx[options.name]);
//         return;
//     };
// }
// let isGet = function (options) {
//     return function (ctx, next) {
//         assert.equal(ctx.isGet(), true);
//         assert.deepEqual(ctx.get(), { n: 10 })
//         ctx.status = 200;
//         return;
//     };
// }
// let isPost = function (options) {
//     return function (ctx, next) {
//         assert.equal(ctx.isPost(), true);
//         assert.deepEqual(ctx.post(), { aa: 111 })
//         ctx.status = 200;
//         return;
//     };
// }
// let isAjax = function (options) {
//     return function (ctx, next) {
//         assert.equal(ctx.isAjax(), true);
//         assert.deepEqual(ctx.param(), { aa: 111 })
//         ctx.status = 200;
//         return;
//     };
// }
// let isPjax = function (options) {
//     return function (ctx, next) {
//         assert.equal(ctx.isPjax(), true);
//         assert.deepEqual(ctx.param(), { aa: 111 })
//         ctx.status = 200;
//         return;
//     };
// }
// let isJsonp = function (options) {
//     return function (ctx, next) {
//         assert.equal(ctx.isJsonp(), true);
//         ctx.status = 200;
//         return;
//     };
// }

// let param = function (options) {
//     return function (ctx, next) {
//         assert.deepEqual(ctx.param(), { aa: 111 })
//         ctx.status = 200;
//         return;
//     };
// }
// let ref = function (options) {
//     return function (ctx, next) {
//         assert.deepEqual(111, { aa: 111 })
//         ctx.status = 200;
//         return;
//     };
// }

// describe('http middlware', () => {

//     let app;

//     before(() => {
//         if (!think || !think.app) {
//             app = new thinkkoa({
//                 root_path: path.resolve('./test'),
//                 app_path: path.resolve('./test') + path.sep + 'app',
//                 app_debug: false
//             });
//         }
//         think.use(http());
//     });

//     describe('with PATH exception', () => {
//         it('should not call the middleware when the path doesnt match', (done) => {
//             request(think.app.listen()).get('/test').expect(404, done);
//         })
//     });

//     describe('Check extensions', () => {
//         it('startTime', (done) => {
//             think.use(midd({ name: 'startTime', type: 'isNumber' }));
//             request(think.app.listen()).get('/test').query({ n: 10 }).expect(200).end(function (err, res) {
//                 if (err) {
//                     return done(err);
//                 }
//                 done();
//             });
//         });
//         it('version', (done) => {
//             think.use(midd({ name: 'version', type: 'isString' }));
//             request(think.app.listen()).get('/test').query({ n: 10 }).expect(200, done);
//         });
//         it('originalPath', (done) => {
//             think.use(midd({ name: 'originalPath', type: 'isString', value: '/test' }));
//             request(think.app.listen()).get('/test').query({ n: 10 }).expect(200, done);
//         });
//         it('timeoutTimer', (done) => {
//             think.use(midd({ name: 'timeoutTimer', type: 'isFunction' }));
//             request(think.app.listen()).get('/test').query({ n: 10 }).expect(200, done);
//         });
//         it('afterEnd', (done) => {
//             think.use(midd({ name: 'afterEnd', type: 'isFunction' }));
//             request(think.app.listen()).get('/test').query({ n: 10 }).expect(200, done);
//         });
//         it('isGet', (done) => {
//             think.use(midd({ name: 'isGet', type: 'isFunction' }));
//             request(think.app.listen()).get('/test').query({ n: 10 }).expect(200, done);
//         });
//         it('isPost', (done) => {
//             think.use(midd({ name: 'isPost', type: 'isFunction' }));
//             request(think.app.listen()).get('/test').query({ n: 10 }).expect(200, done);
//         });
//         it('isAjax', (done) => {
//             think.use(midd({ name: 'isAjax', type: 'isFunction' }));
//             request(think.app.listen()).get('/test').query({ n: 10 }).expect(200, done);
//         });
//         it('isPjax', (done) => {
//             think.use(midd({ name: 'isPjax', type: 'isFunction' }));
//             request(think.app.listen()).get('/test').query({ n: 10 }).expect(200, done);
//         });
//         it('isJsonp', (done) => {
//             think.use(midd({ name: 'isJsonp', type: 'isFunction' }));
//             request(think.app.listen()).get('/test').query({ n: 10 }).expect(200, done);
//         });
//         it('referer', (done) => {
//             think.use(midd({ name: 'referer', type: 'isFunction' }));
//             request(think.app.listen()).get('/test').query({ n: 10 }).expect(200, done);
//         });
//         it('header', (done) => {
//             think.use(midd({ name: 'header', type: 'isFunction' }));
//             request(think.app.listen()).get('/test').query({ n: 10 }).expect(200, done);
//         });
//         it('types', (done) => {
//             think.use(midd({ name: 'types', type: 'isFunction' }));
//             request(think.app.listen()).get('/test').query({ n: 10 }).expect(200, done);
//         });
//         it('deny', (done) => {
//             think.use(midd({ name: 'deny', type: 'isFunction' }));
//             request(think.app.listen()).get('/test').query({ n: 10 }).expect(200, done);
//         });
//         it('sendTime', (done) => {
//             think.use(midd({ name: 'sendTime', type: 'isFunction' }));
//             request(think.app.listen()).get('/test').query({ n: 10 }).expect(200, done);
//         });
//         it('expires', (done) => {
//             think.use(midd({ name: 'expires', type: 'isFunction' }));
//             request(think.app.listen()).get('/test').query({ n: 10 }).expect(200, done);
//         });
//         it('cookie', (done) => {
//             think.use(midd({ name: 'cookie', type: 'isFunction' }));
//             request(think.app.listen()).get('/test').query({ n: 10 }).expect(200, done);
//         });
//         it('echo', (done) => {
//             think.use(midd({ name: 'echo', type: 'isFunction' }));
//             request(think.app.listen()).get('/test').query({ n: 10 }).expect(200, done);
//         });
//     });
//     describe('Inspection method judgment', () => {
//         it('isGet', (done) => {
//             think.use(payload());
//             think.use(isGet());
//             request(think.app.listen()).get('/test').query({ n: 10 }).expect(200, done);
//         });
//         it('isPost', (done) => {
//             think.use(payload());
//             think.use(isPost());
//             request(think.app.listen()).post('/test').send({ aa: 111 }).query({ n: 10 }).expect(200, done);
//         });
//         it('param', (done) => {
//             think.use(payload());
//             think.use(param());
//             request(think.app.listen()).post('/test').send({ aa: 111 }).query({ aa: 10 }).expect(200, done);
//         });
//         it('isAjax', (done) => {
//             think.use(payload());
//             think.use(isAjax());
//             request(think.app.listen())
//                 .get('/test')
//                 .send({ aa: 111 })
//                 .set('X-Requested-With', 'XMLHttpRequest')
//                 .expect(200)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     done();
//                 });
//         });
//         it('isPjax', (done) => {
//             think.use(payload());
//             think.use(isPjax());
//             request(think.app.listen())
//                 .get('/test')
//                 .send({ aa: 111 })
//                 .set('X-Pjax', 'true')
//                 .expect(200)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     done();
//                 });
//         });
//         it('isJsonp', (done) => {
//             think.use(payload());
//             think.use(isPjax());
//             request(think.app.listen())
//                 .get('/test')
//                 .query({ jsonpcallback: 111 })
//                 .expect(200)
//                 .end(function (err, res) {
//                     if (err) return done(err);
//                     done();
//                 });
//         });
//     });

//     describe('Other method', () => {
//         it('referer', (done) => {
//             think.use(ref());
//             request(think.app.listen()).get('/test').query({ aa: 111 }).expect(200, done);
//         });
//     });
// });