/**
 * 短信发送
 * Created on 2017-09-26
 */
var sms = {};
const SMSClient = require('@alicloud/sms-sdk');
const log = require("./log");
// ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
const accessKeyId = 'LTAI20GT476fy9Ei';
const secretAccessKey = 'I8mfMpd6DBosa0OChCeJZaqYYS2rTl';
//初始化sms_client
let smsClient = new SMSClient({accessKeyId, secretAccessKey});

sms.send = function(trade){
    //console.info("send sms");
    var params = {
        "PhoneNumbers": trade.dev_phone,
        "SignName": "摩恩斯特",
        "TemplateCode": "SMS_100250024",
        "TemplateParam": "{\"trade_no\":\""+trade.trade_no+"\",\"size\":\""+trade.size+"\",\"div\":1}"
    };
    //console.info(params);
    return smsClient.sendSMS(params).then(function (res) {
        let {Code}=res
        if (Code === 'OK') {
            //处理返回参数
            log.logger.info("trade_no"+ trade.trade_no +",成功发送短信指令!,号码："+ trade.dev_phone);
        }else{
            log.logger.error("trade_no"+ trade.trade_no +",发送短信失败!,号码："+ trade.dev_phone);
            log.logger.error(Code);
        }
    }, function (err) {
        log.logger.error(err);
    });
};

module.exports = sms;
