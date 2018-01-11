/*************************
 * des:产品model
 * by:yangwne
 * time:2017/9/17
**************************/

var mongoose   = require('mongoose');
var Schema     = mongoose.Schema;

var UserSchema = new Schema({
    open_id:{  //微信openid
        type:String,
        index:true
    },
    nick_name: String,//昵称
    device: String,//首次使用设备 eg {"$ref" : "device","$id" : ObjectId("5126bc054aed4daf9e2ab772")}
    phone: String,//手机号
    create_time :{  //创建日期
        type:Date,
        default:Date.now
    },
    last_login_time : {//最近一次登录时间
    	type:Date,
        default:Date.now
    },
    balance: {//余额
        type:Number,
        default:0
    },
    score: { //积分余额
        type:Number,
        default:0
    },
    property:{ //删除:false,正常:true
        type:Boolean ,
        default:true
    }
});

module.exports = mongoose.model('user', UserSchema);




