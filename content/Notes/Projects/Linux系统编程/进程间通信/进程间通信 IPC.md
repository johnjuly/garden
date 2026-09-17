---
created: 2026-03-20
---
同主机/不同主机；进程之间是否有亲缘关系；
**通信方式**：
## 1. [[管道]]
内核提供，单工：一端读，一端写（队列）
自同步机制：迁就慢的一方，读写。瓶颈部分。水管 粗 细部分。
###  匿名管道
磁盘上不存在。
适用于有亲缘关系的进程。
`int pipe(pipefd[2])`;
![[Pasted image 20260320082748.png]]




###  命名管道
磁盘上一个文件类型为p的文件，打开文件，给一个fd.
`mkfifo`![[Pasted image 20260320085722.png]]

凑齐双方 

`date> namedfifo`
`cat namedfifo`
## 2. [[xsi|XSI ->SysV]] 
主动端 ：先发包的一方
被动端：先收包的一方（先运行）
`ipcs` show
![[Pasted image 20260320090042.png]]

key的概念；ftok();
关键字，没有亲缘关系的进程，确信通信双方拿到同一机制，创建实例；找唯一值，inode.哈希。

xxxget xxxop  xxxctl 创建/使用/销毁 ，其他控制；
xxx->msg/sem/shm;

### 1. message queue

双工操作，都能读写；
msgsnd
msgrcv
### 2. semaphore arrays
semget();
semop();
semctl();
### 3. shared memory
shmget();
shmop();
shmctl();

## 3 . 网络套接字socket 跨主机 

### 讨论： 跨主机的传输要注意的问题
1. 字节序问题
	1. 大端: 低地址处放高字节
	2. 小端:低地址处放低字节 (x86)
		发数据总是从低地址开始发
	区分，不再纠结大端小端
	主机字节序:host
	网络字节序:network
	解决：\_to\_: htons,htonl,ntohs,ntohl


2. 对齐
```c
struct
{
	int i;
	float f;
	char ch;
};
```
编译器自动对齐(32bit 4字节对齐) 目的：加速 节省 取址周期
解决： 不对齐 ，宏

3. 类型长度问题
	int 字节长度？16bit 32bit
	char 有无符号
	解决：int32_t ,uint32_t,int64_t,int8_t/uint8_t(char)

### SOCKET是什么
> 中间层

应用层(http)与网络层协议(ipv4...)之间
抽象成文件描述符，打开 关闭 读写 定位
IO是一切的基础
![[Pasted image 20260322200153.png]]


协议族*domain*中的某一个协议 _protocol_ 来完成某一类型 _type_ 的传输

### 两种传递方式：
#### _SOCK_DGRAM_ [[socket_udp|报式套接字]]：
- 数据的分组，完整性。传一个学生的结构体。每个结构体之间清晰的边界。无连接，不可靠。
>[!note] 用到的函数
>	socket();
>	bind();
>	sendto();
>	rcvfrom();
>	inet_pton();
>	inet_ntop();
>	setsockopt();
>	getsockopt();
>
- 多点通讯 只能用于报式，不能用于流式
	- 广播
		- 全网广播
		- 子网广播
	- 多播/组播 224.0.0.1
#### _SOCK_STREAM_ [[socket_流式|流式套接字]]：
- 不代表 不丢包，收到的一定是有序的，可靠的，双工的，基于连接（点对点，一对一。or 三次握手）的字节流（数据没有严格边界，char）。