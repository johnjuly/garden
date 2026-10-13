---
created: 2026-10-06
tags:
  - cs/cpp
  - cs/stl
---


把已经存在的东西改一下。

存在多种adapters

- functor adapters
- iterator adapters
- container adapters

关键思路：使用者->**A**(桥梁)->B

A可以取用B的方法。

做法：A继承B；A**内含**B（常用做法）
与算法作用
![[Pasted image 20261007090811.png]]
## 容器适配器 stack queue

```cpp
template<clss T,class Sequence=deque<T>>
class stack{

protected:
	Sequence c; //内含 改造 底层容器
public:
	void push(const value_type& x){c.push_back(x);}
};
```

## 函数适配器：binder2nd

`cout<<count_if(vi.begin(),vi.end(),not1(bind2nd(less<int>(),40)));`

```cpp
template<class InputIterator,class Predicate>
typename iterator_traits<InputIterator>::difference_type
count_if(InputIterator first,InputIterator last,Predicate pred){
	typename iterator_traits<InputIterator>::difference_type n=0; //定义一个初值为0的计数器
	for(;first!=last;++first)
		if(pred(*first))    //遍历元素，看是否满足条件
			++n;
		return n;
}
```

(对象，40)

修饰函数，重载()

```cpp
template<class Operation>
class binder2nd
 :public unary_function<typename Operation::first_argument,typename Operation::result_type>{
protected:
	Operation op;
	typename Operation::second_argument_type value;
public:
	//constructor
	binder2nd(const Operation& x,const typename Operation::second_argument_type& y):op(x),value(y){}
	
	typename Operation::result_type 
	operator()(const typename Operation::first_argument_type& x)const{
	return op(x,value);  //这时绑定第二参数
	}
};
```


辅助函数binder 编译器自动推导op的类型。函数模板参数,看用户传进来什么

```cpp
template<class Operation,class T>
inline binder2nd<Operation> bind2nd(const Operation& op,const T& x){
	typedef typename Operation::second_argument_type arg2_type;
	return binder2nd<Operation>(op,arg2_type(x));
}
```

