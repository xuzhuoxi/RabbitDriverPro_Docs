# UpdateDocs 对照

给 `UpdateDocs` 用。每次更新前先读「身份文件」，再按用户点名的章节读「章节对照」那一行的源码。表里的路径是起点，不是允许停在目录名上。

路径从 `RabbitDriverPro_Docs` 出发。

## 身份文件

生成任何版本文句之前读取：

| 文件 | 从中取 |
|------|--------|
| `../RabbitDriverPro_UnityDev/Assets/JLGames/RabbitDriverPro/package.json` | `displayName`、`name`、`version`、`unity`、`description` |
| `../RabbitDriverPro_UnityDev/ProjectSettings/ProjectVersion.txt` | `m_EditorVersion` |
| `../RabbitDriverPro_UnityDev/Assets/JLGames/RabbitDriverPro/Guide_CN.md` 与 `Guide_EN.md` | 阅读手册底稿。与 package.json / 源码冲突的句子丢掉 |
| `../RabbitDriverPro_UnityDev/Assets/JLGames/RabbitDriverPro/CHANGELOG_CN.md` 与 `CHANGELOG_EN.md` | 插件更新日志正文 |
| `../RabbitDriverPro_UnityDev/Assets/JLGames/RabbitDriverPro/Remarks_CN.md` 与 `Remarks_EN.md` | 第三方说明 |
| `../RabbitDriverPro_UnityDev/Assets/JLGames/RabbitDriverPro/LICENSE.md` | 关于页的许可证事实 |
| `../RabbitDriver-Core/RabbitDriver-Core/RabbitDriver-Core.csproj` | 运行时是否仍为 `netstandard2.0`、`LangVersion` 7.3；排除编译的条目 |
| `_config.yml` | 站内链接用的 `home.url`、`github.issues_url`、`unity.package_url`。本 skill 不改这个文件 |

插件菜单实现在：

`../RabbitDriverPro_UnityDev/Assets/JLGames/RabbitDriverPro/Editor/MenuItems/`

只采用未注释的 `[MenuItem]`。框架编辑器能力在 `../RabbitDriver-Core/RabbitDriver-CoreEditor/`，命名空间 `JLGames.RabbitDriverEditor`。

## 页面分层

| 读者看到的 | 壳（少改） | 正文（主要改这里） |
|------------|------------|--------------------|
| 阅读手册 | `pages/Home_README_cn.md`、`_en.md` | `pages/HomeInclude_README_*.md` |
| 更新日志 | `pages/Home_CHANGELOG_*.md` | `pages/HomeInclude_CHANGELOG_*.md` |
| 第三方说明 | `pages/Home_ThirdPartyNotices_*.md` | `pages/HomeInclude_ThirdPartyNotices_*.md` |
| 关于 | `pages/Home_About_*.md` | `pages/HomeInclude_About_*.md` |
| 常见问题 | `pages/Home_FAQs_*.md` | `pages/HomeInclude_FAQs_*.md` |
| 手册目录 | `pages/Home_Manual_*.md` | 目录项来自 YAML，不要在壳里抄一份 |
| 手册某一章 | `pages/Manual_<n>.<Name>_cn.md` 与 `_en.md` | `pages/ManualInclude_<n>_<Name>_*.md` |
| 手册开篇 | 被 `Home_Manual` 与 `Manual_Full` 包含 | `pages/ManualInclude_Head_*.md` |
| 全量手册 | `pages/Manual_Full_*.md` | 由 `manual.nav` 中 `show: yes` 的 Include 拼成 |

`pages/Home_Contact_*.md` 的表单文案在 `_data` 的 `contact:` 下，不在 Include 里。

## 章节对照

手册章的框架实现在 Core，调用示例在 UnityDev `Samples/`。插件工程里没有这些模块的方法体。

| 导航 id | Include | Core 源码（先读） | UnityDev 示例与菜单 |
|---------|---------|-------------------|---------------------|
| `manual.event` | `ManualInclude_1_Event_*.md` | 事件核心不在 Core。示例使用 `JLGames.Infra.Event`。`Actions/ThreadEvent` 类型体为注释，不要写成多线程实现 | `Samples/Event/` |
| `manual.loader` | `ManualInclude_2_Loader_*.md` | `RabbitDriver-Core/JLGames/RabbitDriver/Actions/Loaderx/`，入口 `Loader` | `Samples/Loader/`；菜单 `Tools/RabbitDriverPro/Project/Gen LoaderSettings` |
| `manual.i18n` | `ManualInclude_3_i18n_*.md` | `Actions/i18n/` | `Samples/i18n/`；菜单 `Gen I18NSettings`。`I18NTMPText` 在插件 Runtime，且受 `TMP_PRESENT` 约束 |
| `manual.net` | `ManualInclude_4_Net_*.md` | `Games/NetManager/` 是连接登记与虚拟网络。联机组件在 `RabbitNetwork/` | `Samples/NetManager/`、`Samples/RabbitNetwork/` |
| `manual.audio` | `ManualInclude_5_Audio_*.md` | `Actions/Audio/`。跳过名为 Delete 的废弃目录 | `Samples/Audio/` |
| `manual.panel` | `ManualInclude_6_Panel_*.md` | `Games/PanelManager/`。对外入口是 `PanelManagerShared`，不要教用户 `new` internal 实现类 | `Samples/Panel/` |
| `manual.service` | `ManualInclude_7_Service_*.md` | `Actions/Service/`、`Games/Service/` | `Samples/Service/` |
| `manual.material` | `ManualInclude_8_RpgMaterial_*.md` | `Games/RpgMaterial/` | `Samples/RpgMaterial/` |
| `manual.lua` | `ManualInclude_9_Lua_*.md` | `Actions/Languages/Lua/` | `Samples/Lua/` |

