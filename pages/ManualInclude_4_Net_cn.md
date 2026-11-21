## <span id="4">4. 网络管理扩展模块(NetManager)
简单易用的连接登记，以及没有真实网络时的虚拟服务端 / 客户端。  
+ **JLGames.RabbitDriver.Games.NetManager** 登记连接实例，入口是 `NetManager.Shared`。它不是某一种传输协议的实现。  
+ **JLGames.RabbitDriver.Games.NetManager.Virtual** 提供 `VirtualServer` 与 `VirtualClient`，用于在没有实际网络连接时模拟请求与推送。  
+ 联机组件是 **JLGames.RabbitDriver.RabbitNetwork** 中的 `RabbitNetworkManager`。示例在 `Assets/JLGames/RabbitDriverPro/Samples/RabbitNetwork`。 

### <span id="4.1">4.1 VirtualServer的使用

#### <span id="4.1.1">4.1.1 实例化并加入到NetManager管理
```C#
var server = new VirtualServer("server", "none");
NetManager.Shared.Register(server, true);
```
![image](assets/img/net_7.png)  
加入到NetManager中的对象可以通过名称获得。  

#### <span id="4.1.2">4.1.2 注册扩展
```C#
server.RegisterExtension(VirtualReqIds.Id0, 
  OnRequestHandler);
```
![image](assets/img/net_8.png)  
+ protoId: 协议号，由开发者定义。
+ onProtoRequestHandler: 响应函数，对应协议号的响应管理逻辑。

#### <span id="4.1.3">4.1.3 协议响应
响应委托声明：`VirtualServerDelegate.OnProtoRequestHandler`  
![image](assets/img/net_9.png)  
+ server: IVirtualServer实例，在函数中主要用于发送协议结果和数据的广播通知。
+ protoId: 协议号
+ data: 协议请求时传送的数据

#### <span id="4.1.4">4.1.4 消息推送
+ INotifyServer接口包含了消息推送用的函数声明。
![image](assets/img/net_10.png)  
+ IMaterialNotifyServer接口包含了材料数据相关的消息推送用函数声明。
![image](assets/img/net_11.png)  
+ 响应委托`VirtualServerDelegate.OnProtoRequestHandler`中的server实例，已经实现了INotifyServer和IMaterialNotifyServer接口，通过调用消息推送函数，实现数据的广播功能。

### <span id="4.2">4.2 VirtualClient的使用

#### <span id="4.2.1">4.2.1 实例化并加入到NetManager管理。
```C#
var client = new VirtualClient("client", "none");
NetManager.Shared.Register(client, true);
```
![image](assets/img/net_7.png)  
加入到NetManager中的对象可以通过名称获得。  

#### <span id="4.2.2">4.2.2 连接服务器
```C#
var serverProxy = NetManager.Shared.
  GetServer<IVirtualServer>("server") as IVirtualServerProxy;
client.Connect(serverProxy);
```
![image](assets/img/net_12.png)  
+ 从管理器中取得服务器代理(实际为VirtualServer对象)。
+ 连接代理函数为Connect。
+ 取消代理连接函数为Disconnect。

#### <span id="4.2.3">4.2.3 监听请求响应、监听消息推送
监听功能建立在事件机制下：  
```C#
client.AddEventListener(VirtualClientEvents.EventResponse,
  OnClientResponse);
client.AddEventListener(VirtualClientEvents.EventNotify,
  OnClientNotify);
```
![image](assets/img/net_13.png)  

#### <span id="4.2.4">4.2.4 发送消息请求
使用接口IVirtualClient下的Request函数可以向服务器发送消息请求。
```C#
NetManager.Shared.GetClient<IVirtualClient>("client")
  .Request(protoId, m_InputRequestData.text.Trim());
```
![image](assets/img/net_14.png)  

### <span id="4.3">4.3 示例
Assets/JLGames/RabbitDriverPro/Samples/NetManager  
![image](assets/img/net_6.png)  