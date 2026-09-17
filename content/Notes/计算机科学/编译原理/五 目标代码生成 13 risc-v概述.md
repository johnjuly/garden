---
created: '2026-01-06'
---


## 背景
汇编语言。

大生态，芯片制造。

Reduced Instruction Set Computer 精简指令集计算机。第五代。

each instruction performs only one function.每条指令只做一件事情。定长。


指令集：软件硬件的接口。![[Pasted image 20251230085256.png]]
定义指令，数据类型，寄存器  ，输入输出

开源
模块式，菜单（大而全，增量式,x86）![[Pasted image 20251230090236.png]]

---
![[Pasted image 20251230090439.png]]


通用寄存器 x0-x31，别名，`zero`   `ra`  `sp`  `gp`
t0-t6 7个临时寄存器


[RARS 模拟器](https://github.com/TheThirdOne/rars)
*r*isc-v *a*ssembler and *r*untime *s*imulator
![[Pasted image 20251230092755.png]]
寄存器的操作。
`li`伪指令，语法糖, `addi t0 ,zero,100`
如何系统调用？how to use syscall system services?
step1:load the service number in register a7
step2:load argument values in a0,a1...
step3:issue the ecall instruction


zero的用法：把一个寄存器里的内容复制到另一个寄存器 add a0,t6 ,zero;伪指令  move a0 ,t6
