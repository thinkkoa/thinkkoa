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
        }
    }
};