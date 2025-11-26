signal()函数缺陷
`mydaemon.c `没法执行后两行收尾操作

```c
static void daemon_exit(int s)
{
	if(s==SIGINT)
//多个信号共用一个信号处理函数	
	fclose(fp);
	closelog();
}

signal(SIGNIT,daemon_exit);
signal(SIGQUIT,daemon_exit);
signal(siGTERM,daemon_exit);

```

一个空间被free多次，fclose,内存泄漏 嵌套；
方法：处理一个信号时把另外的信号屏蔽掉；使用sigaction


```c
struct sigaction sa;
sa.sa_hadler=daemon_exit();
sigemptyset(&sa.sa_mask);
sigaddset(&sa.sa_mask,SIGQUIT)
sigcation(SIGINT,&sa,NULL);
```