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
        http: {
            timeout: 30, //http超时时间,30 seconds
        },
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
            error_code: 500, //报错时的状态码
            error_no_key: 'errno', //错误号的key
            error_msg_key: 'errmsg', //错误消息的key
        },
        router: {
            deny_modules: ['common'], //禁止访问的模块
            default_module: 'home', //默认的模块
            default_controller: 'index', //默认控制器
            default_action: 'index', //默认方法
            prefix: [], // url prefix
            suffix: ['.jhtml'], // url suffix
            subdomain_offset: 2,
            subdomain: {}, //subdomain
        }
    }
};