## 布尔表达式的短路求值
翻译方案
两个label true false

多加一些Label![[Pasted image 20251206182406.png]]

## easy模式冗余的地方
![[Pasted image 20251206182518.png]]

t1=true不需要，直接跳转到b.true4,if语句才知道s（a=b）的信息翻译布尔表达式 if语句 父节点知道这个信息。用继承属性，告诉子节点。
减少冗长的跳转路径。本身是不知道全局信息，
## 例子
![[Pasted image 20251206183228.png]]

另一个例子，想让第四行 false知道begin1,更深的层次，while 告诉if ,if 告诉大B 两个告诉位置不同，有3个位置。

## 困难模式
直接用布尔表达式改变控制流，无需计算最终逻辑值
从父节点获取更具体的跳转目标，缩短跳转路径

### 分工合作
父节点为子节点准备跳转指令的目标标签
子节点通过继承属性确定跳转目标

### 例子
问题是 S只生成自己内部的 它不知道它的next在哪里。S.next 但是它的父节点知道。![[Pasted image 20251206183954.png]]
l0的获取

## 产生式与语义规则
![[Pasted image 20251206184106.png]]
翻译方案里 有两个非终结符 B S
对于每一个大B 有**两个**继承属性 B.true ,B.false
大S**一个**继承属性 S.next 跳出S
综合属性 唯一一个 S.code


### 第一条 P->S
对于S.next
对于大P P.code
program->statement
![[Pasted image 20251206184647.png]]
```
S.next=newlabel()
P.code=S.code || label(S.next)
```
S.next为语句S指明了跳出S的目标
### 赋值语句
S-> assign

### if 语句
先看B
	要确定 B.true B.false所在的具体位置
	为什么B.true直接new一个？因为大S知道。
	第二行设置两个继承属性

#### 例子 两层嵌套
先翻译p->S 
再翻译大S
然后递归翻译B1 S1的code![[Pasted image 20251206190005.png]]
关键是false 的设置

#### 例子2 if else 两个嵌套
b的true 和false S都知道
关键是 s1和s2的next![[Pasted image 20251206190342.png]]
先翻译S的code
再翻译 P的code
B1.true和B1.false 是所知道的两个标签 放在对应位置
S.next由P（program）所设定，继承属性 goto S.next 实际是去L0标签
接着翻译 B1.code S1.code ...


### while语句
首先 整个代码的结构
放一个begin label 
安排B.code
新建还是从父节点继承
B为真 S知道跳转到哪里
B.false跳出循环
#### 例子
![[Pasted image 20251206191858.png]]
怎么知道跳转开头的 if结束

### 顺序语句
S-> S1 S2
为什么要有S1.next标签？可能S1复杂，里面有跳出的语句标签S知道的 New一个就好


### 布尔表达式
![[Pasted image 20251206192212.png]]

#### 简单的
true和false
这种翻译方案 直接对应一个无条件跳转指令。 父节点继承这两个标签。
#### 取反
反了跳转的标签。B1为真跳转的标签是B为假跳转标签 改变跳转目标。
#### 短路求值
考虑两个大B的true和false标签，4个继承属性

#### 完整的例子
![[Pasted image 20251206192914.png]]
![[Pasted image 20251206193003.png]]
进入 算继承属性
退出 算综合属性


## 缺陷
 goto 标签
代码真正执行 goto 到内存中的地址
goto l0 但是 l0 还没有生成 在下面