
aka 系统调用 io

文件描述符（fd） 是 在文件IO中贯穿始终的类型


- 文件描述符的概念
- 文件Io操作： open,close,read.write.lseek
	-  标准io依赖于文件io。读取相关的函数 ，文件指针相关的函数
- 文件io与标准io进行区别
	- 标准io有一个贯穿始终的类型叫作FILE,文件io有一个贯穿始终类型叫做int
	- 标准流 stdin stdout err 对应 文件io 0 1 2 文件描述符从3开始
	- 举例： 传达室老大爷跑邮局。一封信跑一封。等着拿20封信跑邮局。一来以去20分钟。缓冲区操作。强制刷新 马上执行。  标准io有缓冲区，文件io 实时性高 user 到kernel 一封一次
	- 区别： 响应速度&吞吐量[^1][[os 0916 week2#^756fc0]]
	- 面试： 如何使一个程序变快？一分为二作答，您说的是响应速度还是吞吐量？。用户所感受的变快是吞吐量。 多用标准Io
	- 提醒：标准io与文件io不可以混用。结构体中的pos不会一致 标准io有缓冲

> [!两者转换]
> 	   `int fileno(FILE *stream) `
> 	   `FILE *fdopen(int fd,const char *mode);`

- IO的效率问题 
	- 习题：将mycpy.c 程序进行更改，将BUFSIZE的值放大，并观察进程所消耗的时间，注意性能最佳拐点出现时的BUFSIZE值，以及何时程序会出问题   读1024写1024 mycopy.c文件 bufsize 从128翻上去到16g 性能最佳拐点
		- `time ./mycpy /etc/services tmp/out` real/user/sys
- 文件共享：多个任务共同操作一个文件或者协同完成任务
	- 面试： 写程序 删除一个文件的第10行，数组覆盖，
	- 补充函数： `{c} int truncate(const char *path,off_t length);int ftruncate(int fd,off_t length)`把一个未打开的文件截断到多长 或者 已打开的文件
- 原子操作： 不可分割的操作
	- 原子：不可分割的最小单位
	- 作用：解决竞争和冲突    **应用**：多进程与多线程并发`tmpnam` 给文件名 操作不原子，名字 创建 两步 ；tmpfile 直接创建一个文件。创建临时文件 多种方法。
- 程序中的重定向：dup,dup2
	- `dup.c`
- 同步：与设备相关。 系统开发，中间层 sync,fsync,fdatasync
- fcntl();管家级函数。管理文件描述符
	- 文件描述符所变的魔术几乎都来源于该函数。功能杂。
- ioctl();同上；另外一个管家设备相关的内容。
	- 一切皆文件的设计原理好不好？简化操作 5个；但是有些设备不仅仅是读写。声卡的放音与录音。读写。篇幅短。没人说自己是Ioctl专家……。基于1.3.27内核 ioctl-list古董文物。光环下的垃圾堆。
- /dev/fd/目录：虚目录，显示的是当前进程的文件描述符信息。ls -l /dev/fd/ 谁看就是谁，是ls的文件描述符 照镜子 link链接文件




## 1.

人身份证 文件 
- 打开一个文件 会得到一个结构体 
- 实质是一个整形数 数组下标 
- 0 1 2 关联的是stdin stdout stderr会提前打开三个设备
- 一说 stream 三个 stdin stdout stderr 
- 一说 fd 0 1 2 
- ![[Pasted image 20250913132557.png]]
- ![[Pasted image 20250913133233.png]]
- 
- 1024数组大小 ulimit 可以更改大小
- 左右不同的实现 FILE 类型指针 操作 结构体中有fd
- 文件描述符优先使用当前可用范围最小的
- 该数组存在于一个进程空间。非共用。不同进程 拿到同一文件 不同结构体
- 一个结构体 被多个数组下标所指

## 2. 文件io操作相关函数：

- 首先 获得文件描述符：`man 2 open`
- `{c} int open(const char *pathname,int flags);`;第二个参数 位图
	- 返回值 文件描述符如果成功； 失败返回-1 errno：文件描述符->数组下标->不可能为负数
	- **flags**: 选项 O_RDONLY,O_WRONLY,O_RDWR；
		- O_DIRECT: cache 读的缓冲区/加速机制；buffer 写的缓冲区
		- O_NOATIME:偷摸读别人的文件 但不改文件修改时间
		- O_NONBLOCK:  阻塞 打印机 读 读 等 等 。。。

- 标准io过渡到系统调用io 按位或
- ```c
  //只能对已有文件操作
  r-> O_RONLY
  r+->O_RDWR
  
  
  w-> O_WRONLY|O_CREAT|O_TRUNC
  
  //读与写 有则清空 无则创建
  w+->O_RDWR|O_TRUNC|O_CREAT
  ```
  - open 函数 有 两个函数原型。重载？非 printf如何实现？**变参函数**
  - ```c
    int open(const char *pathname,int flags);
    int open(const char *pathname,int flags,mode_t mode);
    ```
- 重载是定参。`{c} printf("%d%d",a,b)`;
- ```c makefile
  CFLAGS=-D_FILE_OFFSET_BITS=64 -D_GNU_SOURCE -Wall
  ```
- `man 2 read `:读一个文件描述符
- `{c} ssize_t read(int fd, void *buf,size_t count);`,buf 读到的位置
- man 2 write
- `{c} ssize_t write(int fd, const void *buf,size_t count);`返回值为0说明没有东西写进去
- lseek: `{c} off_t lseek(int fd, off_t offset,int whence);`offset:偏移量，相对偏移位置。将fseek和ftell进行综合。
```c mycopy.c
#include <stdio.h>
#include <stdlib.h>
#include<sys/types.h>
#include<sys/stat.h>
#include<fcntl.h>
#define BUFSIZE 1024
//源文件和目标文件由终端来决定 arg
int main(int argc,char **argv){

	int sfd,dfd; //source file describe
	char buf[BUFSIZE];
	int len,ret,pos;
	//判断命令行传参是否合法
	if(argc<3){
		//报错结束 
		fprintf(stderr,"Usage...\n");
		exit(1);
	}	
	
	//两次open 打开源和目标文件 
	std=open(argv[1],O_RDONLY); //打开的文件 打开的方式 返回值 文件描述符
	//如果打开失败 结束当前进程
	if(sfd<0){
		perror("open()");
		exit(1);
	}
	//不存在：创建 存在 ：清空 给一个权限
	dfd=open(arg[2],O_WRONLY|O_CREAT,O_TRUNC,0600);
	if(dfd<0){
		//防止产生内存泄漏
		close(sfd);
		perror("open()");
		exit(1);
	}
	//中间读一块 写一块 该过程放在循环当中
	while(1){
		len=read(sfd,buf,BUFSIZE);//read的返回值读到的真正的字节数
		if(len<0){
			perror("read()");
			
			break;//为了执行关闭函数
		}
		if(len == 0)
		break;
		
		pos=0
		while(len>0){
		//要写10个字节 却只写了3个
		ret = write (dfd,buf+pos,len);
		if(ret <0){
			perror("write()");
			exit(1);//小的内存泄漏
		}
		pos +=ret;
		len -=ret;
		}
		
	}

	close(dfd);
	close(sfd);
	exit(0);
}


```

- make mycpy
- ./mycpy /etc/services      /tmp/out
- diff 上面两个文件

## 3. 

```c
FILE *fp;

fputc(fp) -> pos++
fputc(fp) -> pos++
//没有写到磁盘上，缓冲区 word写好后 点 是否保存 保存 将缓冲区刷新

```

```c
#include <stdio.h>
#include<stdlib.h>
#include<unistd.h>
int main(){

	putchar('a');//std
	write(1,"b",1);//sys
	
	putchar('a');
	write(1,"b",1);
	
	putchar('a');
	write(1,"b",1);
	
	
	exit(0);
}
```

- 输出会是？
	- bbbaaa
- 命令 `strace ./ab`跟踪 getchar放到输出缓冲区。三句putchar相当于一句write来实现
![[Pasted image 20250916200058.png]]


## 4 

```
while(){
lseek 11 +read +lseek 10 +write}
定位读定位写
需要4个系统调用

/**********************************/
//同一个文件在一个进程中打开两次 简化while循环中的系统调用
1-> open r  -> fd1 -> lseek 11只读打开 
2-> open r+ -> fd2 -> lseek 10读写打开 r+确定文件一定存在

while()
{
1->fd1->read
2->fd2->write
}


/*************************************/

process1->open->r
process2->open->r+

p1->read->p2->write

```




## 4.

```c   
#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#define FNAME "/tmp/out"

//hello world并不简单 支持多国语言输出
int main(){
	int fd;
	//文件描述符优先使用当前描述符中最小的
	close(1);
	fd = open(FNAME,O_WRONLY|O_CREAT|O_TRUNC,0600);
	
	//如果打开失败了，报错结束
	if(fd<0){
		perror("open()");
		exit(1);
	}
	
	
	
/*************************/	
	puts("hello!!");
	
	exit(0);
}

```

> 没有简单的程序，只有头脑简单的程序员……

- 如何删除程序呢？ 把不需要的mv到一个文件夹 再定期清理它   这不就跟回收站一样么

- `./dup` ; `cat /tmp/out
- dup 文件描述符复制一份指向同一份空间 结构体
- 
 ```c
 
#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#define FNAME "/tmp/out"

//hello world并不简单 支持多国语言输出
int main(){
	int fd;
	//文件描述符优先使用当前描述符中最小的
	fd = open(FNAME,O_WRONLY|O_CREAT|O_TRUNC,0600);
	
	//如果打开失败了，报错结束
	if(fd<0){
		perror("open()");
		exit(1);
	}
//	close(1);
//	dup(fd);
	dup2(fd,1);
	if(fd != 1){
	close(fd);
	}
	//相当于输出重定向
	
/*************************/	
	puts("hello!!");
	
	exit(0);
}  
  ```

- 有些程序天生没有占用1号描述符。情况一：fd本身是1；不可贸然关闭fd,如果本身不是1号那么可以关掉
- 根本原因：多进程非原子操作close和dup；原子操作：dup2 关掉一号，把fd副本放到1号
- 微观 宏观编程思想 只有main函数？搭框架 封装好的接口 码驴……蒙着眼睛 
- 看成小模块 不改变 打印后 还原 。内存泄漏 ；越界；看成模块；安全性


## 5.

- sync（2）: 牵涉到设备 同步内核层面的buffer和cache ；关机的时候；解除设备挂载时 正在 buffer中还未同步时刷新
- fsync:刷文件 fdatasync 只刷数据 不刷亚数据：文件最后的修改时间、属性

## 6

`int fcntl(int fd,int cmd, .../*arg*/)`:命令不同，传的参数不同；命令不同，函数返回值不同；
- dup 和dup2 是由该函数变相进行封装的

[^1]: 下午os课程也有讲到欸 吞吐量和延迟！梦幻联动！[[]]
