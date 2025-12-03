#编译原理

[chris lattner](https://nondot.org/sabre/) 笑眯眯怪

  

[acm 软件系统获奖名单](https://en.wikipedia.org/wiki/ACM_Software_System_Award)

![[Pasted image 20251203154203.png]]

- x86 台式机 笔记本

- arm 手机 嵌入式

  
  

LLVM IR :**带类型**的、介于**高级程序设计语言**与**汇编语言**之间

  

与汇编语言相比：带类型；

与高级语言相比 ：低一层 没有if while 靠的是 跳转指令 br goto jump

可以理解为带类型的汇编语言

  
  

- 一个module 模块对应一个.c文件

- .ll中 即一个模块中 由两大部分组成 函数+全局变量

- 函数由若干个基本块构成 basic block

- 每一个基本块由指令构成![[Pasted image 20251203154914.png]]

  

## 三个例子 由浅入深

  

### 1 顺序语句（+函数调用）

![[Pasted image 20251203155427.png]]

命令 选项 到中间停下 `-emit-llvm` ；`-S`翻译成人类可读的ll中间代码 否则以bitcode形式生成。 `-g0` 不要debug信息![[Pasted image 20251203155404.png]]

  

- 以逗号开头 是注释

- 全局符号以@开头 函数。局部加%，也可为寄存器。

- 指令名上面也带有类型信息 icmp fcmp

- 参数名 返回名 带由类型信息

- cmp的结果是1位，零扩展 变为 32位 %6 zero exetension

  

- 也叫做三地址码 Three Address Code (TAC)

- **性质**：静态单赋值。static single assignment.每一个寄存器只能在等号左边一次，只能给它赋值一次，所以不断使用新的寄存器。它的优点：易于找到在什么地方赋值的，对应的定义的那一行，关系清楚。代码优化。

  

### 2 选择语句

![[Pasted image 20251203160519.png]]

  

---

- 概念：控制流图CFG 一个函数内部的控制流 不是函数与函数之间的调用关系，frances elizabeth allen.

  
  

- 每个节点是基本块

- 基本块：有序的指令序列，对它的要求：除了在退出点和进入点之外 没有跳转和分支语句。不可能跳转到中间的位置。如果基本块里面有跳转分支指令 那么只能出现在最后一条指令。

- 跳转关系构成有向边![[Pasted image 20251203161132.png]]

---

  

跳转![[Pasted image 20251203161440.png]]

  

%4 为 val.最后一个基本块为return

从%2所指示的地址空间返回。![[Pasted image 20251203162124.png]]

  

bb基本块的特点：最后一条指令 terminator instructions: `ret` `br`

为什么中间可以有call指令，终结指令指示了下一个基本块的地址，call没有跳到其他基本块。

开O1优化后的代码

phi指令 如果是什么分支来的 返回对应值![[Pasted image 20251203162741.png]]

$\phi$指令

转换成静态单赋值形式。通过下标重命名。单赋值引入问题，汇总时到底选y1还是y2![[Pasted image 20251203163123.png]]使用$\phi$指令选择

ssa的构建 消去 重建。

### 3 循环语句

![[Pasted image 20251203163409.png]]

结果存储到%3中不开优化![[Pasted image 20251203163710.png]]

寄存器指针存储值地址

%5有两个前驱，考虑是否要插入phi指令。

开一级优化，没有内存空间保存值了，load store,都是在寄存器当中做运算。![[Pasted image 20251203164126.png]]

phi出现在% 3和%5 有前驱
如果value小于2 直接返回了
无论你是从基本还是循环情况跳转来的，汇总 选取 返回。
单赋值。
优化：mem2reg

三个资料 #todo
- [llvm ir animation](https://blog.piovezan.ca/compilers/llvm_ir_animation/llvm_ir.html)
- [llvm ir tutoral](https://www.bilibili.com/video/BV1mE421g7BA/?share_source=copy_web&vd_source=afddc1f6e07c3046ed07519aa34370fd)
- [使用命令行生成](https://www.bilibili.com/video/BV1jT421C7cH/?share_source=copy_web&vd_source=afddc1f6e07c3046ed07519aa34370fd)
- 