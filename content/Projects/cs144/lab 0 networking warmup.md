#计算机网络
#cs144
#lab


- 要做的事情：写一个小的程序使用c++语言，抓取因特网上的一个网页，实现网络的一个重要抽象：在写者和读者之间的可靠字节流。
- 概览整个实验 ， 路由器，一个network interface,tcp协议（将不可靠的数据报转换为可靠的字节流）
---

## 手工网络连接
### 1 fetch a web page

[^2]`telnet cs144.keithw.org http`
程序在你的电脑和另一台电脑（该网址）之间打开一个可靠的字节流。and with a particular service  [^1]http #缩写 running on that computer.
![[Pasted image 20251121211904.png]]

### 2 send yourself an email


### 3 监听与连接（服务器的角色）


## 写一个网络程序 using an os stream socket

- stream socket,the ability to create a reliable bidirectional byte stream between two programs,一个在你的电脑上运行，一个在遥远的另一一台电脑上运行 因特网连接。（例子：web服务器apache 或者 nginx，或者 netcat 程序）
他说，the socket  looks like an ordinary file descriptor,stdin or stdout i/o strams.当两个流socket连接了，任何写入一个socket的字节最终会从按顺序从另一台计算机上面的socket上出来。
在现实世界里，因特网并不提供可靠的字节流服务。并且互联网能做的是 best effort 发送 short pieces of data ,称作 internet 数据报 到他们的目的地。每一个数据报会包含一些元数据（headers）指明原地址，目标地址，以及一些payload up to about 1500字节。
在传输过程当中，数据报可能会
1. 丢失
2. 乱序
3. 内容被改变
4. 复制并且被发送不止一次。

所以通常是两端的操作系统的任务将best effort datagrams (the abstraction the Internet provides)转变为 reliable byte streams(the abstraction that application usually want)
![[Pasted image 20251126170820.png]]

手动编译gcc13 ！！！![[Pasted image 20251126171516.png]]
![[Pasted image 20251126171740.png]]
TCP:Transmission Control Protocol

### 现代c++: 大部分安全 快速 低级
基本的想法是让每一个对象设计出来拥有最小的可能的公共接口，拥有很多内部安全检查机制并且很难错误地使用。并且知道清理自己。

想避免paried operations.比如分配释放（malloc/free,new/delete）,为什么呢，因为有的时候很可能还没来得及.

[^4]an agreed-upon scheme

[^3]netcat

这些操作发生在 对象的构造函数时候，相反的操作在析构函数的时候，这种类型叫做"Resource acquisition is initialization"or RAII.

具体的要求如下：
- 使用[ 语言文档]( https://en.cppreference.com)作为资源。cpluscplus.com out of date
- 一定不要用malloc() or free()
- 一定不要用new or delete
- essentially 一定不要用raw pointers(\*) and use smart pointers(`unique_ptr`or`shared_ptr`) only when necessary
- avoid templates,threads,locks and virtual functions
- 字符串。avoid c-style strings(`char *str`) or string function( `strlen()` ,`strcpy()`) these are pretty error-prone.use a std:: string instead
- 永远不要使用c-style casts（`(FILE *)x`）use a C++ `static_cast` if u have to
- prefer 传递函数参数时 **const** reference(`const Address &address`)
- 每一个变量 const 除非需要改变它
- 每一个方法 const 除非需要改变对象
- 避免使用全局变量，给每一个变量最小的域
- 


### 阅读 minnow support code
minnow的类将操作系统函数封装在现代c++语言中。
公共接口，`socket.hh file_descriptor.hh`

|类|代表什么|
|---|---|
|**FileDescriptor**|OS 中所有 I/O 文件描述符的抽象（文件、管道、终端、socket 都是 FD）|
|**Socket**|一种特殊的 file descriptor，用于网络通信|
|**TCPSocket**|具体的 TCP socket，有 connect、listen、accept|
### writing webget
webget,a program to fetch web pages over the Internet usin the os 's tcp support和stream-socket的抽象。


需要注意的是：
	- 在http中 每一行用\r\n来结束
	- 不要忘记include connection:close 在你的客户端请求中。这会告诉服务器不要等着你的客户端去发送更多的请求在这个之后。并且 服务器会发送一个恢复然后立即end its outgoing bytestream (the one from the server's socket to your socket)你会发现你的到来的字节流has ended 因为你的socket 会reach EOF 的那个你读完了所有从服务器发送的字节流。that's how your client will know that the server has finished its reply.
	- 确认要read and print all the output from the server until the socket reaches eof--a single call to read is not enough


##  an in-memory reliable byte stream

单台计算机的内存里实现一个提供这种抽象的对象。可靠的字节流哇。即 bytes are written on the input side and canbe read in the same sequence  from the output side.
字节流是确定的，写者可以end the input ,and no more bytes can be written.当读者读到流的末端时，it will reach EOF,and no more bytes can be read.
你的字节流同样也会 **流量控制** flow-control  to limit its memory consumption at any given time.
- the object is initialized with a particular capacity:**the maximum number of bytes** it is willing to store in its memory at any given point
- 字节流会限制写者在一个给定时刻能够写的数量 to make sure 流不会超过它的存储容量。

[^1]: hytper-text transfer protocol

[^2]: Telecommunication Network）是一种非常早期的网络协议和工具，用来通过 **TCP 连接到远程主机并进行文本交互**。彩蛋：`telnet towel.blinkenlights.nl`ascll 星球大战!

[^3]: 网络上的cat(unix,cat的精神：原样收，原样发、不加工、不解释)，从网络连接读数据再输出。

[^4]: 一项双方认可的方案
