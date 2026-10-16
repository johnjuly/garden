---
created: 2026-10-15
tags:
  - cs/stl
  - cs/cpp
type:
---

测试类型的大小
```cpp
cout<<"string,sizeof="<<sizeof(string)<<endl;     //pointer, 4(32b)
```



## tuple制造以及用法

tuplez大小 不是类型总和
```cpp
tuple<string,int,int,complex<double>> t;
cout<<"sizeof="<<sizeof(t)<<endl;          //32(not 28)
```


```cpp
tuple<int,float,string> t1(41,6.3,"nico");
cout <<sizeof(t1)<<endl;     //12


//iterate

cout<<"t1:"<<get<0>(t1)<<''<<get<1>(t1)<<''<<get<2>(t1)<<endl;
```



使用make_tuple()  `auto t2=make_tuple(22,44,"stacy")`



比较和赋值

<<重载


`tie(i1,f1,s1)=t3` assign values of t to i f s


```cpp
typedef tuple<int,float,string> TupleType;
cout<<tuple_size<TupleType>::value<<endl; //3
tuple_element<1,TupleType>::type f1;
typedef tuple_element<1,TupleType>::type t
```



## 原理

放头部和尾部

两个函数 head和tail

```cpp
template<typename Head,typename... Tail>
class tuple<Head,Tail...>
:private tuple<Tail...>
{
	typedef tuple<Tail...>inherited;
public:
  tuple(){}
  tuple(Head v,Tail... vtail)
    :m_head(v),inheritrd(vtail...){}
    
  typename Head::type head(){return m_head;}
  inherited& tail(){return *this;}
protected:
  Head m_head;
};
```


variadic templates自动递归 自动继承尾部部分。头的部分声明一个变量。
![[Pasted image 20261015102232.png]]
写一个0 的偏特化，终止条件

```cpp
template<typename... Values> class tuple;
template<>class tuple<>{};
```