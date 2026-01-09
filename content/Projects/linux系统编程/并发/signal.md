---
created: '2026-01-06'
---


```c star.c
#include <signal.h>

int main()
{
	int i;
	//往屏幕打印信号 1s打印一个
	for(i=0;i<10;i++)
	{
		write(1,"*",1);
		sleep(1);
	}
	
	exit(0);
}

```

*  ctrl+c ,sigint 的快捷方式。打断。

```c

#include <signal.h>

static void int_handler(int s)
{
	write(1,"!",1);
}
int main()
{

	int i;
	//signal(SIGINT,SIG_IGN); //忽略
	signal(SIGINT,int_handler);//指定响应方式
	//往屏幕打印信号 1s打印一个
	for(i=0;i<10;i++)
	{
		write(1,"*",1);
		sleep(1);
	}
	
	exit(0);
}
```
- 给一个信号指定一个行为，handler 不是sig_ign,sig_def,就是自定义函数地址。
- EINTR 当一个阻塞的系统调用发生时就可能被信号打断。io方式。`man 2 read open` 还没来得及做任何事情。

```c signal.c
do
{sfd=open(argv[1],O_RDONLY);
if(sfd<0)
{
	if(errno !=EINTR)
	{  perror("open()");
		exit(1);//真错
	}
}
}while(sfd<0);


```