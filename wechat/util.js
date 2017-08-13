'use strict'
var xml2js = require('xml2js')
var Promise = require('bluebird')
//转post请求，parseXMLAsync只能转为xml对象的形式，其中value的值不能确定为数组还是对象
exports.parseXMLAsync = function (xml) {
    return new Promise(function (resolve, reject) {
        xml2js.parseString(xml, {
            trim: true
        }, function (err, content) {
            if (err) reject(err)
            else resolve(content)
        })
    })
}
//遍历对象进行转化
function formatMessage(result) {
    var message = {}
 
    if (typeof result === 'object') {
        var keys = Object.keys(result)
        for (var i = 0; i < keys.length; i++) {
            var item = result[keys[i]]
            var key = keys[i]
            if (!(item instanceof Array) || item.length === 0) {
                continue
            }
 
            if (item.length === 1) {
                var val = item[0]
                if (typeof val ==='object') {
                    message[key]=formatMessage(val)
                } 
                else {
                    message[key] = (val||'').trim()
                }
            } 
            else {
                message[key] = []
 
                for (var j = 0,k = item.length; j < k;  j++) {
                    message[key].push(formatMessage(item[j]))
                }
            }
        }
    }
 
    return message
}

exports.formatMessage = formatMessage