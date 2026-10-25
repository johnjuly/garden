---
created: 2026-10-23
tags:
  - cs/cs169
  - SaaS
type: course-note
---
![[Pasted image 20261023143340.png]]



## The MVC Design Pattern


- Goal: separate organization of data(model) from UI & presentation(view) by introducing controller
	- mediates user actions requesting access to data(对用户请求访问数据的操作 进行中介处理)
	- prsents data for rendering by the view

![[Pasted image 20261023143735.png]]


- each entity has a model,controller & set of views


## models

- how should we store and retrieve record-oriented structured data?
- what is the relationship between data as stored and data as manipulated in a programming language?


### In-memory vs In-storage objects 


- marshal/serialize           ——>    database   `#<Movie:0x32ffe416>`
- unmarshal/deserialize <——     database   `m.name, m.rating, ...`

- how to represent persisted object in storage
	- example:Movie with name& rating attributes
- Basic operations on object:CRUD(Create,Read,Update,Delete)
- ActiveRecord: every model knows how to CRUD itself,using common mechanisms
- Part of the Model's job is to convert between in-memory and stored representations of objects


## controllers

- what design decisions would allow our app to support Service-Oriented Architecture



### REST(Representational State Transfer) ——R.Fielding,2000


- Idea: URI names resource, not page or action
	-  self-contained:which resource,and what to de to it
	- Responses include hyperlinks to discover additional RESTful resources

- A service (in the SOA sense) whose operations are like this is a RESTful service
- Ideally,RESTful URIs name the operations




### Routes

- In MVC, each interaction the user can do is handled by a controller action
	- Ruby method that handles that interaction
- A route maps <HTTP method, URI> to controller action
- example![[Pasted image 20261023151244.png]]


