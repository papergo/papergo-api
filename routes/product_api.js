/*************************
 * des: 产品相关api
 * by:yangwen
 * time:2017/9/17
**************************/

var express = require('express');
var router = express.Router();
var Product     = require('./../models/product');
const msg_code = require("../config/msg_code");
const cache_prefix = require("../config/cache_prefix")
var utils = require("../common/utils");
var log = require("../common/log");
var cache  = require("../common/cache");

/**
* 新增产品
**/
router.route('/product')
//create
    .post(function(req, res) {
        if(utils.isEmpty(req.body.code)||
            utils.isEmpty(req.body.name)||
            utils.isEmpty(req.body.score)){
            return res.json(utils.fail(msg_code.PARAM_ERROR));
        }else{
            Product.findOne({code:req.body.code}, function(err, product) {
                if (err){
                    log.logger.error(err);
                    return res.send(err);
                }
                if(utils.isEmptyObject(product)){
                    product = new Product();
                    product.code = req.body.code;
                    product.name = req.body.name;
                    utils.isEmpty(req.body.size)?"":(product.size = req.body.size)//充值产品没有尺寸
                    utils.isEmpty(req.body.per)?"":(product.size = req.body.per)//份数
                    product.score = req.body.score;
                    product.price = req.body.price;
                    product.type =  req.body.type;
                    utils.isEmpty(req.body.online)?"":(product.online = req.body.online)//是否上线
                    product.save(function(err) {
                        if (err){
                            log.logger.error(err);
                            return res.send(err);
                        }
                        log.logger.info("create new product :  code = " + product.code + " name = " + product.name );
                        refreshProductlist();//更新缓存
                        return res.json(utils.success());
                    });
                }else{
                    return res.json(utils.fail(msg_code.EXIST));
                }
            });
        }

    });


/**
* 查询所有已上线产品
**/
router.route('/products')

    .get(function(req, res) {

        cache.get(cache_prefix.PRO_LIST).then(function(data){
            if (data) {
                //console.info("从缓存中获取到数据");
                return Promise.resolve(data);
            }else{
                //console.info("缓存中无数据，查找数据库");
                return new Promise(function(resolve, reject) {
                    Product.find({online: true, property: true}, function (err, products) {
                        if (err)
                            return reject(err);
                        //console.info("返回数据: " + typeof (products));
                        return resolve(products);
                    });
                });
            }
        }).then(function(data){
            if (typeof (data)== "string") {
                //console.info("数据是从缓存中取的，直接返回");
                return res.json(JSON.parse(data));
            }else{
                //console.info("缓存无数据，更新缓存数据");
                cache.set(cache_prefix.PRO_LIST,JSON.stringify(data)).then(function(result){
                    if (result == 'OK') {
                        log.logger.info("refresh productlist success");
                    }
                });
                return res.json(data);
            }
        });

    })
;

/**
 * 根据code获取产品
 */
router.route('/product_code/:code')
    .get(function(req, res) {
        Product.findOne({code:req.params.code}, function(err, product) {
            if (err)
                return res.send(err);
            return res.json(product);
        });
    })
;

router.route('/product/:product_id')

    //根据产品id获取产品
    .get(function(req, res) {
        Product.findById(req.params.product_id, function(err, product) {
            if (err)
                return res.send(err);
            return res.json(product);
        });
    })

    //修改产品
    .put(function(req, res) {
        Product.findById(req.params.product_id, function(err, product) {
            if (err){
                log.logger.error(err);
                return res.send(err);
            }
            if(!utils.isEmptyObject(product)){
                utils.isEmpty(req.body.name)?"":(product.name = req.body.name);
                utils.isEmpty(req.body.price)?"":(product.price = req.body.price);
                utils.isEmpty(req.body.size)?"":(product.size = req.body.size);
                utils.isEmpty(req.body.per)?"":(product.size = req.body.per);
                utils.isEmpty(req.body.score)?"":(product.score = req.body.score);
                utils.isEmpty(req.body.online)?"":(product.online = req.body.online);
                utils.isEmpty(req.body.property)?"":(product.property = req.body.property);
                product.save(function(err) {
                    if (err){
                        log.logger.error(err);
                        return res.send(err);
                    }
                    refreshProductlist();//更新缓存
                    return res.json(utils.success());
                });
            }else{
                return res.json(utils.fail(msg_code.NO_EXIST));
            }
        });
    })
;

/**
 * 更新产品列表缓存
 */
function refreshProductlist(){
    Product.find({online: true, property: true}, function (err, products) {
        if (err){
            log.logger.error(err);
        }
        cache.set(cache_prefix.PRO_LIST,JSON.stringify(products)).then(function(result){
            if (result == 'OK') {
                log.logger.info("refresh productlist success");
            }
        });
    });
};

module.exports = router;