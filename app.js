'use strict'
var Koa = require('koa')
var path = require('path')
var wechat = require('./wechat/g')
var util = require('./libs/util')
var wechat_file = path.join(__dirname,'./config/wechat.txt')
var sha1 = require('sha1')
var config = {
    wechat:{
        appID:'wxf786867049c12e08',
        appSecret:'64b297e9ccbd0126f79d11b9b731b757',
        token:'easontest',
        getAccessToken:function(){
            return util.readFileAsync(wechat_file)
        },
        saveAccessToken:function(data){
            data = JSON.stringify(data)
            console.log(data)
            return util.writeFileAsync(wechat_file,data)
        }
    }
}

var app = new Koa()

app.use(wechat(config.wechat))

app.listen(1234)
console.log('Listening!')