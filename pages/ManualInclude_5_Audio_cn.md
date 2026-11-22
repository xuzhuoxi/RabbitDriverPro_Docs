## <span id="5">5. 音频管理模块(AudioManager) 
完善的音频管理模块，支持场景与UI的音乐音效同时，去除Assetbundle的依赖。  

+ **JLGames.RabbitDriver.Actions.Audio** 提供了音频管理全部的功能支持。
+ 音频的加载使用默认的加载器(Loader)，同时也支持自定义的加载器。
+ 采用Ico方式注入音频资源信息。
+ 无须直接引用音频资源，实现了资源使用与资源打包的分离。  
+ 支持缓存设置，减少加载消耗。

### <span id="5.1">5.1 初始化

#### <span id="5.1.1">5.1.1 生成配置资产
执行菜单 “Tools/RabbitDriverPro/Project/Gen AudioSettings”。  
在项目Assets/Resources下会生成 AudioSettings.asset(可重命名) 文件。  
![image](assets/img/audio_2.png)  
+ SysSettings为系统级别的设置，用户无法修改。
+ UserSettings为用户级别的设置，开放AP修改。I

#### <span id="5.1.2">5.1.2 设置管理物件
复制 `Assets/JLGames/RabbitDriverPro/Assets/AudioManager/Prefabs/AudioManager.prefab` 到项目初始化场景中，并重新关联 AudioSettings.asset  
![image](assets/img/audio_1.png)  
+ Dont Destroy OnLoad 场景销毁时是否保存物件
+ Music Register Infos 音乐信息预处理注册表
+ Sound Register Infos 音效信息预处理注册表

#### <span id="5.1.3">5.1.3 设置音频加载器：
```C#
AudioManagerPool.Shared.SetLoaderAdapter(new AudioLoader());
```
如果要必要自定义加载， 实现IAudioLoader接口即可。  

### <span id="5.2">5.2 使用 

#### <span id="5.2.1">5.2.1 注册音频信息(可选)
可以在脚本中使用AudioManager函数注册音频信息。`RegisterMusic`、`ClearMusicRegister` 声明在 `IAudioManager` 中：  

```csharp
/// <summary>
/// Register music resource info.
/// 注册音乐资源信息。
/// </summary>
/// <param name="key">Audio key.<br/>音频标识。</param>
/// <param name="bundleName">Bundle name.<br/>Bundle 名称。</param>
/// <param name="path">Asset path.<br/>资源路径。</param>
void RegisterMusic(string key, string bundleName, string path);

/// <summary>
/// Clear the music register table.
/// 清理音乐注册表。
/// </summary>
void ClearMusicRegister();
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Audio/IAudioManager.cs`。  
`RegisterSound`、`ClearSoundRegister` 声明在 `IAudioManager` 中：  

```csharp
/// <summary>
/// Register sound resource info.
/// 注册音效资源信息。
/// </summary>
/// <param name="key">Audio key.<br/>音频标识。</param>
/// <param name="bundleName">Bundle name.<br/>Bundle 名称。</param>
/// <param name="path">Asset path.<br/>资源路径。</param>
void RegisterSound(string key, string bundleName, string path);

/// <summary>
/// Clear the sound register table.
/// 清理音效注册表。
/// </summary>
void ClearSoundRegister();
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Audio/IAudioManager.cs`。  

#### <span id="5.2.2">5.2.2 播放音乐、播放音效
+ AudioManger中以SwitchMusic开头的函数为播放音乐提供支持。
+ AudioManager中以PlaySound开头的函数为播放音效提供支持。
+ 音乐音效的播放支持**不注册**直接播放。

#### <span id="5.2.3">5.2.3 音频设置
+ AudioManager 支持音乐静音与音量设置。`PlayingMusicName`、`SetMusicVolume` 声明在 `IAudioManager` 中：  

```csharp
/// <summary>
/// Name of the currently playing music.
/// 当前播放中的音乐名称。
/// </summary>
string PlayingMusicName { get; }

/// <summary>
/// Set music volume.
/// 设置音乐音量。
/// </summary>
/// <param name="volume">Volume in range [0, 1].<br/>音量，范围 [0, 1]。</param>
/// <param name="refresh">Whether to apply immediately.<br/>是否立即生效。</param>
void SetMusicVolume(float volume, bool refresh = true);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Audio/IAudioManager.cs`。  
+ AudioManager 支持音效静音与音量设置。`SetSoundVolume`、`SetSoundMuted` 声明在 `IAudioManager` 中：  

```csharp
/// <summary>
/// Set sound effect volume.
/// 设置音效音量。
/// </summary>
/// <param name="volume">Volume in range [0, 1].<br/>音量，范围 [0, 1]。</param>
/// <param name="refresh">Whether to apply immediately.<br/>是否立即生效。</param>
void SetSoundVolume(float volume, bool refresh = true);

/// <summary>
/// Set sound effect mute state.
/// 设置音效静音。
/// </summary>
/// <param name="muted">Muted state.<br/>是否静音。</param>
/// <param name="refresh">Whether to apply immediately.<br/>是否立即生效。</param>
void SetSoundMuted(bool muted, bool refresh = true);
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Audio/IAudioManager.cs`。  

#### <span id="5.2.4">5.2.4 建议包装组件进行使用，如：
示例中的AudioDemoMusicNode、AudioDemoSoundNode组件。  

#### <span id="5.3">5.3 示例
Assets/JLGames/RabbitDriverPro/Samples/Audio  
![image](assets/img/audio_5.png)  