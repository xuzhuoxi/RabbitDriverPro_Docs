## <span id="5">5. Audio Manager (AudioManager)
The perfect audio management module supports scene and UI music sound effects, and removes the dependency of Assetbundle.  

+ **JLGames.RabbitDriver.Actions.Audio** provides full functional support for audio management.
+ Audio loading uses the default loader (Loader), but also supports custom loader.
+ Use Ico method to inject audio resource information.
+ There is no need to directly reference audio resources, which realizes the separation of resource usage and resource packaging.
+ Support cache settings to reduce loading consumption.

### <span id="5.1">5.1 Initialization

#### <span id="5.1.1">5.1.1 Generate configuration assets
Execute menu "Tools/RabbitDriverPro/Project/Gen AudioSettings".  
The AudioSettings.asset (renameable) file will be generated under the project Assets/Resources.  
![image](assets/img/audio_2.png)  
+ SysSettings are system-level settings and cannot be modified by users.
+ UserSettings are user-level settings, open to AP modification. I

#### <span id="5.1.2">5.1.2 Setting up management objects
Copy `Assets/JLGames/RabbitDriverPro/Assets/AudioManager/Prefabs/AudioManager.prefab` into the project initialization scene, and re-associate AudioSettings.asset  
![image](assets/img/audio_1.png)  
+ Dont Destroy OnLoad whether to save the object when the scene is destroyed
+ Music Register Infos Music information preprocessing registry
+ Sound Register Infos Sound effect information preprocessing registry

#### <span id="5.1.3">5.1.3 Set the audio loader:
````C#
AudioManagerPool.Shared.SetLoaderAdapter(new AudioLoader());
````
If you need to customize the loading, you can implement the IAudioLoader interface.  

### <span id="5.2">5.2 Use

#### <span id="5.2.1">5.2.1 Register audio information (optional)
Audio information can be registered in the script using the AudioManager function. `RegisterMusic` and `ClearMusicRegister` are declared on `IAudioManager`:  

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

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Audio/IAudioManager.cs`.  
`RegisterSound` and `ClearSoundRegister` are declared on `IAudioManager`:  

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

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Audio/IAudioManager.cs`.  

#### <span id="5.2.2">5.2.2 Play music, play sound effects
+ Functions starting with SwitchMusic in AudioManger provide support for playing music.
+ Functions starting with PlaySound in AudioManager provide support for playing sound effects.
+ The playback of music sound effects supports direct playback without registration.

#### <span id="5.2.3">5.2.3 Audio Settings
+ AudioManager supports music mute and volume settings. `PlayingMusicName` and `SetMusicVolume` are declared on `IAudioManager`:  

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

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Audio/IAudioManager.cs`.  
+ AudioManager supports audio mute and volume settings. `SetSoundVolume` and `SetSoundMuted` are declared on `IAudioManager`:  

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

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Audio/IAudioManager.cs`.  

#### <span id="5.2.4">5.2.4 It is recommended to use packaged components, such as:
AudioDemoMusicNode and AudioDemoSoundNode components in the example.  

#### <span id="5.3">5.3 Example
Assets/JLGames/RabbitDriverPro/Samples/Audio  
![image](assets/img/audio_5.png)  