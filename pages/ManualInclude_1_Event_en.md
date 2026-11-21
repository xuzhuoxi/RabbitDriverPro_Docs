## 1. Event - Efficient event module, supports Unity multithreading
The event uses a **listen**-**capture** mechanism. A listener can set capture count and priority.  
+ Event types come from **JLGames.Infra.Event**. The sample uses `EventDispatcher` as an `IThreadEventDispatcher`.  
+ `Actions/ThreadEvent` in the framework repository is entirely commented out and is not the current multithreading implementation.

### 1.1 Core functions - add listeners, remove listeners, dispatch events

#### 1.1.1 Monitoring
`EventDispatcher.AddEventListener` adds an event listener. It can take a priority, a capture count, and a tag.  
![image](assets/img/event_2.png)  

#### 1.1.2 remove monitor
`EventDispatcher.RemoveEventListener` removes an event listener.  
![image](assets/img/event_3.png)  

#### 1.1.3 Distributing events
`EventDispatcher.DispatchEvent` dispatches an event.  
![image](assets/img/event_4.png)  

#### 1.1.4 Multithreading support
The sample treats `EventDispatcher` as `IThreadEventDispatcher`. After `SetThreadEventContext(SynchronizationContext.Current)`, `DispatchEvent` can be called from another thread. `ClearThreadEventContext` clears that context.  
![image](assets/img/event_5.png)  

#### 1.1.5 Extensions
Extend `EventDispatcher` and implement a custom interface to customize event behavior.  

### 1.2 Example
`Assets/JLGames/RabbitDriverPro/Samples/Event/Scripts/EventDemo.cs`  
![image](assets/img/event_1.png)  
