## <span id="9">9. Lua脚本解释器
+ 引入轻量级的开源Lua解释器：LuaInterpreter。  
+ 进行了功能扩展和优化，使之在Unity中能更好地工作。  

### <span id="9.1">9.1 库说明

#### <span id="9.1.1">9.1.1信息说明
+ 库名称: **Lua Interpreter**  
+ 作者: **Liu Junfeng**  
+ URL: http://www.codeproject.com/Articles/228212/Lua-Interpreter  
+ License: **MIT** (http://opensource.org/licenses/mit-license.php)  

#### <span id="9.1.2">9.1.2修改说明
1. 去除了WinFrom相关代码逻辑。  
2. 对LuaTable类进行的函数扩展。  
3. 增加了多个针对LuaValue相关的函数处理。  
4. 增加Unity使用包装类Lua，这也是常用功能入口。  

### <span id="9.2">9.2 使用

#### <span id="9.2.1">9.2.1 在C#中执行Lua脚本
1. 调用 `Lua.RunLuaRaw` 函数，或直接执行Lua脚本。如有返回值，则获得返回值。  
`RunLuaRaw` 声明在 `Lua` 中：  

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

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Languages/Lua/LuaInterpreterWrapper/Lua.cs`。  
2. 调用 `Lua.RunLua` 函数，同样可以执行Lua脚本。并针对返回值返回了包装类LuaResult。  
`RunLua` 声明在 `Lua` 中：  

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

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Languages/Lua/LuaInterpreterWrapper/Lua.cs`。  
3. 调用 `Lua.IsTrue` 函数，可直接判断Lua的逻辑表达式，并获得结果布尔值。  
`IsTrue` 声明在 `Lua` 中：  

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

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Languages/Lua/LuaInterpreterWrapper/Lua.cs`。  

#### <span id="9.2.2">9.2.2 在Lua中调用C#函数
1. 首先需要把C#函数注册到Lua解释器环境中，我们可以用 `Lua.RegisterFunction` 函数执行注册逻辑。  
`RegisterFunction` 声明在 `Lua` 中：  

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

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Languages/Lua/LuaInterpreterWrapper/Lua.cs`。   
2. 在Lua脚本中，使用注册时的funcName则可以调用被注册的函数。  
3. 重复使用同一个funcName进行注册，则会进行覆盖。  
4. 使用 `Lua.UnregisterFunction` 函数则可能 解除注册行为。  
`UnregisterFunction` 声明在 `Lua` 中：  

```csharp
/// <summary>
/// Cancel the function registered in the Lua interpreter
/// 取消Lua解释器中注册的函数
/// </summary>
/// <param name="funcName"></param>
public static void UnregisterFunction(string funcName)
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Languages/Lua/LuaInterpreterWrapper/Lua.cs`。   

#### <span id="9.2.3">9.2.3 重置Lua解释器
1. 使用 `Lua.Restart` 函数，可重置Lua解释器，这将清空全部上下文。  
`Restart` 声明在 `Lua` 中：  

```csharp
/// <summary>
/// Restart the Lua interpreter
/// 重启Lua解释器
/// </summary>
public static void Restart()
```

来源：`RabbitDriver-Core/RabbitDriver-Core/JLGames/RabbitDriver/Actions/Languages/Lua/LuaInterpreterWrapper/Lua.cs`。  

### <span id="9.3">9.3 示例
Assets/JLGames/RabbitDriverPro/Samples/Lua   
![image](assets/img/Lua_1.png)  