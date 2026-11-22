## <span id="1">1. 事件(Event) - 高效的事件模块，支持Unity多线程
事件采用“**监听**-**捕获**”机制，监听时支持捕获次数、 捕获优先级的设置。  
+ 事件类型来自 **JLGames.Infra.Event**。示例里使用的实现类是 `EventDispatcher`，并按 `IThreadEventDispatcher` 使用。  
+ 框架仓库中的 `Actions/ThreadEvent` 整段被注释，不是当前的多线程实现。

### <span id="1.1">1.1 核心功能 - 添加监听、移除监听、分发事件

#### <span id="1.1.1">1.1.1 监听
`EventDispatcher.AddEventListener` 用于添加事件监听，可传入优先级、捕获次数和标签。  
`IEventDispatcher` 继承 `IEventListener`。添加监听的函数声明在 `IEventListener` 中：  

```csharp
/// <summary>
/// Add single event listener
/// 添加单次事件监听
/// </summary>
/// <param name="type">Event Type<br/>事件类型</param>
/// <param name="handler">Listener Function<br/>监听函数</param>
/// <param name="weight">Response Weight<br/>响应权重</param>
/// <param name="tag">Function Tag<br/>函数的唯一标签</param>
void OnceEventListener(string type, EventDelegates.EventHandler handler, int weight = EventConst.DefaultWeight, string tag = null);

/// <summary>
/// Add event listener
/// 添加事件监听
/// </summary>
/// <param name="type">Event Type<br/>事件类型</param>
/// <param name="handler">Listener Function<br/>监听函数</param>
/// <param name="tag">Function Tag<br/>函数的唯一标签</param>
void AddEventListener(string type, EventDelegates.EventHandler handler, string tag = null);

/// <summary>
/// Add event listener
/// 添加事件监听
/// </summary>
/// <param name="type">Event Type<br/>事件类型</param>
/// <param name="handler">Listener Function<br/>监听函数</param>
/// <param name="weight">Response Weight<br/>响应权重</param>
/// <param name="tag">Function Tag<br/>函数的唯一标签</param>
void AddEventListener(string type, EventDelegates.EventHandler handler, int weight, string tag = null);

/// <summary>
/// Add event listener
/// 添加事件监听
/// </summary>
/// <param name="type">Event Type<br/>事件类型</param>
/// <param name="handler">Listener Function<br/>监听函数</param>
/// <param name="listeningTimes">Max responses; 0 means unlimited.<br/>最大响应次数；0 表示不限次数。</param>
/// <param name="tag">Function Tag<br/>函数的唯一标签</param>
void AddEventListener(string type, EventDelegates.EventHandler handler, uint listeningTimes, string tag = null);

/// <summary>
/// Add event listener
/// 添加事件监听
/// </summary>
/// <param name="type">Event Type<br/>事件类型</param>
/// <param name="handler">Listener Function<br/>监听函数</param>
/// <param name="weight">Response Weight<br/>响应权重</param>
/// <param name="listeningTimes">Max responses; 0 means unlimited.<br/>最大响应次数；0 表示不限次数。</param>
/// <param name="tag">Function Tag<br/>函数的唯一标签</param>
void AddEventListener(string type, EventDelegates.EventHandler handler, int weight, uint listeningTimes, string tag = null);
```

来源：`Infra-CSharp/JLGames/Infra/Event/IEventListener.cs`。  

#### <span id="1.1.2">1.1.2 移除监听
`EventDispatcher.RemoveEventListener` 用于移除事件监听。  
移除监听的函数声明同样在 `IEventListener` 中：  

```csharp
/// <summary>
/// Delete event listener
/// 删除事件监听
/// </summary>
/// <param name="type">Event type.<br/>事件类型。</param>
/// <param name="handler">Listener function.<br/>监听函数。</param>
/// <param name="tag">Optional tag to match; null removes the last matching handler only.<br/>可选标签；为 null 时仅移除最后一个匹配的处理器。</param>
void RemoveEventListener(string type, EventDelegates.EventHandler handler, string tag = null);

/// <summary>
/// Delete event listener
/// 删除事件监听
/// </summary>
/// <param name="type">Event type.<br/>事件类型。</param>
/// <param name="tag">Tag of listeners to remove.<br/>要移除的监听标签。</param>
void RemoveEventListener(string type, string tag);

/// <summary>
/// Delete a type of event listeners
/// 删除一类事件监听
/// </summary>
/// <param name="type">Event type.<br/>事件类型。</param>
void RemoveEventListener(string type);

/// <summary>
/// Clear all event listeners
/// 清除全部事件监听
/// </summary>
void RemoveEventListener();
```

来源：`Infra-CSharp/JLGames/Infra/Event/IEventListener.cs`。  

#### <span id="1.1.3">1.1.3 分发事件
`EventDispatcher.DispatchEvent` 用于分发事件。  
分发函数声明在 `IEventDispatcher` 中：  

```csharp
/// <summary>
/// Trigger an event of a certain type and pass data
/// 触发某一类型的事件,并传递数据
/// </summary>
/// <param name="evd">Event data.<br/>事件数据。</param>
void DispatchEvent(EventData evd);

/// <summary>
/// Trigger an event of a certain type and pass data
/// 触发某一类型的事件,并传递数据
/// </summary>
/// <param name="type">Event type.<br/>事件类型。</param>
/// <param name="data">Event payload (may be null).<br/>事件数据（可为 null）。</param>
void DispatchEvent(string type, object data);
```

来源：`Infra-CSharp/JLGames/Infra/Event/IEventDispatcher.cs`。  

#### <span id="1.1.4">1.1.4 多线程支持
示例把 `EventDispatcher` 当作 `IThreadEventDispatcher`。调用 `SetThreadEventContext(SynchronizationContext.Current)` 之后，可以从其他线程 `DispatchEvent`。`ClearThreadEventContext` 用于清掉这个上下文。  
`IThreadEventDispatcher` 继承 `IEventDispatcher`。多线程相关声明如下：  

```csharp
/// <summary>
/// Whether no thread synchronization context is set.
/// 是否未设置线程同步上下文。
/// </summary>
bool IsNullContext { get; }

/// <summary>
/// Set the synchronization context used when dispatching events.
/// 设置派发事件时使用的同步上下文。
/// </summary>
/// <param name="context">Synchronization context with queue/scheduling support.<br/>具备队列或调度能力的同步上下文。</param>
void SetThreadEventContext(SynchronizationContext context);

/// <summary>
/// Clear the thread synchronization context (dispatch runs on caller thread).
/// 清除线程同步上下文（随后在调用线程上直接派发）。
/// </summary>
void ClearThreadEventContext();
```

来源：`Infra-CSharp/JLGames/Infra/Event/IThreadEventDispatcher.cs`。  

#### <span id="1.1.5">1.1.5 扩展
可以继承 `EventDispatcher` 并实现自定义接口，用来扩展事件行为。  

### <span id="1.2">1.2 示例
`Assets/JLGames/RabbitDriverPro/Samples/Event/Scripts/EventDemo.cs`  
![image](assets/img/event_1.png)  
