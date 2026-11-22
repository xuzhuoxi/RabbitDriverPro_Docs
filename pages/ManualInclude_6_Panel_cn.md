## <span id="6">6. 面板管理模块(PanelManager)
+ **JLGames.RabbitDriver.Actions.Layer** 提供了容器层级管理功能。
+ **JLGames.RabbitDriver.Games.PanelManager** 提供了面板管理功能。
+ 面板管理模块的使用流程： 注册 -> 展示 -> 关闭
+ 若要缓存面板不销毁，建议把面板移出屏幕外。 

### <span id="6.1">6.1 注册信息

#### <span id="6.1.1">6.1.1 注册层容器信息
```C#
PanelManagerShared.Manager.Register.RegisterLayer(containerName, 
  tranContainer, isDefault);
```
`RegisterLayer` 声明在 `IPanelRegister` 中：  

```csharp
/// <summary>
/// Register panel display layer.
/// 注册面板显示层容器。
/// </summary>
/// <param name="layerName">Layer name<br/>层名称</param>
/// <param name="layer">Layer transform<br/>层 Transform</param>
/// <param name="default">Whether this is the default layer<br/>是否为默认层</param>
void RegisterLayer(string layerName, Transform layer, bool @default = false);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Register/IPanelRegister.cs`。  
+ layerName: 为注册的层信息指定一个名称，与layer的name属性无关。
+ layer: 层的Transform组件引用.
+ default: 是否设置为默认，如果为true，当打开面板时不指定层名称，则选择默认层。

#### <span id="6.1.2">6.1.2 注册背景处理信息
```C#
PanelManagerShared.Manager.Register.RegisterBackground(backgroundKey, 
  backgroundOrigin, backgroundScript);
```
`RegisterBackground` 声明在 `IPanelRegister` 中：  

```csharp
/// <summary>
/// Register background meta prefab.
/// 注册背景元预制件。
/// </summary>
/// <param name="key">Background mapping key<br/>背景映射 Key</param>
/// <param name="origin">Background prefab<br/>背景预制件</param>
/// <param name="script">Background handler script name<br/>背景处理脚本名</param>
void RegisterBackground(string key, GameObject origin, string script);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Register/IPanelRegister.cs`。  
+ key: 为注册的背景信息指定一个key， 用于标识信息的唯一性。
+ origin: 背景的预制件, 当展示面板时, 克隆预制件添加到面板容器的最底层。
+ script: 处理背景逻辑的脚本组件的类名(包含命名空间)。

#### <span id="6.1.3">6.1.3 注册动画信息
```C#
PanelManagerShared.Manager.Register.RegisterAnimator(animKey, animAnimator);
```
`RegisterAnimator` 声明在 `IPanelRegister` 中：  

```csharp
/// <summary>
/// Register a runtime animator controller.
/// 注册运行时动画控制器。
/// </summary>
/// <param name="key">Animator mapping key<br/>动画映射 Key</param>
/// <param name="animator">Animator controller<br/>动画控制器</param>
void RegisterAnimator(string key, RuntimeAnimatorController animator);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Register/IPanelRegister.cs`。  
+ key: 为注册的动画信息指定一个Key， 用于标识信息的唯一性。
+ animator: 动画RuntimeAnimatorController组件。

#### <span id="6.1.4">6.1.4 设置面板的基础容器
```C#
PanelManagerShared.Manager.Register.RegisterPanelContainer(container);
```
`RegisterPanelContainer` 声明在 `IPanelRegister` 中：  

```csharp
/// <summary>
/// Register panel instance meta container prefab.
/// 注册面板实例元容器预制件。
/// </summary>
/// <param name="container">Container prefab<br/>容器预制件</param>
void RegisterPanelContainer(GameObject container);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Register/IPanelRegister.cs`。  
+ container: 面板容器的预制件，当展示面板时, 克隆预制件作为面板根节点添加到展示层中, 面板的实际内容任务子节点添加到面板容器中。

#### <span id="6.1.5">6.1.5 注册面板信息
```C#
PanelManagerShared.Manager.Register.RegisterPanelInfo(panelId,
  settings, maxDisplayNum, extendType);
```
`RegisterPanelInfo` 声明在 `IPanelRegister` 中：  

