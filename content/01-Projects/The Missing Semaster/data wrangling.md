---
created: 2026-01-23
type: course-note
---

## 课堂

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

  > `cat ssh.log|sed 's/.*Disconnected from //'|less`

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

- awk **column** based stream processor.edit text
- `awk `(print $2) :打印第二行
- `paste -sd,` 将很多行 paset them together into a single line(-s), with a delimeter ,(-d,)
- awk 更加强大 great for operating columns.比如 想要第一行是1 然后用户名 c开头，e结尾
  ，然后打印整行
  > `awk '$1 == 1 && $2 ~ /^c.*e$/ print $0'`

---

bc caculator
`echo "1+2"| bc -l`
extract the data , `awk '$1 != 1 { print $1}' | paste -sd+ | bc -l `

其他的编程语言 ，R ，gnuplot...

- xargs 把line变成参数
- extract data from data source find something intersting.

## 练习

1. ![[Pasted image 20260125145842.png]]
2. 统计 words 文件 (`/usr/share/dict/words`) 中包含至少三个 `a` 且不以 `'s` 结尾的单词个数。这些单词中，出现频率前三的末尾两个字母是什么？ `sed` 的 `y` 命令，或者 `tr` 程序也许可以帮你解决大小写的问题。共存在多少种词尾两字母组合？还有一个很 有挑战性的问题：哪个组合从未出现过？
   ![[Pasted image 20260125152509.png]]
   ![[Pasted image 20260125160044.png]]
   ![[Pasted image 20260125160230.png]]
   ![[Pasted image 20260125162253.png]]
   - comm -1/2/3：不显示第一/二/三类；
3. 进行原地替换听上去很有诱惑力，例如： `sed s/REGEX/SUBSTITUTION/ input.txt > input.txt`。但是这并不是一个明智的做法，为什么呢？还是说只有 `sed` 是这样的? 查看 `man sed` 来完成这个问题
   \>是先清空再写入，也就是说不能用重定向实现原地替换，重定向发生在命令执行之前
   `sed -i[suffix]` edit file **i**nplace,如果提供后缀那么就是备份
   `sed s/regexp/replacement/`

4. 找出您最近十次开机的开机时间平均数、中位数和最长时间。在 Linux 上需要用到 `journalctl` ，找到每次起到开始和结束时的时间戳。在 Linux 上类似这样操作：

```
Logs begin at ...
```

和

```
systemd[577]: Startup finished in ...
```

`sudo systemd-analyze plot > systemed.svg`

![[systemd.svg]]

```sh
for i in {0,,9}; do
journalctl -b -$i |grep "Startup finished" | sed -n 's/.*= \([0-9.]+\)s/\1/p'
done > boot_times.txt

echo "最长启动时间："
sort -n boot_times.txt | tail -1

echo "平均启动时间："
awk '{sum += $1} END {print sum / NR}' boot_times.txt

echo "中位数启动时间："
sort -n boot_times.txt | awk '{a[NR]=$1} END {print (a[5]+a[6])/2}'
```

5. 查看之前三次重启启动信息中不同的部分(参见 `journalctl` 的 `-b` 选项)。将这一任务分为几个步骤，首先获取之前三次启动的启动日志，也许获取启动日志的命令就有合适的选项可以帮助您提取前三次启动的日志，亦或者您可以使用 `sed '0,/STRING/d'` 来删除 `STRING` 匹配到的字符串前面的全部内容。然后，过滤掉每次都不相同的部分，例如时间戳。下一步，重复记录输入行并对其计数(可以使用 `uniq` )。最后，删除所有出现过 3 次的内容（因为这些内容是三次启动日志中的重复部分）。
   ![[Pasted image 20260125195517.png]]

```bash
journalctl -b -3 |sed 's/^[A-Z][a-z]\+ [ 0-9]\+ [0-9:]\+ [^ ]\+  //'|sort |uniq -c | awk '$1 !=3'
```

- sed部分把一行中最前面的“月份 日期 时间 主机名 + 空格”替换为空
- 或者

```sh
journalctl -b -3 -o cat |sort | uniq -c | awk '$1 !=3'
```

- journalctl是查询一个结构化的数据库，binary journal,`-o`是在选择如何把结构化字段投影成文本。

6. 在网上找一个类似 [这个](https://stats.wikimedia.org/EN/TablesWikipediaZZ.htm) 或者 [这个](https://ucr.fbi.gov/crime-in-the-u.s/2016/crime-in-the-u.s.-2016/topic-pages/tables/table-1) 的数据集。或者从 [这里](https://www.springboard.com/blog/free-public-data-sets-data-science-project/) 找一些。使用 `curl` 获取数据集并提取其中两列数据，如果您想要获取的是 HTML 数据，那么 [`pup`](https://github.com/EricChiang/pup) 可能会更有帮助。对于 JSON 类型的数据，可以试试 [`jq`](https://stedolan.github.io/jq/) 。请使用一条指令来找出其中一列的最大值和最小值，用另外一条指令计算两列之间差的总和。
   `head -n -3` 减三，把输入的最后三行丢掉，
   `sort -k 2n` 把第二个字段当作数字来比大小，默认是字符比大小:
