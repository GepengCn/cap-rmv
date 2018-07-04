main();

//====================================程序入口===================================================================
function main() {
  var toLaunch =false;
  msgFrom = getParameter('msgFrom');
  msgTo = getParameter('msgTo');
  if(isNullOrEmpty(msgFrom)){
    alert('登录名为空!');
    return;
  }
  log('msgFrom='+msgFrom);
  //如果有视频接收人则发起视频
  if(!isNullOrEmpty(msgTo)){
    toLaunch = true;
    log('msgTo='+msgTo);
    log('toLaunch='+toLaunch);
  }
  //连接socket.io信令服务器
  connect();
  //登录
  login(msgFrom);

  log('getLocalMedia');
  //播放本地视频流
  getLocalMedia(function () {
    log('toLaunch='+toLaunch);
    if(toLaunch){
      log('正在发起RTCPeerConnection连接');
      getRTCPeerConnection(msgTo);
      log('正在发起offer');
      offer(msgTo);
    }
  });
}
//====================================全局函数===================================================================
/**
 * 视频发起人
 * */
var msgFrom;
/**
 * 视频接收人
 * */
var msgTo;
/**
 * 是否发起视频
 * */

/**
 * 本地视频流
 * */
var localStream;
/**
 * 远程视频流
 * */
var remoteStream;
/**
 * 本地视频
 * */
var localVideo = document.querySelector('#localVideo');
/**
 * 远程视频
 * */
var remoteVideo = document.querySelector('#remoteVideo');
/**
 * RTCPeerConnection
 * */
var peerConn;
/**
 * socket
 * */
var socket;

//====================================全局函数===================================================================
/**
 * url?param1=xxx&param2=xxx
 * 外部连接访问获取参数方法
 * */
function getParameter(key) {
  var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
};
/**
 * 非空判断
 * */
function isNullOrEmpty(value){
  if(value == null||value == ""){
    return true;
  }
  return false;
}
/**
 * 日志　
 * */
function log(debug){
  console.log(getNowTime()+'  :  '+debug);
}
/**
 * 获取当前时间函数　
 * */
function getNowTime(){
  var time=new Date();
  var strTime='';
  strTime+=time.getFullYear()+'年'+(time.getMonth()+1)+'月'+time.getDate()+'日 '+(time.getHours()+1)+':'+(time.getMinutes()+1)+':'+(time.getSeconds()+1);
  return strTime;
}
/**
 * 发送消息
 * */
function sendMsgTo(message){
  socket.emit('onMessageRouter',JSON.stringify(message));
}
/**
 * 调用WebRTC API调用本地获取音视频流
 * callback:回调函数　
 * */



function getLocalMedia(callback){
  log('开始获取本地视频流');
  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
  }).then(function(stream){
    log('成功获取本地视频流');
    localVideo.srcObject=stream;
    log('界面上播放本地视频流');
    localStream=stream;
    callback();
  }).catch(function(e) {
    console.log(e);
    log('getUserMedia() error: ' + e.name);
  });
}
/**
 * 发起RTCPeerConnection连接
 * 1.注册icecandidate监听
 * 2.注册addstream监听
 * 3.添加localStream
 * */
function getRTCPeerConnection(msgTo){
  log('getRTCPeerConnection');
  peerConn = new RTCPeerConnection({"iceServers":[
        {"urls":[
          "turn:139.199.94.202:3478?transport=udp",
            "turn:139.199.94.202:3478?transport=tcp"
          ],
        "username":"superadmin",
        "credential":"0xe1e38dc42722c4eafce651ca9987103e"
        }],
    "iceTransportPolicy":"all","iceCandidatePoolSize":"8"}
    );
  peerConn.onicecandidate = function (event) {
    if (event.candidate) {
      sendMsgTo({
        msgTo:msgTo,
        sdpMLineIndex:event.candidate.sdpMLineIndex,
        candidate:event.candidate.candidate,
        type:'candidate'
      })
    }
  };
  peerConn.onaddstream = function (event) {
    remoteStream = event.stream;
    remoteVideo.srcObject = remoteStream;
  }
  peerConn.addStream(localStream);
}

function offer(msgTo){
  log("发送offer给"+msgTo);
  peerConn.createOffer(function (offer) {
    peerConn.setLocalDescription(offer);
    sendMsgTo({
      type:'offer',
      offer:offer,
      msgTo:msgTo
    })
  }, function (error) {
    log(error);
  });
}
function answer(msgTo){
  log("发送answer给"+msgTo);
  peerConn.createAnswer().then(
    function (answer) {
      peerConn.setLocalDescription(answer);
      sendMsgTo({
        type:'answer',
        answer:answer,
        msgTo:msgTo
      })
    },
    function (error) {
      log(error);
    });
}
//====================================socket.io===================================================================

function connect(){
  socket = io.connect();
  socket.on('onMessageListener',function (message) {
    message = JSON.parse(message);
    switch (message.type){
      case 'candidate':
        log('监听:candidate,'+message.candidate);
        peerConn.addIceCandidate(new RTCIceCandidate({
          sdpMLineIndex: message.sdpMLineIndex,
          candidate: message.candidate
        }));
        break;
      case 'offer':
        var offer = message.offer;
        log('监听:offer');
        getRTCPeerConnection(message.msgFrom);
        peerConn.setRemoteDescription(new RTCSessionDescription(message.offer));
        answer(message.msgFrom);
        break;
      case 'answer':
        //设置远程连接描述
        log('监听:answer');
        peerConn.setRemoteDescription(new RTCSessionDescription(message.answer));
        break;
      default:
        break;
    }
  });
}

function login(acctLogin){
  socket.emit('login',acctLogin);
}
