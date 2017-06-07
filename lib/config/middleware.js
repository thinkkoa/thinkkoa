'use strict';

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */

module.exports = {
    list: [], //加载的中间件列表
    config: { //中间件配置 {logger: {log: true}}
        http: {
            timeout: 30, //http超时时间,30 seconds
            cookie: {
                domain: '',
                path: '/',
                timeout: 0
            }
        },
        logger: {
            log: true, //是否存储日志
            level: ['warn', 'error'] },
        static: { //静态资源,如果配置了Nginx代理,请设置为 static: false
            prefix: '/static', //resource prefix 
            gzip: true, //enable gzip
            filter: null, //function or array['jpg', 'gif']
            maxAge: 3600 * 24, //cache maxAge seconds
            buffer: false, //enable buffer
            alias: {}, //alias files {key: path}
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
            error_msg_key: 'errmsg' },
        router: {
            deny_modules: ['common'], //禁止访问的模块
            default_module: 'home', //默认的模块
            default_controller: 'index', //默认控制器
            default_action: 'index', //默认方法
            prefix: [], // url prefix
            suffix: ['.jhtml'], // url suffix
            subdomain_offset: 2,
            subdomain: {} },
        controller: {
            action_suffix: 'Action', //方法后缀,带后缀的方法为公共方法
            empty_action: '__empty', //空方法,如果访问控制器中不存在的方法,默认调用
            common_before: '__before', //控制器类公共前置方法,除私有方法外其他方法执行时自动调用
            self_before: '_before_' }
    }
};