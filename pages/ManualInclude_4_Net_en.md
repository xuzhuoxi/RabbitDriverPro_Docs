## <span id="4">4. Network management extension module (NetManager)
Connection registry, plus a virtual server and client for use without a real network.  
+ **JLGames.RabbitDriver.Games.NetManager** registers connection instances. The entry point is `NetManager.Shared`. It is not an implementation of a transport protocol.  
+ **JLGames.RabbitDriver.Games.NetManager.Virtual** provides `VirtualServer` and `VirtualClient` for simulating requests and pushes without a real network connection.  
+ The networking component is `RabbitNetworkManager` in **JLGames.RabbitDriver.RabbitNetwork**. The sample is `Assets/JLGames/RabbitDriverPro/Samples/RabbitNetwork`.

### <span id="4.1">4.1 Use of VirtualServer

#### <span id="4.1.1">4.1.1 Instantiate and add to NetManager management
````C#
var server = new VirtualServer("server", "none");
NetManager.Shared.Register(server, true);
````
`Register` is declared on `NetManager`:  

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

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/NetManager.cs`.  
Objects added to NetManager can be obtained by name.  

#### <span id="4.1.2">4.1.2 Registering extensions
````C#
server.RegisterExtension(VirtualReqIds.Id0, 
  OnRequestHandler);
````
`VirtualServer` implements `IVirtualServerExtension`. `RegisterExtension` is declared on `IVirtualServerExtension`:  

```csharp
/// <summary>
/// Register extension
/// 注册扩展
/// </summary>
/// <param name="protoId">Protocol identifier to handle.<br/>待处理的协议标识。</param>
/// <param name="onProtoRequestHandler">Handler invoked when the protocol is requested.<br/>协议被请求时调用的处理器。</param>
void RegisterExtension(string protoId, VirtualServerDelegate.OnProtoRequestHandler onProtoRequestHandler);
```

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/Virtual/VirtualServer/IVirtualServer.cs`.  
+ protoId: Protocol ID, defined by the developer.
+ onProtoRequestHandler: Response function, corresponding to the response management logic of the protocol number.

#### <span id="4.1.3">4.1.3 Protocol response
The response delegate `OnProtoRequestHandler` is declared on `VirtualServerDelegate`:  

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

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/Virtual/VirtualServer/VirtualServerDelegate.cs`.  
+ server: IVirtualServer instance, which is mainly used in the function to send broadcast notifications of protocol results and data.
+ protoId: protocol number
+ data: the data sent when the protocol requests

#### <span id="4.1.4">4.1.4 Message Push
+ The `INotifyServer` interface contains function declarations for message push. `IVirtualServer` extends `INotifyServer`. Declared on `INotifyServer`:  

```csharp
/// <summary>
/// Message notify to client
/// 向客户端发送消息推送
/// </summary>
/// <param name="protoId">Protocol identifier.<br/>协议标识。</param>
/// <param name="data">Optional notify payload.<br/>可选的通知载荷。</param>
void NotifyToClient(string protoId, object data = null);
```

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/Virtual/VirtualServer/IVirtualServer.cs`.  
+ The `IMaterialNotifyServer` interface contains function declarations for pushing messages related to material data. `IVirtualServer` extends `IMaterialNotifyServer`. Declared on `IMaterialNotifyServer`:  

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

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/Virtual/VirtualServer/IVirtualServer.cs`.  
+ The server instance in the response delegate `VirtualServerDelegate.OnProtoRequestHandler` has implemented the INotifyServer and IMaterialNotifyServer interfaces, and realizes the data broadcasting function by calling the message push function.  

### <span id="4.2">4.2 Use of VirtualClient

#### <span id="4.2.1">4.2.1 Instantiate and add to NetManager management.
````C#
var client = new VirtualClient("client", "none");
NetManager.Shared.Register(client, true);
````
`Register` is declared on `NetManager`:  

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

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/NetManager.cs`.  
Objects added to NetManager can be obtained by name.  

#### <span id="4.2.2">4.2.2 Connecting to the server
````C#
var serverProxy = NetManager.Shared.
  GetServer<IVirtualServer>("server") as IVirtualServerProxy;
client.Connect(serverProxy);
````
`GetServer` is declared on `NetManager`:  

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

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/NetManager.cs`.  
`VirtualClient` implements `IVirtualClient`. `Connect`, `Disconnect`, and `Reconnect` are declared on `IVirtualClient`:  

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

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/Virtual/VirtualClient/IVirtualClient.cs`.  
+ Get the server proxy (actually the VirtualServer object) from the manager.
+ The connection proxy function is Connect.
+ The function to cancel the proxy connection is Disconnect.

#### <span id="4.2.3">4.2.3 Monitor request response, monitor message push
The monitoring function is built under the event mechanism. `VirtualClient` extends `EventDispatcher`. The event names used in this section are declared on `VirtualClientEvents`:  

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

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/Virtual/VirtualClient/VirtualClientEvents.cs`.  
````C#
client.AddEventListener(VirtualClientEvents.EventResponse,
  OnClientResponse);
client.AddEventListener(VirtualClientEvents.EventNotify,
  OnClientNotify);
````

#### <span id="4.2.4">4.2.4 Send message request
Use the Request function under the interface IVirtualClient to send a message request to the server. `Request` is declared on `IVirtualClient`:  

```csharp
/// <summary>
/// Send a protocol request to the server
/// 向Server发送协议请求
/// </summary>
/// <param name="protoId">Protocol identifier.<br/>协议标识。</param>
/// <param name="data">Request payload.<br/>请求载荷。</param>
void Request(string protoId, object data);
```

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/NetManager/Virtual/VirtualClient/IVirtualClient.cs`.  
````C#
NetManager.Shared.GetClient<IVirtualClient>("client")
  .Request(protoId, m_InputRequestData.text.Trim());
````


### <span id="4.3">4.3 Example
Assets/JLGames/RabbitDriverPro/Samples/NetManager  
![image](assets/img/net_6.png)  