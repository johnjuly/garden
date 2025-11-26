
流控依然成立在执行简单的攻击时![[Pasted image 20251114140433.png]]

```c mytbf.c



```

![[Pasted image 20251114140614.png]]
信号处理函数中，由于信号到来，执行信号所指定的行为。只响应kernel来的信号。保留一版`cp mytbf -r mytbf_sa`
if判断信号的来源。

两个函数来代替. /etc/services
```c
//全局
static struct sigaction alrm_sa_save;

//三参的处理函数
static void alrm_action(int s,siginfo_t *infop,void *unused)
{
	int i;
	//alarm(1);
	if(infop->si_code!=SI_KERNEL)
		return i;

}
static void module_load(void)
{
	//alrm_handler_save = signal(SIGALRM,alrm_handler);
	//alarm(1);
	struct sigaction sa;
	struct itimerval itv;
	sa.sa_sigaction=alrm_action;              //填充成员
	sigemptyset(sa.sa_mask);
	sa.sa_flags=SA_SIGINFO;
	sigaction(SIGALRM,&sa，&alrm_sa_save); //注册的行为 需要一个结构体
	/*if error*/
	
	itv.it_interval.tv_sec=1;
	itv.it_interval.tc_usec=0;
	itv.it_value.tv_sec=1;
	itv.it_value.tv_usec=0;
	setitimer(ITIMER_REAL,&itv,NULL);//时钟类型
	/*if error*/
	atexit(module_unload);
}
```


```c
static void module_unload(void)
{
	int i;
	//signal(SIGALRM,alrm_handler_save);
	//alarm(0);
	struct itimerval itv;
	//进行恢复，之前的状态不关心
	sigaction(SIGALRM,&alrm_sa_save,NULL);
	
//关掉时钟
	itv.it_interval.tv_sec=0;
	itv.it_interval.tc_usec=0;
	itv.it_value.tv_sec=0;
	itv.it_value.tv_usec=0;
	
	setitimer(ITIMER_REAL,&itv,NULL);
}
```

暂停两秒，真信号淹没在假信号中。

关于第三个参数 void * . getcontext;刚刚打断的现场。在用户态，搭建多线程框架。