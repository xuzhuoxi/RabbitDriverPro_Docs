## <span id="6">6. Panel Manager (PanelManager)
+ **JLGames.RabbitDriver.Actions.Layer** provides container level management.
+ **JLGames.RabbitDriver.Games.PanelManager** provides panel management functions.
+ The usage process of the panel management module: registration -> display -> close
+ If the cached panel is not destroyed, it is recommended to move the panel off the screen.

### <span id="6.1">6.1 Registration Information

#### <span id="6.1.1">6.1.1 Registration layer container information
````C#
PanelManagerShared.Manager.Register.RegisterLayer(containerName, 
  tranContainer, isDefault);
````
`RegisterLayer` is declared on `IPanelRegister`:  

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

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Register/IPanelRegister.cs`.  
+ layerName: Specify a name for the registered layer information, regardless of the layer's name attribute.
+ layer: The Transform component reference of the layer.
+ default: Whether to set to default, if true, when opening the panel without specifying a layer name, the default layer is selected.

#### <span id="6.1.2">6.1.2 Registering background processing information
````C#
PanelManagerShared.Manager.Register.RegisterBackground(backgroundKey, 
  backgroundOrigin, backgroundScript);
````
`RegisterBackground` is declared on `IPanelRegister`:  

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

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Register/IPanelRegister.cs`.  
+ key: Specify a key for the registered background information to identify the uniqueness of the information.
+ origin: The prefab for the background, when the panel is shown, the cloned prefab is added to the bottommost layer of the panel container.
+ script: The class name (including namespace) of the script component that handles the background logic.

#### <span id="6.1.3">6.1.3 Register animation information
````C#
PanelManagerShared.Manager.Register.RegisterAnimator(animKey, animAnimator);
````
`RegisterAnimator` is declared on `IPanelRegister`:  

```csharp
/// <summary>
/// Register a runtime animator controller.
/// 注册运行时动画控制器。
/// </summary>
/// <param name="key">Animator mapping key<br/>动画映射 Key</param>
/// <param name="animator">Animator controller<br/>动画控制器</param>
void RegisterAnimator(string key, RuntimeAnimatorController animator);
```

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Register/IPanelRegister.cs`.  
+ key: Specify a Key for the registered animation information, which is used to identify the uniqueness of the information.
+ animator: Animate the RuntimeAnimatorController component.

#### <span id="6.1.4">6.1.4 Setting the base container for the panel
````C#
PanelManagerShared.Manager.Register.RegisterPanelContainer(container);
````
`RegisterPanelContainer` is declared on `IPanelRegister`:  

```csharp
/// <summary>
/// Register panel instance meta container prefab.
/// 注册面板实例元容器预制件。
/// </summary>
/// <param name="container">Container prefab<br/>容器预制件</param>
void RegisterPanelContainer(GameObject container);
```

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Register/IPanelRegister.cs`.  
+ container: The prefab of the panel container. When the panel is displayed, the cloned prefab is added to the display layer as the panel root node, and the actual content task child node of the panel is added to the panel container.

#### <span id="6.1.5">6.1.5 Registration panel information
````C#
PanelManagerShared.Manager.Register.RegisterPanelInfo(panelId,
  settings, maxDisplayNum, extendType);
````
`RegisterPanelInfo` is declared on `IPanelRegister`:  

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

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Register/IPanelRegister.cs`.  
+ Panel information is finally saved as an instance of IPanelInfo for search and display.
+ When the project is used, the configuration information of the project panel should be read and registered.

#### <span id="6.1.6">6.1.6 Using the PanelManagerRegister component, you can handle the registration function of layer container, background, animation and panel information at the same time
![image](assets/img/panel_1.png)  

#### <span id="6.1.7">6.1.7 Note
**Background registration** and **Animation registration** **optional**, only register when there are relevant requirements in the panel information.  

### <span id="6.2">6.2 Display Panel

#### <span id="6.2.1">6.2.1 To pop up a panel by panel id, you can select the specified panel layer container.
````C#
PanelManagerShared.Manager.ShowPanel(panelId);
````
`ShowPanel` is declared on `IPanelManager`:  

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

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Manager/IPanelManager.cs`.  

#### <span id="6.2.2">6.2.2 Pop up the panel through the panel id, and pass in the parameter object, you can choose to specify the panel layer container.
````C#
PanelManagerShared.Manager.ShowPanel(panelId, panelParams);
````
`ShowPanel` is declared on `IPanelManager`:  

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

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Manager/IPanelManager.cs`.  

### <span id="6.3">6.3 Close Panel

#### <span id="6.3.1">6.3.1 Close the panel by the panel id. 
You can choose to close the default, close the first display, and close the last display through the panel id. Declared on `IPanelManager`:  

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

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Manager/IPanelManager.cs`.  

#### <span id="6.3.2">6.3.2 Close the panel through instance information. 
Close the panel accurately by providing the panel instance Id (instanceId), display view (view), and panel instance (IPanelInstance). `CloseInstacnePanel` is declared on `IPanelManager`:  

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

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Manager/IPanelManager.cs`.  

#### <span id="6.3.3">6.3.3 Close panels in batches. 
You can choose to close all displayed panels, close all panels with a specified panel id, or close panels that match the matching function. `ClosePanels` is declared on `IPanelManager`:  

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

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Manager/IPanelManager.cs`.  

### <span id="6.4">6.4 Advanced Applications

#### <span id="6.4.1">6.4.1 Custom Registrar
The registrar in IPanelManager can be customized, as long as the IPanelRegister interface is implemented. `SetRegister` is declared on `IPanelManager`:  

