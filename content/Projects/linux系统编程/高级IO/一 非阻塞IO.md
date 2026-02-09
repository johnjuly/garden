**数据中继**   两个设备(两个文件 两个用户 两个server) 数据交换
场景：
- 输入网址，登录网站 下载资料or提交文档 ；
- 流式套接字, 发送数据包-ack-下一个数据包
- 域名拦截，访问baidu.com,广告页面先出现几秒，放大数据中继模型 中间人攻击？
- 父进程 管理 两万对设备之间进行对话  负载重-> fork 多个子进程  负责 一定数量设备对话，父进程管理子进程 -> 子进程放在不同的主机上 负载均衡 滚雪球
模型：
设备l  设备r 
方法：
1.  读左 写右  读右 写左  rl-wr-rr-wl   成为一个任务 一个人完成 
2. 分成两个任务 第一个任务负责 rl-wr ;第二个任务 rr-wl
**mycpy** 重构 ： 多个 一起工作  不冲突

c是工具  用它 完成功能 
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
- 两个状态机 一个 读左写右  一个读右写左；状态机数据结构的封装  copy 的封装,mycopy的现场
- 确保进入与出去的状态是一致的，  relay()前后 文件打开方式不变 1 阻塞 2 非阻塞。 relay 函数的最后 恢复文件状态 使用`fcntl`
- **思路** ：
	- main函数用来模拟用户的操作：打开两个设备，调用数据中继函数
	- relay函数中 在所有实现之前，保证两个文件是以非阻塞方式实现，结束时恢复之前的状态。中间建立两个状态机，初始化状态为读态，分别把源和目标指定好。不停推两个状态机直到T态，死循环。


make relay  
root 用户执行
ctl alt f11 f12 
一行的内容按ctl+c 放在缓冲区中不发出去