/*************************
 * des:场所model
 * by:yangwne
 * time:2017/9/17
**************************/

var mongoose   = require('mongoose');
var Schema     = mongoose.Schema;

var PlaceSchema = new Schema({
    code:{  //编号
        type:String,
        index:true
    },
    name: String,//名称
    city:{//所属城市，城市代码,城市名称
        code:String,
        name:String
    },
    lon:String,//经度
    lat:String,//纬度
    contact:{//联系方式
        name:String,
        phone:String
    },
    create_time :{  //创建日期
        type:Date,
        default:Date.now
    },
    property:{ //删除:false,正常:true
        type:Boolean ,
        default:true
    }
});

module.exports = mongoose.model('place', PlaceSchema);




