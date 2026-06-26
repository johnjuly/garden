---
created: '2026-01-06'
---

> 使用时钟的不同边沿激活





![[Pasted image 20251019144000.png]]
behavior modeling


## D_Latch

```v
module D_latch{
	input D,
	input clk,
	output reg Q,
	output Q_b     //b即bar
};
	assign Q_b =~Q;
	alaways @(D,clk)//激活条件 当输入改变时
	begin
		Q=Q;
		if(clk)//时钟为正
			Q=D；
		else //不改变
			Q=Q；
		
	
	end
endmodule
```

- rtl:register transfer level :寄存器传输级别


## D Flip -Flops


- 负沿
```v
module D_FF_neg{
	input D,
	input clk,
	output reg Q
};
	always @(negedge clk)
		begin
			Q=D;
		end
endmodule
```

- 正沿
```v
module D_FF_pos{
	input D,
	input clk,
	output reg Q
};
	always @(posedge clk)
		begin
			Q=D;
		end
endmodule
```


- 在always 里面assign为寄存器类型



```verilog
module compare_storage_elements{
	input D,clk,
	output Qa,Qb,Qc
};

D_latch L0 {
	.D(D),
	.clk(clk),
	.Q(Qa)
	.Q_b()
};
..

endmoule
```


```verilog
module compare_storage_elements_tb{};

reg clk,D;
wire Q_latch,Q_ff_pos,Q_ff_neg

compare_storage_elements uut{
	.D(D),
	.clk(clk),
	.Qa(Q_latch),
	.Qb(Q_ff_pos),
	.Qc(Q_ff_neg)
};


//generate stimuli using inital and always
localparam T=20; //clock period

//as long as the simulation is running ,run forever
always
begin
	clk=1b'0;
	#(T/2);
	clk=1'b1;
	#(T/2);
end

initial
begin
	D=1'b1;
	
	#(2*T);
	D=1'b0;
	
	#(posedge clk); //wait for the next positive edge of the clock
	D=1'b1;
	
	#2 D=1'b0;
	#3 D=1'b1;
	#4 D=1'b0;
	
	repeat(2) @(negedge clk); //等待2个时钟负边沿
	D=1'b1;
	
	#20 $stop
	
end

endmodule
```
- 使用本地参数 动态更改时钟周期
- testbench timing control structure
- intial 只运行一次![[Pasted image 20251019153857.png]]