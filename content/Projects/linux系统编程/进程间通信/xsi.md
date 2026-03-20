---
created: 2026-03-20
---

## 消息队列
proto.h
rcver.c
snder.c

约定双方对话格式 ->协议

```c proto.h
#ifndef PROTO_H_
#define PROTO_H_

#define KEYPATH "/etc/services"
#define KEYPROJ 'g'
#define NAMESIZE 32

struct msg_st
{
	long mtype;
	char name[NAMESIZE];
	int math;
	int chinese;
};





#endif
```


```c snder.c
#include<stdio.h>
#include<stdlib.h>
#include <sys/types.h>
#include<sys/ipcs.h>
#include<sys/msg.h>
#include<string.h>

#include"proto.h"

int main()
{
	struct msg_st sbuf;
	int msgid;
	key_t key;
	key=ftok(KEYPATH，KEYPROJ);
	if(key<0)
	{
		perror("ftok()");
		exit(1);
	}
	
	msgid=msgget(key,0);
	if(msgid<0)
	{
		perror("msgget()");
		exit(1);
	}
	
	sbuf.mtype=1;
	strcpy(sbuf.name,"Alan");
	sbuf.math=rand()%100;
	sbuf.chinese=rand()%100;
	if(msgsnd(msgid,&sbuf,sizeof(sbuf)-sizeof(long),0)<0)
	{
		perror("msgsnd()");
		exit(1);
	}

//谁创建谁销毁
	puts("ok!");
	exit(0);
}
```

recv先运行，区别 IPC_CREAT
```c rcver.c

#include <stdio.h>
#include <stblib.h>
#include<sys/types.h>
#include<sys/ipc.h>
#include<sys/msg.h>

#include"proto.h"


int main()
{
	struct msg_st rbuf;
	key_t key;
	int msgid;
	key=ftok(KEYPATH,KEYPROJ);
	if(key<0)
	{
		perror("ftok()");
		exit(1);
	}
	msgid=msgget(key,IPC_CREAT|0600); //使用权限
	if(msgid<0)
	{
		perror("msgget()");
		exit(1);
	}
	
	while(1)
	{
	if(msgrcv(msgid,&rbuf,sizeof(rbuf)-sizeof(long),0,0)<0)
	{
		perror("msgrcv()");
		exit(1);
	}
	printf("NAME= %s\n",rbuf.name);
	printf("MATH = %d\n",rbuf.math);
	printf("CHINESE = %d\n".rbuf.chinese);
	}
	msgctl(msgid,IPC_RMID,NULL);
	
	exit(0);
	
}
```

ipcrm