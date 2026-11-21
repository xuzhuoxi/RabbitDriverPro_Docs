# Start

### Overview
This user guide gives RabbitDriver Pro users a basic overview of the tool, its features, and how to use it.  

### Installation
1. After downloading RabbitDriver Pro from the Unity Asset Store, go to: "Assets->Import Package->Custom Package...". 
2. In the Import Assets window, find and select the RabbitDriver Pro UnityPackage file. 
3. After Unity shows the Import Package window, make sure the items you need are selected, then click Import at the bottom right. 
4. Plugin files are under `Assets/JLGames/RabbitDriverPro`. The framework implementation is provided as precompiled DLLs under `Assets/Plugins/JLGames/`. 

You can also import only the parts you need.  

### Support
To see the main features quickly, open the samples in `Assets/JLGames/RabbitDriverPro/Samples`.  

For design notes and module details, see the [online help](https://www.xuzhuoxi.com/RabbitDriverPro_Docs).  

If you cannot find what you need, please [file an issue](https://github.com/xuzhuoxi/RabbitDriverPro_Docs/issues/new) (or open a pull request) and describe what happened.  

Or contact the author: xuzhuoxi@gmail.com or mailxuzhuoxi@163.com  

# Features
RabbitDriver Pro keeps plugin files and precompiled framework DLLs separate.  

+ `Assets/Plugins/JLGames/RabbitDriver-Core.dll` is the framework runtime. Its namespace is **JLGames.RabbitDriver**. The readable source is in the sibling repository `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/`.  
+ `Assets/Plugins/JLGames/RabbitDriver-CoreEditor.dll` is the framework editor extension. Its namespace is **JLGames.RabbitDriverEditor**.  
+ `Assets/Plugins/JLGames/Infra-CSharp.dll` and `RabbitClient.dll` are side dependencies. Event primitives live in **JLGames.Infra.Event**, and service primitives live in **JLGames.Infra.Service**. The source for these two DLLs is not in the RabbitDriver-Core repository.  
+ `Assets/JLGames/RabbitDriverPro` is the plugin folder. Its namespace is **JLGames.RabbitDriverPro**. It holds editor menus, a thin runtime extension, and samples. Loader, Panel, and Audio are not implemented here.  

## Feature overview

### Framework runtime Actions
Namespace: **JLGames.RabbitDriver.Actions**. Folder: `RabbitDriver-Core/JLGames/RabbitDriver/Actions/`.  

+ Animatorx  
+ AssetIndex  
+ Audio  
  Audio management. See [5.Audio Manager(AudioManager)](Manual_5.Audio_en.html#5).  
+ Component  
+ Component2D  
+ DateTimex  
+ ExcelExporter  
  Support for data exported by [ExcelExporter](https://github.com/xuzhuoxi/ExcelExporter).  
+ Graphicsx  
+ i18n  
  Internationalization. See [3.Internationalization System(i18n)](Manual_3.i18n_en.html#3). The plugin also provides `I18NTMPText` when `TMP_PRESENT` is defined.  
+ Jsonx  
+ Languages  
  + Lua: Lua support on Unity. See [9. Lua Interpreter](Manual_9.Lua_en.html#9).  
+ Layer  
  Display layers, used with panel management. See [6.Panel Manager(PanelManager)](Manual_6.Panel_en.html#6).  
+ Loaderx  
  Resource loading. See [2.Loader System(Loader)](Manual_2.Loader_en.html#2).  
+ Localx  
+ Page  
+ Pool  
+ Service  
  Serializable service-node data. See [7.Service Framework(Service)](Manual_7.Service_en.html#7).  
+ UIElements  
+ Utils  
+ Wait  

### Framework runtime Games
Namespace: **JLGames.RabbitDriver.Games**. Folder: `RabbitDriver-Core/JLGames/RabbitDriver/Games/`.  

+ LocalAccount  
  Local accounts.  
+ NetManager  
  Connection-instance registry, plus a virtual server and client for use without a real network. The entry point is `NetManager.Shared`. See [4.Net Manager(NetManager)](Manual_4.Net_en.html#4).  
+ PanelManager  
  Panel management. The entry point is `PanelManagerShared.Manager`. See [6.Panel Manager(PanelManager)](Manual_6.Panel_en.html#6).  
+ RpgMaterial  
  Game material data. See [8.Rpg Material Data System(RpgMaterial)](Manual_8.RpgMaterial_en.html#8).  
+ Service  
  Shared services such as preload and config data. See [7.Service Framework(Service)](Manual_7.Service_en.html#7).  
+ Tiledx  
+ TipsManager  

### RabbitNetwork
Namespace: **JLGames.RabbitDriver.RabbitNetwork**. `RabbitNetworkManager` is the networking component placed in a scene. The sample is `Assets/JLGames/RabbitDriverPro/Samples/RabbitNetwork`.  

### Plugin folder
`Assets/JLGames/RabbitDriverPro`  

+ Editor  
  Menu prefix: `Tools/RabbitDriverPro/`. Uncommented entries include Getting Started, Help, Project (`Gen LoaderSettings`, `Gen I18NSettings`, `Gen AudioSettings`), Tools, Settings, and Macros.  
+ Runtime  
  A thin extension. `I18NTMPText` is in `Runtime/Extend/i18n/Component/` and compiles only when `TMP_PRESENT` is defined.  
+ Samples  
  Module samples. Each manual chapter ends with the matching `Samples/<module>` path.  

# Common modules
