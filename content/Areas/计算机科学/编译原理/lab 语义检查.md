

我会先整体浏览这个 `sementic_check` 目录下的各个文件，弄清楚职责分工和总体架构，然后再按文件、按功能模块有条理地给你讲解。接下来我先把这些文件内容读一遍。

### 整体概览：`sementic_check` 文件夹在干什么？

这个目录下的代码整体实现了 **语义分析（Semantic Check）+ 简单的常量折叠（Constant Folding）**，围绕一个核心类 `ASTChecker` 展开。  
它通过 AST Visitor 模式遍历整棵语法树，在遍历过程中：

- 维护并使用 `SymTable` 做 **符号表与作用域管理**
- 做 **变量 / 函数 的声明与使用检查**
- 做 **表达式与语句的类型检查与控制流检查**
- 做 **编译期常量表达式求值（`typeInfer`）**
- 收集所有语义错误到 `errors` 这个 `std::vector<std::string>` 中

目录下大致可以按功能分成两块：

1. **总体驱动与统一入口**：`ast_checker.h` + `ast_checker.cpp`
2. **按节点类型拆分的具体检查逻辑**：  
   - 声明相关：`decl_checker.cpp`  
   - 表达式相关：`expr_checker.cpp`  
   - 语句相关：`stmt_checker.cpp`  
   - 常量推断与折叠：`type_infer.cpp`

下面按文件，从“全局设计 → 声明 → 表达式 → 语句 → 常量折叠”的顺序，循序渐进讲一遍。

---

### 一、`ast_checker.h`：ASTChecker 的总体设计

这个头文件定义了整个语义检查器的 **核心类与状态**。

#### 1. 继承关系与返回值约定

```c++
using Checker_t = Visitor_t<bool>;

class ASTChecker : public Checker_t
```

- `Visitor_t<bool>` 说明这是一个 **访问者模式**，每个 `visit` 返回 `bool`，表示该节点的语义检查是否成功。
- 递归遍历时常用 `res &= apply(*this, *child);` 这样的写法，把所有子节点的结果按位与累积。

#### 2. 关键成员状态

```c++
FE::Sym::SymTable                        symTable;
std::map<FE::Sym::Entry*, VarAttr>       glbSymbols;
std::map<FE::Sym::Entry*, FuncDeclStmt*> funcDecls;

bool mainExists;

bool  funcHasReturn;
Type* curFuncRetType;

size_t loopDepth;

std::vector<std::string> errors;
```

- `symTable`：符号表对象，负责 **作用域嵌套** 和 **名字查找**。
- `glbSymbols`：记录全局变量（名称 Entry → `VarAttr`），后端 IR / Codegen 可以用。
- `funcDecls`：记录所有函数的声明（包括库函数和用户定义函数）。
- `mainExists`：是否出现过 `main` 函数，最终检查时用。
- `curFuncRetType` + `funcHasReturn`：记录当前正在检查的函数的返回类型，以及它是否出现过合法 `return`。
- `loopDepth`：当前嵌套在多少层循环之中，用于 `break/continue` 合法性检查。
- `errors`：所有的语义错误信息都 push 进来，外部可以统一打印或处理。

#### 3. 构造 / 析构：库函数注册与清理

构造函数：

```c++
ASTChecker()
    : symTable(),
      glbSymbols(),
      funcDecls(),
      mainExists(false),
      funcHasReturn(false),
      curFuncRetType(voidType),
      loopDepth(0),
      errors()
{
    libFuncRegister();
}
```

- 初始化所有状态为“还未进入任何函数/循环”的默认值，当前函数返回类型设为 `voidType`。
- 最关键的是调用 `libFuncRegister()` 把 SysY 的标准库函数描述预先注册到 `funcDecls` 中（后面详讲）。

析构函数中：

- 知道哪些函数是库函数名字（`getint/getch/...` 一系列），在 `funcDecls` 中找出对应的 `FuncDeclStmt*` 并 `delete`，避免内存泄漏。

#### 4. 统一的 visit 接口

头文件里声明了所有 AST 节点的 `visit` 函数：

