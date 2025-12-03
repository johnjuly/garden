## Lab3-1. 语义分析

  

需要阅读的代码：

  

###  interfaces/frontend/symbol/isymbol_table.h ： 定义了符号表的操作接口。
1. 核心接口方法（对外 API）

这些都是对外统一调用入口，内部通过 static_cast<Derived*>(this) 转发到具体实现类的 xxx_impl 方法：

- 生命周期与整体状态
    
         void reset() { static_cast<Derived*>(this)->reset_impl(); }
    

- 语义：重置符号表状态，一般用于清空所有符号、回到初始化状态（例如重新编译一个新文件时）。

- 符号增删查（这里提供的是新增与查询）
    
         void addSymbol(Entry* entry, AST::VarAttr& attr) {
    
             static_cast<Derived*>(this)->addSymbol_impl(entry, attr);
    
         }
    
         AST::VarAttr* getSymbol(Entry* entry) {
    
             return static_cast<Derived*>(this)->getSymbol_impl(entry);
    
         }
    

- addSymbol：

- 参数 Entry* entry：表示要加入的符号（变量名、函数名等）。

- 参数 AST::VarAttr& attr：该符号对应的属性/元信息（类型、是否常量、是否数组、维度信息、存储类别等）。

- 语义：在当前作用域（或合适作用域结构中）注册一个新符号。

- getSymbol：

- 输入 Entry* entry，返回 AST::VarAttr*。

- 语义：按名字（封装在 Entry 中）查找符号属性；若找不到，通常返回 nullptr（具体行为由 getSymbol_impl 决定）。

- 这是语义分析、类型检查等阶段频繁使用的接口。

- 作用域管理
    
         void enterScope() { static_cast<Derived*>(this)->enterScope_impl(); }
    
         void exitScope()  { static_cast<Derived*>(this)->exitScope_impl(); }
    

- 语义：

- enterScope：进入一个新的词法/语义作用域（例如遇到 { ... }、函数体、if/while 块等），通常会在内部开一个新的“符号栈层”或作用域节点。

- exitScope：退出当前作用域，销毁/弹出在该层定义的所有局部符号。

- 这是实现块作用域、变量遮蔽、生命周期控制的关键接口。

- 作用域信息查询
    
         bool isGlobalScope() { return static_cast<Derived*>(this)->isGlobalScope_impl(); }
    
         int  getScopeDepth() { return static_cast<Derived*>(this)->getScopeDepth_impl(); }
    

- isGlobalScope：

- 返回当前是否处于全局作用域（通常是深度为 0 的层）。

- 在处理如“全局变量初始化限制”、“仅允许在全局定义函数/结构体”等规则时会用到。

- getScopeDepth：

- 返回当前作用域嵌套深度（例如 0=全局，1=函数体，2=块内……）。

- 有利于调试、日志打印，或实现某些与嵌套层数相关的策略（如寄存器分配前的变量分类、局部静态分配等）。
  

需要阅读并编写的代码：

  
###  frontend/symbol/symbol_table.cpp ：实现符号表的处理函数。
它用一个“vector 作用域栈 + 每层 map 符号表”来管理变量/符号的定义与查找

---
```cpp
FE::AST::VarAttr* SymTable::getSymbol_impl(Entry* entry)

{

// 从当前作用域向外层作用域逐层查找符号

// 从栈顶（当前作用域）开始向栈底（全局作用域）查找

for (int i = static_cast<int>(scopeStack.size()) - 1; i >= 0; --i)

{

auto it = scopeStack[i].symbols.find(entry);

if (it != scopeStack[i].symbols.end())

{

// 找到符号，返回其属性的指针

return &(it->second);

}

}

// 未找到符号

return nullptr;

}
```

- it 的类型和值

- 类型大致是：std::map<Entry*, FE::AST::VarAttr>::iterator

- 它指向 scopeStack[i].symbols 这张 map 里的某个元素（键值对），或者指向“尾后迭代器”（表示没找到）。

- 上一行是：auto it = scopeStack[i].symbols.find(entry);

- 如果找到了键为 entry 的元素，it 就指向那一项；

- 如果没找到，it 的值就等于 scopeStack[i].symbols.end()。

- scopeStack[i].symbols.end() 的值

- 这是这张 map 的“尾后迭代器”（past-the-end iterator），不指向任何有效元素，只是一个哨兵值，用来表示“查找失败 / 到头了”。

- 标准约定：find 没找到时就返回这个值。

所以 if (it != scopeStack[i].symbols.end()) 的语义就是：

“如果 it 不是尾后迭代器，那就说明在这一层作用域的 symbols map 里，确实找到了键为 entry 的符号。”

---
### frontend/ast/visitor/sementic_check/ : 结合注释，完成语义检查器的功能。
  需要实现的主要功能：

* 1. 符号表管理 (作用域进入/退出，符号查找/添加)

* 2. 类型检查 (变量类型、函数参数匹配、返回值检查等)

* 3. 语义错误检测 (重定义、未定义、非法操作等)

* 4. 常量折叠 (编译期常量计算)

* 5. 控制流检查 (break/continue 在循环内，return 在函数内等)

完成代码后，你的编译器应能对 semant 测试用例中的非法程序进行识别和报错；对于合法程序，以-parser 运行编译器，应能打印出标记后的语法树。

  

## Lab3-2. 中间代码生成

  

需要阅读的代码：

  

- middleend/module/ : 定义了中间代码的操作数、指令、基本块、函数、模块类，你需要理解关键的成员变量和函数实现，这对你构建中间代码至关重要。

- middleend/visitor/printer/ : 中间代码的打印。另外，middleend/module/ir_instruction.cpp 中给出了 ir 指令的具体打印过程，如果你不理解 Lab3-2 具体是在做什么，可以先阅读这个文件。

  

需要阅读并编写的代码：

  

- middleend/visitor/codegen/ ： 根据提示完成 AST 到 IR 的转换。注意，ast_codegen.h 中已经为你提供了生成指令、插入基本块等操作的接口。

  

你可以用-llvm 运行编译器进行打印和分析；完成代码后，运行 testcase/functional/下的测试用例，根据测试用例的通过情况来对你的实现进行评分。