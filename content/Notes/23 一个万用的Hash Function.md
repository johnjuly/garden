---
created: 2026-10-11
tags:
  - cs/stl
  - cs/cpp
type:
---
一个万用的Hash Function

世界由分子 原子构成。

计算机 编程 数据由原始的整数 浮点数 字符串组成。基本的 也有 hash function.


成员函数， 


```cpp
#include <functional>
class Customer{
...
};

class CustomerHash
{
public:
  std::size_t operator()(const Customer &c) const{
    return...
  }
};

unordered_set<Customer,CustomerHash> custset;

```



一般函数/

元素类型，函数类型，指定 函数地址
```cpp
size_t customer_hash_func(const Customer& c){
  return ...
};

unordered_set<Customer,size_t(*)(const Customer&)>custset(20,customer_hash_func);
```


以struct hash偏特化形式 实现Hash function


如何设计return?

每个基本类型的hashfunc相加？


```cpp
return std::hash<std::string>()(c.fname)+
       std::hash<std::string>()(c.lname)+
       std::hash<long>(c.no);
```

firstname lastname number

这样写会造成后面碰撞比较多.重复率



调用函数

`return hash_val(c.fname,c.lname,c.no);`



同名的三个函数

1 接收任意个数的模板参数

任意类型 任意个数

variadic templates:n个 分为 1和n-1

 ```cpp
 template<typename... Types>       //variadic templates
 inline size_t hash_val(const Types&... args){
   size_t seed=0;
   hash_val(seed,args...);
   return seed; 
 }
 
 ```


2  第一个参数有类型 size_t

```cpp
template<typename T,typename... Types>
inline void hash_val(size_t& seed,const T& val,const Types&... args){
  hash_combine(seed,val);
  hash_val(seed,args...);
}
```
逐一取val 改变seed


3 

```cpp
template<typename T>
inline void hash_val(size_t& seed,const T& val){
	hash_combine(seed,val);
}
```



```cpp
#include<functional>
template<typename T>
inline void hash_combine(size_t& seed,const T&val){
	seed^=std::hash<T>()(val)+0x9e3779b9+(seed<<6)+(seed>>2);
}
```

魔数：黄金比例的小数部分 


set.bucket_count() 看篮子个数