- 基本节点：`visit(Root&)`
- 声明相关：`visit(Initializer&)`、`visit(VarDeclarator&)`、`visit(ParamDeclarator&)`、`visit(VarDeclaration&)`…
- 表达式：`visit(LeftValExpr&)`、`visit(LiteralExpr&)`、`visit(UnaryExpr&)`、`visit(BinaryExpr&)`、`visit(CallExpr&)`、`visit(CommaExpr&)`
- 语句：`visit(ExprStmt&)`、`visit(FuncDeclStmt&)`、`visit(VarDeclStmt&)`、`visit(BlockStmt&)`、`visit(ReturnStmt&)`、`visit(WhileStmt&)`、`visit(IfStmt&)`、`visit(BreakStmt&)`、`visit(ContinueStmt&)`、`visit(ForStmt&)`

以及两个重载的 **核心辅助函数**：

```c++
ExprValue typeInfer(const ExprValue& operand, Operator op, const Node& node, bool& hasError);
ExprValue typeInfer(const ExprValue& lhs, const ExprValue& rhs, Operator op, const Node& node, bool& hasError);
```

- 这两个在 `type_infer.cpp` 里面实现，用来基于操作数 + 运算符做：
  - 类型推断（比如 int + float → float）
  - 编译期常量折叠（常量表达式求值）
  - 同时做一部分合法性检测（如除零、对 void 做运算等），并通过 `errors` 记录错误。

---

### 二、`ast_checker.cpp`：Root、库函数注册和

这个文件实现了：

1. `visit(Root&)`  —— 整体入口
2. `libFuncRegister()` —— 注册 SysY 标准库函数到 `funcDecls`


#### 1. `visit(Root&)`：语义检查的起点

```c++
bool ASTChecker::visit(Root& node)
{
    // 1. 重置符号表，初始化全局作用域
    symTable.reset();

    bool res = true;

    // 2. 遍历所有顶层语句
    auto* stmts = node.getStmts();
    if (stmts)
    {
        for (auto* stmt : *stmts)
        {
            if (!stmt) continue;
            res &= apply(*this, *stmt);
        }
    }

    // 3. 语义上要求有 main 函数
    if (!mainExists)
    {
        errors.push_back("Main function not found");
        res = false;
    }

    return res;
}
```

- 每次对一棵 AST 做检查时先把符号表重置成“只有全局作用域”的状态。
- 顶层都是语句（包括函数定义、全局变量声明），逐个 `apply`。
- 最后检查是否至少有一个名为 `"main"` 的函数声明。

#### 2. `libFuncRegister()`：SysY 标准库函数建模

`libFuncRegister` 里面给每个库函数构造了一个 `FuncDeclStmt`，放入 `funcDecls`：

- 例：`int getint()`  

  ```c++
  funcDecls[getint] = new FuncDeclStmt(intType, getint, nullptr);
  ```

- 带参数的例子：`int getarray(int a[])`

  ```c++
  auto getarray_params = new std::vector<ParamDeclarator*>();
  auto getarray_param  = new ParamDeclarator(TypeFactory::getPtrType(intType), SymEnt::getEntry("a"));
  getarray_param->attr.val.value.type = TypeFactory::getPtrType(intType);
  getarray_params->push_back(getarray_param);
  funcDecls[getarray] = new FuncDeclStmt(intType, getarray, getarray_params);
  ```

- 类似方法把 `getfloat/getfarray/putint/putarray/.../_sysy_starttime/_sysy_stoptime` 全部构造一遍。  
- 这样在 `visit(CallExpr&)` 的时候，就能把 `node.func` 在 `funcDecls` 里找到对应的“函数签名”和参数列表，用来做参数数量和类型的检查。
#### 无参数函数：int getint()

```cpp

funcDecls[getint] = new FuncDeclStmt(intType, getint, nullptr);

//                                      ↑       ↑      ↑

//                                   返回类型  函数名  无参数
```


#### 单参数函数：void putint(int a)

```cpp
auto putint_params = new std::vector<ParamDeclarator*>();

auto putint_param = new ParamDeclarator(intType, SymEnt::getEntry("a"));

putint_param->attr.val.value.type = intType;

putint_params->push_back(putint_param);

funcDecls[putint] = new FuncDeclStmt(voidType, putint, putint_params);

```

