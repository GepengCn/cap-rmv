/**
 * WebRTC技术会调用摄像头及音频设备，涉及隐私与安全所以使用https
 * */
var https = require('https');

var fs = require('fs');

var express = require('express');

var path = require('path');

var app = express();

app.use(express.static(path.join(__dirname, 'public')));
/**
 * 使用Socket.io作为信令服务器的传输技术
 * */
var socketIO = require('socket.io');
/**
 * 时间模块
 * */
var moment = require('moment');
/**
 * 遍历sockets数组
 * */
var underscore = require('underscore');
/**
 * 引入https证书
 * */
var options= {
  key:fs.readFileSync('./ssl/214731414140981.key'),
  cert:fs.readFileSync('./ssl/214731414140981.pem')
};

app.get('/', function(req, res) {
  res.sendfile(__dirname+'/index.html');
});

var port=9091;
/**
 * 创建https服务并使用文件服务过滤输入输出请求
 * */
var server = https.createServer(options,app).listen(port);
/**
 * 使用SocketIO监听
 * */
var io = socketIO.listen(server);

console.log("https://localhost:"+port);


/**
 * 服务端日志函数
 * */
function log(info){
  moment.locale('zh-cn');
  var now=moment(new Date().getTime()).format("YYYY-MM-DD HH:mm:ss");
  console.log(now+">>>>  "+info);
}

io.on('connection',function (socket) {
  log(socket.id+'初始化连接...');
});