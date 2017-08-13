'use strict'
var sha1 = require('sha1')
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var api = {
    accessToken: prefix + 'token?grant_type=client_credential&appid=APPID&secret=APPSECRET'
}
//处理数据
function Wechat(opts) {
    var that = this;
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
    this.getAccessToken()
        .then(function (data) {
            try {
                data = JSON.parse()
            } catch (e) {
                return that.updataAccessToken(data)
            }
            if (that.isValidAccessToken(data)) {
                Promise.resolve(Data)
            } else {
                return that.updataAccessToken()
            }
        }).then(function (data) {
            that.access_token = data.access_token
            that.expires_in = data.expires_in
            that.saveAccessToken(data)
        })
}

Wechat.prototype.isValidAccessToken = function (data) {
    if (!data || !data.access_token || !data.expires_in) {
        return false
    }
    var access_token = data.access_token
    var expires_in = data.expires_in
    var now = (new Date().getTime())
    if (now < expires_in) {
        return true
    } else {
        return false
    }
}

Wechat.prototype.updataAccessToken = function (res) {
    var appID = this.appID
    var appSecret = this.appSecret
    var url = api.accessToken + '&appID=' + appID + '&secret=' + appSecret
    return new Promise(function (resolve, reject) {
        request({
            url: url,
            json: true
        }).then(function (res) {
            var data = res[1]
            var now = (new Date().getTime())
            var expires_in = now + (data.expires_in - 20) * 1000
            data.expires_in = expires_in
            resolve(data)
        })
    })

}
//处理配置问题
module.exports = function (opts) {
    //管理票据更新存储检查
    var wechat  = new Wechat(opts)

    return function* (next) {
        console.log(this.query)
        var token = opts.token;
        var signature = this.query.signature;
        var nonce = this.query.nonce;
        var timestamp = this.query.timestamp;
        var echostr = this.query.echostr;
        var str = [token, timestamp, nonce].sort().join('')
        var sha = sha1(str)
        if (sha === signature) {
            this.body = echostr + ''
        } else {
            this.body = 'wrong'
        }
    }
}