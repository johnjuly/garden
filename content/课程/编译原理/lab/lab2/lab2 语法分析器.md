我先打开 `README.md`，定位实验二相关说明，并梳理源码入口。接着会按需查看与语法分析相关的关键源码文件以便讲解结构关系。

下面我带着你从“实验二：语法分析”的角度，结合 `README.md` 与源码，一步步“读懂”项目中与语法分析相关的关键结构、数据流与文件关系。全程不做实现建议，只做定位、结构梳理与概念讲解，便于小白无痛入门。


### 实验二在 README 的定位与范围

`README.md` 中对 Lab2 的要求很明确：本阶段的目标是“把 Token 序列转换为抽象语法树 AST”，主要涉及 `yacc.y`（Bison 语法与动作）、AST 各类节点定义与打印；符号表项类型可参考但暂不实现符号表。

```96:109:/home/petto/learning/compiler/NKU-Compiler2025/README.md
## Lab2. 语法分析

需要阅读的代码：

- interfaces/frontend/symbol/symbol_entry.h: 符号表项定义。Lab2 中我们暂时还不需要实现符号表，但已经可以开始为一些符号名构建符号表项了。
- frontend/ast/（不含/visitor） ： 分类定义了语法树的节点类
- frontend/ast/visitor/printer/ ： 定义了语法树的打印过程，了解即可

需要阅读并编写的代码：

- frontend/parser/yacc.y : 编写你想要实现的文法定义以及对应的处理函数, 本次实验中只需要构建出语法树即可，不需要其他的额外处理

完成代码后，以-parser 运行编译器，如果能正确输出 parser 测试用例中对应的语法树，即完成 lab2。
```

从这里可以提炼出三个“阅读主轴”：
1) 入口与调用链在哪里；
2) 语法规则与动作如何把 Token 串“拼装”为 AST；
3) AST 是什么样的结构，以及如何被打印出来验证结果。

### 编译器主流程里，语法分析的入口

`main.cpp` 会根据命令行参数选择阶段。和 Lab2 直接相关的是：创建 `FE::Parser`，调用 `parseAST()` 得到 `ast`，然后在 `-parser` 模式下用 AST 打印器输出。

```175:220:/home/petto/learning/compiler/NKU-Compiler2025/main.cpp
/*
 * Lab 2: 语法分析 (Syntax Analysis)
 *
 * 本实验的目标是实现语法分析器，将 Token 序列转换为抽象语法树 (AST)。
 * 语法规则可以参考 `doc/SysY2022语言定义-V1.pdf`，或自行设计。
 * 所实现的语法规则应当可以覆盖 SysY 语言的语法结构。
 *
 * 主要任务:
 * - 构建 AST: 在 `frontend/parser/yacc.y` 中定义语法规则以生成 AST。
 * - AST 成员: 在生成 AST 节点时，正确设置其 `Entry* entry` 成员，
 *   使其指向对应的符号表项。同时正确设置其它属性，如节点的类型与字面量等。
 *
 * 相关文件:
 * - `frontend/parser/yacc.y`: Bison 语法规则定义。
 * - `frontend/ast/`: AST 节点定义目录 (`ast.h`, `expr.h`, `decl.h`, `stmt.h`)。
 * - `interfaces/frontend/symbol/symbol_entry.h`: 符号表项定义。
 *
 * 提示:
 * - AST 的打印功能已提供，位于 `frontend/ast/visitor/printer/`。
 *   可以通过以下方式来使用它。在后续的实验中也会使用到类似的访问者模式，你也可以使用 `apply`
 *   函数来简化访问者的调用。
 *   ```
 *   FE::AST::ASTPrinter printer;
 *   apply(printer, *ast, outStream);
 *   ```
 *
 * 期望输出示例:
 * 在 `testcase/parser/` 目录下提供了一些测试用例以及它们的预期输出，可以自行查看。
 */
ast = parser.parseAST();
if (step == "-parser")
{
    FE::AST::ASTPrinter printer;
    std::ostream*       osPtr = outStream;
    apply(printer, *ast, osPtr);
}
```

