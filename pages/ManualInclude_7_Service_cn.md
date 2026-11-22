## <span id="7">7. 服务框架(Service)
+ **JLGames.Infra.Service** 提供服务框架的基础类型。示例中的 `SampleServiceBase` 继承 `ServiceBase`。
+ **JLGames.RabbitDriver.Actions.Service** 提供可序列化的服务节点 `ServiceNodeGroup` 与 `ServiceNodeData`。
+ **JLGames.RabbitDriver.Games.Service** 提供预加载与配置数据等常用服务。

### <span id="7.1">7.1 设计目的
游戏项目有一些比较明显的特点：数据偶合度高、系统依赖性强。  
所以整个游戏项目很容易就会演变成**单体架构(monolithic software)**。  
随着系统模块越多，单体架构就会越复杂。加上新增功能与旧功能修改的交错进行，互相影响，最终难以管理。  
为了解决或者减轻上述问题的影响，结合**面向服务架构(SOA)**的思想，这里提供了一个解决方案，并解决以下问题的：  
+ 实现业务模块逻辑分离
  + 不同业务间的逻辑分离
  + 同一业务下数据与显示的逻辑分离
+ 规范化业务模块的扩展支持
+ 统一跨业务行为调用的规范

### <span id="7.2">7.2 设计思路
+ 服务如何划分，粒度怎样把握
  1. 把 ”游戏登录完成“ 到 "游戏登出开始" 这个范围内的全部业务视作服务划分对象。
  2. 按规律的进行服务单元划分。划分规律如下：
     + 优先把游戏业务进行划分，得到功能系统。
     + 对功能系统按数据、显示、管理进上步划分，得到服务单元。
     + 数据的读、写通过接口进行隔离。
  3. 对每一个服务单元设计功能开放接口(只读接口)。
  4. 服务单元间通信采用事件机制。
+ 按照IOC思想，扩展业务服务以注入的形式加入到服务框架管理。
+ 按照游戏引擎的设计思路， 给扩展业务服务加入了固定时机调用的接口函数，用于服务内部的初始化数据、释放数据或特殊逻辑实现。
+ 全部扩展服务都由框架进行管理，方便于初始化、更新、释放的统一处理。

### <span id="7.3">7.3 接口说明

#### <span id="7.3.1">7.3.1 服务基础
+ **IService**
  只有实现的IService接口的类，才能识别为服务并加入到框架管理。  
  ServiceName属性返回服务名称，要求具有**唯一性**。  
+ **IEventDispatcher**
  服务的时机管理依赖于[事件模块]()，因此服务实现类要求实现IEventDispatcher接口。  
+ **ServiceBase**
  实现服务类的一些必要功能，可用于继承。  
+ **IProgressingService**
  提供**进度更新**的服务接口。  
  当服务实例抛出**ServiceEvents.OnServiceProcessing**事件后触发一次进度更新。  
  服务实例要求提供**进度总量**与**进度当前量**的属性函数。  
  `IProgressingService` 继承 `IEventDispatcher`。声明如下：  

```csharp
/// <summary>
/// Reports granular init progress; replaces the default one-step count per <see cref="IInitService"/> / <see cref="IInitDataService"/>.
/// 上报细粒度初始化进度；可替代每个 <see cref="IInitService"/> / <see cref="IInitDataService"/> 默认的单步计数。
/// Increment progress and dispatch <see cref="ServiceEvents.OnServiceProcessing"/> from the service implementation.
/// 由服务实现递增进度并派发 <see cref="ServiceEvents.OnServiceProcessing"/>。
/// </summary>
public interface IProgressingService : IEventDispatcher

/// <summary>
/// Total progress
/// 进度总量
/// [0,int.Max)
/// </summary>
uint ProgressingLen { get; }

/// <summary>
/// Current amount of progress
/// 进度当前量
/// [0,Total]
/// </summary>
uint ProgressingCurrent { get; }
```

来源：`Infra-CSharp/JLGames/Infra/Service/IProgressingService.cs`。  

#### <span id="7.3.2">7.3.2 服务初始化相关
执行时机：IArgumentService -> IAwakableService -> IInitService  
+ **IArgumentService**
  提供**参数注入**的服务接口。  
  函数执行完成代表**注入参数**这一过程结束。  
  `InjectArgument` 声明在 `IArgumentService` 中：  

