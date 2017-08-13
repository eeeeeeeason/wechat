'use strict'
var sha1 = require('sha1')
var Wechat = require('./wechat')
var getRawBody = require('raw-body')
var util = require('./util')
//处理配置问题
module.exports = function (opts) {
    //管理票据更新存储检查
    // var wechat  = new Wechat(opts)

    return function* (next) {
        var that = this
        // console.log(this.query)
        var token = opts.token;
        var signature = this.query.signature;
        var nonce = this.query.nonce;
        var timestamp = this.query.timestamp;
        var echostr = this.query.echostr;
        var str = [token, timestamp, nonce].sort().join('')
        var sha = sha1(str)
        //判断是否为微信服务器发送过来的请求,拿到post过来的XML转为buffer
        if (this.method === 'GET') {
            if (sha === signature) {
                this.body = echostr + ''
            } else {
                this.body = 'wrong'
            }
        }else if(this.method ==='POST'){
            if (sha !== signature) {
                this.body = 'wrong'
                return false
            }
            var data = yield getRawBody(this.req,{
                length:this.length,
                limit:'1mb',
                encoding:this.charset
            })

            var content = yield util.parseXMLAsync(data)
            var message = util.formatMessage(content.xml)
            console.log(message)
            if (message.MsgType==='event') {
                if (message.Event==='subscribe') {
                    var now = new Date().getTime()
 
                    that.status =200
                    that.type ='application/xml'
                    that.body ='<xml>'+ 
                                '<ToUserName><![CDATA['+message.FromUserName+']]></ToUserName>'+ 
                                '<FromUserName><![CDATA['+message.ToUserName+']]></FromUserName>'+ 
                                '<CreateTime>'+now+'</CreateTime>'+
                                '<MsgType><![CDATA[text]]></MsgType>'+
                                '<Content><![CDATA[这里是我家~]]></Content>'+ 
                                 
                                '</xml>'
                    return           
                }
            }
        }
    }
}