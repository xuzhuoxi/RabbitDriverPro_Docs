## <span id="7">7. Service Framework (Service)
+ **JLGames.Infra.Service** provides the service framework base types. The sample `SampleServiceBase` extends `ServiceBase`.
+ **JLGames.RabbitDriver.Actions.Service** provides the serializable service nodes `ServiceNodeGroup` and `ServiceNodeData`.
+ **JLGames.RabbitDriver.Games.Service** provides shared services such as preload and config data.

### <span id="7.1">7.1 Design Purpose
Game projects have some obvious characteristics: high degree of data coupling and strong system dependence.  
So the entire game project can easily evolve into a **monolithic software**.  
As there are more modules in the system, the monolithic architecture becomes more complex. In addition, the interleaving of new functions and modification of old functions affects each other and is ultimately difficult to manage.  
In order to solve or reduce the impact of the above problems, combined with the idea of **service-oriented architecture(SOA)**, here is a solution and solve the following problems::  

+ Realize logical separation of business modules
  + Logical separation between different businesses
  + Logical separation of data and display under the same business
+ Extended support for normalized business modules
+ Unify the specification of cross-business behavior calls

### <span id="7.2">7.2 Design Ideas
+ How to divide the service and how to grasp the granularity
  1. All businesses in the range from "game login complete" to "game logout start" are regarded as service division objects.
  2. Divide service units on a regular basis. The division rules are as follows:
     + Priority is given to dividing the game business and obtaining a functional system.
     + The functional system is further divided according to data, display and management to obtain service units.
     + Data reading and writing are isolated through the interface.
  3. Design a functional open interface (read-only interface) for each service unit.
  4. The communication between service units adopts the event mechanism.
+ According to the idea of ​​IOC, extended business services are added to the service framework management in the form of injection.
+ According to the design idea of ​​the game engine, an interface function called at a fixed timing is added to the extended business service, which is used for initializing data, releasing data or special logic implementation inside the service.
+ All extension services are managed by the framework, which is convenient for unified processing of initialization, update and release.

### <span id="7.3">7.3 Interface description

#### <span id="7.3.1">7.3.1 Service Basics
+ **IService**
  Only the class that implements the IService interface can be identified as a service and added to the framework management.  
  The ServiceName property returns the service name, which is required to be **unique**.  
+ **IEventDispatcher**
  The timing management of the service depends on the [event module](), so the service implementation class is required to implement the IEventDispatcher interface.  
+ **ServiceBase**
  Implement some necessary functions of the service class, which can be used for inheritance.  
+ **IProgressingService**
  Provides a service interface for **progress update**.  
  Triggers a progress update when the service instance throws the **ServiceEvents.OnServiceProcessing** event.  
  The service instance requires the attribute functions of **total progress** and **current progress**.  
  `IProgressingService` extends `IEventDispatcher`. Declared as follows:  

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

Source: `Infra-CSharp/JLGames/Infra/Service/IProgressingService.cs`.  

#### <span id="7.3.2">7.3.2 Service initialization related
Execution timing: IArgumentService -> IAwakableService -> IInitService  
+ **IArgumentService**
  Provides a service interface for parameter injection  
  The completion of the function execution represents the end of the process of **injecting parameters**.  
  `InjectArgument` is declared on `IArgumentService`:  

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

Source: `Infra-CSharp/JLGames/Infra/Service/IArgumentService.cs`.  
+ **IAwakableService**
  A service interface that provides **activation** logic.  
  The completion of the function execution represents the end of the **activation** process.  
  `Awake` is declared on `IAwakableService`:  

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

Source: `Infra-CSharp/JLGames/Infra/Service/IAwakableService.cs`.  
+ **IInitService**
  A service interface that provides **initialization** logic.  
  When the service instance throws the **ServiceEvents.OnServiceInited** event, it means the **initialization** process ends.  
  `IInitService` extends `IService` and `IEventDispatcher`. Declared as follows:  

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

Source: `Infra-CSharp/JLGames/Infra/Service/IInitService.cs`.  
+ **IInitDataService**
  A service interface that provides **data initialization** logic.  
  When the service instance throws the **ServiceEvents.OnServiceDataInited** event, it means the **data initialization** process ends.  
  `IInitDataService` extends `IService` and `IEventDispatcher`. Declared as follows:  

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

Source: `Infra-CSharp/JLGames/Infra/Service/IInitDataService.cs`.  

#### <span id="7.3.3">7.3.3 Management scheduling related
+ **IClearService**
  A service interface that provides **cleanup** logic.  
  Mostly used for data reset, event removal and other logic.  
  The completion of the function execution means the end of the cleanup process.  
  `Clear` is declared on `IClearService`:  

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

