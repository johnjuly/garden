> 4 种组合



```verilog
module D_FF_reset{
	input clk,
	input D,
	input reset_n,//async regardless of the clock,下降沿 低电平有效
	input clear_n,//sync
	output Q
};

reg Q_next,Q_reg;
always @(negedge clk,negedge reset_n)
begin
	if(!reset_n)
		Q_reg<=1'b0;
	else
		Q_reg<=Q_next;
end

always @(D,clear_n)
begin
	if(!clear_n)
		Q_next=1'b0;
	else
		Q_next=D;
end 
assign Q=Q_reg;
endmodule
```