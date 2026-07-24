---
created: 2026-04-02
tags:
  - 记录
  - 操作系统
  - lab
type: study_note
field: cs
topic: os
---

## boot
0402 环境配置 之前os安装过7.0 版本 但要求7.2以上 故重新安装

```sh

cd ~/opt

wget https://download.qemu.org/qemu-8.2.0.tar.xz
tar -xf qemu-8.2.0.tar.xz
cd qemu-8.2.0

./configure --prefix=/opt/qemu --target-list=riscv64-softmmu
make -j$(nproc)
sudo make install
```

## sleep
`user/sleep.c`  
涉及的三个文件 
- 实现pause()的系统调用：`kernel/sysproc.c` 
- c definition of pause() callable from a user program: `user/user/h`
- 汇编代码 从用户跳转到内核 `user/usys.S`


头文件的顺序。测试时间间隔太短 出现 `$ sleep 3 $ sleep 4 exec sleep failed`


## sixfive
使用open 和read系统调用，c字符串 以及c的文本文件处理

### 步骤
1. main函数，参数的检查，argc<=1 时输出用法并退出，遍历argv[1]...argv[argc-1]每个输入文件
2. 文件打开与读取 失败报错
3. 字符逐个读 `read(fd,&c,1)`
	1. c是0...9:累积到buf[] 构造数字token
	2. c是分隔符串中的一员，表示数字token结束，buf[i]='\0'做转换atoi判断`%[5-6]==0`后输出`printf("%d\n",num)`
	3. 其他情况 i=0重置
4. 所有文件关闭后返回exit

### 状态机
读->累积->分隔->处理
一个字符一个字符读取，分为3类，数字：累积到buffer,分隔符 触发处理bffer中的数据，其他字符 舍弃
```c
if(c>='0'&&c<='9'){
	buf[i++]=c;
}
else if(strchr(sep,c)){
	if(i>0){...}
}
else{
i=0;
}
```

### 边界处理
特殊处理文件末尾 i>0的情况
### 多文件
argvi for循环 每次打开一个文件处理 关闭


## memdump

`memdump(char* fmt,char*data)`按照fmt 打印data的内容

指针的解读

## find
路径名和目录 ，系统调用 open read fstat
dfs+fs遍历
- 判断当前path是文件还是目录
	- 文件->判断名字是否匹配
	- 目录->遍历目录项 && 递归进入子目录


每个文件项 包含 inum,name;
文件系统的访问模式：open->read->stat(获取类型)
路径的拼接 `path+'/'+filename`

```c
strcpy(buf,path);
p=buf+strlen(buf);
*p++='/';
memmove(p,de.name,DIRSIZ);
p[DIRSIZ]=0;
```

## exec

系统调用 fork exec wait



find函数传入两个参数 execflag和选项参数