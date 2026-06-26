---
created: '2026-01-06'
---


## 进程
## 文件和设备

### 文件：有名字的数据对象
- 字节流（终端）/dev/null;/dev/random; ls -l 左边会有c character device 字符设备，![[Pasted image 20251119115524.png]]
- 一旦读写 就被消失 吃掉了。
- 字节序列
### 文件描述符
- 一个指针，指向操作系统对象，访问。
- `open` 找到最小的没有用到的文件描述符`p=malloc(sizeof(FileDescriptor));`看 -012指向同一个空间。 fd `ls -l/proc/15423/fd`![[Pasted image 20251119120105.png]]
- close delete(p)
- read/write \*(p.data++)
- lseek 每个 对应一个游标 光标 在文件里的位置
- dup 指针的拷贝。浅拷贝 freopen 备份描述符 dup(1)=4;dup2(1,4)返回![[Pasted image 20251119120650.png]]
- 总是分配最小的未使用描述符，0 1 2 已经使用；从3 开始
- 进程能打开多少文件？`ulimit -n`进程限制 `sysctl fs.file-max`系统限制

- 进程fork 了以后？所有文件描述符复制下来，指向同一个对象，如果关掉了 printf都打印不了。对于终端设备可。其实访问文件时是offset+文件对象
- dup()和fork()之后，文件描述符共享offset吗？ fork是共享还是自己有offset.dup的指针共享同一个offset.
- 文件描述符定义了一个新的地址空间，在这个地址空间我们可以访问操作系统的对象。![[Pasted image 20251119121932.png]]
### windows中的文件描述符
**handle**:锅把子，你的把柄在我手上，我可以更好的控制你。。。句柄 指针


u盘上的操作系统？ #todo
`/sys/class/backlight`调整背光
`/dev/urandom `随机数 

- **操作系统提供了api可以创建对象** 。/tmp 一个对象 ，/tmp/proc 一个对象 目录。`mount -t proc proc /temp/proc `在该目录下创建一大堆对象。mount 挂载![[Pasted image 20251119123327.png]]
- `strace + cmd`查看当前命令的系统调用
- dev/fs 控制终端 图形界面，文件系统访问磁盘上的数据。


## 管道 pipe

> 也是操作系统中的一个对象,一个特殊的文件（流式）字符设备

返回两个文件描述符 读口 写口

- 读数据读不到 会一直等。读口与写口的同步。读口读 没有数据 会等到有数据。
- fork 进程的快照。 0 1 2 3 4![[Pasted image 20251119124143.png]]
- 父进程 想往子进程送数据 ，关掉3号读口。子进程关写口。![[Pasted image 20251119124301.png]]
- 再使用dup+close实现`ls | wc-`![[Pasted image 20251119124544.png]]
- 实现父子之间同步 有顺序。
- makefifo有名字的管道。
- 一切皆文件 建立在这些api之上。
	- 一套api访问所有对象。 `|grep`
- shell 所有的一切都是字符串。