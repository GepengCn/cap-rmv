# cap-rmv
Real-time Multiplayer Video(实时多人视频)

#### 0.通过openfire发送一个连接(from,to)

#### 1.连接信令服务器,需要传入登录名msgFrom

#### 2.获取本地视频，getUserMedia,播放视频流

#### 3.渲染页面:
##### a.聊天按钮
##### b.邀请输入框
##### c.邀请按钮
##### d.挂断按钮
##### e.关闭音频按钮^
##### f.关闭视频按钮^
##### g.设置按钮(设置视频、音频、扬声器,带宽)^
##### h.更多按钮(共享屏幕,全屏)^


#### 4.发送视频邀请,输入登录名

#### 5.通过信令服务器转发邀请

#### 6.接收邀请,建立RTCPeerConnection,然后发起offer

#### 7.接收offer,设置远程描述,建立RTCPeerConnection;发起answer,设置本地描述

#### 8.收到answer,设置远程描述;

#### 9.成功建立远程视频

#### 10.视频区域可以切换
##### a.本地视频
##### b.远程视频
##### c.全屏视频