```csharp
/// <summary>
/// Register panel info.
/// 注册面板信息。
/// </summary>
/// <param name="info">Panel definition<br/>面板定义</param>
void RegisterPanelInfo(IPanelInfo info);

/// <summary>
/// Register panel info with bundle and asset path.
/// 使用 Bundle 与资源路径注册面板信息。
/// </summary>
/// <param name="id">Panel id<br/>面板 Id</param>
/// <param name="bundleName">AssetBundle name<br/>AssetBundle 名称</param>
/// <param name="assetPath">Asset path<br/>资源路径</param>
void RegisterPanelInfo(string id, string bundleName, string assetPath);

/// <summary>
/// Register panel info with full settings.
/// 使用完整配置注册面板信息。
/// </summary>
/// <param name="id">Panel id<br/>面板 Id</param>
/// <param name="settings">Panel settings<br/>面板配置</param>
/// <param name="maxDisplayNum">Max simultaneous display count<br/>最大同时显示数量</param>
/// <param name="extendType">Business extend type<br/>业务扩展面板类型</param>
void RegisterPanelInfo(string id, IPanelSettings settings, int maxDisplayNum, int extendType);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Register/IPanelRegister.cs`。  
+ 面板信息最终以IPanelInfo的实例保存起来用于查找与展示。
+ 项目使用时，应该读取项目面板的配置信息，并注册进来。

#### <span id="6.1.6">6.1.6 使用PanelManagerRegister组件，可以同时处理层容器、背景、动画以及面板信息的注册功能
![image](assets/img/panel_1.png)  

#### <span id="6.1.7">6.1.7 注意
**背景注册** 和 **动画注册** **非必要**，当面板信息中有关联要求时才注册。  

### <span id="6.2">6.2 展示面板

#### <span id="6.2.1">6.2.1 通过面板id弹出面板, 可选择指定面板层容器。
```C#
PanelManagerShared.Manager.ShowPanel(panelId);
```
`ShowPanel` 声明在 `IPanelManager` 中：  

```csharp
/// <summary>
/// Show a panel.
/// 打开面板
/// </summary>
/// <param name="panelId">Panel Id<br/>面板的配置Id</param>
/// <param name="layerName">The container layer name corresponding to the panel to be displayed<br/>展示时指定的容器名称</param>
/// <returns>Opened panel instance, or null if failed<br/>已打开的面板实例，失败时为 null</returns>
IPanelInstance ShowPanel(string panelId, string layerName = null);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Manager/IPanelManager.cs`。  

#### <span id="6.2.2">6.2.2 通过面板id弹出面板, 并传入参数对象, 可选择指定面板层容器。
```C#
PanelManagerShared.Manager.ShowPanel(panelId, panelParams);
```
`ShowPanel` 声明在 `IPanelManager` 中：  

```csharp
/// <summary>
/// Show a panel.
/// 打开面板。
/// </summary>
/// <param name="panelId">Panel Id<br/>面板的配置 Id</param>
/// <param name="params">Parameters injected into IParamsPanel<br/>展示时 IParamsPanel 注入的参数对象</param>
/// <param name="layerName">The container layer name corresponding to the panel to be displayed<br/>展示时指定的容器名称</param>
/// <returns>Opened panel instance, or null if failed<br/>已打开的面板实例，失败时为 null</returns>
IPanelInstance ShowPanel(string panelId, object @params, string layerName = null);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Manager/IPanelManager.cs`。  

### <span id="6.3">6.3 关闭面板

#### <span id="6.3.1">6.3.1 通过面板id关闭面板。 
可通过面板id，选择关闭默认的、关闭最先展示的、关闭最后展示的。声明在 `IPanelManager` 中：  

