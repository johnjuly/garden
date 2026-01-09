---
created: '2026-01-06'
---


## review

- fetch() takes time,async meaning while it is fetching data , it can do something else
- with data,do dom manipulation

## declaratives vs imperative programming

- imperative: like a recipe; **how**,step by step
- declaratiges: focus on **what**



```js
let things = ["hello",2,true,-1.2];
let newTings = [];
//for 的高级写法

for(let t of things){
	if(type of t === "number"){
		newTings.push(t);
	}
	
	console.log(newTings)
}




```

- let 与const 的区别 一个可以改变 一个不可以。。 const 意味着 可以change arrtibute但是不可以reassign .故上述代码中如果newTings改为const for循环还是可以写的
- filter narrow down function
- map one o one
- both are lists function ,return lists
- some(cb) and every(cb) return blooean
- `console.log("is there any instructions to bake?")`
-  `console.log(data.recipe.some(inst => inst=== "Bake"));
- case insisentive: `console.log(data.recipe.some(inst => inst.tolowercase() === "bake"));
- inst could be bake 7 minutes .substring search ``console.log(data.recipe.some(inst => inst.tolowercase().includes("bake")));`



- console.log("what are the unique ingredients?")
- we want to loop the ingredients(object,not list),use object.key(),then reduce over then
- reduce takes two arguments,start with a empty list
- `console.log(Object.key(data.ingredients).reduce((prev,cur)=>{},[]))`
- check the unit,if seen before ,discard it
- ```js
			  console.log(Object.key(data.ingredients).reduce((prev,curr)=>{
			  let currObj = data.ingredients[curr];
			  let currUnit= currObj.unit;//unit might not exits,undefined
			  //check
				  //1
			  if(!currUnit){
				  rerurn prev;//without modify the list
				  }
					//2,appear not only 1 times
				if (prev.includes(currUnit)){
					rerurn prev;
					//ignore it
				}
		  //so if we have a unit,exits and haven't been seen before
			  prev.push(currUnit);
			  //back to the next iteration
			  return prev;
  },[]))
  ```

## 语法糖


### template literals: another way to do string concatenation ${exper}
### 三元运算符 ?
### spread operator ... spread list,object,copy of them,shollow copies
- shallow copy 只在第一层开辟空间，深的层指向同一块位置
- deep copy 全拷贝
- reference copy

![[Pasted image 20250914144036.png]]

- #工具 python tutor:可视化网站
### optional chaining ?
- a safer way to grab data we don't know if exists

### ?? null coalescing operator

### css library[[扎伊尔]]

bootstrap: get (oneself or sth )into or out of a situation using existing resources.
- layout:grid 12 容易被整除 span
- responsive design 适应于不同大小设备