开篇 `ManualInclude_Head_*.md` 描述的是整仓布局，不是某一章。按下面的现行布局重写过期的 `Runtime/CSharp`、`JLGames.RocketDriver` 段落：

| 位置 | 文档里应怎么说 |
|------|----------------|
| `../RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions` | Unity 相关能力，命名空间 `JLGames.RabbitDriver.Actions` |
| `../RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Games` | 游戏侧通用系统，命名空间 `JLGames.RabbitDriver.Games` |
| `../RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/RabbitNetwork` | Rabbit 客户端的 Unity 组件 |
| `Assets/Plugins/JLGames/*.dll` | 放进 Unity 工程的编译结果。RabbitDriver 两个 DLL 的可读源码在 Core；Infra 与 RabbitClient 没有放在这两个仓库里的源码 |
| `Assets/JLGames/RabbitDriverPro` | 插件目录：薄 Runtime、Editor 菜单、Samples |
| `Assets/JLGames/RabbitDriverPro/Samples` | 手册「示例」小节的路径 |

`Samples/` 下还有 Animation、Archive、AssetIndex、EditorAsset、Layer、LocalAccount、Other、ToolBin 等目录。现有手册没有对应章时，不要自行加章。用户点名某示例时，再补 Include，并同时加中英壳页面和两边 YAML。

首页阅读手册：以 `Guide_*.md` 为底稿写入 `HomeInclude_README_*.md`，但版本、Unity 版本、目录、菜单以身份文件和源码为准。站内链接仍用 `_config.yml`。

更新日志：把 `CHANGELOG_*.md` 同步进 `HomeInclude_CHANGELOG_*.md`，保留文档站按版本分段的写法。不要并入 Core `notes/release`。

## YAML

`_data/i18n_zh-CN.yaml` 与 `_data/i18n_en-US.yaml`：

| 键 | 作用 |
|----|------|
| `home.nav[]` | 顶栏。`id` 对应壳页面 `page_id`，`pattern` 为输出 html，`text` 为标签 |
| `home.title` / `home.description` | 标题与简介。名称与 package.json 的 `displayName` 一致 |
| `manual.nav[]` | 手册目录、上下节、全量手册。`include` 为 Include 文件名，`pattern` 为壳页面 html |
| `manual.catalog_pattern` | 目录页 |
| `contact` | 联系表单标签 |

约束：

- 中英键结构相同，`id` 相同
- 改章节标题时，Include 的 `##` 标题与 `manual.nav[].text` 一起改，编号保持 `1.` 起连续
- 不改 `id`。页面、Liquid、上一节下一节都靠它
- `show` 只用 `'yes'` / `'no'` 这种已有写法
- 不重排无关条目，不改动未失效的文案

## 现有正文里的过期写法

以下是文档站里已经对不上源码的模式。合并更新时遇到就改，不要把它们当作现行结构：

| 旧写法 | 现行 |
|--------|------|
| RocketDriver Pro（产品名，历史改名记录除外） | `package.json` 的 `displayName` |
| `JLGames.RocketDriver.*` | `JLGames.RabbitDriver.*`；插件自身代码是 `JLGames.RabbitDriverPro` |
| `JLGames/RocketDriver/Runtime/CSharp` 及 `JLGames.RocketDriver.CSharp` | 不在 Core 运行时树里。事件等基础类型以示例的 `using` 为准（事件示例为 `JLGames.Infra.Event`） |
| `Assets/JLGames/RocketDriver` | `Assets/JLGames/RabbitDriverPro` |
| `Tools/RocketDriver/...` | `Tools/RabbitDriverPro/...`（以 MenuItem 原文为准） |
| `Actions.Loader` 作为加载器命名空间 | 目录是 `Actions/Loaderx`，命名空间以该目录 `.cs` 的 `namespace` 为准 |
| ThreadEvent / 多线程事件模块作为已实现特性 | 类型被注释，不要写入功能列表 |

历史更新日志中「本版本把名字从 RocketDriver 改为 RabbitDriver」这类句子保留，它们记录的是当时的变更。
