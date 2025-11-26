execute a file
replace the current process image with a new process image.
替换。忒修斯之船。七年之后，你的细胞。。。但是神经细胞 不会替换的。七年之后，你还是你吗？壳子，内容
`extern char **environ`

变参函数，最后补充NULL结束标记![[Pasted image 20251019105803.png]]
对于execlp为什么只需要filename就可以了不需要路径？因为有环境变量
execle e代表environ
于看到的相反 前三个定参；后两个变参


如何摇身一变 变成别人
`which date`

```c ex.c
#include <stdio.h>
#include<stdlib.h>

//实现功能 打印时戳date +%s

int main()
{
	puts("Begin!");//打印提示语句
	
	execl("/bin/date","date","+%s",NULL);
//若成功 绝对不会回来
	perror("execl()");
	exit(1);
	
	puts("End!");
	exit(0);
}

```

begin去哪了![[Pasted image 20251019110839.png]]
puts 写文件 \n 只表示换行 还在缓冲区中 没有写入
在execl之前 ：`fflush(NULL)`

壳子不变 即pid

三个函数凑在一起。
```c few.c
#include <stdio.h>
...

int main()
{
	pus("Begin!");
	fflush(NULL);
	
	pid=fork();
	
	if(pid<0)
	{
		perror("fork()");
		exit(1);
	}
	
	if(pid==0)//子进程干活
	{
		execl("/bin/date")
		peror("execl()");
		exit(1);
	}
	
	wait(NULL);//父进程收尸
	puts("End!");	
	exit(0);
}

```