---
tags:
  - verilog
created: '2026-01-06'
---
在 verilog语言中有三种赋值
1. 连续赋值 `assign x=y;` 使用条件：只能在不是a procedure内部时使用（always block）
2. procedural blocking assignment(`x=y`) 只能在procedure内部使用
3. procedural 非阻塞赋值 `x<=y`只能在procedure内部使用

准则：
	- 在组合always 块中 使用 阻塞赋值
	-  在 clocked always 块中 使用 非阻塞赋值


----
# 硬件设计中的一个重要原则：避免无意中生成锁存器。
1. 设计电路时，应该从电路结构角度出发，而不是先写代码再希望它生成正确电路
2. 若代码没有指定所有情况下输出信号的值，verilog会保持输出不变，这就会生成锁存器来记忆状态。
3. 组合逻辑电路必须在所有条件下为所有输出赋值，否则就会产生锁存器。


---
# always case

verilog语言中的case 语句与一系列的if else if else .compares one expr to a list of others.

----
# casez