你可以先把这段当作“黑盒”：`parseAST()` 会走 Bison 语法分析，返回 AST；`ASTPrinter` 负责把 AST 以树形格式打印出来用于对拍 `testcase/parser/*.parser` 的期望输出。

### 语法分析的核心：`frontend/parser/yacc.y`

`yacc.y` 是 Bison 描述文件，负责两件事：
- 声明 token、非终结符以及它们的语义值类型；
- 用产生式（文法规则）+ 动作代码“构造” AST 节点。

文件头部把扫描器（Flex）与解析器（Bison）桥接起来，并引入 AST 头文件，以便在动作里创建各类 AST 节点。[[#^68962f|详细释义]]

```11:49:/home/petto/learning/compiler/NKU-Compiler2025/frontend/parser/yacc.y
%code requires
{
    #include <memory>
    #include <string>
    #include <sstream>
    #include <frontend/ast/ast_defs.h>
    #include <frontend/ast/ast.h>
    #include <frontend/ast/stmt.h>
    #include <frontend/ast/expr.h>
    #include <frontend/ast/decl.h>
    #include <frontend/symbol/symbol_entry.h>

    namespace FE
    {
        class Parser;
        class Scanner;
    }
}

%code top
{
    #include <iostream>

    #include <frontend/parser/parser.h>
    #include <frontend/parser/location.hh>
    #include <frontend/parser/scanner.h>
    #include <frontend/parser/yacc.h>

    using namespace FE;
    using namespace FE::AST;

    static YaccParser::symbol_type yylex(Scanner& scanner, Parser &parser)
    {
        (void)parser;
        return scanner.nextToken(); 
    }

    extern size_t errCnt;
}
```

接下来是 token 与非终结符（语义值）类型声明。注意：这里使用了 `%define api.value.type variant`，所以可以为不同 token / 非终结符指定不同的 C++ 类型，如整型字面量、`std::string`，以及指向 AST 节点的指针类型。

```61:86:/home/petto/learning/compiler/NKU-Compiler2025/frontend/parser/yacc.y
// 从这开始定义你需要用到的 token
// 对于一些需要 "值" 的 token，可以在前面加上 <type> 来指定值的类型
// 例如，%token <int> INT_CONST 定义了一个名为 INT_CONST
%token <int> INT_CONST
%token <long long> LL_CONST
%token <float> FLOAT_CONST
%token <std::string> STR_CONST ERR_TOKEN SLASH_COMMENT
****
%token <std::string> IDENT 

// TODO(Lab2)在这里添加 VOID Token
%token IF ELSE FOR WHILE CONTINUE BREAK SWITCH CASE GOTO DO RETURN CONST INT FLOAT VOID 
%token SEMICOLON COMMA LPAREN RPAREN LBRACKET RBRACKET LBRACE RBRACE
%token END
%token PLUS MINUS STAR SLASH MOD
%token ASSIGN
%token EQ NE LT GT LE GE
%token AND OR NOT

%nterm <FE::AST::Operator> UNARY_OP
%nterm <FE::AST::Type*> TYPE
%nterm <FE::AST::InitDecl*> INITIALIZER
%nterm <std::vector<FE::AST::InitDecl*>*> INITIALIZER_LIST
%nterm <FE::AST::VarDeclarator*> VAR_DECLARATOR
%nterm <std::vector<FE::AST::VarDeclarator*>*> VAR_DECLARATOR_LIST
%nterm <FE::AST::VarDeclaration*> VAR_DECLARATION
```

这里最重要的“阅读体会”是：每个非终结符被绑定为某种“语义值类型”，例如：
- 表达式类非终结符统一绑定为 `FE::AST::ExprNode*`；
- 语句类非终结符绑定为 `FE::AST::StmtNode*`；
- 类型、声明等对应到 `Type*`、`VarDeclaration*` 等。

这意味着：对应产生式的动作中，会“组合”成这些 AST 指针对象，逐层向上归约，最终返回根节点（通常是 `FE::AST::Root` 或某个语句列表）供 `parseAST()` 使用。

### AST 是什么样子：核心节点与访问打印

AST 抽象层的基类在 `frontend/ast/ast.h`。根节点 `Root` 保存一个语句列表，并支持访问者模式（`accept(Visitor&)`）。

```c 22:49:/home/petto/learning/compiler/NKU-Compiler2025/frontend/ast/ast.h
// AST的节点类
class Node
{
  public:
    int      line_num;
    int      col_num;
    NodeAttr attr;  // 携带节点属性，是语法树标记的重点对象

    Node(int line_num = -1, int col_num = -1) : line_num(line_num), col_num(col_num), attr() {}
    virtual ~Node() = default;

    virtual void accept(Visitor& visitor) = 0;
};

// AST的根节点
class Root : public Node
{
  private:
    std::vector<StmtNode*>* stmts;

  public:
    Root(std::vector<StmtNode*>* stmts) : Node(-1, -1), stmts(stmts) {}
    virtual ~Root() override;

    virtual void accept(Visitor& visitor) override { visitor.visit(*this); }

    std::vector<StmtNode*>* getStmts() const { return stmts; }
};
```

#### 表达式节点
在 `frontend/ast/expr.h`，例如：
- `LiteralExpr` 保存字面量；
- `UnaryExpr`、`BinaryExpr` 保存运算符与子表达式；
- `LeftValExpr` 用于左值（可选索引维度）；
- `CallExpr` 保存函数项与实参列表。

>[!question]
>- trueTar：当该表达式求值为真时，应跳转到的目标（通常是基本块/标签编号）。
>- falseTar：当该表达式求值为假时，应跳转到的目标。
>- 为生成条件分支/短路求值的 IR 做准备，后续会据此发出形如 br i1 %cond, label %true, label %false 的跳转，其中两个 label 就来自这两个“Target”。

```c 47:61:/home/petto/learning/compiler/NKU-Compiler2025/frontend/ast/expr.h
// 字面量表达式，如整数、浮点数等。其具体数值存储在 literal 中
class LiteralExpr : public ExprNode
{
  public:
    VarValue literal;

  public:
    LiteralExpr(int v, int line_num = -1, int col_num = -1) : ExprNode(line_num, col_num), literal(v) {}
    LiteralExpr(long long v, int line_num = -1, int col_num = -1) : ExprNode(line_num, col_num), literal(v) {}
    LiteralExpr(float v, int line_num = -1, int col_num = -1) : ExprNode(line_num, col_num), literal(v) {}
    virtual ~LiteralExpr() override = default;

    virtual void accept(Visitor& visitor) override { visitor.visit(*this); }

    virtual bool isLiteralExpr() const override { return true; }
};
```

#### 语句节点
在 `frontend/ast/stmt.h`，例如：
- `ExprStmt`、`BlockStmt`、`ReturnStmt`、`IfStmt`、`WhileStmt`、`ForStmt`；
- 函数声明语句 `FuncDeclStmt`（返回类型、符号表项、形参、函数体）；
- 变量声明语句 `VarDeclStmt`，其核心组合体是 `VarDeclaration`（见 `decl.h`）。

```c 37:55:/home/petto/learning/compiler/NKU-Compiler2025/frontend/ast/stmt.h
// 函数声明语句，如 int func(int a, float b) { ... }
class FuncDeclStmt : public StmtNode
{
  public:
    Type*                          retType;
    Entry*                         entry;
    std::vector<ParamDeclarator*>* params;
    StmtNode*                      body;

  public:
    FuncDeclStmt(Type* retType, Entry* entry, std::vector<ParamDeclarator*>* params, StmtNode* body = nullptr,
        int line_num = -1, int col_num = -1)
        : StmtNode(line_num, col_num), retType(retType), entry(entry), params(params), body(body)
    {}
    virtual ~FuncDeclStmt() override;

    virtual void accept(Visitor& visitor) override { visitor.visit(*this); }
    virtual bool isVarDeclStmt() override { return false; }
};
```

#### 声明
相关在 `frontend/ast/decl.h`，例如：
- `VarDeclaration`（类型 + 多个 `VarDeclarator`）；
- `ParamDeclarator`（形参类型、符号项、可选维度）；
- `Initializer` 与 `InitializerList`。继承自`InitDecl`

```c 102:120:/home/petto/learning/compiler/NKU-Compiler2025/frontend/ast/decl.h
// 变量声明语句节点，如 int a = 5, arr[10] = {1,2,3};
// 它们的具体声明都放在 decls 里
// isConstDecl 标记是否是 const 声明
class VarDeclaration : public DeclNode
{
  public:
    Type*                        type;
    std::vector<VarDeclarator*>* decls;
    bool                         isConstDecl;

  public:
    VarDeclaration(Type* type, std::vector<VarDeclarator*>* decls, bool isConstDecl = false, int line_num = -1,
        int col_num = -1)
        : DeclNode(line_num, col_num), type(type), decls(decls), isConstDecl(isConstDecl)
    {}
    virtual ~VarDeclaration() override;

    virtual void accept(Visitor& visitor) override { visitor.visit(*this); }
};
```

#### 打印器
在 `frontend/ast/visitor/printer/`，核心类 `ASTPrinter` 是一个访问者，实现了对所有节点类型的 `visit`，用于把 AST 以统一的文本树样式输出。

```c 20:63:/home/petto/learning/compiler/NKU-Compiler2025/frontend/ast/visitor/printer/ast_printer.h
using Printer_t = Visitor_t<void, std::ostream*>;  // void return type, ostream pointer

class ASTPrinter : public Printer_t
{
  public:
    // Basic AST nodes
    void visit(Root& node, std::ostream* os) override;

    // Declaration nodes
    void visit(Initializer& node, std::ostream* os) override;
    void visit(InitializerList& node, std::ostream* os) override;
    void visit(VarDeclarator& node, std::ostream* os) override;
    void visit(ParamDeclarator& node, std::ostream* os) override;
    void visit(VarDeclaration& node, std::ostream* os) override;

    // Expression nodes
    void visit(LeftValExpr& node, std::ostream* os) override;
    void visit(LiteralExpr& node, std::ostream* os) override;
    void visit(UnaryExpr& node, std::ostream* os) override;
    void visit(BinaryExpr& node, std::ostream* os) override;
    void visit(CallExpr& node, std::ostream* os) override;
    void visit(CommaExpr& node, std::ostream* os) override;

    // Statement nodes
    void visit(ExprStmt& node, std::ostream* os) override;
    void visit(FuncDeclStmt& node, std::ostream* os) override;
    void visit(VarDeclStmt& node, std::ostream* os) override;
    void visit(BlockStmt& node, std::ostream* os) override;
    void visit(ReturnStmt& node, std::ostream* os) override;
    void visit(WhileStmt& node, std::ostream* os) override;
    void visit(IfStmt& node, std::ostream* os) override;
    void visit(BreakStmt& node, std::ostream* os) override;
    void visit(ContinueStmt& node, std::ostream* os) override;
    void visit(ForStmt& node, std::ostream* os) override;
```

### 符号表项（仅作类型引用）

虽然 Lab2 不实现符号表管理，但很多 AST 成员类型会用到 `Entry*`（如 `FuncDeclStmt::entry`、`LeftValExpr::entry` 等）。`interfaces/frontend/symbol/symbol_entry.h` 里给出了 `Entry` 的工厂式接口与名称存储。

```c 9:27:/home/petto/learning/compiler/NKU-Compiler2025/interfaces/frontend/symbol/symbol_entry.h
class Entry
{
    friend class EntryDeleter;

  private:
    static std::unordered_map<std::string, Entry*> entryMap;
    static void                                    clear();

  public:
    static Entry* getEntry(std::string name);

  private:
    Entry(std::string name = "NULL");
    ~Entry() = default;
    std::string name;

  public:
    const std::string& getName();
};
```

在语法分析阶段，你只需要理解：若动作中需要“绑定”一个标识符到统一的实体，可通过 `Entry::getEntry("name")` 获得一个可共享的指针，供 AST 节点引用。

### 源码阅读顺序（建议的理解路径）

不涉及实现，只说“看什么”和“得到什么认识”：
1) 先看 `main.cpp` 中 Lab2 注释块与 `-parser` 分支，明确输入输出与调用点是 `parseAST()` 与 `ASTPrinter`；
2) 打开 `frontend/parser/yacc.y`，浏览：
   - 文件头 `%code requires` 与 `%code top`：它把 AST 类型、Scanner、Parser 接起来；
   - `%token` 与 `%nterm`：理解每个语义值类型对应哪个 AST 指针；
   - 文法规则（在后续部分）：在动作里会“new”各种 AST 节点并向上归约；