#### 多参数函数：void putarray(int n, int a[])

```cpp
auto putarray_params = new std::vector<ParamDeclarator*>();

// 第一个参数：int n

auto putarray_param1 = new ParamDeclarator(intType, SymEnt::getEntry("n"));

putarray_param1->attr.val.value.type = intType;

putarray_params->push_back(putarray_param1);

// 第二个参数：int a[]

auto putarray_param2 = new ParamDeclarator(

    TypeFactory::getPtrType(intType),  // int* 类型

    SymEnt::getEntry("a")

);

putarray_param2->attr.val.value.type = TypeFactory::getPtrType(intType);

putarray_params->push_back(putarray_param2);

funcDecls[putarray] = new FuncDeclStmt(voidType, putarray, putarray_params);

```

#### 关键语法点

1. **static 变量：函数内 static 变量只初始化一次，用于保存符号条目**
2. [] 操作符：map 的下标操作，不存在时自动创建条目

#### 语义总结

该函数的作用是：

1. 为每个库函数创建符号条目（Entry*）

2. 构建参数列表（std::vector<ParamDeclarator*>）

3. 创建函数声明节点（FuncDeclStmt）

4. 将函数声明存入 funcDecls map，供后续语义检查使用

### `decl_checker.cpp`声明检查
#### 3. `visit(Initializer&)` 与 `visit(InitializerList&)`

- `Initializer` 是“单个初始化器”，一般形如 `= expr`，里面有一个 `init_val` 表达式：
  - 先 `apply` 这个表达式；
  - 把 `init_val->attr` 拷贝给当前节点 `node.attr`，统一记录表达式的值、类型等属性。

- `InitializerList` 是数组或结构的初始化列表 `{ a, b, c }`：
  - 遍历 `init_list` 中的每个 `Initializer` / `InitializerList`，依次 `apply`。
  - 这里只负责递归下去，并不在这里做复杂的结构合规性检查（比如维度匹配等）。

#### 4. `visit(VarDeclarator&)`：单个变量声明器

对应形如：

```c
int a = 3, b[10];
```

每个 `a`、`b[10]` 是一个 `VarDeclarator`：

- 如果有 `lval`（左值表达式，代表变量名、可能带数组维度信息），`apply` 它，并把 `node.attr` 同步为 `lval->attr`。
- 如果有 `init` 初始化器，就 `apply` 它。
- 声明真正登记到符号表、对 const 与数组维度检查等，是在 `visit(VarDeclaration&)` 中统一完成。

#### 5. `visit(ParamDeclarator&)`：函数形参

这里体现了 **形参也是一个局部变量，只不过在函数作用域起始处声明** 的思想：

- 检查当前作用域下是否已经有相同 `entry` 的符号，如有则报 **参数重定义**。
- 否则构造一个 `VarAttr`：
  - `attr.type = node.type;`
  - `attr.isConstDecl = false;`
  - `attr.scopeLevel = symTable.getScopeDepth();`
  - 然后 `symTable.addSymbol(node.entry, attr);`。

如果是数组形参（`node.dims` 非空）：

- 对每个维度表达式 `dimExpr`：
  - 先 `apply` 做语义检查；
  - 如果 `dimExpr` 是编译期常量，且 > 0，就把这个维度大小记录到 `attr.arrayDims` 里。
  - **要点**：对于形参来说，数组维度不是强制必须都是编译期常量，可以写类似`int a[][10]`所以这里采取能确定就记录 不能确定就忽略的策略，而不是报错。

#### 6. `visit(VarDeclaration&)`：变量声明整体

对应一整条像 `const int a = 1, b[3] = {...};` 的声明：

