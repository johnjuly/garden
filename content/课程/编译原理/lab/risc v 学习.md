
```c
#include <stdio.h>
int a=0;
int b=0;

int max(int a,int b)
{
	if(a>=b){
		return a;
	}
	else{
		return b;
	}
}

int main(){
	scanf("%d %d",%a,%b);
	printf("max is: %d\n",max(a,b));
	return 0;
}
```

**64** 位的risc-v指令集
	需要了解
- [ ] 基础指令集
- [ ] M扩展（乘除法）
- [ ] F和D扩展（浮点数指令集）


![[Pasted image 20250926155104.png]]
- .option nopic 表示不使用位置无关的代码，*p*osition *i*ndependant *c*ode.此时，汇编器生成的代码将假定它会被加载到固定的内存地址，对于生成静态链接的二进制文件比较重要。 nopic和pic的差异体现在对 GOT(Global Offset Table)表的查找。[^1]
- attribute arch ，用于指定汇编代码所遵循的架构特性和扩展的值令。 rv64i2p1 代码遵循 risc-64 位基础证书指令集 版本号为2.1 ；m2p0 表示支持乘除法值令；d2p2表示支持双精度浮点数值令，版本号2.2
- unaligned_access 表示不允许非对齐访问，
- stack_aligned，16表示栈空间需要16字节对齐，
- .text 代码区
- risc-v函数调用约定参数的传递 首先使用a0-a7寄存器，若寄存器不够，则使用栈进行传递 #待查 
![[Pasted image 20250926155125.png]]

[^1]: 小声：games of thrones...