Source: `Infra-CSharp/JLGames/Infra/Service/IClearService.cs`.  
+ **ILoadDataService**
  Provides a service interface for data loading logic.  
  When the service instance throws the **ServiceEvents.OnServiceLoaded** event, it means the **data loading** process ends.  
  `ILoadDataService` extends `IEventDispatcher`. `LoadData` is declared as follows:  

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

Source: `Infra-CSharp/JLGames/Infra/Service/ILoadDataService.cs`.  
+ **ISaveDataService**
  Provides a service interface for **data storage** logic.  
  When the service instance throws the **ServiceEvents.OnServiceSaved** event, it means the **data saving** process ends.  
  `ISaveDataService` extends `IEventDispatcher`. `SaveData` is declared as follows:  

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

Source: `Infra-CSharp/JLGames/Infra/Service/ISaveDataService.cs`.  

#### <span id="7.3.4">7.3.4 Event Description

##### 7.3.4.1 Progress update related events
Declared on `ServiceEvents`:  

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

Source: `Infra-CSharp/JLGames/Infra/Service/ServiceEvents.cs`.  
+ **ServiceEvents.OnServiceProcessing**
  + Scheduling body: a service instance that implements the IProgressingService interface
  + Scheduling timing: when it is necessary to inform the listener of the update progress.
+ **ServiceEvents.OnInitializationProcessing**
  + Scheduling subject: ServiceManager
  + Scheduling timing: During the initial execution period from StartInitalization to endCall, it is scheduled when three events of OnServiceProcessing, OnServiceInited, and OnServiceDataInited are captured.
+ **ServiceEvents.OnInitializationFinish**
  + Scheduling subject: ServiceManager
  + Scheduling timing: when the call to StartInitalization ends, after the execution of endCall.

##### 7.3.4.2 Service preparation related events
Dispatching order: OnServiceInjected > OnServiceAllInjected > OnServiceAwaked > OnServiceAllAwaked  
Declared on `ServiceEvents`:  

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

Source: `Infra-CSharp/JLGames/Infra/Service/ServiceEvents.cs`.  
+ **ServiceEvents.OnServiceInjected**
  + Scheduling subject: ServiceManager
  + Scheduling timing: during the call to StartInitalization
+ **ServiceEvents.OnServiceAllInjected**
  + Scheduling subject: ServiceManager
  + Scheduling timing: During the call to StartInitalization, all services that implement IArgumentService are processed.
+ **ServiceEvents.OnServiceAwaked**
  + Scheduling subject: ServiceManager
  + Scheduling timing: during the call to StartInitalization
+ **ServiceEvents.OnServiceAllAwaked**
  + Scheduling subject: ServiceManager
  + Scheduling timing: During the call to StartInitalization, after all the services that implement IAwakableService are processed.

##### 7.3.4.3 Service initialization related events
Dispatching order: OnServiceInitStart > OnServiceInited > OnServiceAllInited > OnServiceDataInitStart > OnServiceDataInited > OnServiceDataAllInited  
`OnServiceInitStart`, `OnServiceInited`, and `OnServiceAllInited` are declared on `ServiceEvents`:  

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

Source: `Infra-CSharp/JLGames/Infra/Service/ServiceEvents.cs`.  
+ **ServiceEvents.OnServiceInitStart**
  + Scheduling subject: ServiceManager
  + Scheduling timing: During the call to StartInitalization, process each service before the behavior of the IInitService interface.
+ **ServiceEvents.OnServiceInited**
  + Scheduling subject: service instance, ServiceManager that implements IInitService
  + Scheduling timing: After the service instance that implements IInitService handles the Init behavior; ServiceManager captures the former event and reschedules it.
+ **ServiceEvents.OnServiceAllInited**
  + Scheduling subject: ServiceManager
  + Scheduling timing: During the call to StartInitalization, after all the services that implement IInitService are processed.
`OnServiceDataInitStart`, `OnServiceDataInited`, and `OnServiceDataAllInited` are declared on `ServiceEvents`:  

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

Source: `Infra-CSharp/JLGames/Infra/Service/ServiceEvents.cs`.  
+ **ServiceEvents.OnServiceDataInitStart**
  + Scheduling subject: ServiceManager
  + Scheduling timing: During the call to StartInitalization, process each service before the behavior of the IInitDataService interface.
+ **ServiceEvents.OnServiceDataInited**
  + Scheduling subject: service instance, ServiceManager that implements IInitDataService
  + Scheduling timing: After the service instance that implements IInitDataService handles the InitData behavior; ServiceManager captures the former event and reschedules it.
+ **ServiceEvents.OnServiceDataAllInited**
  + Scheduling subject: ServiceManager
  + Scheduling timing: During the call to StartInitalization, after all the services that implement IInitDataService are processed.

##### 7.3.4.4 Data loading related events
Declared on `ServiceEvents`:  

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

Source: `Infra-CSharp/JLGames/Infra/Service/ServiceEvents.cs`.  
+ **ServiceEvents.OnServiceDataLoadStart**
  + Scheduling subject: ServiceManager
  + Scheduling timing: During the call to LoadServicesData, process each service before the behavior of the ILoadDataService interface.