```csharp
/// <summary>
/// Receives constructor-style arguments before initialization.
/// 在初始化前接收构造/配置参数的接口。
/// Invoked by <see cref="ServiceManager"/> for each entry in <see cref="ServiceConfig"/> during <see cref="ServiceManager.StartInitalization"/>.
/// 在 <see cref="ServiceManager.StartInitalization"/> 期间由 <see cref="ServiceManager"/> 对每个 <see cref="ServiceConfig"/> 项调用。
/// </summary>
public interface IArgumentService

/// <summary>
/// Inject data.
/// 注入数据
/// </summary>
/// <param name="args">Arguments from <see cref="ServiceInfo.Args"/>; may be null or empty.<br/>来自 <see cref="ServiceInfo.Args"/> 的参数；可为 null 或空数组。</param>
void InjectArgument(object[] args);
```

来源：`Infra-CSharp/JLGames/Infra/Service/IArgumentService.cs`。  
+ **IAwakableService**
  提供**激活**逻辑的服务接口。  
  函数执行完成代表**激活**这一过程结束。  
  `Awake` 声明在 `IAwakableService` 中：  

```csharp
/// <summary>
/// Early activation hook before <see cref="IInitService.Init"/>.
/// 在 <see cref="IInitService.Init"/> 之前执行的早期激活钩子。
/// Invoked synchronously by <see cref="ServiceManager"/> during startup; must not use async.
/// 由 <see cref="ServiceManager"/> 在启动时同步调用；不允许使用异步。
/// </summary>
public interface IAwakableService

/// <summary>
/// Awake service
/// 激活Service
/// Async is not allowed
/// 不允许使用异步
/// </summary>
void Awake();
```

来源：`Infra-CSharp/JLGames/Infra/Service/IAwakableService.cs`。  
+ **IInitService**
  提供**初始化**逻辑的服务接口。  
  当服务实例抛出**ServiceEvents.OnServiceInited**事件后代表**初始化**这一过程结束.  
  `IInitService` 继承 `IService`、`IEventDispatcher`。声明如下：  

```csharp
/// <summary>
/// Service initialization interface
/// 服务初始化接口
/// Only when the current interface is implemented and configured into ServiceConfig,
/// the init method will be executed during the initialization process
/// 只有实现了当前接口，并配置到ServiceConfig中时，在初始化过程中才会执行init方法
/// </summary>
public interface IInitService : IService, IEventDispatcher

/// <summary>
/// Whether the initialization has been completed
/// 是否已经完成初始化
/// </summary>
bool IsInited { get; }

/// <summary>
/// Initialize the service; dispatch <see cref="ServiceEvents.OnServiceInited"/> with <see cref="IService.ServiceName"/> when done.
/// 初始化服务；完成后应派发 <see cref="ServiceEvents.OnServiceInited"/>，数据为 <see cref="IService.ServiceName"/>。
/// </summary>
void Init();
```

来源：`Infra-CSharp/JLGames/Infra/Service/IInitService.cs`。  
+ **IInitDataService**
  提供**数据初始化**逻辑的服务接口。  
  当服务实例抛出**ServiceEvents.OnServiceDataInited**事件后代表**数据初始化**这一过程结束.  
  `IInitDataService` 继承 `IService`、`IEventDispatcher`。声明如下：  

```csharp
/// <summary>
/// Data initialization phase for a service.
/// 服务的数据初始化阶段接口。
/// Only when implemented and registered in <see cref="ServiceConfig"/>,
/// <see cref="InitData"/> runs after all <see cref="IInitService"/> instances complete during startup.
/// 只有实现并注册到 <see cref="ServiceConfig"/> 后，启动时才会在所有 <see cref="IInitService"/> 完成之后执行 <see cref="InitData"/>。
/// </summary>
public interface IInitDataService : IService, IEventDispatcher

/// <summary>
/// Whether data initialization has been completed
/// 是否已经完成数据初始化
/// </summary>
bool IsDataInited { get; }

/// <summary>
/// Initialize runtime data; dispatch <see cref="ServiceEvents.OnServiceDataInited"/> with <see cref="IService.ServiceName"/> when done.
/// 初始化运行时数据；完成后应派发 <see cref="ServiceEvents.OnServiceDataInited"/>，数据为 <see cref="IService.ServiceName"/>。
/// </summary>
void InitData();
```

