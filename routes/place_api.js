/*************************
 * des: 场所相关api
 * by:yangwen
 * time:2017/9/17
 **************************/

var express = require('express');
var router = express.Router();
var Place     = require('./../models/place');
const msg_code = require("../config/msg_code");
var utils = require("../common/utils");
var log = require("../common/log");
var m2m = require("../common/m2m");

/**
 * 新增场所
 **/
router.route('/place')
//create
    .post(function(req, res) {
        if(utils.isEmpty(req.body.code)||
            utils.isEmpty(req.body.name)||
            utils.isEmpty(req.body.city)||
            utils.isEmpty(req.body.city.code)||
            utils.isEmpty(req.body.city.name)){
            return res.json(utils.fail(msg_code.PARAM_ERROR));
        }else{
            Place.findOne({code:req.body.code}, function(err, place) {
                if (err){
                    log.logger.error(err);
                    return res.send(err);
                }
                if(utils.isEmptyObject(place)){
                    place = new Place();
                    place.code = req.body.code;
                    place.name = req.body.name;
                    place.city = req.body.city;
                    place.contact = req.body.contact;
                    place.lon = req.body.lon;
                    place.lat = req.body.lat;
                    place.save(function(err) {
                        if (err){
                            log.logger.error(err);
                            return res.send(err);
                        }
                        log.logger.info("create new place :  code = " + place.code + " name = " + place.name );
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
 * 查询所有场所
 **/
router.route('/places')

    .get(function(req, res) {
        m2m.send();
        Place.find({ property:true },function(err, places) {
            if (err)
                return res.send(err);
            //places.forEach(function(doc){
            //    log.logger.info(" 场所 : "+doc);
            //});
            return res.json(places);
        });
    })
;

/**
 * 根据code获取场所
 */
router.route('/place_code/:code')
    .get(function(req, res) {
        Place.findOne({code:req.params.code}, function(err, place) {
            if (err)
                return res.send(err);
            return res.json(place);
        });
    })
;

router.route('/place/:place_id')

//根据场所id获取场所
    .get(function(req, res) {
        Place.findById(req.params.place_id, function(err, place) {
            if (err)
                return res.send(err);
            return res.json(place);
        });
    })
    //修改场所
    .put(function(req, res) {
        Place.findById(req.params.place_id, function(err, place) {
            if (err){
                log.logger.error(err);
                return res.send(err);
            }
            if(!utils.isEmptyObject(place)){
                utils.isEmpty(req.body.name)?"":(place.name = req.body.name);
                utils.isEmpty(req.body.city)?"":(place.city = req.body.city);
                utils.isEmpty(req.body.contact)?"":(place.contact = req.body.contact);
                utils.isEmpty(req.body.lon)?"":(place.lon = req.body.lon);
                utils.isEmpty(req.body.lat)?"":(place.lat = req.body.lat);
                utils.isEmpty(req.body.property)?"":(place.property = req.body.property);
                place.save(function(err) {
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


module.exports = router;