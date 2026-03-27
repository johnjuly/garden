---
created: 2026-03-24
---
三次握手 建立连接
半连接 半连接池 两次握手 ，第三次握手从半连接池里找。
攻击问题：半连接洪水，占满半连接池，永远只发第一次握手，不发第三次握手![[Pasted image 20260324160535.png]]

解决方式：不要半连接池。用对端IP+port加我端IP+port+protocol 或上一个salt（内核产生，每秒变化一次） 进行哈希 得到的内容 叫做cookie,第二次握手把cookie发出去，第三次 带着cookie来，验证。
![[Pasted image 20260324161047.png]]

四次挥手，断开连接


## 基本步骤

### C端（主动端）
1. 获取SOCKET
2. 给SOCKET取得地址(可省)
3. 发送连接
4. 收/发消息
5. 关闭

### S端
1. 获取SOCKET
2. 给SOCKET取得地址
3. 将SOCKET置为监听模式
4. 接受连接
5. 收/发消息
6. 关闭


## basic

### proto.h

```c
#ifndef PROTO_H__
#define PROTO_H__

#define SERVERPORT "1989"
#define FMT_STAMP "%lld\r\n" //约定传输的时戳格式
 

#endif

```

### server.c

```c server.c
#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>

#include "proto.h"


#define IPSTRSIZE 40
#define BUFSIZE 1024

static void server_job(int sd)
{
	int len;
	char buf[BUFSIZE];
	len=sprintf(buf,FMT_STAMP,(long long)time(NULL));
	if(send(sd,buf,len,0)<0)
	{
		perror("send()");
		exit(1);
	}

}



int main()
{

	int sd,newsd;
	struct sockaddr_in laddr,raddr;
	socklen_t raddr_len;
	char ipstr[IPSTRSIZE];
	sd=socket(AF_INET,SOCK_STREAM,0/*IPPROTO_TCP,IPPROTO_SCTP*/,);
	if(sd<0)
	{
		perror("socket()");
		exit(1);
	}
	laddr.sin_family= AF_INET;
	laddr.sin_port=htons(atoi(SERVERPORT));
	inet_pton(AFINET,"0.0.0.0",&laddr.sin_addr)
	if(bind(sd,(void *)&laddr,sizeof(laddr))<0)
	{
		perror("bind()");
		exit(1);
	}
	if(listen(sd,200)<0)
	{
		perror("listen()");
		exit(1);
	}
	raddr_len = sizeof(raddr);
	
	while(1)
	{
		newsd=accept(sd,(void *)&raddr,&raddr_len);
		if(newsd<0)
		{
			perror("accept()");
			exit(1);
		}
		inet_ntop(AF_INET,&raddr.sin_addr,ipstr,IPSTRSIZE)
		printf("Client:%s:%d\n",ipstr,ntohs(raddr.sin_port）);
		
		server_job(newsd);
		
		close(newsd);
	}
	close(sd);
	exit(0);
}
```


`netstat -ant`

nc ip port
`nc/telnet 127.0.0.1 1989`


连续运行出现![[Pasted image 20260324170331.png]]
socket和bind之间设置属性

```c

int val=1;
if(setsockopt(sd,SOL_SOCKET,SO_REUSEADDR,&val,sizeof(val))<0)
{
	perror("setsockopt()");
	exit(1);
}
```


### client 

nc的过程

一切皆文件
socket封装成流来使用，转换为标准io，
`fp=fdopen(sd,"")`

```c client.c
#include <stdlib.h>
#include <stdio.h>
#include <sys/types.h>
#include<sys/socket.h>
#include<netinet/in.h>

#include "proto.h"

int main(int argc,char *argv[])
{
	int sd;
	struct sockaddr_in raddr;
	long long stamp;
	FILE *fp;
	if(argc<2)
	{
		fprintf(stderr,"Usage...\n");
		exit(1);
	}
	
	sd=socket(AF_INET,SOCK_STREAM,0);
	if(sd<0)
	{
		perror("socket()");
		exit(1);
	}
	
	//bind();
	
	raddr.sin_family=AF_INET;
	raddr.sin_port=htons(atoi(SERVERPORT));
	inet_pton(AF_INET,argv[1],&raddr.sin_addr);
	if(connect(sd,(void *)&raddr,sizeof(raddr))<0)
	{
		perror("connect()");
		exit(1);
	}
	
	fp=fdopen(sd,"r+");
	if(fp==NULL)
	{
		perror("fdopen()");
		exit(1);
	}
	
	//标准IO
	
	if(fscanf(fp,FMT_STAMP,&stamp)<1)
	{
		fprintf(stderr,"Bad format!\n");
		
	}
	else 
		fprintf(stdout,"stamp=%lld\n",stamp);
	
	fclose(fp);
	
	
	//rcve();
	//close();
	
	exit(0);
}
```