```
for 每个 declarator in node.decls:
    找到它的 lval（也就是变量名那一块）
    确保是 LeftValExpr
    确保它有 entry（符号表条目）
    再用 entry 做一系列事情（判重 重定义检查、填 attr、加入符号表、处理初始化器...）
```
“拿到 lval → 确认类型 → 确保 entry 就绪 → 提取 entry”这一个准备阶段。
- 遍历 `node.decls` 里的每个 `VarDeclarator`：
  1. 从 `declarator->lval` 里拿到 `LeftValExpr`，确保 `entry` 已经存在（必要时先 `apply`）。
  2. 在当前作用域查找同名符号，如发现同一层级已存在则报“变量重定义”。
  3. 构造 `VarAttr attr`：
     - `attr.type = node.type;`
     - `attr.isConstDecl = node.isConstDecl;`
     - `attr.scopeLevel = 当前作用域深度`。
  4. 如果 `leftVal->indices` 存在，说明这是一个数组声明：
     - 对每个维度表达式 `idx`，`apply` 它，并强制要求其为**常量表达式**、且值 > 0，否则报错。
     - 合法的维度大小 push 到 `attr.arrayDims`。
  5. 处理初始化器 `declarator->init`：

```cpp
// 4. 处理初始化器

if (declarator->init) {

apply(...); // 有初始化器

if (node.isConstDecl) {

if (是列表) {

// 列表版 const 检查

} else if (不是常量表达式) {

// 报错

} else {

// 保存常量值

}

}

} else {

if (node.isConstDecl) {

// const 但没初始化 → 报错

}

}
```


后续操作
  1. 把 `attr` 加入符号表：`symTable.addSymbol(entry, attr);`
  2. 如果当前是全局作用域，则同步记录到 `glbSymbols`。
  3. 最后再 `apply(*this, *declarator)`，让 `VarDeclarator` 节点本身同步属性。

---

### 三、`expr_checker.cpp`：表达式语义检查

这个文件专注 AST 中的几类表达式节点。

#### 1. `visit(LeftValExpr&)`：变量 / 数组访问

- 先看 `node.entry` 是否存在，不存在则直接报“Invalid left value expression”。
- 在 `symTable` 中查找 `attr`：
  - 找不到 → “Undefined variable 'name'”。
- 找到后：
  - 把 `attr.type` 赋给 `node.attr.val.value.type`，表示这个左值表达式的静态类型。
  - 如果这是一个 `const` 变量，且 **没有数组下标访问**：
    - 把该常量视为 **编译期常量**：
      - `node.attr.val.isConstexpr = true;`
      - 如果 `initList` 里保存了常量值，则拷贝出来；否则按类型给默认值。
  - 否则：`isConstexpr = false`。

数组下标部分：

- 对 `node.indices` 中的每个下标表达式：
  - `apply` 做语义检查。
  - 要求类型为整型（这里允许 `int` 或 `bool`，不允许 `void` 或 `float`），否则报“Array subscript must be integer type”。


#### 2. `visit(LiteralExpr&)`：字面量

- 非常直接：字面量一定是编译期常量：
  - `node.attr.val.isConstexpr = true;`
  - `node.attr.val.value = node.literal;`（其中 `literal` 里已经带有类型和值）

#### 3. `visit(UnaryExpr&)`：一元运算（`+x`, `-x`, `!x` 等）

- 确保 `node.expr` 非空，然后 `apply` 子表达式。
- 操作数类型为 `void` 则报错（不允许对 void 做运算）。
- 把 `node.expr->attr.val` 和操作符 `node.op` 交给 `typeInfer(operand, op, node, hasError)`：
  - 由 `type_infer.cpp` 中模板逻辑决定结果类型、是否能在编译期算出值，以及各种非法情况（如取反 void、溢出等）。
- 把返回结果 `ExprValue` 存在 `node.attr.val` 中，并记录 `node.attr.op = node.op`。

#### 4. `visit(BinaryExpr&)`：二元运算（算术、比较、逻辑、赋值等）

- `apply` 左右子表达式，检查非空。
- 检查两边类型不为 `void`。
- 把两个子表达式的 `ExprValue` 与运算符交给 `typeInfer(lhs, rhs, op, node, hasError)`。
- 把 `ExprValue` 结果写回 `node.attr.val`，同时设置 `node.attr.op`。

在这里，**大量与运算类型相关的规则**（比如 int+float、bool 与整数混用、除零、对 float 做取模等）都在 `type_infer.cpp` 中统一维护。

#### 5. `visit(CallExpr&)`：函数调用

- 检查 `node.func` 是否存在，并在 `funcDecls` 里查找：
  - 找不到就报“Undefined function 'name'”。