来源：`Infra-CSharp/JLGames/Infra/Service/IInitDataService.cs`。  

#### <span id="7.3.3">7.3.3 管理调度相关
+ **IClearService**
  提供**清理**逻辑的服务接口。  
  多用于数据重置、事件移除等逻辑。  
  函数执行完成代表清理这一过程结束。  
  `Clear` 声明在 `IClearService` 中：  

```csharp
/// <summary>
/// Resets a service to its pre-init state (listeners, flags, timers, etc.).
/// 将服务重置到未初始化状态（监听、标志、计时器等）。
/// Called on each service by <see cref="ServiceManager.ClearServices"/>.
/// 由 <see cref="ServiceManager.ClearServices"/> 对每个服务调用。
/// </summary>
public interface IClearService

/// <summary>
/// reset
/// 重置
/// Clear events, clear timers, etc.
/// 清除事件、清除计时器等
/// </summary>
void Clear();
```

来源：`Infra-CSharp/JLGames/Infra/Service/IClearService.cs`。  
+ **ILoadDataService**
  提供**数据加载**逻辑的服务接口。  
  当服务实例抛出**ServiceEvents.OnServiceLoaded**事件后代表**数据加载**这一过程结束.  
  `ILoadDataService` 继承 `IEventDispatcher`。`LoadData` 声明如下：  

```csharp
/// <summary>
/// Load persisted or external data for a service.
/// 服务的数据加载接口。
/// Invoked sequentially by <see cref="ServiceManager.LoadServicesData"/> for each registered implementation.
/// 由 <see cref="ServiceManager.LoadServicesData"/> 按配置顺序依次调用。
/// </summary>
public interface ILoadDataService : IEventDispatcher

/// <summary>
/// Load data; dispatch <see cref="ServiceEvents.OnServiceDataLoaded"/> with the service name when done.
/// 加载数据；完成后应派发 <see cref="ServiceEvents.OnServiceDataLoaded"/>，数据为服务名称。
/// </summary>
void LoadData();
```

来源：`Infra-CSharp/JLGames/Infra/Service/ILoadDataService.cs`。  
+ **ISaveDataService**
  提供**数据保存**逻辑的服务接口。  
  当服务实例抛出**ServiceEvents.OnServiceSaved**事件后代表**数据保存**这一过程结束.  
  `ISaveDataService` 继承 `IEventDispatcher`。`SaveData` 声明如下：  

```csharp
/// <summary>
/// Persist service data.
/// 服务的数据保存接口。
/// Invoked sequentially by <see cref="ServiceManager.SaveServicesData"/> for each registered implementation.
/// 由 <see cref="ServiceManager.SaveServicesData"/> 按配置顺序依次调用。
/// </summary>
public interface ISaveDataService : IEventDispatcher

/// <summary>
/// Save data; dispatch <see cref="ServiceEvents.OnServiceDataSaved"/> with the service name when done.
/// 保存数据；完成后应派发 <see cref="ServiceEvents.OnServiceDataSaved"/>，数据为服务名称。
/// </summary>
void SaveData();
```

来源：`Infra-CSharp/JLGames/Infra/Service/ISaveDataService.cs`。  

#### <span id="7.3.4">7.3.4 事件说明

##### 7.3.4.1 进度更新相关事件
声明在 `ServiceEvents` 中：  

```csharp
/// <summary>
/// A single service initializes the progress update event, which is dispatched by the service instance.
/// The service instance must be an implementation class of the IProgressingService interface
/// 单个服务初始化进度更新事件，由服务实例调度。服务实例必须为IProgressingService接口的实现类
/// </summary>
public const string OnServiceProcessing = "ServiceEvents.OnServiceProcessing";

/// <summary>
/// Service initialization process progress update
/// 服务初始化进程进度更新
/// </summary>
public const string OnInitializationProcessing = "ServiceEvents:OnInitializationProcessing";

/// <summary>
/// Service initialization process completed
/// 服务初始化进程完成
/// </summary>
public const string OnInitializationFinish = "ServiceEvents:OnInitializationFinish";
```

