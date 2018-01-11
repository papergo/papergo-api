/**
 * 短信发送
 * Created on 2017-09-26
 */
var m2m = {};
const log = require("./log");
const utils = require("./utils");
const request = require('request');
const moment = require('moment');
var md5= require("md5");
var urlencode = require('urlencode');

const urlPrefix = "http://api.m2m10086.com:89/M2MSmsSend.ashx";
const partnercode = '3432';
const servicecode = '44fcae';
const password = '343244fcae';
const mobiletype = '0';
/**
 *  partnercode  servicecode requesttime sign sendkey mobiletype mobile content
 *
 * @param trade
 */

m2m.send = function(trade){
    var mobile = trade.dev_phone;//trade.dev_phone;
    //var mobile = "1064728507673";
    var trade_no = trade.trade_no;//trade.trade_no;
    var size =  trade.size;//trade.size;
    var per = trade.per;
    var content = `{"trade_no":"${trade_no}","size":${size},"per":${per}}`;
    var contentEncode = urlencode(content);
    var sendkey = utils.generateRandom(16);
    var requestTime = moment().format('YYYYMMDDHHmmssSSS') + moment().format('YYYYMMDD');
    var md5Str = password + requestTime+ sendkey + mobiletype+ mobile + contentEncode;
    var sign = md5(md5Str.toLowerCase());
    var params = {
        "partnercode": partnercode,
        "servicecode": servicecode,
        "requesttime": requestTime,
        "sign": sign,
        "sendkey": sendkey,
        "mobiletype": mobiletype,
        "mobile": mobile,
        "content": contentEncode
    };
    log.logger.info("开始发送短信到设备, mobile :" + mobile + ",trade_no : " + trade_no );
    log.logger.info("params : " + JSON.stringify(params));
    return new Promise(function(resolve, reject) {
        request.post({url: urlPrefix, body: JSON.stringify(params)}, function (error, response, body) {
            if (error) {
                log.logger.error("发送短信到设备失败, mobile :" + mobile + ",trade_no : " + trade_no);
                return reject(error);
            }
            if (JSON.parse(body).status == "0000") {
                log.logger.info("发送短信到设备成功, mobile :" + mobile + ",trade_no : " + trade_no);
                resolve(body);
            }else {
                log.logger.info("发送短信到设备失败, mobile :" + mobile + ",trade_no : " + trade_no + ", return = " + body);
                return reject(body);
            }
        });
    });
};

module.exports = m2m;
