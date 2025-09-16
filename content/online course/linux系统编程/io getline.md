
- 在make中定义宏。而不是具体文件在包含头文件之前



- 封装 malloc 和remalloc


一个文件中有多少个字符
```c getline.c
#include <stdio.h>
#include <stdlib.h>
#include<string.h>


int main(int argc,char **argv){

FILE * fp;
char *linebuf;
size_t linesize;

//给的参数不对
if(argc<2){
	fprintf(stderr,"Usage...\n");
	exit(1)
}

fp=fopen(argv1[1],"r");
if(fp ==NULL){
	perror("fopen()");
	exit(1);

}


//段错误 如果不加 !!!
linebuf =NULL;
linesize= 0;






while(1){
//返回值小于0失败
	if(getline(&linebuf,&linesize,fp)<0){
		break;	
	}
	printf("%d\n",strlen(linebuf));
	printf("%d\n",strlen(linesize));


}

//内存泄漏

fclose(fp);
exit(0);
}


```