```csharp
/// <summary>
/// Close panel by panel id
/// 关闭面板
/// </summary>
/// <param name="panelId">Panel configuration id<br/>面板的配置 Id</param>
void ClosePanel(string panelId);

/// <summary>
/// Close the first opened panel by panel id.
/// 按面板 Id 关闭最先打开的面板。
/// </summary>
/// <param name="panelId">Panel configuration id<br/>面板的配置 Id</param>
void CloseFirstPanel(string panelId);

/// <summary>
/// Close the last opened panel by panel id.
/// 按面板 Id 关闭最后打开的面板。
/// </summary>
/// <param name="panelId">Panel configuration id<br/>面板的配置 Id</param>
void CloseLastPanel(string panelId);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Manager/IPanelManager.cs`。   

#### <span id="6.3.2">6.3.2 通过实例信息关闭面板。
通过提供面板实例Id(instanceId)、显示视图(view)、面板实例(IPanelInstance)，精确关闭面板。`CloseInstacnePanel` 声明在 `IPanelManager` 中：  

```csharp
/// <summary>
/// Close the panel by instance id.
/// 按实例 Id 关闭面板。
/// </summary>
/// <param name="instanceId">Panel instance id<br/>面板的实例 Id</param>
void CloseInstacnePanel(string instanceId);

/// <summary>
/// Close the panel by view instance.
/// 按显示视图关闭面板。
/// </summary>
/// <param name="view">Panel display view<br/>面板显示视图</param>
void CloseInstacnePanel(GameObject view);

/// <summary>
/// Close the panel by instance.
/// 按实例对象关闭面板。
/// </summary>
/// <param name="instance">Panel instance<br/>面板的实例对象</param>
void CloseInstacnePanel(IPanelInstance instance);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Manager/IPanelManager.cs`。  

#### <span id="6.3.3">6.3.3 批量关闭面板。
可选择关闭全部展示中的面板、关闭指定面板id的全部面板、关闭符合匹配函数的面板。`ClosePanels` 声明在 `IPanelManager` 中：  

```csharp
/// <summary>
/// Close all displayed panels
/// 关闭全部显示的面板
/// </summary>
void ClosePanels();

/// <summary>
/// Close all displayed panels by panel id.
/// 按面板 Id 关闭所有已显示的面板。
/// </summary>
/// <param name="panelId">Panel configuration id<br/>面板的配置 Id</param>
void ClosePanels(string panelId);

/// <summary>
/// Close displayed panels that match the predicate.
/// 关闭满足条件的所有已显示面板。
/// </summary>
/// <param name="match">Predicate to match panel instances<br/>用于匹配面板实例的谓词</param>
void ClosePanels(Predicate<IPanelInstance> match);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Manager/IPanelManager.cs`。  

### <span id="6.4">6.4 高级应用

#### <span id="6.4.1">6.4.1 自定义注册器
IPanelManager中的注册器可自定义，只要实现IPanelRegister接口即可。`SetRegister` 声明在 `IPanelManager` 中：  

```csharp
/// <summary>
/// Set panel register.
/// 设置注册表。
/// </summary>
/// <param name="register">Panel register instance<br/>面板注册表实例</param>
void SetRegister(IPanelRegister register);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Manager/IPanelManager.cs`。  

#### <span id="6.4.2">6.4.2 自定义加载器
IPanelManager中的加载器可自定义，只要实现IPanelLoaderAdapter接口即可。`SetLoader` 声明在 `IPanelManager` 中：  

```csharp
/// <summary>
/// Set asset loader adapter.
/// 设置加载器。
/// </summary>
/// <param name="loader">Panel asset loader adapter<br/>面板资源加载器适配器</param>
void SetLoader(IPanelLoaderAdapter loader);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Manager/IPanelManager.cs`。  

#### <span id="6.4.3">6.4.3 设置面板展示时机
IPanelManger中的SetShowMoment可以设置面板展示时机(立即展示|帧结束展示)。`SetShowMoment` 声明在 `IPanelManager` 中：  

```csharp
/// <summary>
/// Set show moment.
/// 设置显示时机。
/// </summary>
/// <param name="showAfterFrame">Whether to show at end of frame<br/>是否在帧结束时显示</param>
void SetShowMoment(bool showAfterFrame);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Manager/IPanelManager.cs`。  
+ 立即展示
  代码执行时，马上进行加载处理。当资源准备完成后立即添加面板到显示节点。  
