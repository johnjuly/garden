---
created: 2026-04-06
---
> 理解 the bit-level **representations** of C data types and the bit-level behavior of the **operations** on data

## bitxor

> x^y using only ~ and &


数字逻辑
1. 真值表

| x   | y   | x ^ y |
| --- | --- | ----- |
| 0   | 0   | 0     |
| 0   | 1   | **1** |
| 1   | 0   | **1** |
| 1   | 1   | 0     |

x^y= `~x&y|x&~y`

2. 德摩根定律消掉|
否定或： $\neg (P\vee Q) \Longleftrightarrow (\neg P) \wedge(\neg Q)$

$(P\vee Q) \Longleftrightarrow \neg((\neg P) \wedge(\neg Q))$

```c
int bitxor(int x,int y)
{ 
	int res=~(~(~x&y)&~(x&~y)); 
	return res;

}
```

## tmin
> 补码中最小的整数 

补码：用来表示有符号数，负数。将字的最高位解释为negative weight.
w位补码能表示的最小值是位向量[10...0] ，-$2^{w-1}$;
最大值是[01...1] , $2^{w-1}-1$
设置负权，清楚其他位；设置其他位，清楚负权。

```c
int tmin(void){
	int res=1<<31;
	return res;
}
```


## isTmax

> 返回1 如果x是最大的补码，否则返回0


```c
int isTmax(int x){

	if(x==-1)
		return 0;
	else{
		return x+1==~x?1:0;
	}
}
```

最大补码的性质
加一 等于 它的反码；


## allOddBits
> return 1 if all odd-numbered bits in word set to 1

构造一个奇数位全是1的掩码，然后检查x在这些位置是不是全是1

1. 构造mask

```c
int mask =0xAA<<8;  //0xAA00
mask=mask+0xAA;     //0xAAAA
mask=mask<<16;      //0xAAAA0000
mask=mask+0xAAAA;   //0xAAAAAAAA
```
2. 取出x的奇数位

`x&mask`
3. 判断是否全为1

`(x&mask)^mask`


## negate

> return -x

按位取反加1

## isAsciiDigit 

> return 1 if 0x30 <=x<=0x39


用减法代替比较，通过判断 x-0x30和0x39-x是否为负数，来实现区间判断；
1. 把区间拆成两个条件，x>=0x30 且x<=0x39
2. 用减法判断大小 `diff1=x+~0x30+1`,diff2
3. 判断是否为负 与上 符号位为负 sign&diff



```c
int isAsciiDigit(int x){

	int sign=1<<31;
	int diff1=x+~0x30+1;
	int diff2=0x39+~x+1;
	int low=sign&diff1;
	int high=sign&diff2;
	return !(low|high);
}
```


## conditional
> same as x?y:z


1. 把条件变成全0或全1的掩码
	1. 把x变成0或1`int flag=!!x;`
	2. 把0/1扩展成全位掩码 `int mask=~flag+1;`
2. 位运算选择
	1. mask=全1,打开y,关闭z
	2. msk=全0,关闭y，打开z
	`y&mask|z&~mask`

## isLessOrEqual

> if x<=y, then return 1, else return 0


转换为y-x>=0;
两种情况，case 1: 两者符号不同，并且x为负数；
case2:两者符号相同并且减掉之后的数符号为正

```c
int isLessOrEqual(int x,int y){
	int sign_x=x>>31;
	int sign_y=y>>31;
	int diff=y-x;
	int diff_sign=diff>>31;
	int same_sign=!(sign_x^sign_y);
	
	int c1=!(same_sign)&sign_x;
	int c2=same_sign&(!(diff_sign));
	return c1|c2;
}
```

## logicalNeg

> 实现 !x：`x==0 `返回1,$x\neq0$返回0



0 是不带符号的数

```c
int logicalNeg(int x){
	int neg_x=~x+1;
	int combined=neg_x|x;
	int sign=combined>>31;
	return sign+1;
}
```


## howManyBits

> return the min number of bits required to represent x in two's complement