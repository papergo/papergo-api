var utils = {};  

var msg = require('../config/msg');

utils.isEmpty = function(obj){
    if(typeof (obj) == "undefined")
        return true;
    else
        return false;
};

utils.isEmptyObject = function(e){
    var t;
    for (t in e)
        return !1;
    return !0 ;
};

utils.isEmptyArray = function(arr){
    if(typeof (obj) != "Array"&& arr.length == 0 )
        return true;
    return false;
};

utils.success = function(result){
    var sucInfo = msg.SUCCESS;
    if(!this.isEmpty(result))
        sucInfo.result= result;
    return sucInfo;
};

utils.fail = function(des){ 
    var errInfo = msg.FAIL ;
    if(!this.isEmpty(des))
        errInfo.status.description = des;
    return errInfo;  
};

utils.generateRandom = function(len,radix){
    radix = radix ? 10 : 36;
    var rdmString = "";
    for (; rdmString.length < len; rdmString += Math.random().toString(radix).substr(2));
    return rdmString.substr(0, len);
};

module.exports = utils;
