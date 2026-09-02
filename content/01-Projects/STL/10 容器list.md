---
created: 2026-04-21
tags:
  - cs/cpp
  - cs/stl
---
最具代表性。
使用的分配器 alloc
![[Pasted image 20260421155313.png]]

一个list中的data只有node.  它的type link_type ->是一个指针 list_node* 大小 4(32bit)

_list_node
![[Pasted image 20260421155601.png]]


两个指针 指向void . 不太理想。需要转析。|指针应指向自己的设计。
要传三个参数，不太理想。

- 前闭后开，begin()总是第一个，end()总是最后一个元素的下一个 灰色节点 空虚的单位

## list's iterator

泡泡：iterator. 模拟指针的动作。指针++ ,指向下一个node.
iterator,一个 smart pointer,a class.除了vector 和array之外，所有的容器的iterator必须是一个class.

- 实现指针的动作。操作符重载。![[Pasted image 20260421160356.png]]
- 五个type def.[[11 Iterator的设计原则和traits|traits]]
![[Pasted image 20260421160444.png]]

### 关于++

为了区分，前++没有参数，后加加有一个参数(形式，无意义)
postfix
prefix
![[Pasted image 20260421160733.png]]

后++,
1. 先看被重载的assign 拷贝构造，等号右手边 拷贝构造的参数。不会调用operator  \*; 
2. 调用前++;
3. 返回原来的东西。

![[Pasted image 20260421161520.png]]
关于两个加的返回值 一个返回引用：
操作符向整数看齐
整数不允许后加加两次，
模拟前加加可以做两次的动作，返回 的是reference


### 提取值

\*;![[Pasted image 20260421161837.png]]


## from 2.9 to 4.9

![[Pasted image 20260421162347.png]]

list 有一个父类。list_impl继承了分配器。![[Pasted image 20260421162557.png]]![[Pasted image 20260421162623.png]]


看list的大小->父类 list_base的data大小->两个pointer