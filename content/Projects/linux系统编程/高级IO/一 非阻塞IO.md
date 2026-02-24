---
created: "2026-02-08"
---

**数据中继** relay.c 两个设备(两个文件 两个用户 两个server) 数据交换
场景：

- 输入网址，登录网站 下载资料or提交文档 ；
- 流式套接字, 发送数据包-ack-下一个数据包
- 域名拦截，访问baidu.com,广告页面先出现几秒，放大数据中继模型 中间人攻击？
- 父进程 管理 两万对设备之间进行对话 负载重-> fork 多个子进程 负责 一定数量设备对话，父进程管理子进程 -> 子进程放在不同的主机上 负载均衡 滚雪球
  模型：
  设备l 设备r
  方法：

1.  读左 写右 读右 写左 rl-wr-rr-wl 成为一个任务 一个人完成
2.  分成两个任务 第一个任务负责 rl-wr ;第二个任务 rr-wl
    **mycpy** 重构 ： 多个 一起工作 不冲突

c是工具 用它 完成功能
讲的是机制，像字典

---

该目录下`io/adv/nonblock`

`relay.c`

- 打开的动作，open ；打开方式 非阻塞io 用户打开方式不确定，main函数模拟用户的操作，在main函数之外保证是以非阻塞方式操作，使用fctl;中间调用函数

```c relay.c
#include <stdio.h>
#include<stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <errno.h>

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
static void relay(int fd1,int fd2)
{
	struct fsm_st fsm12,fsm21; //读1写2&&读2写1
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
		fsm_driver(&fsm12);
		fsm_driver(&fsm21);
	}


	//文件状态恢复
	fcntl(fd1,F_SETFL,fd1_save);
	fcntl(fd2,F_SETFL,fd2_save);
}

int main()
{
	int fd1, fd2;
	fd1=open(TTY1,O_RDWR); //用户阻塞打开

	if(fd1<0)
	{
		perror("open()");
		exit(1);
	}
	//写提示性内容
	write(fd1,"TTY1\n",5);


	fd2=open(TTY2,O_RDWR|O_NONBLOCK)  //用户非阻塞打开
	if(fd2<0)
	{
		peeror
		exit
	}
	write(fd2,"TTY2\n",5)

	relay(fd1,fd2);
	close(fd2);
	close(fd1)
	exit(0);
}
```

- 有限状态机，若改需求，在图上改圈 #todo #截图
- 两个状态机 一个 读左写右 一个读右写左；状态机数据结构的封装 copy 的封装,mycopy的现场
- 确保进入与出去的状态是一致的， relay()前后 文件打开方式不变 1 阻塞 2 非阻塞。 relay 函数的最后 恢复文件状态 使用`fcntl`
- **思路** ：
  - main函数用来模拟用户的操作：打开两个设备，调用数据中继函数
  - relay函数中 在所有实现之前，保证两个文件是以非阻塞方式实现，结束时恢复之前的状态。中间建立两个状态机，初始化状态为读态，分别把源和目标指定好。不停推两个状态机直到T态，死循环。

make relay  
root 用户执行
ctl alt f11 f12
一行的内容按ctl+c 放在缓冲区中不发出去

---

## 改成 中继 引擎

> relayer文件夹

io/adv/nonblock/relayer

调用方 main.c
实现 relay.c
makefile

```makefile
CFLAGS+=-pthread
LDFLAGS+=-pthread
all:relayer
relayer:relayer.o main.o
	gcc $^ -o $@ $(CFLAGS) $(LDFLAGS)

clean:
	rm -rf *.o relayer

```

![[Pasted image 20260214193208.png]]

- 两个文件描述符构成一个Job 。一万个job ,2万个 fd,状态机 12 和状态机21 。ulimit -a 需要先更改 open file 大小

- 两对的实现
  最多管理一万个任务，两万个文件描述符

```c relayer.h
#ifndef RELAYER_H__
#define RELAYER_H__

#define REL_JOBMAX         10000

enum
{
	STATE_RUNNING=1,
	STATE_CANCELLED,
	STATE_OVER
};

struct rel_state_st
{
	int state;
	int fd1;
	int fd2;
	int64_t coutn12,count21;
	struct timerval start,end;
};


//往数组里添加任务,返回数组下标
int rel_addjob(int fd1,int fd2);
/*
*  return >=0       成功，返回当前任务ID
*         ==-EINVAL 失败，参数非法
*         ==-ENOSPC 失败，任务数组满
*          ==-ENOMEM 失败，内存分配有误
**/

int rel_canceljob(int id);
/*
return == 0      成功，指定任务成功取消
       ==-EINVAL 失败，参数非法
       ==-EBUSY  失败，任务早已被取消
*/

//收尸 可以查看状态
int int rel_waitjob(int id，struct rel_sta_st*);
/*
	return == 0      成功，指定任务已终止并返回状态
	       ==-EINVAL 失败，参数非法
*/

int rel_stajob(int fd,struct rel_stat_st *)
/*
	return == 0        成功，指定任务状态已经返回
	       ==-EINVAL   失败，参数非法

*/
#endif
```

- 对于 main.c 不再需要状态机 的定义 driver ，只需要调用方法，保留一个main函数。

