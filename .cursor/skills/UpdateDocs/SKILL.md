---
name: UpdateDocs
description: >-
  [RabbitDriverPro_Docs]: 根据并列仓库 RabbitDriver-Core 的 C# 源码，以及 RabbitDriverPro_UnityDev 的插件源码和
  Samples 示例，更新 RabbitDriverPro_Docs 的 pages、_data，以及根目录 index.md、index_en.md。
  在用户要求更新文档站、用户手册、阅读手册、更新日志、导航文案、i18n YAML，
  或点名 UpdateDocs 时使用。
disable-model-invocation: true
---

# UpdateDocs

把文档站 `pages/` 与 `_data/` 更新到与当前源码一致。默认是**合并更新**：保留章节骨架、截图和仍正确的句子，替换与源码冲突的产品名、路径、命名空间、菜单、API 和版本。

三个仓库并列。文档站内用相对路径指源码，不要写磁盘绝对路径：

| 仓库 | 从文档站出发 |
|------|----------------|
| 文档站（只改 `pages/`、`_data/`、根目录 `index.md` / `index_en.md`） | `.` |
| 框架源码 | `../RabbitDriver-Core` |
| Unity 工程、插件源码、示例 | `../RabbitDriverPro_UnityDev` |
| Infra 基础库（事件、服务等接口声明） | `../Infra-CSharp` |
| Rabbit 客户端库 | `../RabbitClient-CSharp` |

## 执行流程

1. 确认用户范围。未指定章节时，按「章节对照」逐章核对，只改有冲突的文件
2. 先读身份文件（见 [reference.md](reference.md)），再读该章对应的源码与示例。没有打开过的文件，不要写成事实
3. 读文档站里这一章的中英 Include，以及 `_data/i18n_zh-CN.yaml`、`_data/i18n_en-US.yaml` 里对应条目
4. 只改与源码不一致的句子。截图引用、章节编号、`page_id`、导航 `id` 保持不变，除非源码已经没有该模块
5. 中文改完，同一事实同步到英文 Include 和英文 YAML
6. 用文末清单自检。回复里列出改过的文件，以及发现但未改的范围外问题

### 生成模式

| 模式 | 触发语示例 | 做法 |
|------|------------|------|
| **合并更新**（默认） | 「更新文档」「按源码改手册」 | 保留结构与仍正确的段落；替换冲突句 |
| 增量更新 | 「只改 Loader」「只改更新日志」 | 只动点名的章节及其 YAML 文案 |
| 完全重写 | 「重写某一章」「放弃现有表述」 | 该章 Include 按源码重写；壳页面、截图路径、导航 `id` 仍保留 |

未说明模式时按合并更新。完全重写只作用于用户点名的章节，不要顺手重写全站。

## 写入范围

| 路径 | 做什么 |
|------|--------|
| `pages/*Include*.md` | 正文。阅读手册、更新日志、手册各章、关于、FAQ、第三方说明都在这里 |
| `pages/Manual_*.md`、`pages/Home_*.md` | 壳。front matter + `include_relative`。只在 `title`、`page_id`、`lang` 或被包含文件名必须变化时改 |
| `_data/i18n_zh-CN.yaml`、`_data/i18n_en-US.yaml` | 导航文案、手册目录标题、联系表单文案。两份的键树必须一致 |
| `index.md`、`index_en.md` | 站点首页。产品名与 `package.json` 的 `displayName` 一致，中英事实同步。下载链接用 `downloads/` 里的实际文件名。不要改 `layout`、`page_id`、`lang` |

不要改这些，除非用户在同一次要求里点名：

- `_config.yml`、`_layouts/`、`_includes/`、`_sass/`、`assets/`
- `_data/i18n.babel`（BabelEdit 工程元数据，站点运行时不读它）
- `../RabbitDriver-Core` 与 `../RabbitDriverPro_UnityDev` 里的任何文件

`Home_Manual_*.md` 和 `Manual_Full_*.md` 用 Liquid 遍历 `manual.nav`。新增或隐藏章节时改 YAML 的 `show` / `include` / `pattern`，不要在这两个壳里手写目录。

