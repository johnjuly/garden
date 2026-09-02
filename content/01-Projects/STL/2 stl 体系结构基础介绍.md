---
created: 2026-03-31
tags:
  - cs/cpp
---
## stl 六大部件 components:

程序=数据结构(容器)+算法
![[Pasted image 20260331104044.png]]
- **容器** containers  解决了内存的问题。allocator 支持。对容器的某些操作 ，独立出来，放进算法。 与oo不同的是 数据在容器，操作这些数据 在算法里。数据与操作之间的桥梁->迭代器
- 分配器 allocators
- **算法** algorithms
- 迭代器 iterators  泛化的指针。
- 适配器 adapters。 转换 。对容器 仿函数 迭代器 做转换
- 仿函数 functors


```cpp
#include <vector>
#include <algorithm>
#include <functional>
#include<iostream>

using namespace std;
int main()
{
	int ia[6]={27,210,12,47,109,83};
	vector<int,allocator<int>> vi(ia,ia+6);
	cout<< count_if(vi.begin(),vi.end(),not1(bind2nd(less<int>(),40)));
	return 0;
}

```


前闭后开\[ \)   begin end->最后一个元素的下一个


ranged-based for statement
```cpp
for(decl:coll){
	statement
}
```
auto 关键字 