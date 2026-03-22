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


### myftp_msg

c:path;s:data,n个data包，最后eot 表示当前传输结束。
权限校验
被动端先运行等待接包 ./s 作为守护进程,./c path的内容 重定向到文件或输出到终端 cat![[Pasted image 20260321100501.png]]

状态机
start状态->发path ->失败er->t output
![[Pasted image 20260321100835.png]]
```c proto1.h
#ifndef PROTO_H__
#define PROTO_H__

#define KEYPATH "etc/services"
#define KEYPROJ 'a'
#define PATHMAX 1024
#define DATAMAX 1024

enum
{
	MSG_PATH=1;
	MSG_DATA,
	MSG_EOT
}

typedef struct msg_path_st
{
	long mtype; /*must be MSG_PATH*/
	char path[PATHMAX]; /*ASCIZ 带尾0的串*/
}msg_path_t;

typedef struct msg_data_st
{
	long mtype;
	char data[DATAMAX];
	int datalen; //空洞文件 \0 有效数据长度
}msg_data_t;

typedef struct msg_eot_st
{
	long mtype;
}msg_eot_st;

union msg_s2c_un
{
	long mtype;
	msg_data_t datamsg;
	msg_eot_t eotmsg;
};
#endif
```

s端只会接一种类型的包
c端接收两种类型的包



2.h

```c proto2.h
#ifndef PROTO_H__
#define PROTO_H__

#define KEYPATH "etc/services"
#define KEYPROJ 'a'
#define PATHMAX 1024
#define DATAMAX 1024

enum
{
	MSG_PATH=1;
	MSG_DATA,
	MSG_EOT
}

typedef struct msg_path_st
{
	long mtype; /*must be MSG_PATH*/
	char path[PATHMAX]; /*ASCIZ 带尾0的串*/
}msg_path_t;

typedef struct msg_s2c_st
{
	long mtype;
	char data[DATAMAX];
	int datalen; //空洞文件 \0 有效数据长度
}msg_data_t;
/*datalen>0: data ; datalen=0 : eot*/



#endif
```

利用datalen的结果来确定是data包还是eot包,或者用mtype


## 信号量数组
![[Pasted image 20260321103140.png]]
信号数组 2 ，每个信号量为1->两个互斥量， 原子操作 锁a和锁b,否则死锁

文件锁下的add.c

 p v 操作 取资源与还资源

```c
static int semid;
static void P(void)
{
	struct sembuf op;
	op.sem_num=0;
	op.sem_op=-1;
	op.sem_flg=0;
	//真错与假错
	while(semop(semid,&op,1)<0)
	{
		if(errno!=EINTR||errno!=EAGAIN)
		{
			perror("semop()");
			exit(1);
		}

	}
}

static void V(void)
{
	struct sembuf op;
	op.sem_num=0;
	op.sem_op=1;
	op.sem_flg=0;
	if(semop(semid,&op,1)<0)
	{
		perror("semop()");
		exit(1);
	}
}

 
int main(){
	pid_t pid;
	int i;
	
	//父子通信  一旦fork所有子进程都拿到
	//匿名ipc 用它来写互斥量 一个元素
	semid=semget(IPC_PRIVATE,1,0600);
	if(semid<0)
	{
		perror("semget()");
		exit(1);
	}
	if(semctl(semid,0,SETVAL,1)<0)
	//资源总量为1
	{
		perror("semctl()");
		exit(1);
	}

	//销毁
	semctl(semid,0,IPC_RMID);

}
```

![[Pasted image 20260321105146.png]]
![[Pasted image 20260321105320.png]]


## shm

```c shm.c
#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <string.h>

#define MEMSIZE 1024

int main()
{
	int shmid;
	pid_t pid;
	char *ptr;
	shmid=shmget(IPC_PRIVATE,MEMSIZE,0600);
	if(shmid<0)
	{
		perror("shmget()");
		exit(1);
	}
	pid=fork();
	if(pid<0)
	{
		perror("fork()");
		exit(1);
	}	
	if(pid==0) //child write
	{
		ptr=shmat(shmid,NULL,0);
		if(ptr ==(void *) -1)
		{
			perror("shmat()");
			exit(1);
		}
		strcpy(ptr,"Hello!");
		//解除映射
		shmdt(ptr);
		exit(0);
	}
	else  //parent read
	{
		wait(NULL);
		ptr=shmat(shmid,NULL,0);
		if(ptr == (void *)-1)
		{
			perror("shmat()");
			exit(1);
		}
		puts(ptr);
		shmdt(ptr);
		shmctl(shmid,IPC_RMID,NULL);
		exit(0);
		
	}
	
	
}
```


