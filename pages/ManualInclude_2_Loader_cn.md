## <span id="2">2. 加载管理模块(Loader) - 支持Resources、Editor、Assetbundle三种模式自由切换

+ **JLGames.RabbitDriver.Actions.Loaderx** 提供了加载器全部的功能支持。
+ **“Tools/RabbitDriverPro/Project/Gen LoaderSettings”**提供了加载器配置文件的生成入口。

### <span id="2.1">2.1 初始化

#### <span id="2.1.1">2.1.1 生成配置资产
执行菜单 “Tools/RabbitDriverPro/Project/Gen LoaderSettings”。  
在项目Assets/Resources下会生成 LoaderSettings.asset(可重命名) 文件。  
![image](assets/img/loader_1.png)  
![image](assets/img/loader_2.png)  

#### <span id="2.1.2">2.1.2  按项目需求设置配置
LoaderSettings中共有5个可用配置，一个Editor模式， 两个Resource模式， 两个AssetBundle模式。  

+ Editor配置
  ProjectBasePath可以设置项目的资源查找的基础路径部分，在加载资源时可拼接到资源路径前。  
  ![image](assets/img/loader_5.png)  
+ Resource配置
  ProjectBasePath可以设置项目的资源查找的基础路径部分，在加载资源时可拼接到资源路径前。  
  ![image](assets/img/loader_6.png) ![image](assets/img/loader_7.png)  
+ AssetBundle配置

  + BundleSource 
    可选择Web、Streaming Assets、File Debug三种模式。  
    + Web 
      用于加载直接存入在站点上的AssetBundle资源。  
      Web Site Url 中填入站点Url。  
      Web Site Pattern 中填入Parttern路径。   
      ![image](assets/img/loader_3.png)  
    + Streaming Assets 
      用于加载存放在项目StreamingAssets中的AssetBundle资源。  
      Streaming Parttern 中填入相对于StreamingAssets的相对路径。  
      ![image](assets/img/loader_4.png)  
    + File Debug 
      用于加载本地文件系统中的AssetBundle资源，多用于调试。  
      File Url 中填入本机文件路径。  
      File Pattern 中填入与File Url相关的相对路径。   
      ![image](assets/img/loader_9.png)   
  + Base Settings    
    主要是关于项目的Bundle目录信息的设置与加载时缓存信息的设置。  
    + Project Base Path 设置项目的Bundle目录路径
    + CacheName 设置缓存区的名称，这个可以自定义。
    + Version Size 设置每个Bundle资产在缓存中保留的版本数量。
    + History size 设置缓存区数量，每一个CacheName会产生一个缓存区。
  + Resource Release Strategy 
    可选择None、Time、Counter三种。  
    + None为不选择释放策略，释放Bundle与资产后产生的无效内存占用需要自己调用gc释放，该策略适合自行管理内存与gc时机。
    + Time为计时释放策略，会按照设定的时间周期调用gc。
      ![image](assets/img/loader_10.png)   
    + Counter为计数释放策略， 当bundle加载资源到达设定值及倍数值时调用gc. 
      ![image](assets/img/loader_11.png)   