+ 帧结束展示
  代码执行时，马上进行加载处理。当资源准备完成后，开启协程，等待WaitForEndOfFrame后添加面板到显示节点。  

#### <span id="6.4.4">6.4.4 IPanelSettings说明
IPanelSettings实例为面板注册时保存的面板配置信息接口，包含资源配置、背景配置和动画配置。  

##### 6.4.4.1 资源配置
IPanelAssetSettings实例  
主要配置属性：BundleName、AssetPath、MainScriptName、MainScriptParams。声明在 `IPanelAssetSettings` 中：  

```csharp
/// <summary>
/// AssetBundle name.
/// AssetBundle 名称。
/// </summary>
string BundleName { get; }

/// <summary>
/// Asset path within the bundle.
/// 资源路径。
/// </summary>
string AssetPath { get; }

/// <summary>
/// Main script full type name.
/// 主脚本完整类名。
/// </summary>
string MainScriptName { get; }

/// <summary>
/// JSON or string params injected into the main script.
/// 主脚本注入的参数字符串。
/// </summary>
string MainScriptParams { get; }
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Settings/IPanelAssetSettings.cs`。  
+ BundleName
  面板资源所在的Assetbundle的名称  
+ AssetPath
  面板资源处于Assetbundle中的路径  
+ MainScriptName
  面板如果有主脚本， 则返回主脚本的完整类名(包含命名空间)。  
  没有主脚本则返回null或空字符串。  
+ MainScriptParams
  当MainScriptName存在实现IParamsPanel接口时生效，为函数SetPanelStringParams的传入参数。  

##### 6.4.4.2 背景配置
IPanelBackgroundSettings实例  

+ 基础参数
  + OriginKey
    背景信息注册时指定的key  
  + OriginInfo
    通过背景信息注册时指定的key，查找出注册信息，取其中的origin预制件。  
  + Mode
    背景模式支持四种：None、Color、Image、Screenshot  
    + None
    依赖系数：无  
    + Color
    依赖系数：Color  
    + Image
    依赖系数：ImageSprite、ImageBundle、ImagePath、BlurFactor  
    + Screenshot
    依赖系数：ScreenshotFactor  
+ 模式相关参数
  + Color [Mode=Color时生效]
    背景颜色值, 用于设置背景颜色值  
  + ImageSprite [Mode=Image时生效]
    两种情况：ImageSprite不为空、ImageSprite为空。  
    + ImageSprite不为空
      忽略ImageBundle和ImagePath参数，使用ImageSprite填充。  
    + ImageSprite为空
      通过Register中的加载器，使用ImageBundle和ImagePath加载Sprite填充。  
  + ImageBundle和ImagePath [Mode=Image时生效]
    当ImageSprite为空时使用，用回加载Sprite资源。  
  + BlurFactor [Mode=Image时生效]
    模糊系数：[0,1]  
  + ScreenshotFactor [Mode=Screenshot时生效]
    截屏图像模糊系数  

##### 6.4.4.3 动画配置
IPanelAnimSettings实例。`OpenKey`、`OpenState`、`CloseKey`、`CloseState` 声明在 `IPanelAnimSettings` 中：  

```csharp
/// <summary>
/// Open animator mapping key.
/// 展示时动画控制器映射 Key。
/// </summary>
string OpenKey { get; }

/// <summary>
/// Animation state name for open animator.
/// 展示时指定的动画 State。
/// </summary>
string OpenState { get; }

/// <summary>
/// Close animator mapping key.
/// 关闭时动画控制器映射 Key。
/// </summary>
string CloseKey { get; }

/// <summary>
/// Animation state name for close animator.
/// 关闭时指定的动画 State。
/// </summary>
string CloseState { get; }
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Settings/IPanelAnimSettings.cs`。  
+ OpenKey
  动画信息注册时使用的key, 用于查找动画  
+ OpenState
  动画Animator中的状态名称，用于播放指定动画  
+ CloseKey
  动画信息注册时使用的key, 用于查找动画  
+ CloseState
  动画Animator中的状态名称，用于播放指定动画  

