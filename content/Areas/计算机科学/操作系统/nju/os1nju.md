- 计算机：无情地执行指令的机器。
	- 机器永远是对的！
- 使用命令`gcc helllo.c -g` a.out #编译 assembler汇编器· 的输出结果 ,a不是abcd的a.-g生成调试信息 -O0表示不优化
- #gdb  p a打印变量a的值 ，n nextstep
- relasese mode不再是写什么就生成什么，会生成比你写得更高明的代码，编译器优化
- ==一个很重要的概念：== every thing is a state machine **Take away message**
	- 程序的执行 状态的变化；指令的执行，内存的值和寄存器的值  状态的变化  
	- 那么，可以给c语言写一个解释器，每次一句话执行一小部分
	- 状态的迁移
- gdb调试的时候，程序停下来总是在一个状态，状态里有变量的值 `info locals`打印局部变量
- 安卓运行在java虚拟机上，所有安卓应用代码都是编译的，而java虚拟机解释。
- 例子：3n+1猜想，能否画状态图？
- 当觉得调试困难的时候，请想到程序就是一个状态机。你要做的就是检查这个状态里面有没有哪个值不对
## 递归与非递归
状态机概念相联系。
c程序：状态=变量数值+栈
一次状态的迁移 next 每一个栈帧都有一个pc.执行就是每一次从top most取语句执行
汉诺塔
- 函数返回 把顶上的栈帧返回出来


- 再次 状态机 是一个严格的数学对象。
程序的状态一个一个的栈帧[stackframe,stackframe,...]+全局变量
初始状态 一个stackframe,main
- 但是 有些事情实现不了 putchar printf有的时候打印到屏幕显示器像素，有的重定向输出到文件；exit .每一次pc取指令，那么最后栈都弹完了就得到了一个非法的状态
- 涉及到程序外的状态 api操作系统。纯粹的计算只改变程序内状态。操作系统帮大家打开api的世界。



------
- 程序从_start开始执行，那么自己定义一个呢
- 使用命令`gcc -nostartfiles hello.c`
- 加上更多编译选项使得所占内存变小`gcc -nostartfiles - static -nostdlib  hello.c`
- gdb调试 gdb `starti`在第一条指令就调试他`layout asm
```c
void _start(){
	while(1);
}
```
`./a.out` segmentation fault
- 看`info registers` p $rax p $rdi  p/x $rsp 栈指针  
- cpu 执行指令的机器 内存里有什么就执行什么
- 所有的指令都是改变内存和寄存器的，程序内部，在这个世界上除了一条指令，syscall；把整个世界（进程）交给上帝。os超出我们控制的另外的一个实体，代表了外部的更大的程序，程序外部的状态
- 与上帝的契约 app binary interface,比program interface更底层 在二进制文件上 准备寄存器
- `man 2 syscalls`
- coreutils
- `find . -name "*.c" |xargs wc -l |less` #待查
- daemon :systemd 万物归宗
- curiosity is all you need
- `strace -f  gcc a.c`追踪所有创建的子进程。与os交互的过程