#### <span id="2.1.3">2.1.3 使用配置初始化加载器
使用以下API初始化加载器：  
+ 使用由[第一点](#2.1.1)生成的配置文件名称进行初始化。声明在 `LoaderManager` 中：

```csharp
/// <summary>
/// Initialize an ILoader from a Resources settings asset name.
/// 根据 Resources 中的配置资源名初始化 ILoader。
/// </summary>
/// <param name="loaderName">Registered loader name.<br/>注册的加载器名称。</param>
/// <param name="settingsName">LoaderSettings resource name.<br/>LoaderSettings 资源名称。</param>
/// <returns>The initialized loader, or null on failure.<br/>初始化后的加载器，失败时返回 null。</returns>
public static ILoader InitLoader(string loaderName = DefaultName, string settingsName = DefaultName)
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Loaderx/LoaderManager.cs`。  
+ 使用配置实例进行初始化。声明在 `LoaderManager` 中：

```csharp
/// <summary>
/// Initialize an ILoader from a settings instance.
/// 根据配置实例初始化 ILoader。
/// </summary>
/// <param name="loaderName">Registered loader name.<br/>注册的加载器名称。</param>
/// <param name="settings">Loader settings instance.<br/>加载器配置实例。</param>
/// <returns>The initialized loader, or null on failure.<br/>初始化后的加载器，失败时返回 null。</returns>
public static ILoader InitLoader(string loaderName, LoaderSettings settings)
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Loaderx/LoaderManager.cs`。  
+ 使用 `Loader` 静态类中的快捷初始化函数。声明在 `Loader` 中：

```csharp
/// <summary>
/// Initialize the default loader from Resources settings.
/// 从 Resources 配置初始化默认加载器。
/// </summary>
/// <param name="settingsName">LoaderSettings resource name.<br/>LoaderSettings 资源名称。</param>
public static void InitLoader(string settingsName = LoaderManager.DefaultName)
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Loaderx/Loader.cs`。  

#### <span id="2.1.4">2.1.4 初始化Bundle版本信息
+ 调用加载器实例中的函数。`ILoader` 继承 `IBundleLoader`，`InitVersion` 声明在 `IBundleLoader` 中：  

```csharp
/// <summary>
/// Initialize version manifest; manifest loading must not be cached.
/// 初始化版本清单；清单加载不允许走缓存。
/// </summary>
/// <param name="onVersionAssetBundleLoaded">Callback with manifest asset.<br/>携带清单资源的回调。</param>
/// <returns>Coroutine enumerator.<br/>协程枚举器。</returns>
IEnumerator InitVersion(LoaderDelegate.OnAssetLoaded<AssetBundleManifest> onVersionAssetBundleLoaded);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Loaderx/ILoader.cs`。  

+ 函数回调为初始化版本结束后执行，内部可判断初始化结果：成功 或 失败。
+ 函数要求开启协程调用，可以使用 `LoaderManager.Mono` 开启协程。声明在 `LoaderManager` 中：  

```csharp
/// <summary>
/// MonoBehaviour host used to start loader coroutines.
/// 用于启动加载器协程的 MonoBehaviour 宿主。
/// </summary>
public static MonoBehaviour Mono { get; }
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Loaderx/LoaderManager.cs`。  

### <span id="2.2">2.2 使用

#### <span id="2.2.1">2.2.1 加载Bundle资产
在Bundle版本信息初始化完成后，才可以加载Bundle资产。  
加载器实现了IBundleLoader接口, 包含的函数与加载Bundle资产相关。  
加载Bundle资产要求使用协程，可以使用 `LoaderManager.Mono` 实例启用协程加载 Bundle。  
`ILoader` 继承 `IBundleLoader`，`LoadBundleAsync` 声明在 `IBundleLoader` 中：  

```csharp
/// <summary>
/// Download or load a single bundle asynchronously.
/// 异步下载或加载单个资源包。
/// </summary>
/// <param name="bundleName">AssetBundle name.<br/>资源包名称。</param>
/// <param name="onBundleLoaded">Completion callback.<br/>完成回调。</param>
/// <param name="autoRelease">Whether to auto-release after load.<br/>加载完成后是否自动释放。</param>
/// <param name="unloadObjects">Whether to unload instantiated objects on release.<br/>释放时是否卸载已实例化的对象。</param>
/// <returns>Coroutine enumerator.<br/>协程枚举器。</returns>
IEnumerator LoadBundleAsync(string bundleName, LoaderDelegate.OnBundleLoaded onBundleLoaded,
    bool autoRelease = true, bool unloadObjects = false);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Loaderx/ILoader.cs`。  

+ bundleName: bundle资产名称。
+ onBundleLoaded: 执行结果回调, 内部可判断成功与否。
+ autoRelease: 指明在onBundleLoaded执行结束后是否释放bundle实例
+ unloadAllLoadedObjects: 指明在onBundleLoaded执行结束后是否释放从bundle实例中实例化的资源资产
+ 如果autoRelease为true, 在onoBundleLoaded中应该实例化全部要使用的资源资产。

#### <span id="2.2.2">2.2.2 加载资源资产
在获得bundle实例的情况下， 可以从bundle实例中实例化出资源资产的实例， 然后再克隆使用。  
加载资源资产建议使用同步函数，不建议使用异步。 原因是Unity对于在协程内部开启协程支持得不友好， 层级过多(好像是16层)会出现无法预测的报错。  

`ILoader` 继承 `IAssetLoader`。接口函数分四类，声明都在 `IAssetLoader` 中。来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Loaderx/ILoader.cs`。  

+ 单个资源资产加载（同步|异步）  

```csharp
/// <summary>
/// Load an asset synchronously using a path relative to ProjectBasePath.
/// 使用相对于 ProjectBasePath 的路径同步加载资源。
/// </summary>
/// <param name="assetPath">Relative asset path.<br/>相对资源路径。</param>
/// <param name="bundle">Source AssetBundle.<br/>源 AssetBundle。</param>
/// <typeparam name="T">Asset type.<br/>资源类型。</typeparam>
/// <returns>Loaded asset, or null on failure.<br/>已加载的资源，失败时返回 null。</returns>
T LoadAssetSync<T>(string assetPath, AssetBundle bundle) where T : Object;

/// <summary>
/// Load an asset synchronously using a full path (without ProjectBasePath prefix).
/// 使用完整路径同步加载资源（不含 ProjectBasePath 前缀）。
/// </summary>
/// <param name="fullPath">Full asset path ignoring ProjectBasePath.<br/>忽略 ProjectBasePath 的完整资源路径。</param>
/// <param name="bundle">Source AssetBundle.<br/>源 AssetBundle。</param>
/// <typeparam name="T">Asset type.<br/>资源类型。</typeparam>
/// <returns>Loaded asset, or null on failure.<br/>已加载的资源，失败时返回 null。</returns>
T LoadAssetSyncFull<T>(string fullPath, AssetBundle bundle) where T : Object;

/// <summary>
/// Load a single asset asynchronously from a bundle.
/// 从资源包异步加载单个资源。
/// </summary>
/// <param name="assetPath">Relative asset path.<br/>相对资源路径。</param>
/// <param name="bundle">Source AssetBundle.<br/>源 AssetBundle。</param>
/// <param name="onAssetLoaded">Completion callback.<br/>完成回调。</param>
/// <typeparam name="T">Asset type.<br/>资源类型。</typeparam>
/// <returns>Coroutine enumerator.<br/>协程枚举器。</returns>
IEnumerator LoadAssetAsync<T>(string assetPath, AssetBundle bundle, LoaderDelegate.OnAssetLoaded<T> onAssetLoaded)
    where T : Object;
```

+ 批量资源资产加载（同步|异步）  

```csharp
/// <summary>
/// Load multiple assets synchronously by relative paths.
/// 按相对路径同步批量加载资源。
/// </summary>
/// <param name="assetPaths">Relative asset paths.<br/>相对资源路径数组。</param>
/// <param name="bundle">Source AssetBundle.<br/>源 AssetBundle。</param>
/// <typeparam name="T">Asset type.<br/>资源类型。</typeparam>
/// <returns>Loaded assets array.<br/>已加载的资源数组。</returns>
T[] LoadAssetsSync<T>(string[] assetPaths, AssetBundle bundle) where T : Object;

/// <summary>
/// Load multiple assets synchronously by full paths.
/// 按完整路径同步批量加载资源。
/// </summary>
/// <param name="fullPaths">Full asset paths ignoring ProjectBasePath.<br/>忽略 ProjectBasePath 的完整资源路径数组。</param>
/// <param name="bundle">Source AssetBundle.<br/>源 AssetBundle。</param>
/// <typeparam name="T">Asset type.<br/>资源类型。</typeparam>
/// <returns>Loaded assets array.<br/>已加载的资源数组。</returns>
T[] LoadAssetsSyncFull<T>(string[] fullPaths, AssetBundle bundle) where T : Object;

/// <summary>
/// Load multiple assets asynchronously from a bundle.
/// 从资源包异步批量加载资源。
/// </summary>
/// <param name="assetPaths">Relative asset paths.<br/>相对资源路径数组。</param>
/// <param name="bundle">Source AssetBundle.<br/>源 AssetBundle。</param>
/// <param name="onMultiAssetLoaded">Completion callback.<br/>完成回调。</param>
/// <typeparam name="T">Asset type.<br/>资源类型。</typeparam>
/// <returns>Coroutine enumerator.<br/>协程枚举器。</returns>
IEnumerator LoadMulitAssetAsync<T>(string[] assetPaths, AssetBundle bundle, LoaderDelegate.OnMultiAssetLoaded<T> onMultiAssetLoaded)
    where T : Object;
```

+ 单个子资源资产加载（同步|异步）  

```csharp
/// <summary>
/// Load a single named sub-asset synchronously.
/// 同步加载指定名称的单个子资源。
/// </summary>
/// <param name="path">Parent asset path.<br/>父资源路径。</param>
/// <param name="subName">Sub-asset name.<br/>子资源名称。</param>
/// <param name="ab">Source AssetBundle.<br/>源 AssetBundle。</param>
/// <returns>The named sub-asset, or null if not found.<br/>命中的子资源，未找到时返回 null。</returns>
Object LoadSubAssetSync(string path, string subName, AssetBundle ab);

/// <summary>
/// Load a single named sub-asset of a given type synchronously.
/// 同步加载指定名称和类型的单个子资源。
/// </summary>
/// <param name="path">Parent asset path.<br/>父资源路径。</param>
/// <param name="subName">Sub-asset name.<br/>子资源名称。</param>
/// <param name="type">Sub-asset type filter.<br/>子资源类型过滤器。</param>
/// <param name="ab">Source AssetBundle.<br/>源 AssetBundle。</param>
/// <returns>The named sub-asset, or null if not found.<br/>命中的子资源，未找到时返回 null。</returns>
Object LoadSubAssetSync(string path, string subName, Type type, AssetBundle ab);

/// <summary>
/// Load a single named sub-asset of type T synchronously.
/// 同步加载指定名称、类型为 T 的单个子资源。
/// </summary>
/// <param name="path">Parent asset path.<br/>父资源路径。</param>
/// <param name="subName">Sub-asset name.<br/>子资源名称。</param>
/// <param name="ab">Source AssetBundle.<br/>源 AssetBundle。</param>
/// <typeparam name="T">Sub-asset type.<br/>子资源类型。</typeparam>
/// <returns>The named sub-asset, or null if not found.<br/>命中的子资源，未找到时返回 null。</returns>
T LoadSubAssetSync<T>(string path, string subName, AssetBundle ab) where T : Object;

/// <summary>
/// Load a single named sub-asset asynchronously.
/// 异步加载指定名称的单个子资源。
/// </summary>
/// <param name="assetPath">Parent asset path.<br/>父资源路径。</param>
/// <param name="subName">Sub-asset name.<br/>子资源名称。</param>
/// <param name="bundle">Source AssetBundle.<br/>源 AssetBundle。</param>
/// <param name="onAssetLoaded">Completion callback.<br/>完成回调。</param>
/// <typeparam name="T">Sub-asset type.<br/>子资源类型。</typeparam>
/// <returns>Coroutine enumerator.<br/>协程枚举器。</returns>
IEnumerator LoadSubAssetAsync<T>(string assetPath, string subName, AssetBundle bundle, LoaderDelegate.OnAssetLoaded<T> onAssetLoaded)
    where T : Object;
```

+ 批量子资源资产加载（同步|异步）  

```csharp
/// <summary>
/// Load all sub-assets at a path synchronously.
/// 同步加载路径下的全部子资源。
/// </summary>
/// <param name="path">Parent asset path.<br/>父资源路径。</param>
/// <param name="bundle">Source AssetBundle.<br/>源 AssetBundle。</param>
/// <returns>All sub-assets at the path.<br/>路径下的全部子资源。</returns>
Object[] LoadSubAssetsSync(string path, AssetBundle bundle);

/// <summary>
/// Load all sub-assets of a given type at a path synchronously.
/// 同步加载路径下指定类型的全部子资源。
/// </summary>
/// <param name="path">Parent asset path.<br/>父资源路径。</param>
/// <param name="type">Sub-asset type filter.<br/>子资源类型过滤器。</param>
/// <param name="bundle">Source AssetBundle.<br/>源 AssetBundle。</param>
/// <returns>Matching sub-assets.<br/>匹配的子资源。</returns>
Object[] LoadSubAssetsSync(string path, Type type, AssetBundle bundle);

/// <summary>
/// Load all sub-assets of type T at a path synchronously.
/// 同步加载路径下类型为 T 的全部子资源。
/// </summary>
/// <param name="path">Parent asset path.<br/>父资源路径。</param>
/// <param name="bundle">Source AssetBundle.<br/>源 AssetBundle。</param>
/// <typeparam name="T">Sub-asset type.<br/>子资源类型。</typeparam>
/// <returns>All sub-assets of type T.<br/>类型为 T 的全部子资源。</returns>
T[] LoadSubAssetsSync<T>(string path, AssetBundle bundle) where T : Object;

/// <summary>
/// Load multiple named sub-assets synchronously.
/// 同步批量加载多个指定名称的子资源。
/// </summary>
/// <param name="path">Parent asset path.<br/>父资源路径。</param>
/// <param name="subNames">Sub-asset names.<br/>子资源名称数组。</param>
/// <param name="bundle">Source AssetBundle.<br/>源 AssetBundle。</param>
/// <returns>Matched sub-assets in request order.<br/>按请求顺序返回的匹配子资源。</returns>
Object[] LoadSubAssetsSync(string path, string[] subNames, AssetBundle bundle);

/// <summary>
/// Load multiple named sub-assets of a given type synchronously.
/// 同步批量加载多个指定名称和类型的子资源。
/// </summary>
/// <param name="path">Parent asset path.<br/>父资源路径。</param>
/// <param name="subNames">Sub-asset names.<br/>子资源名称数组。</param>
/// <param name="type">Sub-asset type filter.<br/>子资源类型过滤器。</param>
/// <param name="ab">Source AssetBundle.<br/>源 AssetBundle。</param>
/// <returns>Matched sub-assets in request order.<br/>按请求顺序返回的匹配子资源。</returns>
Object[] LoadSubAssetsSync(string path, string[] subNames, Type type, AssetBundle ab);

/// <summary>
/// Load multiple named sub-assets of type T synchronously.
/// 同步批量加载多个指定名称、类型为 T 的子资源。
/// </summary>
/// <param name="path">Parent asset path.<br/>父资源路径。</param>
/// <param name="subNames">Sub-asset names.<br/>子资源名称数组。</param>
/// <param name="bundle">Source AssetBundle.<br/>源 AssetBundle。</param>
/// <typeparam name="T">Sub-asset type.<br/>子资源类型。</typeparam>
/// <returns>Matched sub-assets in request order.<br/>按请求顺序返回的匹配子资源。</returns>
T[] LoadSubAssetsSync<T>(string path, string[] subNames, AssetBundle bundle) where T : Object;

/// <summary>
/// Load all sub-assets at a path asynchronously.
/// 异步加载路径下的全部子资源。
/// </summary>
/// <param name="assetPath">Parent asset path.<br/>父资源路径。</param>
/// <param name="buundle">Source AssetBundle.<br/>源 AssetBundle。</param>
/// <param name="onAssetsLoaded">Completion callback.<br/>完成回调。</param>
/// <typeparam name="T">Sub-asset type.<br/>子资源类型。</typeparam>
/// <returns>Coroutine enumerator.<br/>协程枚举器。</returns>
IEnumerator LoadSubAssetsAsync<T>(string assetPath, AssetBundle buundle, LoaderDelegate.OnMultiAssetLoaded<T> onAssetsLoaded)
    where T : Object;
```

+ 更多用法请参考示例、API或源码。   

### <span id="2.3">2.3 示例
Assets/JLGames/RabbitDriverPro/Samples/Loader  
![image](assets/img/loader_8.png)  