3) 打开 `frontend/ast/` 下的四个头文件，理解树的“骨架”，把“文法产生式左/右侧非终结符的类型”与“具体 AST 类”对上号；
4) 打开 `frontend/ast/visitor/printer/`，理解打印器覆盖的节点集合与输出形式，之后对拍 `testcase/parser/` 里的“期望打印”。

### 关于文档《构造语法分析器.pdf》

本仓库提供了 `构造语法分析器.pdf`（同目录下）。结合上面的结构，它通常会从“形式文法 -> Bison/Flex 基本使用 -> 语义动作构建 AST”的路径讲解。实操时，你只要把文档里的“非终结符设计 + 归约时构造对象”的思路，与 `yacc.y` 中的 `%nterm` 类型绑定、AST 类接口对照起来理解即可。若你希望，我可以在你指定的某段 PDF 内容基础上，逐条映射到当前代码框架的相应位置与类型。

——

小结：
- Lab2 的调用链是：`main.cpp` 调用 `FE::Parser::parseAST()`，Bison 解析根据 `yacc.y` 文法+动作构造 AST，然后用 `ASTPrinter` 打印；
- `yacc.y` 里，token/非终结符的“语义值类型”直接指向具体 AST 类指针，动作中负责“拼装树”；
- `frontend/ast/` 下的 `ast.h / expr.h / stmt.h / decl.h` 定义了树的类型宇宙；打印器在 `frontend/ast/visitor/printer/`；
- `interfaces/frontend/symbol/symbol_entry.h` 提供了轻量的符号项引用类型（Lab2 仅作引用理解）。

