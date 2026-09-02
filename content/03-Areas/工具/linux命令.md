---
created: 2026-01-06
type: cheat-sheet
tool: shell
---


`man -k pthread`
- 阅读器 less

## 第六章 使用命令


>[!info] 命令
>- type 说明怎样解释一个命令名
>- which 显示会执行哪个可执行程序
>- man 显示命令手册页
>- apropos 显示一系列适合的命令
>- info
>- whatis 显示一个命令的简洁描述
>- alias 创建命令别名


## 第七章 重定向
- 删除一个文件内容 或者 创建一个新的空文件
```sh 
 > ls-output.txt
```
- 使用>重定向符来重定向输出结果，目标文件总是从开头被重写。那么，怎样把重定向结果追加到文件尾而不是从开头重写？使用`>>`符号 
- 重定向标准输出和错误到同一个文件：`ls -l /bin/usr > ls-output.txt 2>&1` 两个重定向； 另一种简洁的方法 `ls -l /bin/usr &> ls-output.txt`
- 