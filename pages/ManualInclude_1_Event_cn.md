## 1. 事件(Event) - 高效的事件模块，支持Unity多线程
事件采用“**监听**-**捕获**”机制，监听时支持捕获次数、 捕获优先级的设置。  
+ 事件类型来自 **JLGames.Infra.Event**。示例里使用的实现类是 `EventDispatcher`，并按 `IThreadEventDispatcher` 使用。  
+ 框架仓库中的 `Actions/ThreadEvent` 整段被注释，不是当前的多线程实现。

### 1.1 核心功能 - 添加监听、移除监听、分发事件

#### 1.1.1 监听
`EventDispatcher.AddEventListener` 用于添加事件监听，可传入优先级、捕获次数和标签。  
![image](assets/img/event_2.png)  

#### 1.1.2 移除监听
`EventDispatcher.RemoveEventListener` 用于移除事件监听。  
![image](assets/img/event_3.png)   

#### 1.1.3 分发事件
`EventDispatcher.DispatchEvent` 用于分发事件。  
![image](assets/img/event_4.png)  

#### 1.1.4 多线程支持
示例把 `EventDispatcher` 当作 `IThreadEventDispatcher`。调用 `SetThreadEventContext(SynchronizationContext.Current)` 之后，可以从其他线程 `DispatchEvent`。`ClearThreadEventContext` 用于清掉这个上下文。  
![image](assets/img/event_5.png)  

#### 1.1.5 扩展
可以继承 `EventDispatcher` 并实现自定义接口，用来扩展事件行为。  

### 1.2 示例
`Assets/JLGames/RabbitDriverPro/Samples/Event/Scripts/EventDemo.cs`  
![image](assets/img/event_1.png)  