如果你希望，我可以继续按“一个具体测试用例”（例如 `testcase/parser/simple.sy`）走读它在 `yacc.y` 中会触发哪些产生式，每一步会构造哪个 AST 节点，以及最终打印长什么样。

---

### yylex 是“解析器向词法分析器取 token”的桥

^68962f

：Bison 每要一个 token→叫 yylex→yylex去找 Scanner→拿到 token 给 Bison→根据文法归约/构造 AST。Bison 不认识你的 Scanner，只认识 yylex；而 yylex 又不做复杂事，只是把“要 token”这件事转给 Scanner::nextToken()，再把结果按 Bison 需要的类型交回去。


```c
static YaccParser::symbol_type yylex(Scanner& scanner, Parser &parser)

{

(void)parser;

return scanner.nextToken();

}
```
  static YaccParser::symbol_type yylex(Scanner& scanner, Parser &parser)
  {
      (void)parser;
      return scanner.nextToken(); 
  }
  ```
  也就是 `yylex(Scanner&, Parser&)` 的签名来自这两行 `%lex-param`。

- `%parse-param { ... }`：把这里声明的参数加到“解析入口”和“语义动作上下文”中，使解析过程中和各个动作代码能拿到同名对象（如 `scanner`、`parser`）。简言之，语法分析时也能访问到同一份 `Scanner&` 与 `Parser&`。

- 二者配合效果：Bison 负责调 `yylex(scanner, parser)` 取 token；你的 `yylex` 再调用 `scanner.nextToken()`。同时，规约动作里若需要用到 `scanner`/`parser` 也拿得到。

一句话记忆：
- `%lex-param` 给 `yylex` 添参数；
- `%parse-param` 给解析过程/动作添参数；
- 用它们把同一份 `Scanner&` 和 `Parser&` 贯穿到“取词”和“语法动作”里。

- 这次解答要点
  - 解释了 `%lex-param` / `%parse-param` 的作用与区别。
  - 关联到 `yylex(Scanner&, Parser&)` 的函数签名来源。
    
    
```



