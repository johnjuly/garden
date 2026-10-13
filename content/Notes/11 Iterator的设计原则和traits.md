---
created: 2026-04-21
tags:
  - cs/cpp
  - cs/stl
---
traits.

萃取iterator的特性。
萃取机。


---

## 设计原则

迭代器，容器和算法桥梁。容器的范围，两个iterator指出来；

![[Pasted image 20260421163829.png]]
rotate算法要求知道迭代器的三个属性：
**iterator_category**:移动性质，++,--,步长
**value_type**:迭代器所指的元素的类型
**difference_type**:两个迭代器之间的距离用什么类型来表现
另外未使用的两种：**referenc**e和**pointer**。

iterator必须提供上述五种associated types

算法直接提问，迭代器回答。![[Pasted image 20260421164444.png]]


指针，一种退化的迭代器。
## traits

iterator taits用以分离class iterators和non-class iterators

中间层。 #silver_bullet
机器能够区分![[Pasted image 20260421165606.png]]
某一个算法想要知道iterator的value type:
间接询问 放到traits ,traits问Iterator![[Pasted image 20260421165336.png]]
偏特化语法分离：
指针跑到第二和第三版本；指针以外 第一个版本。
指针：T就是value type;tratis 替指针回答


完整的iterator_traits
![[Pasted image 20260421165730.png]]