来源：`Infra-CSharp/JLGames/Infra/Service/ServiceEvents.cs`。  
+ **ServiceEvents.OnServiceProcessing**
  + 调度主体：实现了IProgressingService接口的服务实例
  + 调度时机：有必要告知监听者更新进度时。
+ **ServiceEvents.OnInitializationProcessing**
  + 调度主体：ServiceManager
  + 调度时机：调用StartInitalization到endCall初始执行期间，捕获到OnServiceProcessing、OnServiceInited、OnServiceDataInited三类事件时调度。
+ **ServiceEvents.OnInitializationFinish**
  + 调度主体：ServiceManager
  + 调度时机：调用StartInitalization结束时，在endCall执行之后。

##### 7.3.4.2 服务准备相关事件
调度顺序：OnServiceInjected > OnServiceAllInjected > OnServiceAwaked > OnServiceAllAwaked  
声明在 `ServiceEvents` 中：  

```csharp
/// <summary>
/// Service argument injection result event, dispatched by ServiceManager.
/// Succ=true when the service implements the IArgumentService interface.
/// 服务参数注入结果事件, 由ServiceManager调度。当服务实现IArgumentService接口时，Succ=true。
/// Event data format: ServiceResultEventData
/// 事件数据格式：ServiceResultData
/// </summary>
public const string OnServiceInjected = "ServiceEvents:OnServiceInjected";

/// <summary>
/// All service argument injection completion event
/// 全部服务参数注入完成事件
/// Event data format: null
/// 事件数据格式：null
/// </summary>
public const string OnServiceAllInjected = "ServiceEvents:OnServiceAllInjected";

/// <summary>
/// Service activation result event, dispatched by ServiceManager.
/// Succ=true when the service implements the IWakableService interface.
/// 服务激活结果事件, 由ServiceManager调度。当服务实现IAwakableService接口时，Succ=true。
/// Event data format: ServiceResultEventData
/// 事件数据格式：ServiceResultData
/// </summary>
public const string OnServiceAwaked = "ServiceEvents:OnServiceAwaked";

/// <summary>
/// All service activation completion event
/// 全部服务激活完成事件
/// Event data format: null
/// 事件数据格式：null
/// </summary>
public const string OnServiceAllAwaked = "ServiceEvents:OnServiceAllAwaked";
```

来源：`Infra-CSharp/JLGames/Infra/Service/ServiceEvents.cs`。  
+ **ServiceEvents.OnServiceInjected**
  + 调度主体：ServiceManager
  + 调度时机：调用StartInitalization期间
+ **ServiceEvents.OnServiceAllInjected**
  + 调度主体：ServiceManager
  + 调度时机：调用StartInitalization期间，全部实现IArgumentService的服务处理完成后。
+ **ServiceEvents.OnServiceAwaked**
  + 调度主体：ServiceManager
  + 调度时机：调用StartInitalization期间
+ **ServiceEvents.OnServiceAllAwaked**
  + 调度主体：ServiceManager
  + 调度时机：调用StartInitalization期间，全部实现IAwakableService的服务处理完成后。

##### 7.3.4.3 服务初始化相关事件
调度顺序：OnServiceInitStart > OnServiceInited > OnServiceAllInited > OnServiceDataInitStart > OnServiceDataInited > OnServiceDataAllInited  
`OnServiceInitStart`、`OnServiceInited`、`OnServiceAllInited` 声明在 `ServiceEvents` 中：  

```csharp
/// <summary>
/// Single service initialization start event, dispatched by ServiceManager
/// 单个服务初始化开始事件，由ServiceManager调度
/// Event data format: ServiceResultData
/// 事件数据格式：ServiceResultData
/// </summary>
public const string OnServiceInitStart = "ServiceEvents:OnServiceInitStart";

/// <summary>
/// A single service initialization complete event, which are dispatched by the service instance.
/// Re-dispatched after being captured by ServiceManager.
/// 单个服务初始化完成事件，由服务实例调度。被ServiceManager捕获后重新调度。
/// Event data format: {named:string}
/// 事件数据格式：{named:string}
/// </summary>
public const string OnServiceInited = "ServiceEvents:OnServiceInited";

/// <summary>
/// All service initialization complete event
/// 全部服务初始化完成事件
/// Event data format: len:int
/// 事件数据格式：len:int
/// </summary>
public const string OnServiceAllInited = "ServiceEvents:OnServiceAllInited";
```

