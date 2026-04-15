---
created: 2026-04-15
tags:
  - 操作系统
  - 记录
  - lab
---
stub? 原意：被截断后剩下的一小截东西。票根，树桩。
映射：功能没有实现，但接口仍在，函数壳，转发。
由pl[^1]生成汇编指令(`usys.S`)

[^1]: perl 语言，[作者的page](https://www.wall.org/~larry/) infp+1,  广泛的爱好，对语言的兴趣

#问题
make 但是 并没有生成.s文件，只是编译了kernel相关的文件。
make 是 按依赖按需生成。没有触发user构建。usys.S只有在需要user程序时才会生成。 `make qemu` 


```c
write:
li a7,SYS_write
ecall
ret
```

首先，编译器将**函数的参数**保存到寄存器(a0...)中，该函数将**系统调用编号**保存到a7. 供内核查看。
ecall 指令 从用户到内核空间，uservec->usertrap->syscall

系统调用的参数放到trapframe，int,addr,fd 不同类型的参数用不同函数解读。
pointer的情况。用户空间和内核空间不同，使用函数辅助，安全地在两个空间传递data.


内核中VA=PA

