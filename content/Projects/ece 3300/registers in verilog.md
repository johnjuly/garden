---
created: '2026-01-06'
---

> register :描述一组触发器的术语

## 4 bit register
4个触发器构成

- structurelly
```verilog
module simple_register(parameter N=4){
	input clk,
	input [N-1:0] I,
	output[N-1:0] Q
};

genvar k;
generate
	for(k=0;k<N;k=k+)
		begin:FF
			D_FF_reset{
				.clk(clk),
				.D(I[k]),
				.Q(Q[k]),
				.reset_n()
				.clear_n()
			}
		end
endgenerate

endmodule
```

- behavorly

```verilog
reg[N-1:0] Q_reg,Q_next;

//register
always @(posedge clk)
begin
	Q_reg <= Q_next; 
end

//next state
always @(I)
begin
	Q_next =I;
end
//output
assign Q=Q_reg
endmodule
```


