## <span id="1">1. Event - Efficient event module, supports Unity multithreading
The event uses a **listen**-**capture** mechanism. A listener can set capture count and priority.  
+ Event types come from **JLGames.Infra.Event**. The sample uses `EventDispatcher` as an `IThreadEventDispatcher`.  
+ `Actions/ThreadEvent` in the framework repository is entirely commented out and is not the current multithreading implementation.

### <span id="1.1">1.1 Core functions - add listeners, remove listeners, dispatch events

#### <span id="1.1.1">1.1.1 Monitoring
`EventDispatcher.AddEventListener` adds an event listener. It can take a priority, a capture count, and a tag.  
`IEventDispatcher` extends `IEventListener`. The add-listener declarations are on `IEventListener`:  

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

Source: `Infra-CSharp/JLGames/Infra/Event/IEventListener.cs`.  

#### <span id="1.1.2">1.1.2 remove monitor
`EventDispatcher.RemoveEventListener` removes an event listener.  
The remove-listener declarations are also on `IEventListener`:  

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

Source: `Infra-CSharp/JLGames/Infra/Event/IEventListener.cs`.  

#### <span id="1.1.3">1.1.3 Distributing events
`EventDispatcher.DispatchEvent` dispatches an event.  
The dispatch declarations are on `IEventDispatcher`:  

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

Source: `Infra-CSharp/JLGames/Infra/Event/IEventDispatcher.cs`.  

#### <span id="1.1.4">1.1.4 Multithreading support
The sample treats `EventDispatcher` as `IThreadEventDispatcher`. After `SetThreadEventContext(SynchronizationContext.Current)`, `DispatchEvent` can be called from another thread. `ClearThreadEventContext` clears that context.  
`IThreadEventDispatcher` extends `IEventDispatcher`. The multithreading declarations are:  

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

Source: `Infra-CSharp/JLGames/Infra/Event/IThreadEventDispatcher.cs`.  

#### <span id="1.1.5">1.1.5 Extensions
Extend `EventDispatcher` and implement a custom interface to customize event behavior.  

### <span id="1.2">1.2 Example
`Assets/JLGames/RabbitDriverPro/Samples/Event/Scripts/EventDemo.cs`  
![image](assets/img/event_1.png)  
