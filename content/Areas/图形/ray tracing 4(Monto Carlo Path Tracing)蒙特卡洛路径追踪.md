---
created: '2026-01-06'
---

>  games101lecture16：正确地实现光线传播的方式，解出所谓的渲染方程

## 复习

- 渲染方程：描述光线的传播方式；
- 概率：连续型随机变量，概率密度函数；
## 蒙特卡洛积分
### why
- 为了解决定积分，复杂函数，无法求出原函数的定积分；数值的方法
### What&&How
- 黎曼积分，小长方形面积之和
- 蒙特卡洛：随机采样的方法.所有长方形求平均；
	- 采样点的值加上它的概率密度
$$\int_{}^{}f(x)dx=\frac{1}{N}\sum\frac{f(X_i)}{p(X_i)} \quad X_i \sim  p(x)$$

## 路径追踪 Path Tracing

### whitted-style ray tracing

- 不断弹射光线
- 当光打到光滑物体specular（玻璃），镜面反射；漫反射的物体，光线停止diffuse
- 不一定对
### whitted style ray tracing:problem 1
犹他茶壶模型。对于glossy的材质；
### problem 2

- diffuse materials
- 反射红墙的光，color bleeding;流到外面，全局光照的效果，天花板
- cornell box模型
###  ws ray tracing 是错误的，但是渲染方程正确
- q1:积分的结构，来自四面八方的光照，半球的积分
- q2:递归的问题：其他物体反射的光照或直接光照


- 积分的解决：蒙特卡罗；变成求平均式，直接光照
	- problem1: explosion of rays光线数量爆炸；指数。$rays=n^{bounces}$
	- 当n=1时才不会爆炸
	- 故随机选一个方向
	- 一个像素有多条路径
	- ray generation 与着色联系起来？
- 递归的问题：
	- 何时停止；设置弹射次数？
	- 方法：russian roulette 俄罗斯轮盘赌；
	- 左轮手枪，6发子弹；生存概率；
	- 用该方法来用一定的概率停止追踪
- 正确但是不高效sample per pixel
- 浪费光线
- 对光源进行采样（不浪费）