```c main.c
#include <stdio.h>
#include<stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <errno.h>
#include <string.h>
#include <relayer.h>

#define TTY1 "/dev/tty11"

#define TTY2 "/dev/tty12"
#define TTY3 "/dev/tty10"
#define TTY4 "/dev/tty9"

int main()

{

int fd1, fd2;
int job1,

fd1=open(TTY1,O_RDWR); //用户阻塞打开

if(fd1<0)

{

perror("open()");

exit(1);

}

//写提示性内容

write(fd1,"TTY1\n",5);

fd2=open(TTY2,O_RDWR|O_NONBLOCK) //用户非阻塞打开

if(fd2<0)

{

peeror

exit

}

write(fd2,"TTY2\n",5)

job1=rel_addjob(fd1,fd2);

if(job1<0)
{
	fprintf(strerr,"rel_addjob():%s\n",strerror(-job1));
	exit(1);
}

fd3=open(TTY3,O_RDWR);
if(fd3<0)
{
	perror("open()");
	exit(1);
}
write(fd3,"TTY3\n",5);

fd4=open(TTY4,O_RDWR);
if(fd4<0)
{
	perror("open()");
	exit(1);
}
write(fd4,"TTY4\n",5);


job2=rel_addjob(fd3,fd4);
if(job2<0)
{
	fprintf(stderr,"rel_addjob():%s\n",strerror(-job2));
}

while(1)
	pause();
close(fd2);
close(fd1);
close(fd3);
close(fd4);

exit(0);

}

```

- addjob的实现。添加任务，会用到当前任务的属性。在当前最大值中找空位。上限暴露给用户。在头文件中

```c relayer.c
#include <pthread.h>
#include<string.h>
#include<relayer.h>

//临界资源来使用，多线程实现
static struct rel_job_st* rel_job[REL_JOBMAX];
static pthread_mutex_t mut_rel_job = PTHREAD_MUTEX_INITIALIZER;
static pthread_once_t init_once=PTHREAD_ONCE_INIT;

struct fsm_st

{

	int state;
	int sfd;
	int dfd;
	char buf[BUFSIZE];
	int len;
	int pos;
	char *errstr;
	int64_t count;

};

...

struct rel_job_st
{
	int job_state;
	int fd1;
	int fd2;
	struct rel_fsm_st fsm12,fsm21;
	//struct timerval start,end;
	int fd1_save,fd2_save
};

static void *thr_relayer(void* p)
{

	while(1)
	{
	pthread_mutex_lock(&mut_rel_job);
	for(i=0;i<REL_JOBMAX;i++)
	{
		if(rel_job[i]!=NULL)
		{
			if(rel_job[i]->job_state==STATE_RUNNING)
			{

				fsm_driver(&rel_job[i]->fsm12);
				fsm_driver(&rel_job[i]->fsm21);
				if(rel_job[i]->fsm12.state==STATE_T&&rel_job[i]->fsm21.state==STATE_T)
				rel_job[i]->job_state= STATE_OVER;
			}
		}
	}
	pthread_mutex_unlock(&mut_rel_job);
	}
}

//module_unload

static void module_load(void)
{
	//创建一个线程，永远推状态机，类似构造函数
	pthread_t tid_relayer;
err=pthread_create(&tid_relayer,NULL,thr_relayer,NULL
	if(err)
	{
		fprintf(stderr,"pthread_create():%s\n",strerror(err));
		exit(1);
	}
}

static get_free_pos_unlocked()
{
	for(i=0;i<REL_JOBMAX;i++)
	{
		if(rel_job[i]==NULL)
			return i;
	}
	//没有空位
	return -1;
}


int rel_addjob(int fd1,int fd2)
{
	struct rel_job_st*me;

	pthread_once(&init_once,module_load);//动态模块单次初始化加载

	me=malloc(sizeof(*me));
	if(me == NULL)
		return -ENOMEM;
	//成员初始化
	me->fd1=fd1;
	me->fd2=fd2;
	me->job_state=STATE_RUNNING;

	//保证非阻塞
	me->fd1_save=fcntl(me->fd1,F_GETFL);
	fcntl(me->fd1_save,F_SETFL,me->fd1_save|O_NONBLOCK);
	me->fd2_save=fcntl(me->fd2,F_GETFL);
	fcntl(me->fd2_save,F_SETFL,me->fd2_save|O_NONBLOCK);

	me->fsm12.sfd=me->fd1;
	me->fsm12.dfd=me->fd2;
	me->fsm12.state=STATE_R;

	me->fsm21.sfd=me->fd2;
	me->fsm21.dfd=me->fd1;
	me->fsm12.state=STATE_R;

	//找空位;


	pthread_mutex_lock(&mut_rel_job);
	pos=get_free_pos_unlocked();
	if(pos<0)
	{
		pthread_mutex_unlock(&mut_rel_job);
		//各种恢复
		fcntl(me->fd1,F_SETFL,me->fd1_save);
		fcntl(me->fd2.F_SETFL,me->fd2_save);
		free(me);
		return -ENOSPC;
	}

	rel_job[pos]=me;

	pthread_mutex_unlock(&mut_rel_job);
}

int rel_canclejob


```

- module_load

io密集型任务，非重负载；
忙等