---
为什么这五个表达式类需要重载析构函数@expr.cpp?
因为这些表达式节点拥有（own）堆分配的子节点/容器，需要在析构时递归释放，避免内存泄漏；而项目里用的是原始指针，所以必须手动 delete。
ast的源文件都是在重载析构函数

---

ast_printer.cpp

[MODE: RESEARCH]

这个文件实现的是 AST 打印器里与根节点相关的打印逻辑，用“树形 ASCII”把整棵语法树有层次地输出到给定的输出流中，便于人类阅读和对拍测试。

- 做了什么
  - 维护一条“是否为本层最后一个子节点”的栈 `lastStack`，用来渲染前缀符号（`|   `、``    ``、`|-- `、``-- `）。
  - 提供几个小工具函数：
    - `emitPrefix(os)`: 根据 `lastStack` 打印每行前缀。
    - `emitHeader(os, text)`: 打印前缀+一行标题文本。
    - `pushLast/isLast` 与 `popLast`: 入栈/出栈维护层级状态。
    - `withChild(isLast, fn)`: [^1]RAII 风格包裹，进入子节点时推状态，执行回调后自动弹出。
  - `visit(Root&, std::ostream*)`: 打印根节点标题“ASTree”，再遍历根的语句列表，逐个递归打印子节点。

- 有什么用
  - 与 `main.cpp` 中的 `apply(printer, *ast, outStream)` 配合，输出完整 AST 的树形文本，供 `-parser` 阶段验证语法分析结果是否正确（和 `testcase/parser/*.parser` 对拍）。
---
`ast_printer.cpp`

- fn 是一个回调（lambda/function），表示“如何打印当前子节点及其子树”。调用处传入的是：[&](){ apply(*this, *child, os); }。

- withChild(isLast, fn) 的职责仅是管理层级状态：先 pushLast(isLast)，执行 fn() 打印子树，最后 popLast() 恢复状态。它不直接打印文本。

- 具体的一行标题打印由各节点自己的 visit(...) 内部完成：那些 visit 会先调用 emitHeader（而 emitHeader 内部会调用 emitPrefix），再继续递归。根的 visit(Root&) 特例，直接输出 "ASTree\n"，其子节点进入各自 visit 后才会用到 emitHeader/emitPrefix。

- 总结：withChild 负责“层次前后处理”，fn 负责“实际打印动作（apply 触发对应节点的 visit）”。emitPrefix/emitHeader 在子节点的 visit 里用，而不是在 withChild 里用。



---
[MODE: RESEARCH]

梳理 lab2 语法分析的整体架构和相关文件。先查看关键文件以理解整体结构。


[6 tools called]


继续查看 AST 节点定义和接口文件，完善对整体架构的理解。


[5 tools called]


## Lab2 语法分析整体架构

### 一、整体流程定位

语法分析是编译器的第二阶段，位于词法分析之后。在 `main.cpp` 中，当使用 `-parser` 参数时，会执行语法分析并将结果输出为 AST。

### 二、核心组件架构

#### 1. 词法分析层（Lexer）

**文件：`frontend/parser/lexer.l`**

- 作用：将源代码文本转换为 Token 序列
- 实现：Flex 词法分析器
- 功能：
  - 识别关键字（if、else、for、while 等）
  - 识别标识符和字面量（整数、浮点数、字符串）
  - 识别运算符和分隔符
  - 处理注释（单行 `//` 和多行 `/* */`）
  - 维护位置信息（行号、列号）

#### 2. 语法分析层（Parser）

**文件：`frontend/parser/yacc.y`**

- 作用：将 Token 序列转换为抽象语法树（AST）
- 实现：Bison 语法分析器（LALR(1)）
- 核心功能：
  - 定义文法规则：声明 Token 和非终结符，定义产生式
  - 构建 AST：在产生式动作中创建对应的 AST 节点
  - 处理优先级和结合性：通过 `%precedence` 解决冲突
  - 错误处理：提供错误报告机制

**关键文法结构**：
- 程序结构：`PROGRAM -> STMT_LIST`
- 语句：`STMT -> EXPR_STMT | VAR_DECL_STMT | FUNC_DECL_STMT | IF_STMT | WHILE_STMT | FOR_STMT | RETURN_STMT | BLOCK_STMT` 等
- 表达式：按优先级分层（逻辑或、逻辑与、相等性、关系、加减、乘除、一元、基本表达式）
- 声明：变量声明、函数声明、参数声明

#### 3. AST 节点定义层

**目录：`frontend/ast/`**

AST 节点分为三类：

**a) 表达式节点（`expr.h/cpp`）**
- `LiteralExpr`：字面量（整数、浮点数等）
- `LeftValExpr`：左值（变量、数组元素）
- `BinaryExpr`：二元运算
- `UnaryExpr`：一元运算
- `CallExpr`：函数调用
- `CommaExpr`：逗号表达式

**b) 语句节点（`stmt.h/cpp`）**
- `ExprStmt`：表达式语句
- `VarDeclStmt`：变量声明语句
- `FuncDeclStmt`：函数声明语句
- `BlockStmt`：块语句
- `IfStmt`：条件语句
- `WhileStmt`：循环语句
- `ForStmt`：for 循环
- `ReturnStmt`：返回语句
- `BreakStmt`、`ContinueStmt`：控制流语句

**c) 声明节点（`decl.h/cpp`）**
- `VarDeclaration`：变量声明
- `VarDeclarator`：变量声明符
- `ParamDeclarator`：参数声明符
- `Initializer`、`InitializerList`：初始化器

**d) 根节点（`ast.h`）**
- `Root`：AST 根节点，包含语句列表

#### 4. 接口抽象层

**目录：`interfaces/frontend/`**

**a) 解析器接口（`iparser.h`）**
- 使用 CRTP（Curiously Recurring Template Pattern）
- 定义 `parseTokens()` 和 `parseAST()` 接口
- 具体实现：`FE::Parser`

**b) AST 定义（`ast_defs.h`）**
- 类型系统：`Type`、`BasicType`、`PtrType`
- 操作符：`Operator` 枚举
- 属性：`NodeAttr`、`VarAttr`、`ExprValue`、`VarValue`
- 类型工厂：`TypeFactory` 管理类型对象

**c) 符号表接口（`symbol/`）**
- `Entry`：符号表项
- `iSymbolTable`：符号表接口

#### 5. 访问者模式层

**目录：`frontend/ast/visitor/`**

**a) AST 打印器（`printer/`）**
- `ASTPrinter`：实现访问者模式，打印 AST
- 支持树形输出，便于调试

**b) 语义检查器（`sementic_check/`）**
- `ASTChecker`：遍历 AST 进行语义检查
- 在 Lab3 中使用

### 三、数据流转过程

```
源代码文件
    ↓
