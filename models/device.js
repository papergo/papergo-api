/*************************
 * des:设备model
 * by:yangwne
 * time:2017/9/17
**************************/

var mongoose   = require('mongoose');
var Schema     = mongoose.Schema;

var DeviceSchema = new Schema({
    code:{  //设备编号
        type:String,
        index:true
    },
    version: String,//型号
    phone: {  //物联卡号码
        type:String,
        index:true
    },
    place: String,
    //place: DBRef,//场所字段暂不定义，直接在新增时插入
                  // "$ref" : "place","$id" : ObjectId("5126bc054aed4daf9e2ab772")
    //status: redis,//状态数据：是否有人、电量、纸量、数据采集时间直接保存于redis
    main_time :{  //最近一次维护时间
        type:Date,
        default:Date.now
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

module.exports = mongoose.model('device', DeviceSchema);