来源：`Infra-CSharp/JLGames/Infra/Service/ServiceEvents.cs`。  
+ **ServiceEvents.OnServiceInitStart**
  + 调度主体：ServiceManager
  + 调度时机：调用StartInitalization期间，处理每一个服务关于IInitService接口行为之前。
+ **ServiceEvents.OnServiceInited**
  + 调度主体：实现IInitService的服务实例、ServiceManager
  + 调度时机：实现IInitService的服务实例处理Init行为完成后；ServiceManager捕获前者事件后重新调度。
+ **ServiceEvents.OnServiceAllInited**
  + 调度主体：ServiceManager
  + 调度时机：调用StartInitalization期间，全部实现IInitService的服务处理完成后。

`OnServiceDataInitStart`、`OnServiceDataInited`、`OnServiceDataAllInited` 声明在 `ServiceEvents` 中：  

```csharp
/// <summary>
/// Single service data initialization start event, dispatched by ServiceManager
/// 单个服务数据初始化开始事件，由ServiceManager调度
/// Event data format: ServiceResultData
/// 事件数据格式：ServiceResultData
/// </summary>
public const string OnServiceDataInitStart = "ServiceEvents:OnServiceDataInitStart";

/// <summary>
/// A single service data initialization complete event, which are dispatched by the service instance.
/// Re-dispatched after being captured by ServiceManager.
/// 单个服务数据初始化完成事件，由服务实例调度。被ServiceManager捕获后重新调度。
/// Event data format: {named:string}
/// 事件数据格式：{named:string}
/// </summary>
public const string OnServiceDataInited = "ServiceEvents:OnServiceDataInited";

/// <summary>
/// All service data initialization complete event
/// 全部服务数据初始化完成事件
/// Event data format: len:int
/// 事件数据格式：len:int
/// </summary>
public const string OnServiceDataAllInited = "ServiceEvents:OnServiceDataAllInited";
```

来源：`Infra-CSharp/JLGames/Infra/Service/ServiceEvents.cs`。  
+ **ServiceEvents.OnServiceDataInitStart**
  + 调度主体：ServiceManager
  + 调度时机：调用StartInitalization期间，处理每一个服务关于IInitDataService接口行为之前。
+ **ServiceEvents.OnServiceDataInited**
  + 调度主体：实现IInitDataService的服务实例、ServiceManager
  + 调度时机：实现IInitDataService的服务实例处理InitData行为完成后；ServiceManager捕获前者事件后重新调度。
+ **ServiceEvents.OnServiceDataAllInited**
  + 调度主体：ServiceManager
  + 调度时机：调用StartInitalization期间，全部实现IInitDataService的服务处理完成后。

##### 7.3.4.4 数据加载相关事件
声明在 `ServiceEvents` 中：  

```csharp
/// <summary>
/// A single  data service load data start event, dispatched by ServiceManager
/// Succ=true when the service implements the ILoadDataService interface.
/// 单个服务数据加载数据开始事件，由ServiceManager调度。当服务实现ILoadDataService接口时，Succ=true。
/// Event data format: ServiceResultData
/// 事件数据格式：ServiceResultData
/// </summary>
public const string OnServiceDataLoadStart = "ServiceEvents:OnServiceDataLoadStart";

/// <summary>
/// A single data service load data completion event, which are dispatched by the service instance.
/// Re-dispatched after being captured by ServiceManager.
/// 单个数据服务加载数据完成事件，由服务实例调度。被ServiceManager捕获后重新调度。
/// Event data format: {named:string}
/// 事件数据格式：{named:string}
/// </summary>
public const string OnServiceDataLoaded = "ServiceEvents:OnServiceDataLoaded";

/// <summary>
/// All data service loading data completion event
/// 全部数据服务加载数据完成事件
/// Event data format: len:int
/// 事件数据格式：len:int
/// </summary>
public const string OnServiceDataAllLoaded = "ServiceEvents:OnServiceDataAllLoaded";
```

来源：`Infra-CSharp/JLGames/Infra/Service/ServiceEvents.cs`。  
+ **ServiceEvents.OnServiceDataLoadStart**
  + 调度主体：ServiceManager
  + 调度时机：调用LoadServicesData期间，处理每一个服务关于ILoadDataService接口行为之前。
