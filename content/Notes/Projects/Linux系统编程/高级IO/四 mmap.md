---
created: 2026-03-02
---
映射到进程空间。![[Pasted image 20260302065337.png]]
实现共享内存的功能。
- 匿名映射 动态分配内存



## 功能：随意指定一个文件，数出这个文件里有多少个字符a
- 使用open ,得到文件描述符
- 获得文件长度 `stat` `fstat`

```c mmap.c
#include<stdio.h>
#include<stdlib.h>
#include<sys/mman.h>
#include<sys/types.h>
...

int main(int argc,char *argv[])
{
	int fd;
	struct stat statres;
	char *str;
	int i;
	int count=0;
	if(argc<2)
	{
		fprintf(stderr,"Usage...\n");
		exit(1);
	}
	
	//获取文件描述符
	fd=open(argv[1],O_RDONLY);
	if(fd<0)
	{
		perror("open()");
		exit(1);
	}
	
	//获取文件长度
	if(fstat(fd,&statres)<0){
		perror("fstat()");
		exit(1);
		
	}
	
	str=mmap(NULL,statres.st_size,PROT_READ,MAP_SHARED,fd,0);
	if(str == MAP_FAILED)
	{
		perror("mmap");
		exit(1);
	}
	//映射完后就可以关闭
	close(fd);
	
	for(i=0;i<statres.st_size;i++)
	{
		if(str[i]=='a')
			count++;
	}
	printf("%d\n",count);
	
	munmap(str,statres.st_size);
	
	exit(0);
}
```


![[Pasted image 20260302071445.png]]
## 父子进程间的通信 共享内存

- 匿名映射，不依赖于任何文件，没有文件描述符
```c shared.c
#include <stdio.h>
#include <stdlib.h>
#include <sys/mman.h>
#include <string.h>

#define MEMSIZE 1024

int main()
{
	char *ptr;
	pid_t pid;
	ptr=mmap(NULL,-1,MEMSIZE,PROT_READ|PROT_WRITE,MAP_SHARED|MAP_ANONYMOUSE,-1,0);
	if(ptr==MAP_FAILED)
	{
		perror("mmap()");
		exit(1);
	}
	pid=fork();
	if(pid<0)
	{
		perror("fork()");
		munmap(ptr,MEMSIZE);
		exit(1);
	}
	if(pid==0) //child  write
	{
		//面临的是字符串 
		strcpy(ptr,"Hello!");
		munmap(ptr,MEMSIZE);
		exit(0);
	}
	else  //parent read
	{
		wait(NULL); //收尸
		
		puts(ptr); //读取内容
		munmap(ptr,MEMSIZE); //解除映射
		exit(0);
	}

}



```