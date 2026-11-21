# 开始

### 概述
本用户指南旨在为 RabbitDriver Pro 用户提供关于工具的基本概述、功能和用法。  

### 安装
1. 从 Unity 的 Asset Store 下载 RabbitDriver Pro 后，请转到：“Assets->Import Package->Custom Package...”。 
2. 在“导入资产”窗口中，查找并选择 RabbitDriver Pro 的 UnityPackage 文件。 
3. 在“导入软件包”窗口中出现 Unity 之后，请验证所有项目选择导入，然后单击窗口右下方的导入按钮。
4. 插件文件位于 `Assets/JLGames/RabbitDriverPro`。框架实现以 `Assets/Plugins/JLGames/` 下的预编译 DLL 提供。 

您也可以选择所需的部分进行导入。  

### 支持
如果您想快速了解 RabbitDriver Pro 中的重要功能，可以直接参考 `Assets/JLGames/RabbitDriverPro/Samples` 中的示例。  

如果您想详细了解各功能模块的设计思路和细节, 您可以在[在线帮助](https://www.xuzhuoxi.com/RabbitDriverPro_Docs)中找到更多信息和常见问题解答。  

如果您无法找到需要的信息，请 [file an issue](https://github.com/xuzhuoxi/RabbitDriverPro_Docs/issues/new)（或者提交一个 pull request）来描述一下你的遭遇。  

或者联系作者：xuzhuoxi@gmail.com 或 mailxuzhuoxi@163.com  

# 功能
RabbitDriver Pro 的代码分开放在插件目录和预编译 DLL 中。  

+ `Assets/Plugins/JLGames/RabbitDriver-Core.dll` 是框架运行时，命名空间 **JLGames.RabbitDriver**。可读源码在并列仓库 `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/`。  
+ `Assets/Plugins/JLGames/RabbitDriver-CoreEditor.dll` 是框架编辑器扩展，命名空间 **JLGames.RabbitDriverEditor**。  
+ `Assets/Plugins/JLGames/Infra-CSharp.dll` 与 `RabbitClient.dll` 是旁路依赖。事件基础类型在 **JLGames.Infra.Event**，服务基础类型在 **JLGames.Infra.Service**。这两个 DLL 的源码不在 RabbitDriver-Core 仓库里。  
+ `Assets/JLGames/RabbitDriverPro` 是插件目录，命名空间 **JLGames.RabbitDriverPro**。这里放编辑器菜单、少量运行时扩展和示例，不包含 Loader、Panel、Audio 的实现。  

## 功能概述

### 框架运行时 Actions
命名空间为 **JLGames.RabbitDriver.Actions**。目录：`RabbitDriver-Core/JLGames/RabbitDriver/Actions/`。  

+ Animatorx  
+ AssetIndex  
+ Audio  
  音频管理。详细请看[5.音频管理模块(AudioManager)](Manual_5.Audio_cn.html#5)。  
+ Component  
+ Component2D  
+ DateTimex  
+ ExcelExporter  
  对第三方导表工具 [ExcelExporter](https://github.com/xuzhuoxi/ExcelExporter) 导出数据的支持。  
+ Graphicsx  
+ i18n  
  国际化。详细请看[3.国际化(i18n)](Manual_3.i18n_cn.html#3)。插件在定义 `TMP_PRESENT` 时另外提供 `I18NTMPText`。  
+ Jsonx  
+ Languages  
  + Lua：Unity 上的 Lua 支持。详细请看[9. Lua解释器](Manual_9.Lua_cn.html#9)。  
+ Layer  
  显示层级。与面板管理一起使用，见[6.面板管理模块(PanelManager)](Manual_6.Panel_cn.html#6)。  
+ Loaderx  
  资源加载。详细请看[2.加载管理模块(Loader)](Manual_2.Loader_cn.html#2)。  
+ Localx  
+ Page  
+ Pool  
+ Service  
  可序列化的服务节点数据。服务框架见[7.服务框架(Service)](Manual_7.Service_cn.html#7)。  
+ UIElements  
+ Utils  
+ Wait  

### 框架运行时 Games
命名空间为 **JLGames.RabbitDriver.Games**。目录：`RabbitDriver-Core/JLGames/RabbitDriver/Games/`。  

+ LocalAccount  
  本地账号。  
+ NetManager  
  连接实例登记，以及无真实网络时的虚拟服务端 / 客户端。入口是 `NetManager.Shared`。详细请看[4.网络管理扩展模块(NetManager)](Manual_4.Net_cn.html#4)。  
+ PanelManager  
  面板管理。入口是 `PanelManagerShared.Manager`。详细请看[6.面板管理模块(PanelManager)](Manual_6.Panel_cn.html#6)。  
+ RpgMaterial  
  游戏材料数据。详细请看[8.Rpg材料数据系统(RpgMaterial)](Manual_8.RpgMaterial_cn.html#8)。  
+ Service  
  预加载与配置数据等常用服务。详细请看[7.服务框架(Service)](Manual_7.Service_cn.html#7)。  
+ Tiledx  
+ TipsManager  

### RabbitNetwork
命名空间为 **JLGames.RabbitDriver.RabbitNetwork**。`RabbitNetworkManager` 是挂到场景上的联机组件。示例在 `Assets/JLGames/RabbitDriverPro/Samples/RabbitNetwork`。  

### 插件目录
`Assets/JLGames/RabbitDriverPro`  

+ Editor  
  菜单前缀是 `Tools/RabbitDriverPro/`。未注释的入口包括 Getting Started、Help、Project（含 `Gen LoaderSettings`、`Gen I18NSettings`、`Gen AudioSettings`）、Tools、Settings、Macros。  
+ Runtime  
  薄扩展。`I18NTMPText` 位于 `Runtime/Extend/i18n/Component/`，仅在定义 `TMP_PRESENT` 时编译。  
+ Samples  
  各模块示例。手册各章末尾给出对应的 `Samples/<模块>` 路径。  

# 常用功能模块
