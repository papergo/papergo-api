var cache = {};
var redis = require("redis");
var client = redis.createClient();
var log = require("./log");

client.on("error", function (err) {
    log.logger.error("Redis Error :" , err);
});

client.on('connect', function(){
    log.logger.info('Redis连接成功.');
})

/**
 *  * 添加string类型的数据
 *   * @param key 键
 *    * @params value 值
 *     * @params expire (过期时间,单位秒;可为空，为空表示不过期)
 *      */
cache.set = function(key, value, expire){

    return new Promise(function(resolve, reject){

        client.set(key, value, function(err, result){

            if (err) {
                log.logger.error(err);
                reject(err);
                return;
            }

            if (!isNaN(expire) && expire > 0) {
                client.expire(key, parseInt(expire));
            }

            resolve(result);
        })
    })
};

/**
 *  * set 哈希map
 *   * @param key 键
 *    * @params value 值
 *     * @params expire (过期时间,单位秒;可为空，为空表示不过期)
 *      */
cache.hset = function(key,mkey, value, expire){

    return new Promise(function(resolve, reject){

        client.hset(key,mkey, value, function(err, result){

            if (err) {
                log.logger.error(err);
                reject(err);
                return;
            }

            if (!isNaN(expire) && expire > 0) {
                client.expire(key, parseInt(expire));
            }

            resolve(result);
        })
    })
};

/**
 *  * 查询string类型的数据
 *   * @param key 键
 *    */
cache.get = function(key){

    return new Promise(function(resolve, reject){

        client.get(key, function(err,result){

            if (err) {
                log.logger.error(err);
                reject(err);
                return;
            }

            resolve(result);
        });
    })
};

/**
 *  * 查询哈希map
 *   * @param key 键
 *    */
cache.hget = function(key ,mkey ){

    return new Promise(function(resolve, reject){

        client.hget(key,mkey, function(err,result){

            if (err) {
                log.logger.error(err);
                reject(err);
                return;
            }

            resolve(result);
        });
    })
};

cache.isEmpty = function(data){
    if( typeof (data) == "undefined"||data == "[]")
        return true;
    return false;
};


module.exports = cache;