+ **ServiceEvents.OnServiceDataLoaded**
  + 调度主体：实现ILoadDataService的服务实例、ServiceManager
  + 调度时机：实现ILoadDataService的服务实例处理LoadData行为完成后；ServiceManager捕获前者事件后重新调度。
+ **ServiceEvents.OnServiceDataAllLoaded**
  + 调度主体：ServiceManager
  + 调度时机：调用LoadServicesData期间，全部实现ILoadDataService的服务处理完成后。

##### 7.3.4.5 数据保存相关事件
声明在 `ServiceEvents` 中：  

```csharp
/// <summary>
/// A single data service save data start event, dispatched by ServiceManager
/// Succ=true when the service implements the ISaveDataService interface.
/// 单个服务数据保存数据开始事件，由ServiceManager调度。当服务实现ISaveDataService接口时，Succ=true。
/// Event data format: ServiceResultData
/// 事件数据格式：ServiceResultData
/// </summary>
public const string OnServiceDataSaveStart = "ServiceEvents:OnServiceDataSaveStart";

/// <summary>
/// A single data service saves data completion events, which are dispatched by the service instance.
/// Re-dispatched after being captured by ServiceManager.
/// 单个数据服务保存数据完成事件，由服务实例调度。被ServiceManager捕获后重新调度。
/// Event data format: {named:string}
/// 事件数据格式：{named:string}
/// </summary>
public const string OnServiceDataSaved = "ServiceEvents:OnServiceDataSaved";

/// <summary>
/// All data services save data complete event
/// 全部数据服务保存数据完成事件
/// Event data format: len:int
/// 事件数据格式：len:int
/// </summary>
public const string OnServiceDataAllSaved = "ServiceEvents:OnServiceDataAllSaved";
```

来源：`Infra-CSharp/JLGames/Infra/Service/ServiceEvents.cs`。  
+ **ServiceEvents.OnServiceDataSaveStart**
  + 调度主体：ServiceManager
  + 调度时机：调用SaveServicesData期间，处理每一个服务关于ISaveDataService接口行为之前。
+ **ServiceEvents.OnServiceDataSaved**
  + 调度主体：实现ISaveDataService的服务实例、ServiceManager
  + 调度时机：实现ISaveDataService的服务实例处理SaveData行为完成后；ServiceManager捕获前者事件后重新调度。
+ **ServiceEvents.OnServiceDataAllSaved**
  + 调度主体：ServiceManager
  + 调度时机：调用SaveServicesData期间，全部实现ISaveDataService的服务处理完成后。

### <span id="7.4">7.4 如何使用框架
在获取服务使用前，必须先注册到框架管理，然后初始化后才能使用。这是为了确保数据已经完整地处理完成。  

#### <span id="7.4.1">7.4.1 把服务注册到框架管理
通过调用 **ServiceConfig** 实例中的 **AddConfig** 函数，能把服务注册到框架管理中去。  
`ServiceConfig.Shared.AddConfig(new ServiceInfo(serviceName, serviceImpl, args));`  
`AddConfig` 声明在 `ServiceConfig` 中：  

```csharp
/// <summary>
/// Add a service to the end of the configuration list
/// 添加服务到配置列表尾部
/// </summary>
/// <param name="sc">Service entry to append.<br/>要追加的服务配置项。</param>
/// <param name="ignoreSame">When false, throws if <see cref="ServiceInfo.ServiceName"/> already exists.<br/>为 false 时，若 <see cref="ServiceInfo.ServiceName"/> 已存在则抛出异常。</param>
/// <exception cref="Exception">Thrown when <paramref name="ignoreSame"/> is false and the service name is duplicate.<br/>当 <paramref name="ignoreSame"/> 为 false 且服务名重复时抛出。</exception>
public void AddConfig(ServiceInfo sc, bool ignoreSame = true)
```

来源：`Infra-CSharp/JLGames/Infra/Service/ServiceConfig.cs`。  
**建议**：  

1. 使用一个专门处理注册服务的类管理注册逻辑。如示例中的ServiceRegister。
2. 注册逻辑调用应该保证唯一。

