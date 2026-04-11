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


在补码中，一个整数的位数由两部分组成：符号位和数值部分。
问题：最高位有效位+1

正数符号位是0,负数符号位是1.对于正数 12(01100)，找最高位1.对于负数 -5(1011)，找最高位0,前导1为符号扩展.
统一处理正数和负数，x<0 取反。这样只需找最高位的1

```c
int sign=x>>31;
x=sign&~x|~sign&x; //or x=x~sign
```


最高位的查找 二分
将32位整数不断折半，检查高位是否存在1.若高位有1,说明至少需要这一半的位数，计数累加并右移处理剩余位。

`!!`:布尔化，有还是没有
```c
int b16=!!(x>>16)<<4; //高16位有没有数，并记录位数
x=x>>b16;
```

把最左边的1移到最右边


##  floatscale2

单精度浮点
`[ sign(1) | exponent(8) | fraction(23) ]`

\*2,指数部分加1,（规格化数）对于特殊情况：NaN[^1],直接返回参数。

[^1]: not a number

对于非规格化数，frac左移


## floatFloat2Int


### 提取各部分信息

通过掩码和移位操作提取符号位、阶码和尾数

### 处理特殊情况

指数过大  exp-127>=31 超过int能表示的最大范围($2^{31}-1$);
指数过小 exp-127<0 说明该数是小于1的小数，转换为整数后结果直接为0

### 计算有效数字
mantissa
补回隐含的1
M=frac|(1<<23)


### 根据指数进行移位

若E>23,小数点向右移动的位数超过了尾数的长度，将M左移E-23位。
若E<=23,说明小数点向右移动的位数不足23位，需要将M右移23-E位，舍弃小数部分


### 处理符号并返回

## floatpower2

$2^x$ 用单精度浮点数表示

$1.0*2^x$
符号位：0
小数位：0
指数位：x=E=exp-127 ,四种情况：溢出，规格化数，非规格化数，下溢

### 情况1：规格

E的范围：1-254，对应x的范围：-126 127

### 情况2：非规格化

$$V = 0.f \times 2^{-126}$$
x小于-126

$$2^x = (0.f) \times 2^{-126}$$
$$(0.f) = 2^x / 2^{-126} = 2^{x + 126}$$
在frac的第k位放一个1,它代表的数值就是$2^{k-23}$（相对于 $0.f$ 里的那个小数点）。  k-23=x+126; k=x+149;

### 情况3： overflow &underflow

上溢：x>127 返回$+\infty$，0x7f800000.
下溢：x<-149,返回0 