- 找到 `FuncDeclStmt* funcDecl` 后：
  - `node.attr.val.value.type = funcDecl->retType;`
  - 调用结果不被视作编译期常量（即使实参全是常量）。
- 检查参数个数：  
  `expectedParamCount = funcDecl->params ? params->size() : 0;`  
  `actualArgCount = node.args ? args->size() : 0;`  
  不等时报“expects X arguments, but got Y”。为什么这样写？防止空指针解引用。nullptr表示没有形参列表。
- 对每个实参：
  - `apply` 之。
  - 不允许 `void` 类型的表达式作为实参。


#### 6. `visit(CommaExpr&)`：逗号表达式

- 顺序 `apply` 每个子表达式。
- 最终结果类型 / 值属性等全部取自 **最后一个子表达式**：
  ```c++
  auto* lastExpr = node.exprs->back();
  if (lastExpr) node.attr = lastExpr->attr;
  ```

---

### 四、`stmt_checker.cpp`：语句级语义检查与控制流检查

这个文件专注处理各种语句节点。

#### 1. `visit(ExprStmt&)`：表达式语句

- 若 `expr` 为空（例如空语句 `;`），直接返回 true。
- 否则 `apply` 内部表达式，语义错误由表达式层产生。

#### 2. `visit(FuncDeclStmt&)`：函数声明/定义

这里是整个函数级语义分析的核心：

1. 要求函数必须出现在 **全局作用域**，否则报错。
2. 在 `funcDecls` 中检查重定义：
   - 已存在同名函数 → “Redefinition of function 'name'”。
   - 否则记录 `funcDecls[node.entry] = &node;`。
3. 特殊处理 `main` 函数：
   - 设置 `mainExists = true`。
   - 要求返回类型为 `intType`，否则报“Main function must return int”。
   - 要求 **无参数**，否则报“Main function should not have parameters”。
4. 更新当前函数上下文：
   - 备份 `prevRetType = curFuncRetType`，`prevHasReturn = funcHasReturn`。
   - 设 `curFuncRetType = node.retType`，`funcHasReturn = false`。
5. 进入函数作用域 `symTable.enterScope()`。
   - 依次 `apply` 每个形参声明（`ParamDeclarator`），这会把参数加入符号表。
   - 然后 `apply` 函数体 `node.body`。
6. 函数检查收尾：
   - 对于非 `void` 且名字不是 `"main"` 的函数，如果 `funcHasReturn == false`，则报“must return a value”。
   - `symTable.exitScope()`，退出函数作用域。
   - 恢复之前的 `curFuncRetType` 与 `funcHasReturn`。

> 注意：`funcHasReturn` 在 `visit(ReturnStmt&)` 中被设置为 true，因此这里“没有 return”的判断是全局粒度的。

#### 3. `visit(VarDeclStmt&)`：变量声明语句

- 封装了一下：如果有 `node.decl`（`VarDeclaration*`），就 `apply`，所有逻辑在前面 `VarDeclaration` 里。

#### 4. `visit(BlockStmt&)`：块 `{ ... }` 和作用域

- 新建一个作用域：`enterScope()`。
- 顺序 `apply` 块内各语句。
- 结束时 `exitScope()`，弹出该层局部变量。

块的存在与否决定了变量的可见范围，这里与符号表配合实现 **词法作用域**。

#### 5. `visit(ReturnStmt&)`：返回语句

- 标记 `funcHasReturn = true;`。
- 如果此时 `symTable.isGlobalScope()` 仍为 true，说明 `return` 出现在函数外，直接报“Return statement outside function”。
- 如果有返回表达式 `retExpr`：
  - `apply` 之。
  - 若当前函数返回类型是 `voidType`，但却有返回值，则报“Void function should not return a value”。
  - TODO：可进一步比较 `retExpr` 的类型与 `curFuncRetType` 是否兼容。
- 如果没有返回表达式：
  - 若 `curFuncRetType != voidType`，则报“Non-void function must return a value”。

#### 6. `visit(WhileStmt&)`：while 循环

- 不允许 `while` 出现在全局作用域（语义上也通常不允许），否则报“While statement in global scope”。
- `apply` 条件表达式 `cond`，要求其类型不为 `void`。
- 进入循环前 `loopDepth++`，离开循环后 `loopDepth--`：
  - 用于约束 `break` / `continue` 只能写在循环内部。