#### <span id="7.4.2">7.4.2 服务初始化
通过调用 **ServiceManager** 实例中的 **StartInitalization** 函数，开始初始化。  
**注意**：初始化开始后不应该重复调用。  
`StartInitalization` 声明在 `ServiceManager` 中：  

```csharp
/// <summary>
/// Initialize the configured service
/// 初始化配置好的服务
/// If it has been initialized once, try to execute the callback directly
/// 如果已经初始化一次，就尝试直接执行回调
/// </summary>
/// <param name="endCall">Invoked after Init and InitData complete for all services.<br/>全部服务 Init 与 InitData 完成后的回调。</param>
public void StartInitalization(Callback endCall)
```

来源：`Infra-CSharp/JLGames/Infra/Service/ServiceManager.cs`。  

#### <span id="7.4.3">7.4.3 服务调用
在全部服务初始完成后，通过调用 **ServiceConfig** 中的 **GetServiceImpl** 函数，可取得服务实例。  
ServiceConfig中获取服务实例的函数有两个重载，无类型参数的重载会调用带类型参数的 GetServiceImpl。  
`GetServiceImpl` 声明在 `ServiceConfig` 中：  

```csharp
/// <summary>
/// Get the specified server implementation object
/// 取指定服务器实现对象
/// </summary>
/// <param name="serviceName">Unique service name.<br/>服务唯一名称。</param>
/// <returns>Implementation instance, or null if not found.<br/>实现实例；未找到时为 null。</returns>
public IService GetServiceImpl(string serviceName)

/// <summary>
/// Take the specified server implementation object and use generics to reduce the amount of code writing
/// 取指定服务器实现对象，使用泛型为了减少代码编写量
/// </summary>
/// <param name="serviceName">Unique service name.<br/>服务唯一名称。</param>
/// <typeparam name="T">Expected implementation type.<br/>期望的实现类型。</typeparam>
/// <returns>Cast implementation, or null if missing or incompatible.<br/>转换后的实现；不存在或类型不匹配时为 null。</returns>
public T GetServiceImpl<T>(string serviceName) where T : class
```

来源：`Infra-CSharp/JLGames/Infra/Service/ServiceConfig.cs`。  
**建议**：  

1. 使用一个专门管理获取服务实例的类管理获取逻辑。如示例中的ServiceCenter。

#### <span id="7.4.4">7.4.4 服务清理
当游戏要实现软重启时，有必要重置全部的服务再重新初始化。  
通过调用 **ServiceManager** 中的 **ClearServices** ，可实现全部服务的重置。  
只有实现IClearService接口的服务才会执行重置逻辑。  
`ClearServices` 声明在 `ServiceManager` 中：  

```csharp
/// <summary>
/// Service cleanup
/// 服务清理
/// </summary>
public void ClearServices()
{
    RemoveEventListener();
    for (var i = m_Services.Length - 1; i >= 0; i--)
    {
        (m_Services[i].ServiceImpl as IClearService)?.Clear();
    }
}
```

来源：`Infra-CSharp/JLGames/Infra/Service/ServiceManager.cs`。  
**建议**：  

1. 每个服务都建议实现IClearService接口。
2. 在IClearService接口中的Clear函数中把事件监听也全部清除。

### <span id="7.5">7.5 示例
Assets/JLGames/RabbitDriverPro/Samples/Service  
![image](assets/img/service_18.png)  
![image](assets/img/service_19.png)  
示例中的服务说明：  
+ ConfigDataService
  1. 使用ExcelExport导出了Excle表头和数据。
  2. cfg.asset是DirFilesIndex资产管理器，用于管理Excel的Json数据的路径。
  3. 使用内置的Loader加载cfg.asset和Json文件，并缓存起来。
  4. Init处理完成。
+ PreloadService
  1. 使用PreloadSettings管理预加载资源的配置信息。
  2. 使用内置的Loader加载PreloadSettings资产。
  3. 根据PreloadSettings配置信息，加载资源。
  4. Init处理完成。
+ ResourceService
  材料数据框架下的服务实现。  
  1. 从ConfigDataService服务中读取配置。
  2. 通过配置初始化。
  3. Init处理完成。
  4. 模拟用户数据的生成。
  5. InitData处理完成。
+ DemoService
  样板服务，模拟了通过注入参数，在同一个服务逻辑下表现不同的功能。  