## 文档站怎么对应源码

壳页面只负责语言和 `page_id`。读者看到的段落在 Include 里。导航、上一节 / 下一节、全量手册拼接读 YAML：

- `page.lang` 为 `zh-CN` 或 `en-US` 时，`_includes/i18ntext.html` 载入 `i18n_<lang>.yaml`
- 手册壳的 `page_id` 必须等于该章 `manual.nav[].id`
- `manual.nav[].include` 必须是 `pages/` 下真实存在的 Include 文件名
- `manual.nav[].pattern` 必须对应该壳页面的输出路径（`pages/Manual_1.Event_cn.html` 这类）
- `show: 'no'` 的章节不进目录、不分页导航、不进全量手册。`manual.others` 目前就是这样，且没有 `ManualInclude_99_Others_*.md`。不要把 `show` 改成 `yes`，除非同时补上中英 Include

章节和源码目录的对照、身份文件、已知过期写法见 [reference.md](reference.md)。

## 事实优先级

同一件事冲突时，采用更靠前的来源：

1. 这次打开过的、会参与编译的 `.cs`（类体被整段注释则不算）
2. `../RabbitDriverPro_UnityDev/Assets/JLGames/RabbitDriverPro/package.json` 的 `displayName`、`name`、`version`、`unity`
3. `../RabbitDriverPro_UnityDev/ProjectSettings/ProjectVersion.txt` 的 `m_EditorVersion`
4. 示例脚本实际调用的类型与菜单里未注释的 `[MenuItem]`
5. `Guide_*.md`、`CHANGELOG_*.md`、`Remarks_*.md`、`ARCHITECTURE_*.md` 里与上面不冲突的句子
6. 文档站现有段落

`Guide_*.md` 和旧 Include 里的版本号、`RocketDriver` 路径、`Tools/RocketDriver` 菜单，只要和 1～4 冲突就不要保留。

### 源码在哪

- 框架运行时：`../RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/`，命名空间 `JLGames.RabbitDriver`
- 框架编辑器：`../RabbitDriver-Core/RabbitDriver-CoreEditor/`，命名空间 `JLGames.RabbitDriverEditor`
- Unity 工程里的 `Assets/Plugins/JLGames/RabbitDriver-Core.dll` 与 `RabbitDriver-CoreEditor.dll` 是上述源码的编译结果。写到其中类型时去 Core 仓库打开 `.cs`，文档里用相对路径链到该文件
- 插件自身 `.cs` 在 `../RabbitDriverPro_UnityDev/Assets/JLGames/RabbitDriverPro/`，命名空间 `JLGames.RabbitDriverPro`。这里没有 Loader、Panel、Audio 的实现
- 示例在该目录的 `Samples/<模块>/`
- `JLGames.Infra.*` 的声明打开 `../Infra-CSharp` 里的 `.cs`。`RabbitClient` 的声明打开 `../RabbitClient-CSharp`。按下一节「接口声明」摘录，不贴方法体

### 版本与链接

- 正文里的插件版本写 `package.json` 的 `version`。打开工程的编辑器版本写 `m_EditorVersion`。`package.json` 的 `unity` 是包的最低 Unity 版本，两个都要读，不要写死
- 关于页若使用 `{{ site.version }}` / `{{ site.build }}`，保持 Liquid，不要改成写死数字。`_config.yml` 里的 `version`、`build`、`title`、`home.url` 不在本 skill 写入范围；发现过期时在回复里单独列出
- 指向本站的链接继续用 `_config.yml` 的 `home.url`、`github.issues_url`、`unity.package_url`。不要改成 `package.json` 的 `documentationUrl`。两套 URL 不一致时只报告，不改配置

## 中英同步

- 每个改过的 `*_cn.md` 都有对应的 `*_en.md`，章节编号与事实一致，英文是翻译而不是留空
- YAML 只改 `text` 等读者可见字符串时，两边一起改。不要单边增删键
- 导航 `id` 中英共用（如 `manual.loader`）。不要为了措辞去改 `id`
- 类型名、菜单路径、文件名、命名空间两边都保持英文原文

## 接口声明

