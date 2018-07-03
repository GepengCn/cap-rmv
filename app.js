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
  key:fs.readFileSync('./ssl/2_www.coolweb.club.key'),
  cert:fs.readFileSync('./ssl/1_www.coolweb.club_bundle.crt')
};

app.get('/', function(req, res) {
  res.sendfile(__dirname+'/index.html');
});

var port=443;
/**
 * 创建https服务并使用文件服务过滤输入输出请求
 * */
var server = https.createServer(options,app).listen(port);

console.log('项目已启动...');
//console.log('https://localhost:9091/?msgFrom=gp');
//console.log('https://localhost:9091/?msgFrom=ql&msgTo=gp');

/**
 * 使用SocketIO监听
 * */
var io = socketIO.listen(server);


var UserList = new Array();


/**
 * 服务端日志函数
 * */
function log(info){
  moment.locale('zh-cn');
  var now=moment(new Date().getTime()).format("YYYY-MM-DD HH:mm:ss");
  console.log(now+">>>>  "+info);
}

var UserManager = {

};
UserManager.queryByAcctLogin = function(acctLogin){
  var index = UserManager.contain({
    acctLogin:acctLogin,
  },'acctLogin');
  if(index!=-1){
    return UserList[index];
  }
  return null;
}
UserManager.queryByUserId = function(userId){
  var index = UserManager.contain({
    userId:userId,
  },'userId');
  if(index!=-1){
    return UserList[index];
  }
  return null;
}

UserManager.add = function (user) {
  var index = UserManager.contain(user,'acctLogin');
  if(index != -1){
    UserManager.remove(index);
  }
  UserList.push(user);
};
UserManager.remove = function(index){
  UserList.splice(index,1);
}
UserManager.contain = function(user,type){
  if(!user){
    return -1;
  }
  for(var i=0;i<UserList.length;i++){
    var User = UserList[i];
    switch (type){
      case 'userId':
        if(user.userId == User.userId){
          return i;
        }
        break;
      case 'acctLogin':
        if(user.acctLogin == User.acctLogin){
          return i;
        }
        break;
      default:
        continue;
    }
  }
  return -1;
}
function messageSendManager(socket,message){
  message=JSON.parse(message);
  message.msgFrom = UserManager.queryByUserId(socket.id).acctLogin;
  var msgToSocket = underscore.findWhere(io.sockets.sockets,{name:message.msgTo});
  if(!msgToSocket){
    log('2.不存在的接收人'+message.msgTo);
    return;
  }
  msgToSocket.emit('onMessageListener',JSON.stringify(message));
}
function logUserList(){
  var userStr="";
  for(var i=0;i<UserList.length;i++){
    var User = UserList[i];
    userStr+=User.acctLogin+',';
  }
  log('在线用户数:['+UserList.length+'],当前在线用户:'+userStr);
}
io.on('connection',function (socket) {
  log(socket.id+'初始化连接...');
  socket.on('login',function (acctLogin) {
    UserManager.add({
      userId:socket.id,
      acctLogin:acctLogin,
      ts:new Date().getTime(),
      dr:'N'
    });
    socket.name = acctLogin;
    logUserList();
  });


  socket.on('disconnect',function () {
    var index = UserManager.contain({
      userId:socket.id
    },'userId');
    if(index != -1){
      UserManager.remove(index);
    }
    logUserList();
  });


  socket.on('onMessageRouter',function (message) {
    messageSendManager(socket,message);
  });
});