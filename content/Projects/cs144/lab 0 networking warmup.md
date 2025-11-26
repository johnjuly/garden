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

想避免paried operations.比如分配释放（malloc/free,new/delete）,为什么呢，因为有的时候很可能还没来得及

[^4]an agreed-upon scheme

[^3]netcat

[^1]: hytper-text transfer protocol

[^2]: Telecommunication Network）是一种非常早期的网络协议和工具，用来通过 **TCP 连接到远程主机并进行文本交互**。彩蛋：`telnet towel.blinkenlights.nl`ascll 星球大战!

[^3]: 网络上的cat(unix,cat的精神：原样收，原样发、不加工、不解释)，从网络连接读数据再输出。

[^4]: 一项双方认可的方案