#### <span id="6.4.5">6.4.5 面板功能扩展
现阶段有4个接口与面板功能扩展相关：  
IInitPanel、IParamsPanel、IRefreshPanel、IDisposePanel  
**注意**：IShowPanel、IClosePanel已**弃用**。  
+ IInitPanel
  用于面板初始化，调用时机在OnEnable之后。声明如下：  

```csharp
/// <summary>
/// Show panel execution timing: Awake > OnEnable > IShowPanel > IInitPanel > IParamsPanel > IRefreshPanel > Start
/// 展示面板执行时机：Awake > OnEnable > IShowPanel > IInitPanel > IParamsPanel > IRefreshPanel > Start
/// </summary>
public interface IInitPanel
{
    /// <summary>
    /// Initialize panel when shown.
    /// 面板展示时执行初始化。
    /// </summary>
    /// <param name="instance">Panel instance<br/>面板实例</param>
    void InitPanel(IPanelInstance instance);
}
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Extend/IInitPanel.cs`。  
+ IParamsPanel
  用于面板注入参数。声明如下：  

```csharp
/// <summary>
/// Show panel execution timing: Awake > OnEnable > IShowPanel > IInitPanel > IParamsPanel > IRefreshPanel > Start
/// 展示面板执行时机：Awake > OnEnable > IShowPanel > IInitPanel > IParamsPanel > IRefreshPanel > Start
/// </summary>
public interface IParamsPanel
{
    /// <summary>
    /// Set panel parameters from a string.
    /// 使用字符串设置面板参数。
    /// </summary>
    /// <param name="instance">Panel instance<br/>面板实例</param>
    /// <param name="str">Parameter string (e.g. JSON)<br/>参数字符串（如 JSON）</param>
    void SetPanelStringParams(IPanelInstance instance, string str);

    /// <summary>
    /// Set panel parameters from an object.
    /// 使用对象设置面板参数。
    /// </summary>
    /// <param name="instance">Panel instance<br/>面板实例</param>
    /// <param name="params">Parameter object<br/>参数对象</param>
    void SetPanelObjectParams(IPanelInstance instance, object @params);
}
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Extend/IParamsPanel.cs`。  
  
  + SetPanelObjectParams 
    当调用ShowPanel时传入参数后被触发调用。  
  + SetPanelStringParams
    触发要求为同时具备以下两个条件：  
    1. 调用ShowPanel时没有传入参数。
    2. 注册面板信息时IPanelAssetSettings配置中MainScriptParams不为空。 传入参数为MainScriptParams的值。

+ IRefreshPanel
  用于面板刷新逻辑不适合放在Start或Awake中时使用。声明如下：  

```csharp
/// <summary>
/// Show panel execution timing: Awake > OnEnable > IShowPanel > IInitPanel > IParamsPanel > IRefreshPanel > Start
/// 展示面板执行时机：Awake > OnEnable > IShowPanel > IInitPanel > IParamsPanel > IRefreshPanel > Start
/// </summary>
public interface IRefreshPanel
{
    /// <summary>
    /// Refresh panel display when shown.
    /// 面板展示时刷新显示。
    /// </summary>
    /// <param name="instance">Panel instance<br/>面板实例</param>
    void RefreshPanel(IPanelInstance instance);
}
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Extend/IRefreshPanel.cs`。  
+ IDisposePanel
  当面板即将被销毁前调用，用于执行释放行为。声明如下：  

```csharp
/// <summary>
/// Remove panel execution timing: IDisposePanel > IClosePanel > OnDisable > OnDestroy 
/// 移除面板执行时机：IDisposePanel > IClosePanel > OnDisable > OnDestroy
/// </summary>
public interface IDisposePanel
{
    /// <summary>
    /// Dispose panel resources when closing.
    /// 面板关闭时执行释放处理。
    /// </summary>
    /// <param name="instance">Panel instance<br/>面板实例</param>
    void DisposePanel(IPanelInstance instance);
}
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Extend/IDisposePanel.cs`。  

### <span id="6.5">6.5 示例
Assets/JLGames/RabbitDriverPro/Samples/Panel  
![image](assets/img/panel_20.png)  