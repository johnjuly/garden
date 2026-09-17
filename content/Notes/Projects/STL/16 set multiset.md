---
created: 2026-05-02
tags:
  - cs/cpp
  - cs/stl
---
set/multiset以rb_tree为底层结构，因此有元素自动排序的特性。排序的依据是key.而set/multiset元素的value和key合一，value就是key.


![[Pasted image 20260502104800.png]]

内含红黑树
第二和第三参数有默认值，
拿的是const iterator,不允许改内容。

set自己不做事情，转调用给底层的t.类似 [[14 deque queue和stack|stack queue]]
当作是container adapter.