## 并发

### server

分成上下游的关系，上游 父进程负责 accept,成功 serverjob的工作交给;子进程去干活。

```c
while(1)
{
	newsd= accept();
	if(newsd<0)
	{
		perror();
		exit(1);
	}
	pid=fork();
	if(pid<0)
	{
		perror("fork()");
		exit(1);
	}
	if(pid==0)
	{
		close(sd);
		//干活
		inet_ntop
		printf
		server_job(newsd);
		close(newsd);
		exit(0);
	}
	close(newsd);
	

}
```



## 静态进程池


server.c

```c
#define PROCNUM 4

int main()
{
	pid_t pid;
	for(i=0;i<PROCNUM;i++)
	{
	pid=fork();
	if(pid<0)
	{
		perror("fork()");
		exit(1);
	}
	if(pid==0)
	{
		server_loop(sd);
		exit(0);
	}

	}
	
	
	for(i=0;i<PROCNUM;i++)
		wait(NULL);
	close(sd);
	exit(0);
}

void server_loop(int sd)
{
	//接收连接 干活
	struct sockaddr_in addr;
	socklen_t raddr_len;
	int newsd;
	
	rddr_len=sizeof(raddr);
	char ipstr[IPSTRSIZE];
	
	accept();//天生互斥
}
```



## 动态进程池

静态 太过僵硬。访问量不固定。某个时间段 空闲，某个时间段 访问资源数量大。
有弹性的进程池。上下限。

pool_dynamic

proto和客户端不变，更改服务器端。

