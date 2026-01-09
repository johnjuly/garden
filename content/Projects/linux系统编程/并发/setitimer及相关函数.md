---
created: '2026-01-06'
---


`int setitimer(int which,const struct itimerval *new_value,struct itimer_itimerval *old_value)`
参数1：设计哪一个时钟，ITIMER_REAL ITIMER_VIRTUAL ITIMER_PROF
参数2：设计时间周期，current value 初相位，递减为0后发送信号，interval的值赋给value **原子化**
秒+微秒级单位
最大的好处是：误差不累积。服务器，一直运行。

---


修改slowcat.c
alarm改为setitimer函数
```c
struct itimer_val itv;
//初始化成员
itv.it_interval.tv_sec=1;
itv.it_interval.tv_usec=0;
itv.it_value.tv_sec=0;
itv.it_value.tv_usec=0;
if(setitimer(ITIMER_REAL,&itv,NULL)<0)
{
	perror("setitimer()");
	exit(1);
}

```

---

## abort
发送abort信号，结束进程，core dump。出错现场 得到。

---
## system
调用shell。block 阻塞一个信号，忽略两个信号。`/bin/sh -c`
`SIGCHILD SIGINT SIGQUIT` 定死的内容。 fork exec

---
## sleep
alarm+pause的封装 不好。

当前是在nanosleep封装的。时间控制。nanosleep select函数的副作用
















