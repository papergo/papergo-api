/*************************
 * des:交易model
 * by:yangwne
 * time:2017/9/17
 **************************/

var mongoose   = require('mongoose');
var Schema     = mongoose.Schema;

var TradeRecordSchema = new Schema({
    trade_no:{  //交易订单号
        type:String,
        index:true
    },
    open_id:{  //用户id
        type:String,
        index:true
    },
    type:String,//0-充值   1-消费
    amount:Number,//付款金额
    balance:Number,//可用余额,
    remark: String,//备注
    time :Date,
    property:{ //删除:false,正常:true
        type:Boolean ,
        default:true
    }
});

module.exports = mongoose.model('trade_record', TradeRecordSchema);




