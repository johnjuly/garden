---
created: '2026-01-06'
---


I/O: input&output, 是一切实现的基础.无的话无法保留（转存到文件中）
两种实现：
	标准IO stdo 
	系统调用IO (文件IO)sysio
	 优先使用标准io.
	 移植性好，并且合并系统调用(为读写加速，buffer和cache)
	 系统调用io由内核提供，不同内核系统io不同，各个平台不同。标准出来和稀泥，对话kernal.
	 printf函数，stdio中的；标准io在系统io基础上,由系统io实现；linux windows都可以用printf;
	 ![[Pasted image 20250807202344.png]]
	 不同的std依赖的sysio不同，标准io中的fopen:linux依赖open;win依赖openfile





# stdio:FILE类型（结构体）贯穿始终

一系列函数：
打开与关闭：
fopen():
> stream open functions

返回值为FILE起始位置
'''FILE \*fopen(const char* path, const char\*mode)'''
- 加const ，不改变；char \*ptr=“abc”;ptr[0]='x';不同编译环境不一样.传的是常量
- 返回值，errno 全局变量，缺陷：大家一起用，若用了没有及时打印，会被其他人使用覆盖；usr/include/asm-generic.errno现已私有化，为宏
- 出错，perror,strerror两种函数
- 返回的指针放在堆里，localtime返回结构体指针放在静态区static区函数被 重复调用时只会声明一次，同一块空间
- 头文件的包含，malloc函数，int *p=malloc(sizeof(int))
- 小技巧：有互逆操作的函数fopen,fclose，返回的指针放在堆上。
fclose();
- 是资源就有上限，一个进程空间里打开的文件数:1024
- stdin sdout stderr 1021 命令：ulimit -a
- 权限设置：0666&~umask (0002)umask值越大，消的权限越多一个文件；664
- -rw-rw-r--

静态区中的
读写字符/字符串/二进制
fgetc();
fputc();
fgets();
fputs();
fread();
fwrite();

printf();
scanf();

文件指针：
fseeko();
ftello();
rewind();


fflush();

getline();

man手册：第一章 基本命令；第七章：man 7 socket/cp/epoll 机制；第三章 标准库函数；使用man手册学习；

-  很多面试题与缓冲有关系 行缓冲 全缓冲 


