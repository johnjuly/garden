---
created: '2026-01-06'
---

```c susp.c block
sigset_t set,oset;
sigemptyset(&set)
sigaddset(&set,SIGINT);//这个集合中只有这么一个信号存在
for(j=0;j<1000;j++)
{
	
	sigprocmask(SIG_BLOCK,&set,&oset);
	for(i=0;i<5;i++)
	{
		write(1,"*",1);
		sleep(1);
	}
	write(1,"\n",1);
	sigprocmask(SIG_SETMASK,&oset,NULL);
}

```
信号驱动程序。打印一行时停住等待，发一个信号，才会驱动程序跑一圈。
```c susp.c block
sigset_t set,oset;
sigemptyset(&set)
sigaddset(&set,SIGINT);//这个集合中只有这么一个信号存在
for(j=0;j<1000;j++)
{
	
	sigprocmask(SIG_BLOCK,&set,&oset);
	for(i=0;i<5;i++)
	{
		write(1,"*",1);
		sleep(1);
	}
	write(1,"\n",1);
	//解除阻塞后才能响应信号。下面两条指令不原子，使用sigsuspend()等待信号。
	sigprocmask(SIG_SETMASK,&oset,NULL);
	pause();

}

```
打印期间不响应信号。


```c 
sigsuspend(&oset);
/*


*/
```