- `apply` 循环体 `body`。

#### 7. `visit(IfStmt&)`：if 分支语句

- 不能出现在全局作用域，否则报“If statement in global scope”。
- `apply` 条件 `cond`，要求其不是 `void` 类型。
- 分别 `apply` then 分支 `thenStmt` 和 else 分支 `elseStmt`（如果存在）。

#### 8. `visit(BreakStmt&)` 和 `visit(ContinueStmt&)`：循环控制语句

- 不允许出现在 `loopDepth == 0` 的位置（即不在任何循环内部），否则分别报：
  - “Break statement not in loop”
  - “Continue statement not in loop”

#### 9. `visit(ForStmt&)`：for 循环

- 不能出现在全局作用域。
- 特点是 **for 自己引入了一个新的作用域**（很多语言/编译器是这样设计的），所以：
  - `enterScope()`；
  - `apply` 初始化语句 `init`、条件 `cond`、步进 `step`；
  - 检查 `cond` 不是 `void` 类型；
  - `loopDepth++`, `apply body`, `loopDepth--`；
  - `exitScope()`。

---

### 五、`type_infer.cpp`：类型推断 + 常量折叠核心

这一文件是整个语义分析中“最偏编译器理论”的部分，负责表达式的“值与类型语义”。
模块图![[Pasted image 20251202110725.png]]

数据流
![[Pasted image 20251202110502.png]]
#### 1. 基础工具函数

- `promoteType(a, b)`：决定二元运算时两个操作数合并后的 **提升类型**：
  - 若有 float → 结果类型为 `floatType`
  - 否则若有 long long（LL）→ `llType`
  - 否则 → `intType`

- `getResultType(operandType, op)`：
  - 如果是比较/逻辑运算符 (`GT/GE/LT/LE/EQ/NEQ/AND/OR/NOT`) → 结果一律 `boolType`
  - 对 `+/-` 一元运算，如果操作数是 `bool`，结果改成 `intType`
  - 其他情况返回原类型。

- `getValue<T>(const VarValue&)`：
  - 把值统一转换为模板参数 T，如 T 是 `int`、`long long`、`float`、`bool`，会根据原始 `Type_t` 做适当转换。
  - 两层判断：外层根据目标类型T选择分支，内层根据varvalue的实际类型vartype读取并转换。
  - 这样后续运算逻辑就可以用一个统一类型来处理不同原始类型。

- `makeVarValue<T>(T value)`：
  - 把 C++ 原生类型包装回 `VarValue`，供结果赋值使用。
---

关于varvalue 是一个联合体类型 意味着什么呢？
只能存储一种类型的值：
```cpp ast_defs.h
struct VarValue

{
Type* type;
union
{
bool boolValue;
int intValue;
long long llValue;
float floatValue;
};
```

---

- `handleIntegerResult(long long result, Type* preferredType, bool isConst)`：
  - 用于把整形结果根据“期望类型”选择保存为 int / long long / float，并构造一个 `ExprValue` 返回。使用标准库`numeric_limits`获取int 可以表示的最小值最大值。
#### 2. 一元运算模板：`performUnaryOp<T>`

核心思想：

- 根据 T 的不同（int/ll/float/bool），实际进行 `+x`、`-x`、`!x` 等运算。
- 只对 **编译期常量** 真正执行运算，否则直接返回“同类型但非 constexpr”的 `ExprValue`。
- 特殊处理：
  - 对 int 的取负时，如果值是 `INT_MIN`，取负会溢出，用 `handleIntegerResult(2147483648LL, ...)` 之类的方式处理，避免崩溃。意思是对int类型做-x是要特别小心 对 long long/float就直接取反。有符号整形最小值溢出
>[!question] 为什么要对int 类型小心？
>关键在于 判断`if (value == INT_MIN)` 在32位有符号int 范围里。取值区间为$[-2^31,2^31-1]$问题是 如果 value == int_min,那么-value超出了int 能够表示的最大值。
- 若遇到非法一元运算符（不属于这几种），把错误信息写入 `errors`，并返回一个类型为 `voidType` 的错误结果。

