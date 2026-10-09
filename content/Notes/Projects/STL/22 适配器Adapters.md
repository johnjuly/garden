
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


新型适配器 bind