+ **ServiceEvents.OnServiceDataLoaded**
  + Scheduling subject: service instance, ServiceManager that implements ILoadDataService
  + Scheduling timing: After the service instance that implements ILoadDataService handles the LoadData behavior; ServiceManager catches the former event and reschedules it.
+ **ServiceEvents.OnServiceDataAllLoaded**
  + Scheduling subject: ServiceManager
  + Scheduling timing: During the call to LoadServicesData, all services that implement ILoadDataService are processed.

##### 7.3.4.5 Data save related events
Declared on `ServiceEvents`:  

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

Source: `Infra-CSharp/JLGames/Infra/Service/ServiceEvents.cs`.  
+ **ServiceEvents.OnServiceDataSaveStart**
  + Scheduling subject: ServiceManager
  + Scheduling timing: During the call to SaveServicesData, process each service before the behavior of the ISaveDataService interface.
+ **ServiceEvents.OnServiceDataSaved**
  + Scheduling subject: service instance, ServiceManager that implements ISaveDataService
  + Scheduling timing: After the service instance that implements ISaveDataService handles the SaveData behavior; ServiceManager captures the former event and reschedules it.
+ **ServiceEvents.OnServiceDataAllSaved**
  + Scheduling subject: ServiceManager
  + Scheduling timing: During the call to SaveServicesData, after all the services that implement ISaveDataService are processed.

### <span id="7.4">7.4 How to use the framework
Before getting the service to use, it must be registered to the framework management, and then can be used after initialization. This is to ensure that the data has been processed completely.  

#### <span id="7.4.1">7.4.1 Register the service to the framework management
By calling the AddConfig function in the ServiceConfig instance, the service can be registered with the framework management.  
`ServiceConfig.Shared.AddConfig(new ServiceInfo(serviceName, serviceImpl, args));`  
`AddConfig` is declared on `ServiceConfig`:  

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

Source: `Infra-CSharp/JLGames/Infra/Service/ServiceConfig.cs`.  
**Suggest**:  
1. Manage the registration logic with a class dedicated to handling registration services. Such as ServiceRegister in the example.
2. Registration logic calls should be guaranteed to be unique.

#### <span id="7.4.2">7.4.2 Service initialization
Start initialization by calling the **StartInitalization** function in the **ServiceManager** instance.  
**Note**: It should not be called repeatedly after initialization has started.  
`StartInitalization` is declared on `ServiceManager`:  

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

Source: `Infra-CSharp/JLGames/Infra/Service/ServiceManager.cs`.  

#### <span id="7.4.3">7.4.3 Service call
After the initial completion of all services, the service instance can be obtained by calling the **GetServiceImpl** function in **ServiceConfig**.  
ServiceConfig has two overloads for obtaining a service instance. The overload without a type parameter calls the generic GetServiceImpl.  
`GetServiceImpl` is declared on `ServiceConfig`:  

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

Source: `Infra-CSharp/JLGames/Infra/Service/ServiceConfig.cs`.  
**Suggest**:  

1. Manage the acquisition logic using a class that specifically manages acquiring service instances. Such as ServiceCenter in the example.

#### <span id="7.4.4">7.4.4 Service cleanup
When the game is to achieve a soft restart, it is necessary to reset all services and then reinitialize.  
All services can be reset by calling **ClearServices** in **ServiceManager**.  
Only services that implement the IClearService interface will perform reset logic.  
`ClearServices` is declared on `ServiceManager`:  

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

Source: `Infra-CSharp/JLGames/Infra/Service/ServiceManager.cs`.  
**Suggest**:  

1. Each service is recommended to implement the IClearService interface.
2. In the Clear function in the IClearService interface, also clear all event listeners.

### <span id="7.5">7.5 Example
Assets/JLGames/RabbitDriverPro/Samples/Service  
![image](assets/img/service_18.png)  
![image](assets/img/service_19.png)  
Service description in example:  
+ ConfigDataService
  1. Use ExcelExport to export the Excel header and data.
  2. cfg.asset is the DirFilesIndex asset manager, which is used to manage the path of Excel's Json data.
  3. Use the built-in Loader to load the cfg.asset and Json files and cache them.
  4. Init processing is complete.
+ PreloadService
  1. Use PreloadSettings to manage the configuration information of preloaded resources.
  2. Use the built-in Loader to load the PreloadSettings asset.
  3. Load resources according to the PreloadSettings configuration information.
  4. Init processing is complete.
+ ResourceService
  Service implementation under the Material Data Framework.  
  1. Read the configuration from the ConfigDataService service.
  2. Initialize by configuration.
  3. Init processing is complete.
  4. Simulate the generation of user data.
  5. InitData processing is complete.
+ DemoService
  The boilerplate service simulates different functions under the same service logic by injecting parameters.  