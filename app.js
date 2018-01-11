/*************************
 * des:应用入口页面
 * by:yangwne
 * time:2017/9/17
**************************/


// 加载express
var express    = require('express');        // call express
var log4js = require('log4js');
var log = require("./common/log");
var app        = express();                 // 获得express定义的app，app对象此时代表整个web应用
var bodyParser = require('body-parser');
var config = require('./config/server');
var domain = require('domain');

//配置Log4j
//app.use(log4js.useLog());
app.use(log4js.connectLogger(log.logger, {format: ':remote-addr :method :url :status :response-time ms'}));
//配置mongodb
require('./common/db');
// 通过如下配置再路由种处理request时，可以直接获得post请求的body部分
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(err,req,res,next) {
    log.logger.error("Error: ",err.stack);
    res.send(err.stack);
});

/**
 * 异常处理中间件
 */
app.use(function (req, res, next) {
    var reqDomain = domain.create();
    reqDomain.on('error', function (err) {  // 下面抛出的异常在这里被捕获,触发此事件
        log.logger.error("发生错误: ",err.stack);
        res.send(err.stack);           // 成功给用户返回了 500
    });
    reqDomain.run(next);
});

/**
 * 捕获异常，防止服务器直接奔溃
 */
process.on('uncaughtException', function (err) {
    if (typeof err === 'object') {
        if (err.message) {
            console.error(err.message);
            log.logger.error('发生uncaughtException异常: ' + err.message)
        }
        if (err.stack) {
            console.error(err.stack);
            log.logger.error(err.stack);
        }
    } else {
        log.logger.error('argument is not an object');
    }
});

app.use('/', require('./routes'));

// 启动server
// =============================================================================
//开始监听端口
app.listen(config.port);
console.log('listen on port ' + config.port);
