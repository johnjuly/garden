---
created: 2026-04-22
tags:
  - cpp
  - stl
---
## deque

分段事实  连续假象![[Pasted image 20260422220848.png]]
五段。
扩充：新分配一个缓冲区，map容器中添加一个指针指向它。

蓝色的部分是iterator,class ，四个元素。
- first和last指向一个buffer的首尾 标兵。当迭代器走到边界（头或者是尾）
- 借由node指向控制中心map,跳到下一个缓冲区。
- cur 当前指向的元素

所有的容器提供两个函数 begin() end() 分别指向first 和finish迭代器。

---
![[Pasted image 20260422222003.png]]

迭代器：

制造连续假象，可以跳。random_access类型
![[Pasted image 20260422222418.png]]

insert

在position处安插一个元素，看移动哪端的数据 短的一端 ![[Pasted image 20260422222800.png]]

空出一格，安插新值
![[Pasted image 20260422222849.png]]

## deque 如何模拟连续空间

> 全部都是迭代器的功劳 `deque_iterators`

front() ; back() ;两个指针：Start finish;finish指的是最后一个元素的下一个位置，先倒退一个![[Pasted image 20260425163740.png]]

### -的重载
size 减的动作 迭代器做了操作符重载。
距离多少元素，node相减->完整的缓冲区；两个node在控制中心间的距离；+两个所指的缓冲区的元素![[Pasted image 20260425164300.png]]


### ++的重载

- 用后++/--调用前++/--
- 迭代器加加 移到下一个元素；若移动到下一个缓冲区，边界重设，first和last![[Pasted image 20260425164704.png]]
- --:判断是在该缓冲区的起点，退回控制中心，找前一个缓冲区

---

前面移动1个位置

### 移动n个位置 +=

>[!note]
![[Pasted image 20260425165222.png]]![[Pasted image 20260425165738.png]]![[Pasted image 20260425165339.png]]

加完或减完是不是仍然落入该区域 有无跨越边界；若要跨越，算跨越多少缓冲区 退回控制中心，到达正确缓冲区。再决定剩下多少要走。

---

新版本：复杂的class ，父类一个数据 继承自allocator;四个类
![[Pasted image 20260425165916.png]]

大小：两个指针加两个迭代器
![[Pasted image 20260426104358.png]]



---
内含deque,封掉一些功能，形成stack和queue.
 ![[Pasted image 20260426104605.png]]
## queue

![[Pasted image 20260426104657.png]]
sequence  即 deque
八个操作，调用c去做，即deque去做。


## stack

![[Pasted image 20260426104848.png]]

两者 都是adapter.

- 可以选择list或deque做底层结构。stack可选择vector作为底层结构，queue不可。
- 都不可选择set或map作为底层结构。
- 两者都不允许遍历，也**不提供iterator**. 特殊的行为，不能允许任意的插入一个元素。


















