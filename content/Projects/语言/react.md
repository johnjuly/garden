> a javascript library for  building interfaces



# recap :components
- react is a framework that lets you divide up your website into reusable components
- each componet is kind of like a "custom HTML tag" that you define
- components are an abstraction of a bunch of html/css/javascript
- the componets can be structured into tree hierarchy


# props recap

- props allow us to create reusable components-renders a skeleton with custom content
- props are passed in from parent to child ONLY
- props are immutable



# state recap
- state is information maintained by components and lets us control what is displayed in the application
- state is mutable and updated by external inputs
- can be passed to reusable child components as props



# component  structure recap

- components can have props and/or state
- props are passed down from parent components and are immutable
- state is data mantained by a component and is mutable
- state can be kept in parent components so that it can be passed into reusable child components as props

![[Pasted image 20250821120942.png]]

- jsx:stricter version of html
- return jsx=what the react component should render
- ![[Pasted image 20250821121733.png]]

```js CommentReply.js
import React,{useState} from'react'
const CommentReply=(props)=>{
return(
	<div className="comment-text">
		<h5>{props.name}</h5>
		<p>{props.content}</p>
	</div>
)
}
```
- `return( )`()allows us to write jsx("html")code inside javascript
- {}allows us to return to js inside the jsx environment to use variables defined inside this react component
- also use'className' instead of 'class'
- add a state
```js CommentReply.js
import React,{useState} from'react'
const CommentReply=(props)=>{
const [isLiked,setIsLiked]=useState(false)



return(
	<div className="comment-text">
		<h5>{props.name}</h5>
		<p>{props.content}</p>
		<p>{isLiked?"Liked":"Like"}</p>
	</div>
)
}
```
- initializes isLiked state to false
- declares setIsLiked as the function to update isLiked
- example:setIsLiked(true) will set isLiked to true
- **components are just functions that can take in props, and they output JSX, or HTML-like, code.**
- 