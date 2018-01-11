/*************************
 * des:产品model
 * by:yangwne
 * time:2017/9/17
**************************/
var mongoose   = require('mongoose');
var Schema     = mongoose.Schema;

var ProductSchema = new Schema({
    code:{  //编号
        type:String,
        index:true
    },
    name: String,//名称
    price:Number,//价格精确到分
    size:Number,//尺寸精确到毫米(充值产品没有尺寸)
    per:Number,//份数
    score:Number,//赠送积分
    direct:String,//指令
    type:String,//产品类型 1-金额 2-定量纸
    send:Boolean,//是否发送
    online:{
    	type:Boolean,
        default:false
    },
    create_time :{  //创建日期
        type:Date,
        default:Date.now
    },
    property:{ //删除:false,正常:true
        type:Boolean,
        default:true
    }
});

module.exports = mongoose.model('product', ProductSchema);
