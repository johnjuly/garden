---
created: "2026-02-22"
---

## select

![[Pasted image 20260222145658.png]]
提供的方法：清除，判断，添加，清零。
类似信号的*sigemptyset*

目录：adv/select
拷贝relay.c 两个设备通信 忙等
更改程序 while 忙等 更改。布置监视任务

- select 可以做安全的休眠 设置 -1 nfd;

```c relay.c

#include <stdio.h>
#include<stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <errno.h>
#include <sys/select.h>

#define TTY1 "/dev/tty11"
#define TTY2 "/dev/tty12"

#define BUFSIZE 1024


enum
{
STATE_R=1,
STATE_W,
STATE_Ex,
STATE_T
};

struct fsm_st
{
int state;
int sfd;
int dfd;
char buf[BUFSIZE];
int len;
int pos;
char *errstr;
};

static void fsm_driver(struct fsm_st *fsm)
{
int ret;
switch(fsm->state)
{
case STATE_R:
fsm->len=read(fsm->sfd,fsm->buf,BUFSIZE);
if(fsm->len==0)
fsm->state=STATE_T;
else if(fsm->len <0)
{
//真错与假错
if(errno==EAGAIN)
fsm->state=STATE_R;
else
{
fsm->errstr="read()";
fsm->state=STATE_Ex;
//跳转同时记录出错原因
}
}
else
{
fsm->pos=0;
fsm->state=STATE_W;
}
break;
case STATE_W:
ret=wirte(fsm->dfd,fsm->buf+fsm->pos,fsm->len);
if(ret<0)
{
if(errno=EAGAIN)
fsm->state=STATE_W;
else
{
fsm->errstr="write()"
fsm->state=state_Ex;

}

}

else

{

fsm->pos+=ret;

fsm->len-=ret;

if(fsm->len==0)

fsm->state=STATE_R;

else

fsm->state=STATE_W;

}

break;

case STATE_Ex:

//报错

perror(fsm->errstr);

fsm->state=STATE_T;

break;

case STATE_T:

//进程结束 但是结束不了 死循环 do sth

break

default:

//do sth 信号

abort();

break;

}
}

static int max(int a, int b)
{
	if(a>b)
		return a;
	return b;
}

static void relay(int fd1,int fd2)

{
int fd1_save,fd2_save;
struct fsm_st fsm12,fsm21; //读1写2&&读2写1
fd_set rset,wset;

int fd1_save,fd2_save;

//两个文件描述符 以非阻塞打开

fd1_save=fcntl(fd1,F_GETFL);

fcntl(fd1,F_SETFL,fd1_save|O_NONBLOK);

fd2_save=fcntl(fd2,F_GETFL);

fcntl(fd2,F_SETFL,fd2_save|O_NONBLOCK);

//状态初始化

fsm12.state=STATE_R;

fsm12.sfd=fd1;

fsm12.dfd=fd2;

fsm21.state=STATE_R;

fsm21.sfd=fd2;

fsm21.dfd=fd1;



while(fsm12.state!=STATE_T||fsm21.state!=STATE_T)

{
	//布置监视任务
	FD_ZERO(&rset);
	FD_ZERO(&wset);
	  //集合清空  状态为可读/可写
	if(fsm12.state == STATE_R)
		FD_SET(fsm12.sfd,&rset);
	if(fsm12.state == STATE_W)
		FD_SET(fsm12.dfd,&wset);
	if(fsm21.state == STATE_R)
		FD_SET(fsm21.sfd,&rset);
	if(fsm21.state == STATE_W)
		FD_SET(fsm21.dfd,&wset);
	rset,wset;

	//进行监视
	if(select(max(fd1,fd2)+1,&rset,&wset,NULL,NULL)<0)//null 为忙等的时间
	{
		if(errno == EINTR)
			continue;//假错
		perror("select()");
		exit(1);
	}

	//查看监视结果

		//有条件的推动  发生感兴趣的动作
	if(FD_ISSET(fd1,&rset)||FD_ISSET(fd2,&wset))
		fsm_driver(&fsm12); //fd1可读 fd2可写
	if(FD_ISSET(fd2,&rset)||FD_ISSET(fd1,&wset))
		fsm_driver(&fsm21);

}

	//文件状态恢复

	fcntl(fd1,F_SETFL,fd1_save);

	fcntl(fd2,F_SETFL,fd2_save);

}



```

select 用来监视文件描述符的行为，当文件描述符发生了感兴趣的行为或者达到了感兴趣的状态 函数返回 有目的地推动状态机
没有考虑到异常处理状态
加一条线 当前状态>3 ex推动到t态 无条件推动;线上有条件推动 线下为无条件推动

```c
enum
{
	STATE_R=1,
	STATE_W,
STATE_AUTO,
	STATE_Ex,
	STATE_T
}

//监视的时候
	//读写的状态 才监视
if(fsm12.state<STATE_AUTO || fsm21.state<STATE_AUTO)
{
	...
}
//查看监视结果

if(FD_ISSET(fd1,&rset)||FD_ISSET(fd2,&wset)||fsm12.state>STATE_AUTO)
	fsm_driver(&fsm12); //fd1可读 fd2可写

if(FD_ISSET(fd2,&rset)||FD_ISSET(fd1,&wset)||fsm21.state>STATE_AUTO)
	fsm_driver(&fsm21);

```

## 问题

- 监视位置和结果相同的位置 三个集合（组织思路：事件为单位 且单一 读写 其他的都为异常） 读写集合，异常集合 ；出了假错 要重新布置现场
- int nfds 溢出 大小限制 不超过 有符号数整形大小
-
