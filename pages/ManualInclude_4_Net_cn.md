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
`Register` 声明在 `NetManager` 中：  

```csharp
/// <summary>
/// Add the instance of INetEntity to the management
/// Currently, instance management of INetClient and INetServer is supported.
/// 把INetEntity的实例加入到管理中
/// 当前支持INetClient与INetServer的实例管理
/// </summary>
/// <param name="entity">Client or server instance to register.<br/>待注册的客户端或服务端实例。</param>
/// <param name="default">Whether to set this instance as the default for its type.<br/>是否将该实例设为其类型的默认实例。</param>
public void Register(INetEntity entity, bool @default = false)
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/NetManager.cs`。  
加入到NetManager中的对象可以通过名称获得。  

#### <span id="4.1.2">4.1.2 注册扩展
```C#
server.RegisterExtension(VirtualReqIds.Id0, 
  OnRequestHandler);
```
`VirtualServer` 实现 `IVirtualServerExtension`。`RegisterExtension` 声明在 `IVirtualServerExtension` 中：  

```csharp
/// <summary>
/// Register extension
/// 注册扩展
/// </summary>
/// <param name="protoId">Protocol identifier to handle.<br/>待处理的协议标识。</param>
/// <param name="onProtoRequestHandler">Handler invoked when the protocol is requested.<br/>协议被请求时调用的处理器。</param>
void RegisterExtension(string protoId, VirtualServerDelegate.OnProtoRequestHandler onProtoRequestHandler);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/Virtual/VirtualServer/IVirtualServer.cs`。  
+ protoId: 协议号，由开发者定义。
+ onProtoRequestHandler: 响应函数，对应协议号的响应管理逻辑。

#### <span id="4.1.3">4.1.3 协议响应
响应委托 `OnProtoRequestHandler` 声明在 `VirtualServerDelegate` 中：  

```csharp
/// <summary>
/// Delegate declaration for protocol handle function
/// 协议响应函数的委托声明
/// </summary>
/// <param name="server">Virtual server handling the request.<br/>处理请求的虚拟服务端。</param>
/// <param name="protoId">Protocol identifier.<br/>协议标识。</param>
/// <param name="data">Request payload.<br/>请求载荷。</param>
public delegate void OnProtoRequestHandler(IVirtualServer server, string protoId, object data);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/Virtual/VirtualServer/VirtualServerDelegate.cs`。  
+ server: IVirtualServer实例，在函数中主要用于发送协议结果和数据的广播通知。
+ protoId: 协议号
+ data: 协议请求时传送的数据

#### <span id="4.1.4">4.1.4 消息推送
+ `INotifyServer` 接口包含了消息推送用的函数声明。`IVirtualServer` 继承 `INotifyServer`。声明在 `INotifyServer` 中：  

```csharp
/// <summary>
/// Message notify to client
/// 向客户端发送消息推送
/// </summary>
/// <param name="protoId">Protocol identifier.<br/>协议标识。</param>
/// <param name="data">Optional notify payload.<br/>可选的通知载荷。</param>
void NotifyToClient(string protoId, object data = null);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/Virtual/VirtualServer/IVirtualServer.cs`。  
+ `IMaterialNotifyServer` 接口包含了材料数据相关的消息推送用函数声明。`IVirtualServer` 继承 `IMaterialNotifyServer`。声明在 `IMaterialNotifyServer` 中：  

```csharp
/// <summary>
/// Notify Material Update - Offset 
/// 通知材料更新 - 偏移
/// </summary>
/// <param name="offset">Material offset change.<br/>材料偏移变更。</param>
void NotifyMaterialEntryUpdate(DataOffset offset);

/// <summary>
/// Notify Material Update - Number 
/// 通知材料更新 - 数量
/// </summary>
/// <param name="num">Material quantity change.<br/>材料数量变更。</param>
void NotifyMaterialEntryUpdate(DataNum num);

/// <summary>
/// Notify Material Update - Number and Offset
/// 通知材料更新 - 偏移+数量
/// </summary>
/// <param name="notify">Combined offset and quantity notify data.<br/>偏移与数量组合通知数据。</param>
void NotifyMaterialEntryUpdate(UserNotifyData notify);

/// <summary>
/// Notify Multiple Material Update - Offset
/// 通知材料更新 - 偏移
/// </summary>
/// <param name="offsetArr">Array of material offset changes.<br/>材料偏移变更数组。</param>
void NotifyMaterialEntryUpdate(DataOffset[] offsetArr);

/// <summary>
/// Notify Multiple Material Update - Number
/// 通知材料更新 - 数量
/// </summary>
/// <param name="numArr">Array of material quantity changes.<br/>材料数量变更数组。</param>
void NotifyMaterialEntryUpdate(DataNum[] numArr);

/// <summary>
/// Notify Multiple Material Update - Number and Offset
/// 通知材料更新 - 偏移+数量
/// </summary>
/// <param name="notifyArr">Array of combined notify data.<br/>组合通知数据数组。</param>
void NotifyMaterialEntryUpdate(UserNotifyData[] notifyArr);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/Virtual/VirtualServer/IVirtualServer.cs`。  
+ 响应委托`VirtualServerDelegate.OnProtoRequestHandler`中的server实例，已经实现了INotifyServer和IMaterialNotifyServer接口，通过调用消息推送函数，实现数据的广播功能。