### server
```c server.c
#include <stdlib.h>

#include <stdio.h>

#include <sys/types.h>

#include<sys/socket.h>

#include<netinet/in.h>
#include <signal.h>
#include "proto.h"
#include <errno.h>

#include<sys/mmap.h>

//资源上下限的定义
#define MINSPARESERVER 5
#define MAXSPARESERVER 10
#define MAXCLIENT 20

#define IPSTRSIZE  40
#define LINEBUFSIZE 80
//信号
#define SIG_NOTIFY SIGUSR2


enum{
	STATE_IDLE=0.
	STATE_BUSY
};

//数据结构定义
struct server_st
{
	pid_t pid;
	int state;
	//int reuse; 达到某个上限父进程杀死
};

static struct server_st *serverpool;
static int idle_count =0,busy_count=0;
static int sd;

static void usr_2_handler(int s)
{
	return ;

}

static void server_job(int pos)
{
	int ppid;
	struct sockaddr_in raddr;
	socklen_t raddr_len;
	int client_sd;
	char ipstr[IPSTRSIZE];
	time_t stamp;
	int len;
	char linebuf[LINEBUFSIZE];
	
	ppid=getppid();
	while(1)
	{
		serverpool[pos].state=STATE_IDLE;
		//通知父进程查看 驱动while
		kill(ppid,SIG_NOTIFY);
		client_sd=accept(sd,(void *)&raddr,&raddr_len);
		if(client_sd<0)
		{
			if(errno!=EINTR||errno!=EAGAIN)
			{
				perror("accept()");
				exit(1);
			}	
		}
		
		serverpool[pos].state=STATE_BUSY;
		kill(ppid,SIG_NOTIFY);
		inet_ntop(AF_INET,&raddr.sin_addr,ipstr,IPSTRSIZE);
		//printf("[%d]clinet:%s:%d\n",getpid(),ipstr,ntohs(raddr.sin_port))
		stamp =time(NULL);
		len=snprintf(linebuf,LINBUFSIZE,FMT_STAMP,stamp);
		send(client_sd,linebuf,len,0);
		/*if error*/
		sleep(5);
		close(client_sd);
		
	}
}

static int add_1_server(void)
{
	int slot;
	pid_t pid;
	
	if(idle_count+busy_count>=MAXCLIENTS)
		return -1;
	for(slot=0;slot<MAXCLIENTS;slot++)
	{
		if(serverpool[slot].pid==-1)
			break;
		
	}
	serverpool[slot].state=STATE_IDLE;
	pid=fork();
	if(pid <0)
	{
		perror("fork()");
		exit(1);
	}
	if(pid==0)  //child
	{
		server_job(slot);
		exit(0);
	}
	else    //parent
	{
		serverpool[slot].pid=pid;
		idle_count ++;
		
	}
	return 0;
}

static int del_1_server(void)
{
	int i;

	if(idle_count==0)
		return -1;
	for(i=0;i<MAXCLIENTS;i++)
	{
		if(serverpool[i].pid!=-1&&serverpool[i].state==STATE_IDLE)
		kill(serverpool[i].pid,SIGTERM);
		serverpool[i].pid=-1;
		idel_count --;
		break;
	}
	return 0;
}


static int scan_pool(void)
{
	int busy=0;
	int count=0;
	for(i=0;i<MAXCLIENTS;i++)
	{
		if(serverpool[i].pid=-1)
			continue;
		
		//检测一个进程是否存在
		if(kill(serverpool[i].pid,0))
		{
			serverpool[i].pid=-1;
			continue;
		}
		if(serverpool[i].state==STATE_IDLE)
		{
			idle++;
		}
		else if(serverpool[i].state == STATE_BUSY)
			busy++;
		else{
				fprintf(stderr,"Unknown state.\n");
				//_exit(1);
				abort(); //coredump 文件
			}
	}
	idle_count=idle;
	busy_count=busy;
	return 0;
}

int main()
{
	int i;
	sigset_t set,oset;
	int val=1;
	struct sockaddr_in laddr;
 	/*创建子进程后自行消亡 不用父进程收尸*/
	struct sigaction sa,osa; //oldsa
	sa.sa_handler=SIG_IGN;//忽略 父进程阻塞收尸的信号
	sigemptyset(&sa.sa_mask);
	sa.sa_flags=SA_NOCLDWAIT; //阻止子进程变成僵尸状态，免去收僵尸的困扰
	
	//定义信号的行为
	sigaction(SIGCHLD,&sa,&osa); //定义新的行为，保存旧的行为
	
	sa.sa_handler=usr2_handler;
	sigemptyset(&sa.sa_mask);
	sa.sa_flags=0;
	sigaction(SIG_NOTIFY,&sa,&osa);
	
	sigemptyset(&set);
	sigaddset(&set,SIG_NOTIFY);
	sigprocmask(SIG_BLOCK,&set,&oset);
	
	
	//申请内存空间 malloc  可用的起始地址 null 自己找
	serverpool = mmap(NULL,sizeof(struct server_st)*MAXCLIENTS,PROT_READ|PROT_WRITE,MAP_SHARED|MAP_ANONYMOUTS,-1,0);
	
	//初始化
	for(i=0;i<MAXCLIENTS;i++)
	{
		serverpool[i].pid=-1;
	}
	
	if(serverpool==MAP_FAILED)
	{
		perror("mmap()");
		exit(1);
	}
	
	sd=socket(AF_INET,SOCK_STREAM,0);
	if(sd<0)
	{
		perror("socket()");
		exit(1);
	}

	if(setsockopt(sd,SOL_SOCKET,SO_REUSEADDR,&val,sizeof(val))<0)
	{
		perror("setsockopt()");
		exit(1);
	}
	
	laddr.sin_family=AF_INT;
	laddr.sin_port=htons(atoi(SERVERPORT));
	inet_pton(AF_INET,"0.0.0.0",&laddr.sin_addr);
	if(bind(sd,(void *)&laddr,sizeof(laddr))<0)
	{
		perror("bind()");
		exit(1);
	}
	
	//设置为监听模式
	if(listen(sd,100)<0)
	{
		perror("listen()");
		exit(1);
	}
	
	for(i=0;i<MINSPRSESERVER;i++)
	{
		add_1_server();
	}
	
	while(1)
	{
		sigsuspend(&oset);
		
		scan_pool();
		
		//control the pool 当前池的状态
		if(idle_count >MAXSPRSESERVER)
		{
		//遍历池 空闲太多 空多少 杀多少
			for(i=0;i<(idle_count-MAXSPARESESERVER);i++)
			del_1_server();
		}
		else if(idle_count<MINSPARSESERVER)
		{  //空闲太少
			for(i=0;i<(MINSPARSESEVER-idle_count);i++)
				add_1_server();
				
		}
		
		//printf the pool
		for(i=0;i<MAXCLIENTS;i++)
		{
		
			if(serverpool[i].pid==-1)
				putchar(' ');
			else if(serverpool[i].state==STATE_IDLE)
				putchar(',');
			else
				putchar('x');
		}
		putchar('\n');
	}
	
	//恢复
	sigprocmask(SIG_SETMASK,&oset,NULL);
	
	
}


```

