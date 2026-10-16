---
created: 2026-10-16
tags:
  - cs/cpp
  - cs/stl
type:
---
moveable元素对于vector速度（非空间）效能的影响

会有扩充增长 2倍


## 写一个moveable class 

静态 数据 在 class外初始为0

特殊函数

指针 分配的动作 new


```cpp
class MySring{
public:
	static size_t DCtor;
	static size_t Ctor;
	static size_t CCtor;
	static size_t CAsgn;
	static size_t MCtor;
	static size_t MAsgn;
	static size_t Dtor;
private:
	char* _data;
	size_t _len;
	void _init_data(const char *s){
		_data= new char[_len+1];
		memcpy(_data,s,_len);
		_data[_len]='\0';
	}
public:
	//default ctor
	MyString() : _data(NULL),_len(0){++DCtor;}
	
	//ctor
	MyString(const char* p):_len(strlen(p)){
		++Ctor;
		_init_data(p);
	}
	
	//copy ctor
	MyString(const MyString& str): _len(str._len){
		++CCtor;
		_init_data(str._data);
	}
	
	//copy assignment 深拷贝
	MyString& operator=(const MyString& str){
		++CAsgn;
		if(this != &str){
			if(_data) delete _data;
			_len = str._len;
			_init_data(str._data);
		}
		else{
		}
		return *this;
	}
	
	//move ctor 只是拷贝指针 浅
	MyString(MyString&& str) noexcept
	  : _data(str._data),_len(str._len){
	    ++MCtor;
	    str._len=0;
	    str._data=NULL;
	  }
	
	//move assignment
	MyString& operator=(MyString&& str) noexcept{
		++MAsgn;
		if (this != &str){
			if (_data) delete _data;
			_len=str._len;
			_data=str._data;
			str._len=0;
			str._data=NULL;
		}
		return *this;
	}
	
	//dtor
	Virtual ~MyString(){
		++Dtor;
		if(_data){
			delete_data;
		}
	}

};

size_t MyStirng::DCtor=0;
...
```



copy和move的区别：
&& : reference of reference 


## 测试

```cpp
test_movable(vector<MyString>(),vector<MyStrNoMove>(),value);
```


```cpp
template<typename M,typename NM>
void test_movable(M c1,NM c2,long& value)
{
char buf[10];

//测试moveable
typedef typename iterator_traits<typename M::iterator>::value_type V1type;
clock_t timeStart=clock();
  for(long i=0;i<value;++i){
	snprintf(buf,10,"%d",rand());  //随机数 放进buf转换成字符串
	auto ite=c1.end();             //定位尾部
	c1.insert(ite,V1type(buf));    //安插于尾部
  }
cout<<"construcftion,mili-seconds:"<<(clock()-timeStart())<<endl;
cout<<"size()="c1.size()<<endl;
output_static_data(*(c1.begin()));

}

//容器的copy
M c11(c1);
M c12(std::move(c1));  //确保之后不再使用c1
  c11.swap(c12);

```


output_static_data
```cpp
#include<typeinfo>
template<typename T>
void output_static_data(const T& myStr)
{
	cout<<typeif(myStr).name()<<"--"<<endl;
	cout<<"CCtor="<<T::CCtor
		<<"MCtor="<<T::MCtor
		...
		<<endl;

}
```


容器的move只是交换了里面的三根指针。


