**1. 水力计算数学模型**
系统建立包含能量方程、连续方程、动量方程的三维耦合方程组：  
$$ \begin{cases}H_i = H_{i-1} - \Delta H_f \pm S \cdot L_i \\Q = K \cdot H^x \\\Delta H_f = f(Q,D,L,\nu)\end{cases}$$
式中：  
- $$H_i$$：第i节点压力水头（m）  
- $$\Delta H_f$$：管段沿程水头损失（m）  
- $$S$$：地面坡降（‰）  
- $$K,x$$：灌水器特性系数  
- $$f()$$：水头损失函数  