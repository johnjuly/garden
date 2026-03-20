---
created: 2026-03-20
---
同主机/不同主机；进程之间是否有亲缘关系；
**通信方式**：
## 1. 管道
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
## 2. XSI  ->SysV
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
### 3. shared memory

## 3 . 网络套接字socket 跨主机 