### <span id="4.2">4.2 VirtualClient的使用

#### <span id="4.2.1">4.2.1 实例化并加入到NetManager管理。
```C#
var client = new VirtualClient("client", "none");
NetManager.Shared.Register(client, true);
```
`Register` 声明在 `NetManager` 中：  

```csharp
/// <summary>
/// Add the instance of INetEntity to the management
/// Currently, instance management of INetClient and INetServer is supported.
/// 把INetEntity的实例加入到管理中
/// 当前支持INetClient与INetServer的实例管理
/// </summary>
/// <param name="entity">Client or server instance to register.<br/>待注册的客户端或服务端实例。</param>
/// <param name="default">Whether to set this instance as the default for its type.<br/>是否将该实例设为其类型的默认实例。</param>
public void Register(INetEntity entity, bool @default = false)
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/NetManager.cs`。  
加入到NetManager中的对象可以通过名称获得。  

#### <span id="4.2.2">4.2.2 连接服务器
```C#
var serverProxy = NetManager.Shared.
  GetServer<IVirtualServer>("server") as IVirtualServerProxy;
client.Connect(serverProxy);
```
`GetServer` 声明在 `NetManager` 中：  

```csharp
/// <summary>
/// Finds a registered server by name and casts to the requested type.
/// 按名称查找已注册的服务端并转换为指定类型。
/// </summary>
/// <typeparam name="T">Server type implementing INetServer.<br/>实现 INetServer 的服务端类型。</typeparam>
/// <param name="serverName">Server instance name.<br/>服务端实例名称。</param>
/// <returns>The server instance, or null if not found.<br/>服务端实例；未找到时返回 null。</returns>
public T GetServer<T>(string serverName) where T : class, INetServer
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/NetManager.cs`。  
`VirtualClient` 实现 `IVirtualClient`。`Connect`、`Disconnect`、`Reconnect` 声明在 `IVirtualClient` 中：  

```csharp
/// <summary>
/// Connect to server
/// 连接Server
/// </summary>
/// <param name="server">Server proxy to connect to.<br/>待连接的服务端代理。</param>
void Connect(IVirtualServerProxy server);

/// <summary>
/// Disconnect from server
/// 断开Server连接
/// </summary>
void Disconnect();

/// <summary>
/// Reconnect to server
/// 重连
/// </summary>
/// <param name="server">Server proxy to reconnect to.<br/>待重连的服务端代理。</param>
void Reconnect(IVirtualServerProxy server);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/Virtual/VirtualClient/IVirtualClient.cs`。  
+ 从管理器中取得服务器代理(实际为VirtualServer对象)。
+ 连接代理函数为Connect。
+ 取消代理连接函数为Disconnect。

#### <span id="4.2.3">4.2.3 监听请求响应、监听消息推送
监听功能建立在事件机制下。`VirtualClient` 继承 `EventDispatcher`。本节使用的事件名声明在 `VirtualClientEvents` 中：  

```csharp
/// <summary>
/// Received protocol response event
/// 收到协议响应事件
/// Data Foramt: VirtualClientResponse
/// 数据格式：VirtualServerResponse
/// </summary>
public const string EventResponse = "VirtualClientEvents.EventResponse";

/// <summary>
/// Received protocol notify event
/// 收到协议通知事件
/// Data Foramt: VirtualClientResponse
/// 数据格式：VirtualClientResponse
/// </summary>
public const string EventNotify = "VirtualClientEvents.EventNotify";
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/Virtual/VirtualClient/VirtualClientEvents.cs`。  
```C#
client.AddEventListener(VirtualClientEvents.EventResponse,
  OnClientResponse);
client.AddEventListener(VirtualClientEvents.EventNotify,
  OnClientNotify);
```

#### <span id="4.2.4">4.2.4 发送消息请求
使用接口IVirtualClient下的Request函数可以向服务器发送消息请求。`Request` 声明在 `IVirtualClient` 中：  

```csharp
/// <summary>
/// Send a protocol request to the server
/// 向Server发送协议请求
/// </summary>
/// <param name="protoId">Protocol identifier.<br/>协议标识。</param>
/// <param name="data">Request payload.<br/>请求载荷。</param>
void Request(string protoId, object data);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/Virtual/VirtualClient/IVirtualClient.cs`。  
```C#
NetManager.Shared.GetClient<IVirtualClient>("client")
  .Request(protoId, m_InputRequestData.text.Trim());
```


### <span id="4.3">4.3 示例
Assets/JLGames/RabbitDriverPro/Samples/NetManager  
![image](assets/img/net_6.png)  