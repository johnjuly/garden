---
created: 2026-10-15
tags:
  - cs/stl
  - cs/cpp
type:
---
## 用法

默认情况下假设所有东西都重要（拷贝构造 拷贝赋值 ，容器 搬元素）

泛化

```cpp
template <class type>
struct __type_traits{
  typedef __true_type           this_dummy_member_must_be_first;
  typedef __false_type          has_trivial_default_constructor;
  typedef __false_type          has_trivial_copy_constructor;
                                            assginment_operator;
                                            destructor;
                                is_POD_type;   //Plain Old Data

};
```


泛化 对于整形

都为true 都不重要

问：`__type_traits<Foo>::has_trivial_destructor


测试

[cplusplus.com]()
```cpp
template<typename T>
void type_traits_output(const T&x)
{
  cout<<"\ntype traits for type: " <<typeid(T).name()<<endl;
  
  cout<<"is_void\t"<<is_void<T>::value<<endl;
  cout...
  
}
```




## 实现

### is_void

- 想知道 类型的一些特性 都是用模板对类型做操作。
- remove \_cv\_ 拿掉const volatile

```cpp
template<typename _Tp>
  struct is_void
  : public __is_void_helper<typename remove_cv<_Tp>::type>::type
  {};
```


#### remove_cv_

泛化与特化remove_const
```cpp
template<typename _Tp>
  struct remove_const
  {typedef _Tp    type;}
```

偏特化，范围缩小。
传的是const, 回答的时候把const拿掉
```cpp
template<typename _Tp>
  struct remove_const<_Tp const>
  {typedef _Tp    type;}
```


volatile同理


整合 

```cpp
template<typename _Tp>
  struct remove_cv
  {
	typedef typename
	remove_const<typename remove_volatile<_Tp>::type>::type type;
  };
```


#### helper

泛化 版本 回答假；传void回答真

```cpp
template<typename>
  struct __is_void_helper
  : public false_type {};
  
template<>
  struct __is_void_helper<void>
  : public true_type {};
```



### is_integral

```cpp
template<typename _Tp>
  struct _is_integral
  : public is_integral_helper<typename remove_cv<_Tp>::type>::type
  {};
```


泛化与特化

```cpp
template<typename>
  struct _is_integral_helper
  : public false_type { };
  
template<>
  struct _is_integral_helper<bool>
  : public true_type { };
  
  
  ...
  
  
```


