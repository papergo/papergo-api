/*************************
 * des: 订单相关api
 * by:yangwen
 * time:2017/9/17
 **************************/

var express = require('express');
var router = express.Router();
var Trade     = require('./../models/trade');
var User     = require('./../models/user');
var Device     = require('./../models/device');
var TradeRecord  = require('./../models/trade_record');
const code = require('./../config/code');
const msg_code = require("../config/msg_code");
var utils = require("../common/utils");
var m2m = require("../common/m2m");
var log = require("../common/log");
var dbPromise = require("../common/db_promise");

/**
 * 创建订单
 * :订单分为三类，1：充值直接消费，2：充值（产品类型为充值、无尺寸数据），3：余额消费(通道号为0)
 **/
router.route('/trade_no')
//create
    .post(async function(req, res) {

        if(utils.isEmpty(req.body.open_id)||
            utils.isEmpty(req.body.dev_code)||
            utils.isEmpty(req.body.pro_id)||
            utils.isEmpty(req.body.amount)){
            return res.json(utils.fail(msg_code.PARAM_ERROR));
        }else{
            try{
                var device = await dbPromise.findOne(Device,{code:req.body.dev_code});
                if(utils.isEmptyObject(device)){
                    return res.json(utils.fail(msg_code.NO_EXIST));
                }
                var trade_no = req.body.dev_code + Date.now();//时间戳+设备卡号
                var trade = new Trade();
                trade.trade_no = trade_no;
                trade.open_id = req.body.open_id;
                trade.dev_phone = device.phone;
                trade.pro_id = req.body.pro_id;
                trade.amount = req.body.amount;
                utils.isEmpty(req.body.size)?"":(trade.size = req.body.size);//尺寸空说明只是充值产品，不出纸
                utils.isEmpty(req.body.per)?"":(trade.per = req.body.per);//尺寸空说明只是充值产品，不出纸
                //支付通道为0：余额消费 ,默认
                trade.pay_channel_no = utils.isEmpty(req.body.pay_channel_no)?code.PAY_CHANNEL_NO.WECHAT:req.body.pay_channel_no;
                utils.isEmpty(req.body.score)?"":(trade.score = req.body.score);//余额消费无积分
                await dbPromise.save(trade);
                log.logger.info("创建订单成功，订单号："+trade.trade_no);
                return res.json(utils.success(trade_no));
            }catch(err){
                return res.json(utils.fail(err));
            }
        }
    })
;

/**
 * 支付结果
 *
 *  mongoDB不支持事务，此方法勉强模拟事务，后期需改进
 **/
router.route('/pay_result')
//create
    .post( async function(req, res) {
        if(utils.isEmpty(req.body.trade_no)||
            utils.isEmpty(req.body.result)){
            return res.json(utils.fail(msg_code.PARAM_ERROR));
        }else{
            var tradeBak;
            var userBak;
            //1.查找订单数据
            try{
                var trade = await dbPromise.findOne(Trade,{trade_no:req.body.trade_no});
                if(!utils.isEmpty(trade)){
                    tradeBak = trade;
                    trade.pay_status = req.body.result;
                    trade.pay_time = Date.now();
                    log.logger.info("订单：" + trade.trade_no + "，收到支付回调通知，："+ trade);
                    //2.保存订单数据,进入下一个then
                    await dbPromise.save(trade);
                    //如果支付成功：通知设备出纸，并保存交易流水
                    if(code.PAY_STATUS.SUCCESS == trade.pay_status){
                        if(!utils.isEmpty(trade.size)){//产品为纸巾
                            //3.通知设备出纸
                            await m2m.send(trade);
                        }
                        log.logger.info("订单：" + trade.trade_no + "，发送出纸通,结果:");
                        //4.查找用户,进入下一个then
                        var user = await dbPromise.findOne(User,{ open_id:trade.open_id });
                        if(!utils.isEmpty(user)){
                            userBak = user;
                            user.balance = user.balance + tradeBak.amount;//变更用户余额
                            user.score =  user.score + utils.isEmpty(tradeBak.score)?0:tradeBak.score;//变更用户积分
                            //5.保存用户数据,进入下一个then
                            await dbPromise.save(user);
                            var record = new TradeRecord();
                            record.trade_no = tradeBak.trade_no;
                            record.open_id = tradeBak.open_id;
                            record.type = code.TRADE_TYPE.RECHARGE;
                            record.amount = tradeBak.amount;
                            record.balance = user.balance;//用户表余额累加
                            record.time = Date.now();
                            //6.保存流水数据
                            await dbPromise.save(record);
                            log.logger.info("订单:"+record.trade_no+",金额："+record.amount+"支付成功");
                            return res.json(utils.success());
                        }else{
                            throw new Error(msg_code.NO_EXIST);
                        }
                    }else{
                        return res.json(utils.success());
                    }
                }else{
                    throw new Error(msg_code.NO_EXIST);
                }
            } catch (err) {
                //console.info("error : " + err);
                //发生异常,回滚数据
                if(!utils.isEmpty(tradeBak)){
                    tradeBak.save(function(err) {
                        if (err){
                            log.logger.error(err);
                            return res.json(utils.fail(err));
                        }
                    });
                }
                if(!utils.isEmpty(userBak)){
                    userBak.save(function(err) {
                        if (err){
                            log.logger.error(err);
                            return res.json(utils.fail(err));
                        }
                    });
                }
                log.logger.info("订单:"+tradeBak.trade_no+",金额："+tradeBak.amount+"，通知失败，数据已经回滚");
                log.logger.error(err);
                return res.json(utils.fail(err));
            }
        }
    })
