instruction selection:

> the process of translation llvm code presented to the code generator into target-specific machine instructions.there are several well-known ways to do this in the literature.llvm uses a selectiondag based instruction selector.

指令选择 中间代码-> 目标 汇编语言。
这是一个**组合优化**的问题。满足给定的一组约束的前提之下，达到某个目标的最优化？很多的可能性，选择一个最优的可能。比如，图算法，a点到b点的最短路径，约束。
这里的约束？llvm->asm 语义不变。
优化目标？翻译方案很多种，每一条指令 有相应的代价。选一个最小化某种代价的翻译方案。指令条数？消耗的时钟周期？能量耗电？
理论上Np-hard的问题。具体实现中 可以做简化，启发式的算法。
> 略有耳闻

三部分 llvm 树翻译方案 毕昇编译器原理与实践：最佳覆盖与最优覆盖算法

整体的地位：
![[Pasted image 20260102141845.png]]

具体的
从llvm ir 开始，目标是 assembly 和object code.线性的代码转换为有向无环图。DAG
![[Pasted image 20260102152521.png]]
中间五个部分：
1. 指令选择 产生MachineInstr
2. 指令调度：dag图序列化，拓扑排序等做一些优化 变成线性的代码
3. 寄存器分配：多的虚拟器，实际上寄存器数量有限。溢出：哪些变量可以存储到寄存器，多出来的放到内存里。从寄存器里溢出到内存当中去。优化的问题。理想 都想放到寄存器里，速度快。
4. 指令调度。又有了寄存器的信息。
5. 代码发送。

今天 指令选择部分。三大块 其实 选择 调度与分配。
调度 流水线 硬件 并行相关。

Where is Prologue/Epilogue Insertion?
堆栈管理，函数调用 操作 stack pointer. 空间的创造与释放。序言与收尾。该放在什么位置上。寄存器分配之前？/之后？。放在寄存器分配之后。要分配多大的栈空间 直到哪些变量可以放到寄存器当中 哪些放到内存中

函数调用的实现？调用的规定。calling conventions:哪些寄存器由caller来保存，哪些寄存器由callee来保存，返回值怎么传递的，参数是怎么传递的，返回地址传递在哪里。


## llvm

dag 也是一系列的选择

得到节点。一系列combine的优化。合法化 legalize 两个事情 一个是类型的合法，64  long long int,在不支持64位的32位平台；另外的 operation 有些操作不支持，循环移位操作 没有相对应指令 用其他指令来实现。![[Pasted image 20260102153316.png]]
三种策略![[Pasted image 20260102153458.png]]
1. SelectionDag Isel.开o1 一系列步骤 
2.  fast sel o0
3. globalIsel 函数范围 优化更多


### selectiondag

- 边表示数据的依赖关系，蓝色控制流依赖
- 绿色的框 处理64位的事情。%x :build pair  需要两个寄存器来存储; %y 2号存储器。 build pair 之后 做截断 操作。![[Pasted image 20260102154053.png]]




![[Pasted image 20260102154357.png]]
- 优化的地方：build pair后面就有截断 两个寄存器拼起来，既然总归要扔掉，那么一开始就不要要了 声明为undef节点

- build pair 也不要了 。直接%0和%2寄存器里面的内容做乘
![[Pasted image 20260102154535.png]]
优化之后，指令选择。
序列化。![[Pasted image 20260102154729.png]]llvm dag替换成目标平台的dag图。目标指令支持的节点。匹配问题。去匹配小的模板。乘法，两个操作数。每个指令 对应一颗小的树。匹配 替换 最终 一个节点？所以 这一步 模式匹配 谁是模式？匹配谁？目标平台支持的指令 每个指令表示为一颗树 三五个节点 匹配dag图 。组合优化问题，一个节点 多个匹配方案，小的pattern去铺满整个树 覆盖的可能性。每一种不同的代价，最优的 选择。

>[!quote] SelectionDAG Select Phase
>The Select phase is the bulk of the target-specific code for instruction selection. This phase takes a legal SelectionDAG as input,pattern matches the instructions supported by the target to this DAG,and produces a new DAG of target code. 



![[Pasted image 20260102154706.png]]


## 树上做匹配
![[Pasted image 20260102155807.png]]
- ind 取值（分为左值和右值，不一样，地址和值） 间接访问 indirection .首地址。
 八种简单的指令：
 1. 立即数aload到ri里
 2. x所在的内存 load到寄存器i
 3. 有三个节点的树结构，寄存器r里的内容存储到，树替换成大M。结果在内存里，作出动作，发出st指令。![[Pasted image 20260102162527.png]]
 4. 如果立即数是1 直接 Inc![[Pasted image 20260102162649.png]]
 第六条更大的树形 来匹配整个大块，匹配的方案 不止一种 采用大的匹配。![[Pasted image 20260102163017.png]]
 tiling 瓦片覆盖 ，cover. 
 过程 变成 算法 。
 lr 是寻找句柄， 替换左边。这里也一样。要识别的是树。把这棵树 序列化成 字符串。前缀表示。转化成**语法分析**翻译的问题。每一次匹配一条产生式 相应动作。 从左往右 从下往上。
 **问题**：二义性：偏向于执行较大的归约，而不是较小的归约。
- 归约/归约冲突；优先选择较长的归约。
- 移入/归约冲突；优先选择移入动作。

小树型对着树做模式匹配，可以转换成语法分析的问题
## 毕昇编译器
鲲鹏处理器
