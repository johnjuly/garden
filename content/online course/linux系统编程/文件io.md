
aka 系统调用 io

文件描述符（fd） 是 在文件IO中贯穿始终的类型


- 文件描述符的概念
- 文件Io操作： open,close,read.write.lseek
- 标准io依赖于文件io。读取相关的函数 ，文件指针相关的函数
- 文件io与标准io进行区别
- IO的效率问题 
- 文件共享
- 原子操作
- 程序中的重定向：dup,dup2
- 同步：系统开发，中间层 sync,fsync,fdatasync
- fcntl();管家级函数
- ioctl();同上
- /dev/fd/目录




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