;


/**
 * 余额消费出纸
 * TODO 判断余额是否够 pay_time
 */
router.route('/trade_balance')
//create
    .post(function(req, res) {
        if(utils.isEmpty(req.body.trade_no)){
            return res.json(utils.fail(msg_code.PARAM_ERROR));
        }else{

        }
    })
;


/**
 * 积分消费出纸
 * TODO 扣除余额是否够 pay_time
 */

router.route('/trade_score')
//create
    .post(function(req, res) {
        if(utils.isEmpty(req.body.trade_no)){
            return res.json(utils.fail(msg_code.PARAM_ERROR));
        }else{


        }
    })
;

/**
 *  出纸结果
 **/
router.route('/paper_result')
    .post(async function(req, res) {
    if(utils.isEmpty(req.body.trade_no)||
        utils.isEmpty(req.body.result)){
        return res.json(utils.fail(msg_code.PARAM_ERROR));
    }else{
        var tradeBak;
        var userBak;
        //1.查找订单数据
        try{
            var trade = await dbPromise.findOne(Trade,{trade_no:req.body.trade_no});
            if(!utils.isEmpty(trade)){
                tradeBak = trade;
                trade.send_status = req.body.result;
                trade.send_time = Date.now();
                log.logger.info("订单：" + trade.trade_no + "，收到出纸回调通知，："+ trade);
                //2.保存订单数据,进入下一个then
                await dbPromise.save(trade);
                //如果出纸成功：保存用户数据和交易流水
                if(code.SENT_STATUS.SUCCESS == trade.send_status){
                    //4.查找用户,进入下一个then
                    var user = await dbPromise.findOne(User,{ open_id:trade.open_id });
                    if(!utils.isEmpty(user)){
                        userBak = user;
                        log.logger.info("用户余额："+ user.balance + " , 交易金额 : " + tradeBak.amount);
                        user.balance = user.balance - tradeBak.amount;
                        //5.保存用户数据,进入下一个then
                        await dbPromise.save(user);
                        var record = new TradeRecord();
                        record.trade_no = tradeBak.trade_no;
                        record.open_id = tradeBak.open_id;
                        record.type = code.TRADE_TYPE.CONSUME;
                        record.amount = tradeBak.amount;
                        record.balance = user.balance;//用户表余额累加
                        record.time = Date.now();
                        //6.保存流水数据
                        await dbPromise.save(record);
                        log.logger.info("订单:"+record.trade_no+",金额："+record.amount+"出纸成功");
                        return res.json(utils.success());
                    }else{
                        throw new Error(msg_code.NO_EXIST);
                    }
                }else{
                    return res.json(utils.success());
                }
            }else{
                throw new Error(msg_code.NO_EXIST);
            }
        } catch (err) {
            //发生异常,回滚数据
            if(!utils.isEmpty(tradeBak)){
                tradeBak.save(function(err) {
                    if (err){
                        log.logger.error(err);
                        return res.json(utils.fail(err));
                    }
                });
            }
            if(!utils.isEmpty(userBak)){
                userBak.save(function(err) {
                    if (err){
                        log.logger.error(err);
                        return res.json(utils.fail(err));
                    }
                });
            }
            log.logger.info("订单:"+tradeBak.trade_no+",金额："+tradeBak.amount+"，出纸失败，数据已经回滚");
            return res.json(utils.fail(err));
        }
    }
})
;


/**
 * 查询所有订单
 **/
router.route('/trades')

    .get(function(req, res) {
        Trade.find({ property:true },function(err, trades) {
            if (err)
                return res.send(err);
            //trades.forEach(function(doc){
            //    log.logger.info(" 订单 : "+doc);
            //});
            return res.json(trades);
        });
    })
;

/**
 * 查询所有流水
 **/
router.route('/trade_records')

    .get(function(req, res) {
        TradeRecord.find({ property:true },function(err, tradeRecords) {
            if (err)
                return res.send(err);
            //trades.forEach(function(doc){
            //    log.logger.info(" 订单 : "+doc);
            //});
            return res.json(tradeRecords);
        });
    })
;

/**
 * 根据code获取订单
 */
router.route('/trade_code/:code')
    .get(function(req, res) {
        Trade.findOne({trade_no:req.params.code}, function(err, trade) {
            if (err)
                return res.send(err);
            return res.json(trade);
        });
    })
;

/**
 * 根据code获取订单
 */
router.route('/trade_record_code/:code')
    .get(function(req, res) {
        TradeRecord.findOne({trade_no:req.params.code}, function(err, tradeRecord) {
            if (err)
                return res.send(err);
            return res.json(tradeRecord);
        });
    })
;

router.route('/trade/:trade_id')

//根据订单id获取订单
    .get(function(req, res) {
        Trade.findById(req.params.trade_id, function(err, trade) {
            if (err)
                return res.send(err);
            return res.json(trade);
        });
    })
;

router.route('/trade_record/:trade_record_id')

//根据订单id获取订单
    .get(function(req, res) {
        TradeRecord.findById(req.params.trade_id, function(err, tradeRecord) {
            if (err)
                return res.send(err);
            return res.json(tradeRecord);
        });
    })
;


module.exports = router;