[词法分析器 lexer.l]
    ↓ Token序列
[语法分析器 yacc.y]
    ↓ AST节点
[AST构建完成]
    ↓
[AST访问者（打印/检查/代码生成）]
```

### 四、关键设计模式

1. 访问者模式：用于遍历和操作 AST
2. CRTP：用于解析器接口抽象
3. 工厂模式：`TypeFactory` 管理类型对象
4. 组合模式：AST 节点树形结构

### 五、文件依赖关系

```
main.cpp
    ↓
frontend/parser/parser.h (FE::Parser)
    ↓
frontend/parser/yacc.y (Bison语法规则)
    ↓ 依赖
frontend/parser/lexer.l (Flex词法规则)
    ↓ 生成
frontend/ast/*.h (AST节点定义)
    ↓ 使用
interfaces/frontend/ast/ast_defs.h (类型系统)
interfaces/frontend/symbol/symbol_entry.h (符号表)
```

### 六、语法分析的核心任务

1. 文法设计：在 `yacc.y` 中定义 SysY 语言的文法规则
2. AST 构建：在产生式动作中创建对应的 AST 节点
3. 优先级处理：通过 Bison 的优先级机制处理运算符优先级
4. 错误恢复：提供语法错误报告和位置信息
5. 符号关联：将标识符与符号表项关联（通过 `Entry::getEntry()`）

该架构将词法分析、语法分析、AST 构建和后续处理分离，便于维护和扩展。

[^1]: RAII，全称为 Resource Acquisition Is Initialization，中文常翻译为“资源获取即初始化”。 它的核心思想是： 将资源的生命周期与对象的生命周期绑定。 资源在对象构造函数中获取（初始化） 资源在对象析构函数中释放 这意味着，只要一个 RAII 对象成功创建，我们就拥有了资源；当这个对象离开其作用域被销毁时，资源就会被自动、可靠地释放。
