/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */

module.exports = {
    list: [], //加载的中间件列表
    config: { //中间件配置 {logger: {is_log: true}}
        logger: {
            log: true, //是否存储日志
            level: ['warn', 'error'], //日志存储级别, info, warn, error, console类型日志有效
        },
        static: { //静态资源,如果配置了Nginx代理,请设置为 static: false
            prefix: '/static', //resource prefix 
            gzip: true, //enable gzip
            filter: null, //function or array['jpg', 'gif']
            maxAge: 3600 * 24, //cache maxAge seconds
            buffer: false, //enable buffer
            alias: {},  //alias files {key: path}
            preload: false //preload files
        },
        payload: {
            extTypes: {
                json: ['application/json'],
                form: ['application/x-www-form-urlencoded'],
                text: ['text/plain'],
                multipart: ['multipart/form-data'],
                xml: ['text/xml']
            }
        },
        error: {
            error_code: 503, //报错时的状态码
            error_no_key: 'errno', //错误号的key
            error_msg_key: 'errmsg', //错误消息的key
        },
        router: {
            route_on: false, //是否开启自定义路由功能
            pathname_suffix: '.jhtml', //不解析的pathname后缀，这样利于seo
        }
    }
};