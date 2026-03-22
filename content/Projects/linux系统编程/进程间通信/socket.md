---
created: 2026-03-22
---
## basic

### log
#### 被动端(先运行，收包的一端)
1. 取得socket
2. 给socket取得地址，绑定本地地址
3. 收/发消息
4. 关闭socket
#### 主动端
1. 取得socket
2. 给socket取得地址（可省略），系统分配可用端口
3. 发/收消息
4. 关闭socket

proto.h
rcver.c
snder.c

### proto

```c proto.h
#ifndef PROTO_H__
#define PROTO_H__

//不对齐
#define NAMESIZE 11 

//一般1024以上，1024以内一般预留.没有单位的数值没有意义。atoi
#define RCVPORT "1989"

struct msg_st
{
	uint8_t name[NAMESIZE];
	uint32_t math;
	uint32_t chinese;
}__atrribute__((packed));
//对齐问题

//接收方先举手 说自己的地址

```


### rcver.c

```c rcver.c
#include <stdio.h>
#include <stdlib.h>
#include<sys/types.h>
#include<sys/socket.h>
#include<arpa/inet.h>

#include "proto.h"
#define IPSTRSIZE 40
int main()

{
	int sd;
	struct sockaddr_in laddr,raddr; //localaddr,remoteaddr
	struct msg_st rbuf;
	socklen_t	raddr_len;
	char ipstr[IPSTRSIZE];
	//1
	sd=socket(AF_INET,SOCK_DGRAM,0/*0默认 IPPROTO_UDP*/);
	if(sd<0)
	{//文件描述符不可能有问题
		perror("socket()");
		exit(1);
	}
	
	laddr.sin_family=AF_INET;
	laddr.sin_port=htons(atoi(RCVPORT));//端口要随网络传输 man 7 ip
	inet_pton(AF_INET,"0.0.0.0"/*any addr 万能地址*/,&laddr.sin_addr);
	//2
	if(bind(sd,(void *)&laddr,sizeof(laddr))<0)
	{
		perror("bind()");
		exit(1);
	}
	
	/*!!!*/
	raddr_len=sizeof(raddr);
	
	
	//3
	while(1)
	{
	//void * 强转，地址类型不符
	recvfrom(sd,&rbuf,sizeof(rbuf),0,(void *)&raddr,&raddr_len);

	inet_ntop(AF_INET,&raddr.sin_addr,ipstr,IPSTRSIZE);	
	printf("---MESSAGE FROM %s:%d---\n",raddr.sin_addr,ntohs(raddr.sin_port));
	}
	printf("NAME=%s\n",rbuf.name);//单字节传输不涉及大小端
	printf("MATH=%d\n",ntohl(rbuf.math));
	printf("CHINESE=%d\n".ntohl(rbuf.chinese));
	//4
	close(sd);

	exit(0);
}
```

- bind 不同的协议族来绑定自己这端的地址所使用的结构体不同。
- inet_pton 把 ipv4/6地址 点分式转换成二进制形式
- recvfrom 记录对端的地址和地址长度


`netstat -anu` u :udp

### sender.c

```c snder.c
#include <stdio.h>

#include <stdlib.h>

#include<sys/types.h>

#include<sys/socket.h>

#include<arpa/inet.h>
#include<string.h>
#include "proto.h"

int main(int argc,char *argv[])
{
	int sd;
	struct msg_st sbuf;
	struct sockaddr_in raddr;
	
	if(argc<2)
	{
		fprintf(stderr,"Usage...\n");
		exit(1);
	
	}
	
	sd=socket(AF_INET,SOCK_DGRAM,0);
	if(sd<0)
	{
		perror("socket()");
		exit(1);
	}
	//bind();
	strcpy(sbuf.name,"Alan");
	sbuf.math=htonl(rand()%100);
	sbuf.chinese=htonl(rand()%100);
	
	raddr.sin_family=AF_INET;
	raddr.sin_port=htons(atoi(RCVPORT));
	raddr.sin_addr=inet_pton(AF_INET,argv[1],&raddr.sin_addr);
	if(sendto(sd,&sbuf,sizeof(sbuf),0,(void *)&raddr,sizeof(raddr))<0)
	{
		perror("sendto()");
		exit(1);
	}
	puts("OK!");
	
	close(sd);

	exit(0);
}
```



## var 
> 变化版本


关于名字 太死 11 `uint8_t name[NAMESIZE]`.网络传输不会传指针 `char *name`,传的是地址。不同主机地址存的内容不同。

变成 变长结构体

```c proto.h
#define NAMEMAX (512-8-8) //512 udp推荐长度 -固定前两个成员8-报头8

struct msg_t
{
	uint32_t math;
	uint32_t chinese;
	uint8_t name[1];
}__attribute__((packed));
```

./snder IP NAME



```c 
int size;
struct msg_st *sbufp;

argc<3
//判断名字长度
if(strlen(argv[2]>NAMEMAX))
{
	fprintf(stderr,"Name is too long!\n");
	exit(1);
}
size=sizeof(struct msg_st)+strlen(argv[2]);
sbufp=malloc(size);
if(sbufp=NULL)
{
	perror("malloc()");
	exit(1);
}
strcpy(sbufp->name.argv[2]);
sbufp->
if(sendto(sd,sbufp,size,...))

```




```c
int size
struct msg_st *rbufp; //不知道有多大

size=sizeof(struct msg_st)+NAMEMAX-1;
rbufp=malloc(size);
if(rbufp==NULL)
{
	perror("malloc()");
	exit(1);
}

recvfrom(sd,rbufp,size,...)

prinf(rbufp->)


```