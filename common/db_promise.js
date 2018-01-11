/**
 * 数据库操作promise化
 * @type {{}}
 */
var db_promise = {};


/**
 * 保存数据
 * @param model
 * @param data
 * @returns {*}
 */
db_promise.save = function(data){
    return new Promise(function(resolve, reject){
        data.save(data,function(error){
            if (error) {
                return reject(error);
            }
            resolve(data);
        })
    })
};

/**
 * 查找数据
 * @param model
 * @param params
 * @returns {*}
 */
db_promise.find = function(model,params){
    return new Promise(function(resolve, reject){
        model.find(params,function(error,datas){
            if (error) {
                return reject(error);
            }
            resolve(datas);
        })
    })
};

/**
 * 查找数据
 * @param model
 * @param params
 * @returns {*}
 */
db_promise.findOne = function(model,params){
    return new Promise(function(resolve, reject){
        model.findOne(params,function(error,data){
            if (error) {
                return reject(error);
            }
            resolve(data);
        })
    })
};

/**
 *  空操作
 * @returns {*}
 */
db_promise.doNothing = function(){
    return new Promise(
        function (resolve, reject) {
            reject();
        }
    );
};

module.exports = db_promise;