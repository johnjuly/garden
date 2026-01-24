 - 想把一个形式的数据切换成另一个形式 one format to another format
 - 形式：pipe 
 - fancy and useful way
 - `journalctl`日志信息
 - 好用的grep: `journalctl|grep ssh`
 - 远程操作：`ssh tsp 'journalctl |grep ssh|grep "Disconnected from"|less'`
 - tsp 远程电脑名字
 - less is a pager, when using man
---

 - sed 是什么 流编辑器 lets you make changes to the contents to the stream,就像做替换
 >  `cat ssh.log|sed 's/.*Disconnected from //'|less`
 
 - s 代表substitude
 - `.`one character of any kind
 - `*`任意多个这样的字符了 大于等于0
 - 匹配 zero or more of any character followed by the literal string disconnected from 
 > `echo 'aba'|sed 's/[ab]//`
 
 - 通常只匹配一次，若全部匹配 后面加上g

> `echo 'abcaba'|sed -E 's/(ab)*//g'`

- 使用E，代表扩展，更现代；否则的话很多符号都要加反斜杠
- `head -n5` 只看前五行
- 工具 https://regex101.com/ explaination 也可以用来Debug
- capture group?()
- 贪心匹配 match as long as possible.解决方法：放`?`在`.*`后.

---
`wc -l`
sed 用来search 和 replace 
sort
uniq -c 
> `cat ssh.log| sed -E 's/^.*Disconnected from(invalid  |anthenticating )?user  (.*)  [0-9.]+ port [0-9]+ (  \[preauth\])?$/\2/' | sort|uniq -c | sort -nk1,1|tail -n10`


- -n :numeric sort
- -k ：key 排序所用

---
- awk **column** based  stream processor.edit text 
- `awk `(print $2)  :打印第二行
- `paste -sd,` 将很多行 paset them together into a single line(-s), with a delimeter ,(-d,) 
- awk 更加强大   great for operating columns.比如 想要第一行是1 然后用户名 c开头，e结尾
，然后打印整行
> `awk '$1 == 1 && $2 ~ /^c.*e$/ print $0'`


---

bc caculator
`echo "1+2"| bc -l`
extract the data , `awk '$1 != 1 { print $1}' | paste -sd+ | bc -l ` 

其他的编程语言 ，R ，gnuplot...


- xargs 把line变成参数
- extract data from data source  find something intersting.