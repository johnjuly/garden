---
created: 2026-10-23
tags:
  - cs/cs169
  - BDD
  - TDD
  - SaaS
type: course-note
---
#语言/句子 

- debugging is twice as hard as writing code in the first place    ——[^1]Brian Kerighan

[^1]: co-inventor of the C language


- testing can never demonstrate the absence of
  errors in software only their presence     ——[^2]Edsger Dijkstra

[^2]: "goto statement considered harmful"



- BDD: behavior driven design
- TDD: test d


![[Pasted image 20261023134649.png]]


- Cucumber describes behavior via features& scenarios(bdd)
- RSpec tests individual modules that contribute to those behaviors(tdd)

## Unit tests should be FIRST

- **F**ast: run(subset of) tests quickly(since you'll be running  them all the time)
- **I**ndependent: no tests depend on others, so can run any subset in any order
- **R**epeatable:run N times,get same result(to help isolate bugs and enable automation)
- **S**elf-checking:test can automatically detect if passed(no human checking of output)
- **T**imely: written about the same time as code under test(with TDD,written first)

## RSpec, a DSL for testing



- RSpec tests are called specs or examples
- Run the tests in one file :rspec filename


## Nuts and bolts :TCP/IP protocols

#语言/句子 螺丝钉与螺母

- IP(Internet Protocol) address identifies a physical network interface with four octets, e.g. 128.32.244.172
- TCP/IP(Transmission Control Protocol/Internet Protocol)
	- IP:no-guarantee,best-effort service that delivers packets from one IP address to another
	- TCP: make IP reliable by detecting  "dropped" packets,data arriving out of order,transmission errors,slow networks,etc.,and respond appropriately
	- TCP ports allow multiple TCP apps on same computer

- 相关人物：Vint Cerf & Bob Kahn: 2004 Turing Award


## Web

- The web is a _client/server_ architecture
- It is fundamentally request/reply oriented
- Domain Name System is another kind of server that maps names to IP addresses


web broser  ——DNS server——   Web site


## HTTP

> Hypertext Transfer Protocol

- an ASCII-based request/reply protocol for transferring information on the Web
- HTTP request includes:
	- request method(GET,POST,etc.)
	- Uniform REsource Identifier(URI)
	- HTTP protocol version understood by the client
	- headers: extra regarding transfer request
- HTTP response from server
	- Protocol version & Status code
		- 2xx    *all is well*
		- 3xx    *resource moved*
		- 4xx    *access problem*
		- 5xx    *server error*
	- Response headers&body


## Cookies

- HTTP is stateless
- problem? how to guide a user "through" a flow of pages?比如购物，记住 浏览商品，加入购物车，订单，付款一系列页面操作。



## 3 tier architecture


web server(Apache,Microsofet IIS,WEBrick)\[**Presentation tier**]     ——  Appserver(rack)\[**Logic tier**]——Database(SQLite,Postgres)\[**Persistence tier**] 



## Dynamic content generation


- 在过去，most web pages were collections of plain old files
- 但是 Web1.0/电商 网站 run a program to generate each "page"
- 原始：templates with embedded code "snippets"
- 最终，code became  "tail that wagged the dog" #语言/句子 and moved out of  the Web server


## Sites that are really programs(SaaS)


![[截图 2026-10-23 14-23-51.png]]



## Summary: Web 1.0 SaaS

- Browser requests web resource(URI) using HTTP
	- HTTP is a simple request-reply protocol that relies on TCP/IP
	- In SaaS,most URI's cause a program to be run, rather than a static file to be fetched
- HTML is used to encode content, CSS to style it visually
- Cookies allow server to track client
	- Browser automatically passes cookie to server on each request
	- Sever may change cookie on each response
	- Typical usage: cookie includes a handle to server-side information 
- Framworks make all these abstractions convenient for programmers to use,without sweating the details