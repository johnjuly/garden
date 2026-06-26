---
created: '2026-01-06'
---

- continous assignment data flow model outside of always blocks  有 assign keyword 一旦右边有变化 左边立刻更新
- procdural assignment within a always block 没有 assign keyword 只有当always triggerd 左边才会更新 两种方式
	- blocking(immedia): =
	- nonblocking(deferred): <=


```verilog
module comb_block_nonblock{
	input a,b,c,
	output reg x
};
	always @(a,b,c)
	begin
		x=a; //block the execution of the next statement 执行这一条语句
		x=x^b;
		x=x|c;
	end
	
endmodule

```


```verilog
module comb_block_nonblock{
	input a,b,c,
	output reg x
};
	always @(a,b,c)
	begin
		x<=a; //block the execution of the next statement 执行这一条语句
		x<=x^b;
		x<=x|c;
	end
	
endmodule
```

unblocking assignment should not be used with combinational circuit
阻塞语句是有顺序的

```verilog
module ff_block_nonblock{
	input D,clk,
	output reg  Q1,Q2
};

always @(posedge clk)
begin
	Q1=D;
	Q2=Q1;
end


endmodule

```
这样写 vivado会知道 q1 和q2都是用的d的值 最后的图像就不会是两个d latch 了 。
改变顺序
```verilog
begin
	Q2=Q1;
	Q1=D;
end
```

nonblock
```verilog
//顺序不重要
	Q2<=Q1;
	Q1<=D;

```

takeaway:
	using blocking assignment when you use combination of circuits
	using nonblocking assignment when you use sequential sircuits