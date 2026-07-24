---
created: 2026-04-21
tags:
  - cpp
  - stl
---
动态增长的数组。

内存无法原地扩充。内存中找另一个空间两倍大 搬过去。![[Pasted image 20260421170222.png]]

gnuc 2.9
三个指针 控制整个容器。大小 12![[Pasted image 20260421170328.png]]

函数：
begin(),end(),前闭后开
size() 两次函数调用
empty() 两个指针是否相等
\[]连续空间都会提供，

## 空间分配

两倍增长，发生在放元素进去的时候![[Pasted image 20260421170724.png]]

insert_aux还会被其他函数调用，故 也有if  做检查 else。

已无备用空间，计算新的大小。
记录原来的大小。创建一开始为0,放1个进去。![[Pasted image 20260421170951.png]]

分配空间之后，
拷贝原内容。
新的元素添加。
安插点之后内容同样拷贝，为insert函数准备；

## 迭代器

连续空间，不必为class.
一个指针 `T*`![[Pasted image 20260421171501.png]]

## 新版本 4.9
![[Pasted image 20260421171638.png]]

大小 12

public 代表 is a ,vector只是用到了分配器的功能 应该为private继承。

iterator变化
![[Pasted image 20260421172357.png]]
