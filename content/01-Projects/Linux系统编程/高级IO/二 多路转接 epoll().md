---
created: 2026-02-25
---
三步走：创建一个实例epoll_create，控制 epoll_ctl，最后查看监视结果 epoll_wait


poll与epoll()的区别，一个是linux方言版本.
poll建立一个数组，在用户态下自己管理数组，完成各种行为的指定、获取；而epoll在kernel态下管理这么一个数组，管理文件描述符，关心的事件，返回的事件，提供系统调用，方法，封装了一层。


`int epoll_create(int size)`size 可以理解成数组的大小，常规的数值。？

`int epoll_ctl(int epfd,int op,int fd,struct epoll_event *event)`
op:想做什么：添加/修改/删除
fd:对象
event:针对的事件


`int epoll_wait(int epfd,struct epoll_event *events, int maxevents,int timeout);

maxevents
可以连续取很多事件 放到该数组当中


```c relay.c
#include<sys/epoll.h>


static relay()
{
	struct epoll_event ev;
	epfd=epoll_create(10);
	//如果失败了
	if(epfd<0)
	{
		perror("epoll_create()");
		exit(1);
	}
	
	ev.events =0; //暂时没有行为，第一个成员
	ev.data.fd=fd1; //第二个成员
	epoll_ctl(epfd,EPOLL_CTL_ADD,fd1,&ev);
	//把数据传递给内核
	ev.events=0;
	ev.data.fd=fd2;
	epoll_ctl(epfd,EPOLL_CTL_ADD,fd2,&ev);
	while(fsm12.state !=STATE_T||fsm21.state!=STATE_T)
	{
		//布置监视任务
		
		//fd1事件的修改
		ev.data.fd = fd1;
		ev.events =0;
		if(fsm12.state == STATE_R)
			ev.events |= EPOLLIN;
		if(fsm21.state == STATE_W)
			ev.events |= EPOLLOUT;
		epoll_ctl(epfd,EPOLL_CTL_MOD,fd1,&ev);
		
		
		//监视
		if(fsm12.state<STATE_AUTO ||)
		{
			while(epoll_wait(epfd,&ev,1,-1))//死等
			{
				if(errno )
				perror
				exit
			}
		}
		//查看当前结果
		if(ev.data.fd ==fd1 &&ev.events &EPOLLIN||ev.data.fd==fd2&&ev.events &EPOLLOUT||fsm12.state>STATE_AUTO)
		//文件描述符1可读
			fsm_driver(&fsm12);
	}
	
	//最后关闭
	close(epfd);
}
```

events:
- epoll的精华所在 设立的 epoll_data_t data; 而 epoll_data_t 是一个union ![[Pasted image 20260225194620.png]]
- void * 最好用的数据类型。关联到树 ，存树的节点