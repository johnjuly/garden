- 要做的事情：写一个小的程序使用c++语言，抓取因特网上的一个网页，实现网络的一个重要抽象：在写者和读者之间的可靠字节流。
- 概览整个实验 ， 路由器，一个network interface,tcp协议（将不可靠的数据报转换为可靠的字节流）
---

## 手工网络连接
### 1 fetch a web page

[^2]`telnet cs144.keithw.org http`
程序在你的电脑和另一台电脑（该网址）之间打开一个可靠的字节流。and with a particular service  [^1]http #缩写 running on that computer.
![[Pasted image 20251121211904.png]]

### 2 send yourself an email


### 3 监听与连接（服务器的角色）


## 写一个网络程序 using an os stream socket

- stream socket,the ability to create a reliable bidirectional byte stream between two programs,一个在你的电脑上运行，一个在遥远的另一一台电脑上运行 因特网连接。（例子：web服务器apache 或者 nginx，或者 netcat 程序）

[^3]netcat

[^1]: hytper-text transfer protocol

[^2]: Telecommunication Network）是一种非常早期的网络协议和工具，用来通过 **TCP 连接到远程主机并进行文本交互**。彩蛋：`telnet towel.blinkenlights.nl`ascll 星球大战!

[^3]: 网络上的cat(unix,cat的精神：原样收，原样发、不加工、不解释)，从网络连接读数据再输出。
