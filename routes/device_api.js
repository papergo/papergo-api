/*************************
 * des: 设备相关api
 * by:yangwen
 * time:2017/9/17
 **************************/

var express = require('express');
var router = express.Router();
var Device     = require('./../models/device');
const msg_code = require("../config/msg_code");
var utils = require("../common/utils");
var log = require("../common/log");
const cache_prefix = require("../config/cache_prefix")
var cache  = require("../common/cache");

/**
 * 新增设备
 **/
router.route('/device')
//create
    .post(function(req, res) {

        if(utils.isEmpty(req.body.code)||
            utils.isEmpty(req.body.phone)||
            utils.isEmpty(req.body.place_id)){
            return res.json(utils.fail(msg_code.PARAM_ERROR));
        }else{
            Device.findOne({code:req.body.code}, function(err, device) {
                if (err){
                    log.logger.error(err);
                    return res.send(err);
                }
                if(utils.isEmptyObject(device)){
                    device = new Device();
                    device.code = req.body.code;
                    device.version = req.body.version;
                    device.phone = req.body.phone;
                    device.place = "ObjectId(\""+req.body.place_id+"\")";
                    log.logger.info("place ======= " + device.place);
                    device.save(function(err) {
                        if (err){
                            log.logger.error(err);
                            return res.send(err);
                        }
                        log.logger.info("create new device :  code = " + device.code + " phone = " + device.phone );
                        return res.json(utils.success());
                    });
                }else{
                    return res.json(utils.fail(msg_code.EXIST));
                }
            });
        }

    })
;


/**
 * 查询所有已上线设备
 **/
router.route('/devices')

    .get(function(req, res) {
        Device.find({ property:true },function(err, devices) {
            if (err)
                return res.send(err);
            //devices.forEach(function(doc){
            //    log.logger.info(" 设备 : "+doc);
            //});
            return res.json(devices);
        });
    })
;

/**
 * 根据code获取设备
 */
router.route('/device_code/:code')
    .get(function(req, res) {
        Device.findOne({code:req.params.code}, function(err, device) {
            if (err)
                return res.send(err);
            return res.json(device);
        });
    })
;

/**
 * 根据place获取设备
 */
router.route('/device_place/:place_id')
    .get(function(req, res) {
        Device.find({place:req.params.place_id ,property:true}, function(err, device) {
            if (err)
                return res.send(err);
            return res.json(device);
        });
    })
;

router.route('/device/:device_id')

    //根据设备id获取设备
    .get(function(req, res) {
        Device.findById(req.params.device_id, function(err, device) {
            if (err)
                return res.send(err);
            return res.json(device);
        });
    })

    //修改设备
    .put(function(req, res) {
        Device.findById(req.params.device_id, function(err, device) {
            if (err){
                log.logger.error(err);
                return res.send(err);
            }
            if(!utils.isEmptyObject(device)){
                utils.isEmpty(req.body.phone)?"":(device.phone = req.body.phone);
                utils.isEmpty(req.body.version)?"":(device.version = req.body.version);
                utils.isEmpty(req.body.place_id)?"":(device.place = "\"$ref\":\"place\",\"$id\" : ObjectId(\""+req.body.place_id+"\")");
                utils.isEmpty(req.body.property)?"":(device.property = req.body.property);
                device.save(function(err) {
                    if (err){
                        log.logger.error(err);
                        return res.send(err);
                    }
                    return res.json(utils.success());
                });
            }else{
                return res.json(utils.fail(msg_code.NO_EXIST));
            }
        });
    })
;

/**
 * 更新设备维护状态
 */
router.route('/device_main/:code/:paper/:bat')
    .put(function(req, res) {
        Device.findOne({code:req.params.code}, function(err, device) {
            if (err){
                log.logger.error(err);
                return res.send(err);
            }
            if(!utils.isEmptyObject(device)){
                device.main_time = new Date().toLocaleString();//当前时间
                /**
                 * 更新设备缓存数据
                 * 如果paper或bat空，则不更新缓存数据
                 */
                if(!utils.isEmpty(req.params.paper)){
                    refreshDevStatus(cache_prefix.DEV_PAPER,device.phone,100);
                }
                if(!utils.isEmpty(req.params.bat)){
                    refreshDevStatus(cache_prefix.DEV_BAT,device.phone,100);
                }
                device.save(function(err) {
                    if (err){
                        log.logger.error(err);
                        return res.send(err);
                    }
                    log.logger.info("maintain device :  code = " + req.params.code  );
                    return res.json(utils.success());
                });
            }else{
                return res.json(utils.fail(msg_code.NO_EXIST));
            }
        });
    })
