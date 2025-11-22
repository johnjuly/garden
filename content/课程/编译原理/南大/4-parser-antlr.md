
## 任务一：设计一个类c语言![[Pasted image 20251029154512.png]]

### 文法结构

- 从上到下来描述。一个Prog长什么样子，`prog: (varDecl | functionDecl)* EOF;`变量声明或者函数声明，星号表示0个或者任意多个。接下来分别描述一个变量声明一个函数声明是什么样子的
- 可选的初始化?，`varDecl: type ID ('=' expr)?';';`
- `functionDecl:type ID'{'formalParameters?'}' block;`
- `formalParameters:formalParameter(','formalParameter)*` 迭代的方式；或者递归的方式如下
- `fps:fp ',' fps|fp;`右递归
- 函数体`block: '{stat*'}';`
- 语句 block stat互递归，a调用b b调用a
```g4
stat:block
	|varDecl
	|'if'expr'then' stat('else' stat)?
	|'return' expr?';'
	|expr'='expr';'
	|expr ';'
	;
```

变量声明，条件语句，后面的else可选的。赋值语句；表达式语句；
- **难点**：表达式；不递归一个表达式可以就是一个整数、变量。取负 取非 逆运算。中括号 数组下标访问。括号 函数调用

```g4
expr: ID'('exprList?')' //函数调用
	| expr'['expr']' //数组
	| '-' expr
	| '!' expr
	| expr'^'expr
	|expr('*'|'/')expr
	|expr('+'|'-')expr
	|expr('=='|'!=')expr
	|'('expr')'
	|ID
	|INT
	
```

### 二义性文法 ambiguous

![[Pasted image 20251029161138.png]]
antl4使用最前优先匹配原则 采用2，c语言中说else与离他最近的还未匹配if匹配。

- 运算符的结合性带来的二义性。antl默认左结合。`<assoc=right>`。同一个符号。
- 运算符的优先级带来的二义性。antl4认为乘法优先级高于减号。消耗时间的方法理解起来也更难。left recursion;right recursion![[Pasted image 20251029162420.png]]
- 

## 任务二：抽取函数调用图![[Pasted image 20251029154458.png]]
一个类 parsetreewalker 负责以dfs方式深度优先遍历语法分析树。每个节点至少访问两次。enter exit;每个节点 触发事件进入 退出。接受事件，做相应处理。
![[Pasted image 20251029163601.png]]
- 处理两个事件，一个是进入到函数声明节点的事件，一个是进入到函数调用节点的事件，拿到函数名，画边。
- antl4 expr中的备选分支加标签 所产生的事件更加细致了。`#functionCall`![[Pasted image 20251029163905.png]]
- left hand side变量命名的问题  op表示是乘还是除
- 覆写其中的两个方法。![[Pasted image 20251029164236.png]]
- 节点 集合，边 hashmap;问题是怎么得到一个个函数名add到节点，得到一个个函数调用关系把他加到边里
- 用一个变量记录当前正在活跃的函数`currentfunction`动态遍历的过程。
- 监听函数的缺点是 返回值为void 不允许返回值；两种方法 visitor ;标注语法树