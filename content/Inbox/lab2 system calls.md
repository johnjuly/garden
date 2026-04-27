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

## sandbox a command

`sandbox 32768 - cat README`
![[Pasted image 20260423162552.png]]
创建一个 interpose 系统调用，用于沙盒化进程，限制其子进程可以调用的系统调用。
- 2个参数，1个整数掩码（ 系统调用号码，说明拒绝哪个系统调用）和一个路径。这里第二个参数为"-"

### 添加的内容

#### user

- Add \$U/\_sandbox to UPROGS in Makefile  编译该程序。
- a prototype for interpose `user.h`  添加原型 让用户可以调用
- a stub `usys.pl`  它做了什么？ makefile 触发perl script -> produces usys.S  实际的系统调用stubs,使用risc-v ecall指令转移到kernel中。

---

#### kernel

- a syscall number `syscall.h` 系统调用号
- `proc.h` 在结构体中添加 int mask 存储每个进程interpose的掩码
- `sys_interpose()` sysproc.c,读取参数存在结构体中。设置掩码
- 将 sys_interpose 添加到syscalls array &原型声明
- syscall()函数， 在执行系统调用前检查 `if(p->interpose_mask&(1<<num))` 匹配 则返回-1
- kfork() 子进程继承掩码 `np->interpose_mask=p->interpose_mask`



![[Pasted image 20260423161807.png]]

### 调用关系

#### 用户程序调用链
- sandbox调用interpose(mask,path)
- stub 执行`li a7,SYS_interpose; ecall` 触发内核中断
#### 内核处理链
- syscall( )被调用，获取 num=SYS_interpose
- 调用 sys_interpose(), 设置`myproc()->interpose_mask=mask
- 子进程通过fork()创建时，kfork() 复制掩码
- 当子进程执行其他系统调用时，syscall()检查掩码并可能拒绝

### 描述

从用户空间开始，添加stub和原型；内核中定义号，存储字段，实现处理函数 ，修改调度逻辑，确保继承和检查。

## Sandbox with allowed pathnames

![[Pasted image 20260423164819.png]]


扩展，不仅根据掩码拒绝系统调用，还允许特定的open和exec系统调用访问指定的路径名。即使这些系统调用被掩盖，若路径名匹配允许的路径，则允许执行。增加了沙盒的灵活性，避免完全阻塞必要的文件访问。


### 添加
#### kernel
- `proc.h` 在struct proc中添加 char allowed_path[MAXPATH] 用于存储允许的路径名
- `sysproc.c` 修改sys_interpose() 使用 argstr读取路径名，并用safestrcpy存储到myproc()->allowed_path
- proc.c
	- allocproc中添加memset(p->allowed_path,0,MAXPATH) 初始化新进程的允许路径为空。
	- kfork()中 safestrcpy 确保子进程继承父进程的允许路径
- syscall.c 修改syscall函数的检查逻辑，如果num是SYS_open或者SYS_exec且被mask,则获取路径名argstr，比较strncmp，若匹配则允许执行。

### 调用关系

#### 用户程序调用链
- sandbox 调用interpose(mask,path),路径名作为第二个参数传递
- stub通过ecall 进入内核，调用syscall()

#### 内核处理链
- syscall()获取num,调用sys_interpose()设置mask和allowed_path
- 子进程通过fork()创建时，kfork()复制allowed_path
- 当子进程执行open或者exec时，syscall检查掩码和路径，如果被掩码但是路径匹配，则允许；否则拒绝。

### 描述

- 从简单掩码 到 路径感知。
- 存储路径：添加字段；设置时：读取路径；继承：复制路径。
- 检查时特殊处理open和exec,提取参数比较路径。
- 这确保了沙盒既能拒绝大部分调用，又能允许关键文件访问。


## attack xv6