```csharp
/// <summary>
/// Set panel register.
/// 设置注册表。
/// </summary>
/// <param name="register">Panel register instance<br/>面板注册表实例</param>
void SetRegister(IPanelRegister register);
```

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Manager/IPanelManager.cs`.  

#### <span id="6.4.2">6.4.2 Custom Loaders
The loader in IPanelManager can be customized, as long as the IPanelLoaderAdapter interface is implemented. `SetLoader` is declared on `IPanelManager`:  

```csharp
/// <summary>
/// Set asset loader adapter.
/// 设置加载器。
/// </summary>
/// <param name="loader">Panel asset loader adapter<br/>面板资源加载器适配器</param>
void SetLoader(IPanelLoaderAdapter loader);
```

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Manager/IPanelManager.cs`.  

#### <span id="6.4.3">6.4.3 Set panel display timing
SetShowMoment in IPanelManger can set the panel display timing (immediate display | frame end display). `SetShowMoment` is declared on `IPanelManager`:  

```csharp
/// <summary>
/// Set show moment.
/// 设置显示时机。
/// </summary>
/// <param name="showAfterFrame">Whether to show at end of frame<br/>是否在帧结束时显示</param>
void SetShowMoment(bool showAfterFrame);
```

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games/PanelManager/Manager/IPanelManager.cs`.  
+ show immediately
  When the code is executed, the loading process is performed immediately. Add panels to the display node as soon as the asset is ready.
+ end of frame display
  When the code is executed, the loading process is performed immediately. When the resource preparation is complete, start the coroutine, wait for WaitForEndOfFrame, and add the panel to the display node.

#### <span id="6.4.4">6.4.4 IPanelSettings Description
The IPanelSettings instance is the interface of the panel configuration information saved when the panel is registered, including resource configuration, background configuration and animation configuration.  

##### 6.4.4.1 Resource Configuration
IPanelAssetSettings instance  
Main configuration properties: BundleName, AssetPath, MainScriptName, MainScriptParams  
![image](assets/img/panel_17.png)  
+ BundleName
  The name of the Assetbundle where the panel assets are located
+ AssetPath
  The path of the panel asset in the Assetbundle
+ MainScriptName
  If the panel has a main script, the full class name (including namespace) of the main script is returned.
  Returns null or an empty string without a main script.
  +MainScriptParams
  It takes effect when MainScriptName exists and implements the IParamsPanel interface, and is the incoming parameter of the function SetPanelStringParams.

##### 6.4.4.2 Background configuration
IPanelBackgroundSettings instance  

+ basic parameters
  + OriginKey
    The key specified when the background information is registered  
  + OriginInfo
    Find out the registration information through the key specified during the registration of the background information, and take the origin prefab.  
  + Mode
    Four background modes are supported: None, Color, Image, Screenshot  
    + None
    Dependency coefficient: none  
    + Color
    Dependency coefficient: Color  
    + Image
    Dependencies: ImageSprite, ImageBundle, ImagePath, BlurFactor  
    + Screenshot
    Dependency factor: ScreenshotFactor  
+ Mode related parameters
  + Color [Valid when Mode=Color]
    background color value, used to set the background color value  
  + ImageSprite [Valid when Mode=Image]
    Two cases: ImageSprite is not empty, ImageSprite is empty.  
    + ImageSprite is not empty
      Ignore ImageBundle and ImagePath parameters, use ImageSprite to fill.  
    + ImageSprite is empty
      Through the loader in Register, use ImageBundle and ImagePath to load Sprite fills.  
  + ImageBundle and ImagePath [effective when Mode=Image]
    Used when the ImageSprite is empty, to load the Sprite resource.  
  + BlurFactor [Valid when Mode=Image]
    Blur factor: [0,1]  
  + ScreenshotFactor [Valid when Mode=Screenshot]
    Screenshot image blur factor  

##### 6.4.4.3 Animation Configuration
IPanelAnimSettings instance  
![image](assets/img/panel_19.png)  
+ OpenKey
  The key used when animation information is registered, used to find animations  
+ OpenState
  The state name in the animation Animator, used to play the specified animation  
+ CloseKey
  The key used when animation information is registered, used to find animations  
+ CloseState
  The state name in the animation Animator, used to play the specified animation  

#### <span id="6.4.5">6.4.5 Panel function extension
At this stage, there are 4 interfaces related to panel function expansion:  
IInitPanel, IParamsPanel, IRefreshPanel, IDisposePanel  
**NOTE**: IShowPanel, IClosePanel are **deprecated**.  
+ IInitPanel
  Used for panel initialization, the call timing is after OnEnable  
  ![image](assets/img/panel_9.png)  
  +IParamsPanel
  Used for panel injection parameters.  
  ![image](assets/img/panel_10.png)  
  
  + SetPanelObjectParams
    Triggered when calling ShowPanel with parameters passed in.  
  + SetPanelStringParams
    Triggering requires both of the following conditions:  
    1. No parameters were passed when calling ShowPanel.
    2. When registering panel information, MainScriptParams in IPanelAssetSettings configuration is not empty. The incoming parameter is the value of MainScriptParams.

+ IRefreshPanel
  Used when the panel refresh logic is not suitable for use in Start or Awake.  
  ![image](assets/img/panel_11.png)  
+ IDisposePanel
  Called when the panel is about to be destroyed to perform the release behavior.  
  ![image](assets/img/panel_12.png)  

### <span id="6.5">6.5 Example
Assets/JLGames/RabbitDriverPro/Samples/Panel  
![image](assets/img/panel_20.png)  