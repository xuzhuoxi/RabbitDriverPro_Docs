## <span id="9">9. Lua Interpreter
+ Introduce a lightweight open source Lua interpreter: LuaInterpreter.  
+ Function extensions and optimizations to make it work better in Unity.  

### <span id="9.1">9.1 Library Description

#### <span id="9.1.1">9.1.1 Information Description
+ Name: **Lua Interpreter**  
+ Author: **Liu Junfeng**  
+ URL: http://www.codeproject.com/Articles/228212/Lua-Interpreter  
+ License: **MIT** (http://opensource.org/licenses/mit-license.php)  

#### <span id="9.1.2">9.1.2 Modification Description
1. Removed WinFrom related code logic.  
2. Function extension of LuaTable class.  
3. Added several functions related to LuaValue.  
4. Add Unity to use the packaging class Lua, which is also a common function entry.  

### <span id="9.2">9.2 Use

#### <span id="9.2.1">9.2.1 Execute Lua script in C#
1. Call the `Lua.RunLuaRaw` function, or directly execute the Lua script. If there is a return value, get the return value.  
`RunLuaRaw` is declared on `Lua`:  

```csharp
/// <summary>
/// Execute Lua script code
/// 执行Lua脚本代码
/// </summary>
/// <param name="luaCode"></param>
/// <param name="allowExceptions"></param>
/// <returns></returns>
public static LuaValue RunLuaRaw(string luaCode, bool allowExceptions = false)
```

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Languages/Lua/LuaInterpreterWrapper/Lua.cs`.  
2. Call the `Lua.RunLua` function to execute Lua scripts. And the wrapper class LuaResult is returned for the return value.  
`RunLua` is declared on `Lua`:  

```csharp
/// <summary>
/// Execute Lua script code
/// 执行Lua脚本代码
/// </summary>
/// <param name="luaCode"></param>
/// <param name="allowExceptions"></param>
/// <returns></returns>
public static LuaResult RunLua(string luaCode, bool allowExceptions = false)
```

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Languages/Lua/LuaInterpreterWrapper/Lua.cs`.  
3. Call the `Lua.IsTrue` function to directly judge the Lua logical expression and obtain the resulting Boolean value.  
`IsTrue` is declared on `Lua`:  

```csharp
/// <summary>
/// Check if conditional expression is true
/// 判断条件表达式是否为真
/// </summary>
/// <param name="luaCondition"></param>
/// <param name="allowExceptions"></param>
/// <returns></returns>
public static bool IsTrue(string luaCondition, bool allowExceptions = false)
```

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Languages/Lua/LuaInterpreterWrapper/Lua.cs`.  

#### <span id="9.2.2">9.2.2 Call C# function in Lua
1. First, the C# function needs to be registered in the Lua interpreter environment. We can use the `Lua.RegisterFunction` function to execute the registration logic.  
`RegisterFunction` is declared on `Lua`:  

```csharp
/// <summary>
/// Register functions to the Lua interpreter environment
/// 注册函数到Lua解释器环境
/// Only bool, string and double types are supported for function parameters
/// 函数参数只支持bool、string、double三种类型
/// </summary>
/// <param name="funcName"></param>
/// <param name="target"></param>
/// <param name="method"></param>
public static void RegisterFunction(string funcName, object target, MethodInfo method)
```

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Languages/Lua/LuaInterpreterWrapper/Lua.cs`.  
2. In the Lua script, use the registered funcName to call the registered function.  
3. If the same funcName is used repeatedly for registration, it will be overwritten.  
4. Use the `Lua.UnregisterFunction` function to unregister the behavior.  
`UnregisterFunction` is declared on `Lua`:  

```csharp
/// <summary>
/// Cancel the function registered in the Lua interpreter
/// 取消Lua解释器中注册的函数
/// </summary>
/// <param name="funcName"></param>
public static void UnregisterFunction(string funcName)
```

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Languages/Lua/LuaInterpreterWrapper/Lua.cs`.  

#### <span id="9.2.3">9.2.3 Restart Lua Interpreter
1. Use the `Lua.Restart` function to reset the Lua interpreter, which will clear all contexts.  
`Restart` is declared on `Lua`:  

```csharp
/// <summary>
/// Restart the Lua interpreter
/// 重启Lua解释器
/// </summary>
public static void Restart()
```

Source: `RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Languages/Lua/LuaInterpreterWrapper/Lua.cs`.  

### <span id="9.3">9.3 Examples
Assets/JLGames/RabbitDriverPro/Samples/Lua  
![image](assets/img/Lua_1.png)  