;

/**
 *  设备红外状况设置
 */
router.route('/monitor/:phone/:data')
    .get(function(req, res) {
        if(utils.isEmpty(req.params.phone)||
            utils.isEmpty(req.params.data)){
            return res.json(utils.fail(msg_code.PARAM_ERROR));
        }
        cache.hset(cache_prefix.DEV_MON,req.params.phone,req.params.data).then(function(result){
            console.dir(result);
            if (result == cache_prefix.SET_NEW ||result == cache_prefix.SET_COVER) {
                log.logger.info("refresh cache success : " + req.params.phone);
                return res.json(utils.success());
            }else{
                log.logger.error("refresh cache fail : " +result);
                return res.json(utils.fail());
            }
        });
        /**
         * 加入消息队列，存储历史数据到数据库 TODO
         */
    })
;
/**
 *  获取设备红外状况
 */
router.route('/monitor/:phone')
    .get(function(req, res) {
        if(utils.isEmpty(req.params.phone)){
            return res.json(utils.fail(msg_code.PARAM_ERROR));
        }
        cache.hget(cache_prefix.DEV_MON,req.params.phone).then(function(result){
            log.logger.info("get cache success : " + result);
            return res.json(utils.success(result));
        });
    })
;

/**
 *  设备电量设置
 */
router.route('/battery_statue/:phone/:data')
    .get(function(req, res) {
        if(utils.isEmpty(req.params.phone)||
            utils.isEmpty(req.params.data)){
            return res.json(utils.fail(msg_code.PARAM_ERROR));
        }
        cache.hset(cache_prefix.DEV_BAT,req.params.phone,req.params.data).then(function(result){
            if (result == cache_prefix.SET_NEW ||result == cache_prefix.SET_COVER) {
                log.logger.info("refresh cache success : " + req.params.phone);
                return res.json(utils.success());
            }else{
                log.logger.error("refresh cache fail : " +result);
                return res.json(utils.fail());
            }
        });
    })
;

/**
 *  获取设备电池状况
 */
router.route('/battery_statue/:phone')
    .get(function(req, res) {
        if(utils.isEmpty(req.params.phone)){
            return res.json(utils.fail(msg_code.PARAM_ERROR));
        }
        cache.hget(cache_prefix.DEV_BAT,req.params.phone).then(function(result){
            log.logger.info("get cache success : " + result);
            return res.json(utils.success(result));
        });
    })
;

/**
 *  设备纸量设置
 */
router.route('/paper_statue/:phone/:data')
    .get(function(req, res) {
        if(utils.isEmpty(req.params.phone)||
            utils.isEmpty(req.params.data)){
            return res.json(utils.fail(msg_code.PARAM_ERROR));
        }
        cache.hset(cache_prefix.DEV_PAPER,req.params.phone,req.params.data).then(function(result){
            if (result == cache_prefix.SET_NEW ||result == cache_prefix.SET_COVER) {
                log.logger.info("refresh cache success : " + req.params.phone);
                return res.json(utils.success());
            }else{
                log.logger.error("refresh cache fail : " +result);
                return res.json(utils.fail());
            }
        });
    })
;


/**
 *  获取设备纸量状况
 */
router.route('/paper_statue/:phone')
    .get( async function(req, res) {
        if(utils.isEmpty(req.params.phone)){
            return res.json(utils.fail(msg_code.PARAM_ERROR));
        }
        var result ;
        try {
            result =  await cache.hget(cache_prefix.DEV_PAPER,req.params.phone);
        } catch (err) {
            return res.json(utils.fail(result));
        }
        return res.json(utils.success(result));
    })
;

/**
 * 查询所有已上线设备
 **/
router.route('/test/:data')

    .get(function(req, res) {
        log.logger.info("*************************  START  ****************************");
        log.logger.info(req.params.data);
        log.logger.info("*****************************   END  ************************");
        return res.json(utils.success(req.params.data));
    })
;

router.route('/test_post')
    .post(function(req, res) {
        return res.json(utils.success());
    })
;


/**
 * 更新设备缓存
 * @param prefix
 * @param phone
 * @param data
 */
function refreshDevStatus(prefix,phone,data){
    cache.hset(prefix,phone,data).then(function(result){
        if (result == cache_prefix.SET_NEW ||result == cache_prefix.SET_COVER) {
            log.logger.info("refresh cache success : " + "prefix =  "+prefix + " ,phone = " + req.params.phone + ",data="+ data);
        }else{
            log.logger.error("refresh cache fail : " +result);
        }
    });
};

module.exports = router;