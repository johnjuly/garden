```c fork1.c
#include<unistd.h>
int main()
{
	pid_t pid;
	printf("[%d]Begin!\n",getpid());
	pid=fork();
	if(pid<0)
	{
		perror("fork()");
		exit(1);
	}
	if(pid==0) //chid
	{
		printf("[%d]:child is working!\n",getpid());
	}
	else  //parent
	{
		printf("[%d]parent is working!\n",getpid());
	}
	
	
	printf("[%d]End!\n",getpid())
	exit(0);
}
```


在exit前加上 getchar让两个进程先不要结束。`ps axf`阶梯状关系![[Pasted image 20251014220055.png]]
memcopy 连名字都一样。1号是祖先而非父进程
- 一般情况下 begin打印一次 end打印两次
- 若重定向到文件中。``./fork1 > /tmp/out
- 若begin没有\n,终端没有问题，文件有问题
- 正解：刷新所有成功打开的流，在printf之后。==`fflush(NULL);`==
- 文件全缓冲模式。begin写到缓冲区当中，还未来得及写入文件。马上fork,父子进程当中的缓冲区中各自都有begin.所以输出两次，但是父子进程的号。