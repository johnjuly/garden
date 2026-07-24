---
created: "2026-02-23"
---

- select 以事件为单位组织文件描述符，
- poll以文件描述符为单位组织事件
- select的缺陷 监视的事件过于单一 ；发生假错绕一大圈 因为原因与结果同一空间

poll第一个参数结构体数组的起始位置，一个结构体一个文件描述符
`int poll(struct pollfd *fds,nfds_t nfds,int timeout);`
timeout 毫秒为单位，0非阻塞，-1阻塞；

adv/poll
short 类型 16位图 十六种事件最多 更详细的事件

```c relay.c
#include<poll.h>

static void relay()
{
	struct pollfd pfd[2];
}

//放在循环外
pfd[0].fd=fd1;
pfd[1].fd=fd2;
while(fsm12.state!=STATE_T||fsm21.state !=STATE_T)
{
	//布置监视任务
	pfd[0].events = 0; //循环内清零 上一次事件
	if(fsm12.state == STATE_R)
		pfd[0].events |=POLLIN;
	if(fsm21.state == STATE_W)
		pfd[0].events |=POLLOUT;

	pfd[1].events=0;
	if(fsm12.state == STATE_W)
		pfd[1].events |= POLLOUT;
	if(fsm21.state == STATE_R)
		pfd[1].events |= POLLIN;



	//监视
	if(fsm12.state<STATE_AUTO || fsm21.state < STATE_AUTO)
	{
		while(poll(pfd,2,-1)<0)
		{
			if(errno == EINTR)
				continue; //绕小圈了
			perror(“poll()”);
			exit(1);
		}
	}
	//查看监视结果
	if(pfd[0].revents & POLLIN||pfd[1].revents &POLLOUT||fsm12.state > STATE_AUTO)
		 //如果一可读或者二可写
		fsm_driver(&fsm12);
	if(pfd[1].revents & POLLIN || pfd[0].revents &POLLOUT||fsm21.state>STATE_AUTO)
		fsm_driver(&fsm21);
}
```
