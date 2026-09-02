---
created: 2026-05-03
tags:
  - cs/cpp
  - cs/stl
---
- multimap/map以rb_tree为底层结构，因此有元素自动排序特性，排序依据是key.
- multimap/map提供遍历操作及iterators.按正常规则++ite遍历，便能获得排序状态。
- 我们无法使用map/multimap的iterators改变元素的key(key有其严谨排序规则)，但可以用它来改变元素的data.因此map/multimap内部自动将user指定的keytype时为const,禁止user对元素的key赋值。
- map元素的key必须独一无二，因此insert()用的是insert_unique()
- multimap元素的key可以重复，因此insert()用的是rb_tree的insert_equal()


---

默认参数![[Pasted image 20260503210848.png]]

- select1st (gnc)从一堆东西里面取出第一个。
元素的合成 key摆在前面，故取出的是key
- 把 key 和value包成了一个pair 换一个名字 value_type 红黑树第二个模板参数。自动将key设为const.

![[Pasted image 20260503212345.png]]
- map独特的operator\[].功能：传回key所对应的data.如果key不存在，创建一个元素带着key放入map中。
- lowerbound 二分查找的一种，排序的区间中若有，iterator指向第一个元素；若没有，传回最适合安装的那个点。