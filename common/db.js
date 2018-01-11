/*************************
 * des: 数据连接
 * by:yangwne
 * time:2017/9/17
**************************/

const dbConfig = require('./../config/db');//引入配置文件

//配置mongodb
var url = dbConfig.url // 连接mongodb的url
var mongoose = require('mongoose');//加载mongoose模块
mongoose.Promise = global.Promise;
mongoose.connect(url,{useMongoClient:true}); // 连接数据库

var db = mongoose.connection;
db.on('error', function (err) {
     console.log('connection error:', err.message);
});
db.once('open', function callback () {
     console.log("Connected to MongoDB!");
});


// 导出  
module.exports = db;  