对于less 比大小（二元函数）[[21 仿函数和函数对象#可继承可适配条件|adaptable 条件]]
- 第一实参类型？
- 第二实参类型？
- 比完之后的类型？
typename 行 看类型是否相等，加typename是因为编译器可能此时并不知道是不是一个类型


binder2nd被替换掉，[[#新型适配器bind|新型适配器bind]]

## 函数适配器:not1

乐高堆积，继续修饰。不小于40.
`cout<<count_if(vi.begin(),vi.end(),not1(bind2nd(less<int>(),40)));`

创建一个对象
```cpp
template<class Predicate>
inline unary_negate<Predicate> not1(const Predicate& pred){          //实参推导
	return unary_negate<Predicate>(pred);  //创建一个对象
}
```

相关类
```cpp
template<class Predicate>
class unary_negate
 :public unary_function<typename Predicate::argument_type,bool>{
protected:
  Predicate pred;
public:
  //constructor
  explicit unary_negate(const Predicate& x):pred(x){}
  bool operator()(const typename Predicate::argument_type& x){
  return !pred(x);
  }
 };
```

count_if 三个参数


```cpp
template<class InputIterator,class Predicate>
typename iterator_traits<InputIterator>::difference_type
count_if(InputIterator first,InputIterator last,Predicate pred)
{

}
```



## 新型适配器bind

> [cplusplus.com ]()  functional





std::bind可以绑定
1. 函数
2. 函数对象（functor）
3. 成员函数
4. 数据成员

```cpp
//test 1or2 (also works with function obj: std::divides<double> my_divide;)
double my_divde(double x,double y)
	{return x/y;}
	

//test 3 4
struct MyPair{
	double a,b;
	double multiply(){return a*b;}
}
```


placeholder \_1 \_2

 占位符号
`using namespace std::placeholders;`


### 绑定函数

1个placeholder
```cpp
auto fn_half=bind(my_divide,_1,2);
cout<<fn_half(10)<<'\n';
```
2个placeholder
```cpp
auto fn_invert=bind(my_divide,_2,_1);
cout<<fn_invert(10,2)<<'\n';   //0.2
```

指定返回类型
```cpp
auto fn_rounding=bind<int>(my_divide,_1,_2); //int 为return type
cout<<fn_rounding(10,3)<< '\n';  //3
```


### 绑定成员


member function 有个看不见的实参 **argument:this**


创建对象
```cpp
MyPair ten_two{10,2}
```


```cpp
auto bound_memfn=bind(&MyPair::multiply,_1);  //留着
cout<<bound_memfn(ten_two)<<'\n';        // 传进去this 20
```

```cpp
auto bound_memdata=bind(&MyPair::a,ten_two);  //绑定
cout<<bound_memdata()<<'\n';        // 10
```

```cpp
auto bound_memdata2=bind(&MyPair::b,_1);  //留着
cout<<bound_memdata2(ten_two)<<'\n';        // 2
```


---

### bind2nd && bind


```cpp
vector<int> v{15,37,94,50,73,58,28,98};
int n=count_if(v.cbegin(),v.cend(),not1(bind2nd(less<int>(),50)));
cout<<"n= "<<n<<end;

auto fn_=bind(less<int>(),_1,50);
cout<<count_if(v.cbegin(),v.cend(),fn_)<<endl;
```


## 迭代器适配器 reverse_iterator

排序 默认由小到大；

如果需要由大到小
```cpp
reverse_iterator rbegin(){
	return reverse_iterator(end());  //逆向的头 正向的尾
} 


reverse_iterator rend(){
	return reverse_iterator(begin());  //逆向的尾 正向的头
}

```


修饰iterator 内部应有一个iterator

指向迭代器的5种associated types都和其对应的正向迭代器相同
关键在取值的动作。对逆向取值 就是对正向退一格取值。



## 迭代适配器 inserter



需要手动指定空间。copy里是赋值。
```cpp
int myints[]={x};
vector<int> myvect(7);

copy(myints,myints+7,myvec.begin());
```



插入 会自己准备空间
```cpp
list<int>foo,bar;
for(int i=1;i<=5;i++)
{
	foo.push_back(i);
	bar.push_back(i*10);
}

list<int>::iterator it=foo.begin();
advance(it,3);
copy(bar.begin(),bar.end(),inserter(foo,it));
```


难点：把copy中的assgin行为改为insert 

copy
```cpp
template<class InputIterator,class OutputIterator>
OutputIterator 
copy(InputIterator first,InputIterator last,OutputIterator result)
{
	while(first!=last){
	  *result=*first;
	  ++result;++first;
	}
	return result;
} 
```
 

辅助函数：传入容器和迭代器


```cpp
template<class Container,class Iterator>
inline insert_iterator<Container>
insert(Container& x,Iterator i){
	typedef typename Container::iterator iter;
	return insert_iterator<Container>();
} 
```


操作符重载(=)
```cpp
template<class Container>
class insert_iterator{
protected:          //保存记录的两个数据
	Container* container;
	typename Container::iterator iter;
public:
	typedef output_iterator_tag iterator_category;
	
	insert_iterator(Container& x,typename Container::iterator i):container(&x),iter(i){}
	insert_iterator<Container>&*operator=(const typename Container::value_type& value){
		iter=container->insert(iter,value);   //key:调用insert()
		++iter;
		return *this;
	}
};
```




## 未归类适配器 ostream_iterator

迭代器关链到一个设备
 ```cpp
 #include <iostream>  //std::cout
 #include <iterator>
 #include <vector>
 #include <algorithm> //copy
 
 int main(){
	 std:vector<int> myvector;
	 for(int i=i;i<10;++i)myvector.push_back(i*10);
	 
	 std::ostream_iterator<int> out_it(std::cout,".");  //绑定cout,字符串作分隔符号
	 std::copy(myvector.begin(),myvector.end(),out_it);
	 return 0;
 
 }
 ```



四个与result有关动作重载
= \* ++  返回时的拷贝构造


## 未归类适配器 istream_iterator

当创建一个对象(iit)， 构造函数 ++,重载， cin>>

读值 传入v中;
```cpp
int main()
{
	double v1,v2;
	std::cout<<"Plese insert two vs:";
	std::istream_iterator<double> eos; //end of stream
	std::istream_iterator<double> iit(std::cin);
	if(iit!=eos) v1=*iit;     //return v1
	
	++iit;
	if(iit!=eos) v2=*iit;
}
```


```cpp
istream_iterator(istream_type& s):in_stream(&s){++*this;}
istream_iterator<T,char T,traits,Distance>& operator++(){
	if(in_stream&&!(*in_stream>>value)) in_stream=0;
	return *this
}

const T& operator*()const {return value;}
```