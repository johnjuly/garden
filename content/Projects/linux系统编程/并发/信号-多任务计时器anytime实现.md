---
created: '2026-01-06'
---

多个alarm.只有最后一个有效。![[Pasted image 20251101214132.png]]
类似，微波炉设置，第一个人 3分钟，第二个人 5分钟。一定是最后一个事件起作用。
anytimer.c+anytimer.h+main.c
```c main.c
#include<stdio.h>

static void f1(void *p)
{
	printf("f1():%s\n",p);
}
static void f2(void *p)
{
	printf("f2():%s\n",p);
}
int main()
{
	puts("Begin!");
	//5秒之后调f1,传入参数3个a
	//2,f2,"bbb";
	//7,f1."ccc"
	puts("End!");
	
	while(1)
	{
		write(1,".",1);
		sleep(1);
	}
	exit(0);
}
```

- begin end 瞬间调用。过两秒 bbb调用
- `//Begin!End!..bbb...aaa..ccc.......`
- 一个任务的要素：时间sec，function,参数arg。
	- 不断减时间到零。count down。倒计时为0时调用函数并传参
	- 构建一个存储空间![[Pasted image 20251101215745.png]]


```c anytimer.c
#ifndef ANYTIMER_H__
#define ANYTIMER_H__

#define JOB_MAX 1024
typedef void at_jobfunc_t(void *);
//添加任务
int at_addjob(int sec,at_jobfunc_t *jobp,void *arg);
/*return >=0 成功，返回任务ID
*        ==-EINVAL 失败，参数非法
*        ==-ENOSPC 失败，数组满
*        ==-ENOMEM 失败，内存空间不足
*/
int at_canceljob(int id);
/* return ==0   成功 指定任务成功取消
*         ==-EINVAL 失败，参数非法
*         ==-EBUSY  失败，指定任务已完成
*         ==-ECANCELEND 失败，指定任务重复取消
*/


//收尸
int at_waitjob(int id);
/*
*  return ==0 成功，指定任务成功释放
*         == -EINVAL 失败，参数非法
*
*/

at_pausejob();
at_resumejob();


#endif
```
- 模拟文件描述符 返回整形
标准出错，`usr/local/include/asm-generic/errono-base.h`
```c main.c
#include<stdio.h>

static void f1(void *p)
{
	printf("f1():%s\n",p);
}
static void f2(void *p)
{
	printf("f2():%s\n",p);
}
int main()
{
	puts("Begin!");
	job1=at_addjob(5,f1,"aaa");
	if(job1<0)
	{
		fprintf(stderr,"at_addjob():%s\n",strerror(-job1));
		exit(1)
	}
	at_addjob(2,f2,"bbb");
	at_addjob(7,f1,"ccc");
	puts("End!");
	
	while(1)
	{
		write(1,".",1);
		sleep(1);
	}
	exit(0);
}
```

- 为什么要有wait操作？典型的异步变为同步化



---

- slowcat2.c的问题：alarm信号砸在 token<=0 和pause()之间，token已为1.不原子的操作，![[Pasted image 20251102110130.png]]
- token--这句话未必是由一条指令完成的，精简指令集。同时对token操作。

`static volatile sig_atomic_t token=0;`