---
created: '2026-01-06'
---


man 3 printf 

一族的函数
可以指定输出的流
fprintf(FILE*stream,const char *format,)
fprintf(stderr,"Usage:%s <src><des>\n",argv[0]);


int sprintf(char * str,const char *format,...)
sprintf 把...这些内容按照这样的格式输出到一个字符串当中去.
把多种不同的数据类型的串按照特定的一对一的格式放在一个字符串当中去
(atoi的反向功能。没有一个函数叫做itoa?)
atoi  把一个串转换成一个整形的数

```atoi.c
/*char str[]="123a456";//123
printf("%d\n",atoi(str));*/


char buf[1024];
int year=2014,month=5,day=13;

printf("%d-%d-%d\n",year,month,day);
sprintf(buf,"%d-%d-%d",year,month,day);
puts(buf);


```



snprintf用来解决sprintf可能遇到的问题：
不知道输出到的串有多大。
防止越界。空间溢出
snprintf(char*str,size_t size,const char*format,...);