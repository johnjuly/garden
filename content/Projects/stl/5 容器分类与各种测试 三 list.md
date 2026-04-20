---
created: 2026-04-17
tags:
  - cpp
---
标准库 全局sort,容器 自己也有sort

## 双向链表


```cpp
list<string> c; //第二参数 默认分配器

clock_t timeStart = clock();

for(long i=0;i<value;i++){

	try{
		snprintf(buf,10,"%d",read());
		c.push_back(string(buf));
	
	}catch(exception&p){
	
		cout<<"i="<<i<<" "<<p.what()<<endl;
		abort();
	}

}

list.size()
list.max_size();
list.front();
list.back()


string target=get_a_target_string();
timeStart=clock();
auto pItem= ::find(c.begin(),c.end(),target);
cout<<"::find(),mili-seconds: "<<(clock()-timeStart)<<endl;

if(pItem!=end())
	cout<<"found, "<<*pItem<<endl;
else
	cout<<"not found!"<<endl;
	
timeStart=clock();
c.sort();


```



## 单向链表

forward_list


加入：
`push_front()`

相关函数：
`forward_list.max_size()`
`forward_list.front()`
无 back size函数


`#include <ext/slist>`
slist gnuc 非标准
 

## 双端队列

结构
![[Pasted image 20260417161830.png]]

分段连续
段与段之间 操作符重载 ++,iterator从99到0

扩容，分配另一个buffer 前或后 .

无容器的sort,用全局。



stack 和 queue 都使用deque实现。 
![[Pasted image 20260417162844.png]]
![[Pasted image 20260417162918.png]]
称为adapters![[Pasted image 20260417163114.png]]

stack queue
不提供 iterator. 使得不破坏容器的性质