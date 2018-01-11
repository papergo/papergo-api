/*************************
 * des: 用户相关api
 * by:yangwne
 * time:2017/9/17
**************************/
var express = require('express');
var router = express.Router();
var User     = require('./../models/user');
const msg_code = require("../config/msg_code");
var utils = require("../common/utils");
var log = require("../common/log");


/**
* 新增用户
**/
router.route('/user')
//create
    .post(function(req, res) {
        if(utils.isEmpty(req.body.open_id)||utils.isEmpty(req.body.nick_name)){
            res.json(utils.fail(msg_code.PARAM_ERROR));
        }else{
            User.findOne({open_id:req.body.open_id}, function(err, user) {
                if (err){
                    log.logger.err(err);
                    res.send(err);
                }
                if(utils.isEmptyObject(user)){
                    var user = new User();
                    user.nick_name = req.body.nick_name;
                    user.open_id = req.body.open_id;
                    user.save(function(err) {
                        if (err){
                            log.logger.err(err);
                            res.send(err);
                        }
                        log.logger.info("create new user :  open_id = " + user.open_id + " nick_name = " + user.nick_name );
                        res.json(utils.success());
                    });
                }else{
                    res.json(utils.fail(msg_code.EXIST));
                }
            });
        }
    })
;


router.route('/user/:open_id')

    //根据用户id获取用户-
    .get(function(req, res) {

        User.findOne({open_id:req.params.open_id}, function(err, user) {
            if (err){
                log.logger.err(err);
                res.send(err);
            }
            res.json(user);
        });
    })

    //修改用户
    .put(function(req, res) {

        User.findOne({open_id:req.params.open_id}, function(err, user) {
            if (err){
                log.logger.err(err);
                res.send(err);
            }
            if(!utils.isEmptyObject(user)){
                utils.isEmpty(req.body.open_id)?"":(user.open_id = req.body.open_id);
                utils.isEmpty(req.body.nick_name)?"":(user.nick_name = req.body.nick_name);
                utils.isEmpty(req.body.balance)?"":(user.balance = req.body.balance);
                utils.isEmpty(req.body.score)?"":(user.score = req.body.score);
                user.save(function(err) {
                    if (err){
                        log.logger.err(err);
                        res.send(err);
                    }
                    res.json(utils.success());
                });
            }else{
                return res.json(utils.fail(msg_code.NO_EXIST));
            }

        });
    })
;


module.exports = router;