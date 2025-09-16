fopen()
fclose()

FILE * 所指向的结构体位于？
假如在栈上，会在内部 定义一个FILE 结构体

```c
FILE* fopen(const char *path,const char*mode)
{


temp. =  ;


return &tenp;返回局部变量的地址
}
```

若声明为static，只会声明一次 会覆盖 之前的内容static FILE tmp;


```c
FILE* fopen(const char *path,const char*mode)
{
FILE * tmp =NULL;
tmp = malloc(sizeof(FILE));

temp-> = ;

return tmp




}
```



malloc free 在fclose 函数中；
若一个函数返回值是指针，有互逆操作，则在堆上


谁打开谁关闭 谁申请谁释放；是资源一定有上限，如递归
一个进程里i打开的文件数也有限，1024

输入输出函数

第一对：
fgetc()  
getchar()=getc(stdin)=fgetc(stdin)
宏（节约时间）与函数：调用时间与编译时间

cp src dest
格式
./mycp src dest
 

```
//mycpy

#include <stdio.h>
#include <stdlib.h>

//命令行传参
int main(int argc,char** argv)
{
FILE*fps,*fpd;
int ch;//返回值为整形


//使用了命令行的传参，一定要判断命令行的参数

if(argc < 3){
//如果命令行传的参数不是3个，那么报错、结束
	fprinf(stderr,"Usage:%s <src_file> <des_file>\n",argv[0]);/*往标准出错报错，说什么呢*/
	exit(1);
}

//两个文件，调用两次fopen.选择r说明源文件一定要存在，不然会向自己报错
fps=fopen(argv[1],"r");//fopen函数的返回值类型，在上行定义
//马上判断是否出错
if(fps == NULL){
	perror("fopen()");
	exit(1);
}
fpd=fopen(arg[2],"w");
if(fpd == NULL){

。	fclose(fps); //当当前为止，fps文件已经打开，内存泄漏。以后可以用钩子函数
	perror("fopen()");
	exit(1);
}

//读写过程放在一个循环当中.读一次写一次
while(1){
	//读
	ch= fgetc(fps);
	if(ch == EOF)//读到文件尾或者出错了，校验
		break;   //循环没有必要继续了，否则读到有效内容
	//写
	fputc(ch,fpd);
}

//谁打开，谁关闭
fclose(fpd);
fclose(fps);

}


```

实验：
	./mycpy /etc/services   /tmp/out 
	diff /etc/services  tmp/out


* 测试一个文件中有多少个字符

```fgetc.c
#include<stdio.h>
#include<stdlib.h>

int main(int argc,char **argv){//命令行传文件名，然后进行判断

FILE *fp;
int count=0;
命令行传参是否有误
	if(argc<2){
		fprintf(stderr,"Usage ...\n");//报错，说使用方法
		exit(1);
	}

fopen(argv[1],"r");

if(fp == NULL){
perror("fopen()");
exit(1);
}//打开失败，报错结束
//成功，统计，循环去读
while(fgetc(fp)！=EOF){

count++
}
printf("count = %d\n",count);

fclose(fp);
exit(0);
}

```


字符串相关

	fgets()   gets()bugs,never use gets,dangerous! 

```
define SIZE 5
char buf [SIZE];
fgets(buf，size,stream);

abcdef 讀abcd\0.文件指針在e的位置
ab  讀到ab\n\0

擦邊球。讀這個文件需要 兩次 讀完
abcd
1-> a b c d \0
2-> \n \0
```
`define SIZE 5`
`char buf [SIZE];`
`fgets(buf，size,stream)`;有兩種可能造成正常返回，
	1. 讀到了size-1
	2. 讀到了 '\n'


puts
修改之前的複製代碼。字符串拷貝
```mycopy_fgets.c

define BUFSIZE 1024

char buf[BUFSIZE];


while
	(fgets(buf,BUFSIZE,fps)!=NULL)
	//當返回值不爲空
	fputs(buf,fpd);


```

`size_t fread(void *ptr,size_t size,size_t nmemb,FILE *stream);`
從stream讀，讀到ptr所指的地址，讀size乘nmemb個對象大小
返回值成功的數量

fread(buf,size,nmemb,fp);

1->數據量足夠
2->文件中只有5个字节
fread(buf,1,10,fp);//要求读10个对象，1个对象1个字节
1->10 ->10个字节
2->5 ->5字节

fread(buf,10,1,fp);

1-> 1 ->10个字节
2->0->???

最好是单字节的实现
``` mycpy_fread.c

while(fread(buf,1,BUFSIZE,fps))
fwrite(buf,1,BUFSIZE,fpd);


while((n=fread(buf,1,BUFSIZE,fps))>0)
	fwrite(buf,1,n,fpd);

```

一切皆文件。文件的操作io的重要性



## reposition of stream 重新定位一个流

文件指针
```
//三个需要掌握的
fseek()
ftell
rewind()

//
fgetpos()
fsetpos()
```

 >  int fseek(FILE * stream, long offset, int whence);


- 第三个参数 ：文件首 当前位置 文件尾指针
- fseek(fp,0,SEEK_SET);
- fseek和ftell经常合在一起使用

测试文件长度 
```flen.c
FILE *fp;
int count =0;

if (argc <2)
{
	fprintf(stderr,"Usage...\n");
	exit(1);
}

fp = fopen(argv[1],"r");
//只读。返回值用fp来接收

//判断操作是否成功

//不成功 报错 结束
if(fp == NULL){
	perror();
	exit(1);
}

fseek(fp,0,SEEK_END);
printf("%ld\n",ftell(fp))










```


- rewind函数 封装 **（void） fseek(stream, 0L,SEEK_SET)**
- 功能 文件位置指针回到文件首



- fseek 与 空洞文件：ascii码 0。 刚刚建立下载任务的时候的文件。一上来就是文件本身的大小 2g，不是从0涨上来的。先占用磁盘。 
- 具体操作 touch 一个文件 为0；调用fseek函数 offset 设置为2k 全为\0.把文件切成小块。利用多线程 。每个线程锁主一块下载

fflush()
```fflush.c
#include <stdio.h>
#include<stdlib.h>
/*
   缓冲区的作用： 大多数情况下是好事，合并系统调用
   模式分类：
	   行缓冲：换行/满/强制（标准输出是这样，因为是终端设备）
	   全缓冲：满/强制（默认，只要不是终端设备）
	   无缓冲：如stderr.需要立即输出的内容，不需要等




*/

int main(){
	
	int i;
	printf("Before while:");
	fflush(stdout);
	while(1);
	printf("After while()");
	fflush(NULL);
	exit(0);
}

```

vim使用;shift+k跳转到man手册
- setvbuf 手动更改缓冲模式