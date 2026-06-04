---
created: 2026-04-18
tags:
  - 算法与数据结构
  - 递归
  - master公式
topic: 算法
type: course-note
field: cs
---
## 递归

一个数组中找最大值

分解问题，左侧与右侧求最大值.不能划分的情况：base case. ^70dc6b

**递归图**


![[Pasted image 20260418084913.png]]
```java
public static int maxValue(int[] arr){
	return f(arr,0,arr.length-1);

}

//arr[l,r]范围上的最大值
public static int f(int[] arr,int l,int r){

	if(l==r){
		//base case
		return arr[l];
	}
	int m=(l+r)/2;
	int lmax=f(arr,1,m);
	int rmax=f(arr,m+1,r);
	return Math.max(lmax,rmax)
}

```

**系统 栈**


保留函数参数，状态，中间结果。
子过程得出的结果返回栈顶。从栈里拿出函数重建。
![[Pasted image 20260418085243.png]]

任何递归都可以改为非递归，模拟系统压栈。系统栈比较小，内存空间比较大，灵活保存状态 。递归可以不改的情况：数据量再大递归也不一定深，[^1]归并排序，快速排序，线段树，很多的平衡树。
![[Pasted image 20260418090459.png]]
[^1]: 递归：左边，有序；递归：右边，有序；整合（非递归）：左，右
开的层数: logn, 左侧运行后释放空间再去右侧。


## master

估计复杂度
所有子问题规模相同的递归才能使用master公式。T(n)=a\*T(n/b)+O(n^c)

a:子过程调用了几次
子过程之外，其他行为的时间复杂度。  
上述的[[#^70dc6b|例子]]：T(N)=T(N/2)+T(N/2)+O(1)=2T(N/2)+O(1)


>[!note]
>1. log(b,a) < c, 复杂度为：O(n^c)
>2. log(b,a)>c,  复杂度为：O(n^log(b,a))
>3. log(b,a)=\=c,复杂度为：O(n^c\*logn)
>以b为底




















