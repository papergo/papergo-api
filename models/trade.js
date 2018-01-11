/*************************
 * des:交易model
 * by:yangwne
 * time:2017/9/17
 **************************/

var mongoose   = require('mongoose');
var Schema     = mongoose.Schema;

var TradeSchema = new Schema({
    trade_no:{  //订单号
        type:String,
        index:true
    },
    open_id:{  //用户id
        type:String,
        index:true
    },
    pro_id:{  //产品id
        type:String,
        index:true
    },
    dev_phone:{  //设备id
        type:String,
        index:true
    },
    amount:Number,//付款金额
    size:Number,//购买尺寸
    per:Number,//购买份数
    score:{//赠送积分
        type:Number,
        default:0
    },
    pay_channel_no: String,//支付通道订单号
    pay_info:String,
    pay_status:{//支付状态-1 失败 0 初始状态 1 成功 2 其他状态
        type:String,
        default:0
    },
    direct: String,//通知指令
    direct_phone:String,//指令接收号码
    send_status:{//指令状态 -1 失败 0 初始状态 1 成功 2 其他状态
        type:String,
        default:0
    },
    send_info:String,//指令通知信息
    send_time:Date,//指令发送时间
    pay_time :Date,
    property:{ //删除:false,正常:true
        type:Boolean ,
        default:true
    }
});

module.exports = mongoose.model('trade', TradeSchema);