手册某一小节在介绍一组公开函数时，按事件章 `ManualInclude_1_Event_*.md` 的写法补全。中英两页使用同一段代码。

1. 打开声明这些函数的接口文件。函数在基接口上时，写明「`IEventDispatcher` 继承 `IEventListener`」，声明块仍取自真正写出该函数的文件
2. 只放这一小节对应的重载，不把整个接口贴进来
3. 签名与源码一致，包含默认参数。源码里的 `/// <summary>` 与 `/// <param>` 原样复制，中英两行都留
4. 代码块用 `csharp`。块后写来源，路径从该仓库根目录算，例如 `Infra-CSharp/JLGames/Infra/Event/IEventListener.cs`
5. 属性与这一小节的函数写在同一块里，例如 `IThreadEventDispatcher.IsNullContext`
6. 保留该小节已有的截图。不编造注释，不从实现类反推接口没有的重载
7. 类体整段被注释的类型不要写成声明来源

## 写法

- 简体中文。术语保留源码中的英文名
- 产品显示名用 `package.json` 的 `displayName`（撰写时为 RabbitDriver Pro）。目录、程序集、命名空间用 `RabbitDriverPro` / `JLGames.RabbitDriver` / `JLGames.RabbitDriverPro`，不要写回 RocketDriver
- 菜单只写未注释的 `[MenuItem]` 字符串，例如 `Tools/RabbitDriverPro/Project/Gen LoaderSettings`
- 代码示例只调用本次读过的公开 API，并注明源文件相对路径。Core 运行时示例遵守 C# 7.3
- 保留仍然存在的 `assets/img/...` 截图。不要新造图片路径，也不要因为周围句子改了就删图
- 安装路径写 `Assets/JLGames/RabbitDriverPro`。不要写 `Assets/JLGames/RocketDriver`，也不要写 `Runtime/CSharp` 这套旧目录，除非本次在仓库里看到该目录

## 禁止

- 不改 Core、UnityDev、主题布局、`_config.yml`
- 不把注释掉的类型写成功能。`Actions/ThreadEvent` 里的类型体是注释；`MainThread` 不要写成已提供的多线程事件系统。是否编译以文件内容与 csproj 为准，每次重新确认
- 不把 `Games/NetManager` 写成 http/udp/quic/ws 协议全家桶。它是连接登记和虚拟网络。联机组件在 `RabbitNetwork`
- 不把 `Assets/JLGames/RabbitDriverPro/Runtime` 写成 Loader / Panel / Audio 的实现位置
- 不把注释掉的 `[MenuItem]` 写成可用菜单
- 不把 `RabbitDriverPro-Private` 写成用户手册里的功能
- 不把 Core 的 `notes/release` 写进插件更新日志。更新日志以 UnityDev 的 `CHANGELOG_CN.md` / `CHANGELOG_EN.md` 为准
- 不编造截图、UPM 包安装步骤、NuGet、不存在的示例场景
- 不留下「待补充」或只改了中文的章节

## 交叉验证

- [ ] 每个被改写的 API、菜单、路径都能在这次打开的文件里对上
- [ ] 中英 Include 都已更新，编号一致
- [ ] `i18n_zh-CN.yaml` 与 `i18n_en-US.yaml` 键树一致；改过的 `text` 两边都改了
- [ ] `manual.nav[].include` 指向的文件存在；`page_id` 与 `id` 一致
- [ ] `show: 'yes'` 的章节都有中英 Include
- [ ] 正文中的产品名、命名空间、菜单不再使用 RocketDriver（历史更新日志里描述当年改名的句子可以保留）
- [ ] `index.md` 与 `index_en.md` 的产品名与 `displayName` 一致
- [ ] 插件版本来自 `package.json`，没有沿用 Include 或 Guide 里的旧版本
- [ ] 未改 `_config.yml`、布局、资源、两个源码仓库
- [ ] 接口声明与打开过的 `.cs` 一致，含 XML 注释；中英代码块相同，并写了来源路径
- [ ] 未把 ThreadEvent、MainThread 写成可用特性

## 附加资源

章节对照、身份文件、YAML 字段：[reference.md](reference.md)