#### 3. 二元运算模板：`performBinaryOp<T>`

逻辑丰富：

- 若是 `/` 或 `%`，且右操作数是编译期常量，先检查是否为 0，是的话立即报“zero divisor”错误。
- 对非编译期常量：直接跳过求值，只设置类型。
- 对 float 上的 `%`、位运算（`BITOR/BITAND`）一律报错。
- 具体运算：
  - `ADD/SUB/MUL/DIV/MOD`：对于整型结果用 `handleIntegerResult`，对 float 直接运算。
  - 比较运算：返回 bool 类型 VarValue。
  - 按位运算：只对整数类型有意义
  - 逻辑运算：返回 bool。
  - 赋值（`ASSIGN`）：结果值为右值。
- 任何非法运算符都会在 `errors` 中记录，并返回 `voidType` 错误结果。

#### 4. dispatch：根据 Type_t 决定使用哪种 T

- `dispatchUnaryOp(Type_t kind, ...)`：
  - `BOOL/INT` → `performUnaryOp<int>`
  - `LL` → `performUnaryOp<long long>`
  - `FLOAT` → `performUnaryOp<float>`
- `dispatchBinaryOp(Type_t kind, ...)`：
  - 类似，用 `int / long long / float` 进行具体计算。

#### 5. ASTChecker::typeInfer 实现

- 一元：

  ```c++
  Type* operandType = operand.value.type;
  Type* resultType  = getResultType(operandType, op);
  return dispatchUnaryOp(operandType->getBaseType(), operand, op, resultType, errors, node.line_num, hasError);
  ```

- 二元：

  ```c++
  Type* promotedType = promoteType(lhs.value.type, rhs.value.type);
  Type* resultType   = getResultType(promotedType, op);
  return dispatchBinaryOp(promotedType->getBaseType(), lhs, rhs, op, resultType, errors, node.line_num, hasError);
  ```

通过这两个接口，上层的 `visit(UnaryExpr/ BinaryExpr)` 完全不需要知道各种类型与操作符组合的细节，只需要把 `ExprValue` 和 `Operator` 丢给 `typeInfer`，并根据 `hasError` 来决定是否标记语义失败。

---

### 小结：这组文件形成的语义检查“流水线”

按执行顺序把整个 `sementic_check` 看一遍：

1. **创建 ASTChecker**：
   - 构造函数自动调用 `libFuncRegister`，把 SysY 库函数建好符号信息。

2. **从 Root 开始 `visit(Root)`**：
   - 重置符号表为全局作用域；
   - 遍历所有顶层声明与语句。

3. **对声明类节点**：
   - `VarDeclaration` 负责把变量（含数组/const）登记进符号表，并作重定义/维度/初始化规则检查；
   - `ParamDeclarator` 负责把函数参数登记入函数作用域；
   - `FuncDeclStmt` 负责函数级的所有规则（全局作用域、重定义、main 特例、返回类型 / return 语句完整性）。

4. **对表达式节点**：
   - `LeftValExpr` 做变量存在性与类型绑定、const 折叠；
   - `LiteralExpr` 设置字面量为编译期常量；
   - `UnaryExpr`、`BinaryExpr`、`CallExpr`、`CommaExpr` 统一依赖 `typeInfer` 做类型推断和常量求值。

5. **对语句节点**：
   - 块语句和函数声明配合 `SymTable` 管理作用域；
   - `if/while/for` 管理控制流，检查条件表达式类型；
   - `break/continue` 通过 `loopDepth` 限制在循环内使用；
   - `return` 使用 `curFuncRetType` 与 `funcHasReturn` 检查返回语义。

6. **错误收集**：
   - 所有检查过程中发现的问题统一写进 `errors`，最终 `visit(Root)` 的返回值告诉你“是否有任何语义错误”。

---

如果你愿意，我可以再针对某一部分深入讲，例如：

- 专门拆解 `SymTable` 如何配合这些 visitor 使用；
- 详细走一遍“含数组的 const 全局变量声明 + 初始化”的语义检查流程；
- 或者以某个 SysY 测试用例为例，从 AST 层一步步跟踪 `ASTChecker` 的行为。