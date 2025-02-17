
function calculate() {
    // 获取输入参数
    const L = parseFloat(document.getElementById('L').value);
    const B = parseFloat(document.getElementById('B').value);
    const x = parseFloat(document.getElementById('x').value);
    const y = parseFloat(document.getElementById('y').value);
    const q = parseFloat(document.getElementById('q').value) / 1000 / 3600;  // 转换为m³/s
    const Hw = parseFloat(document.getElementById('Hw').value);
    const D_mao = parseFloat(document.getElementById('D_mao').value) / 1000; // 转换为米
    const D_zhi = parseFloat(document.getElementById('D_zhi').value) / 1000;
    const C = parseFloat(document.getElementById('C').value);
    // 新增水泵效率输入     
    const eta = parseFloat(document.getElementById('eta').value) / 100;

    // 计算毛管水头损失
    const n_mao = Math.floor(B / y);        // 毛管出水器数量
    const y_actual = B / n_mao;             // 实际出水器间距
    let h_mao = 0;

    // 从尾端到首端计算多孔管损失
    for(let i=1; i<=n_mao; i++) {
        const Q = i * q;  // 当前段流量
        const h = (10.67 * Math.pow(Q, 1.852) * y_actual) / 
                 (Math.pow(C, 1.852) * Math.pow(D_mao, 4.871));
        h_mao += h;
    }

    // 计算支管水头损失
    const n_zhi = Math.floor(L / x);        // 支管毛管数量
    const x_actual = L / n_zhi;             // 实际毛管间距
    const Q_mao_total = n_mao * q;          // 单根毛管总流量
    let h_zhi = 0;

    // 从尾端到首端计算多孔管损失
    for(let j=1; j<=n_zhi; j++) {
        const Q = j * Q_mao_total;  // 当前段流量
        const h = (10.67 * Math.pow(Q, 1.852) * x_actual) / 
                 (Math.pow(C, 1.852) * Math.pow(D_zhi, 4.871));
        h_zhi += h;
    }

    // 显示计算结果
    Q_total=((B*L)/(x*y)*q*3600).toFixed(3)
    Hp=(Hw+h_mao + h_zhi).toFixed(3)

    // 水泵功率计算     
    const rho = 1000;         
    // 水密度 kg/m³     
    const g = 9.81;           
    // 重力加速度 m/s²     
    const Pw = (Q_total/3600  *Hp  *rho *g) / eta; 
    // 单位：瓦特    
    const PkW = Pw / 1000;   
    // 转换为千瓦

    document.getElementById('result').innerHTML = `
        <h3>计算结果</h3>
        <p>毛管数量：${n_zhi}根，每根毛管出水器：${n_mao}个</p>
        <p>毛管水头损失：${h_mao.toFixed(3)}米</p>
        <p>支管水头损失：${h_zhi.toFixed(3)}米</p>
        <p>总水头损失：${(h_mao + h_zhi).toFixed(3)}米</p>
        <p>总流量：${Q_total} m3/h</p>
        <p>总扬程：${Hp} 米 </p>
        <p>水泵功率需求：${PkW.toFixed(2)} kW（效率 ${eta*100}%）</p>
   
    `;

        // 绘制田块布局图
        const canvas = document.getElementById('fieldLayout');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 设置比例尺
        const width =canvas.width-30
        const height=canvas.height-40
        const scaleX = width / L;
        const scaleY = height / B;
    
        // 绘制田块边界
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, width, height);
    
        // 新增尺寸标注
        ctx.fillStyle = "#000";
        ctx.font = "14px Arial";
        // 长边标注
        ctx.fillText(`L = ${L}m`, width/2 - 30, -5);
        ctx.fillText(`L = ${L}m`, width/2 - 30, height + 20);
        // 宽边标注
        ctx.save();
        ctx.translate(-20, height/2);
        ctx.rotate(-Math.PI/2);
        ctx.fillText(`B = ${B}m`, 0, 0);
        ctx.restore();
        
        ctx.save();
        ctx.translate(width + 20, height/2);
        ctx.rotate(-Math.PI/2);
        ctx.fillText(`B = ${B}m`, 0, 0);
        ctx.restore();

        // 绘制支管（红色）     
        ctx.strokeStyle = "red";     
        ctx.lineWidth = 2;     
        ctx.beginPath();     
        ctx.moveTo(0, 5);     
        ctx.lineTo(width* scaleX +10, 5);     
        // 新增标注
        ctx.fillStyle = "#000";
        ctx.font = "8px ";
        // 标注
        ctx.fillText(`支管`, width - 2, 25);
        
        ctx.fillText(`Q = ${Q_total} m3/h`, width-75 , 45);
        ctx.stroke();
    
        // 修改毛管显示（加粗并添加箭头）
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;  // 加粗毛管线条
        // ctx.setLineDash([5, 5]);  // 虚线显示
       // const n_mao2 = Math.floor(L* scaleX / y); 
        for(let i=0; i<n_zhi; i++) {
            const x_pos = i * x_actual * scaleX;
            
            // 绘制毛管线
            ctx.beginPath();
            ctx.moveTo(x_pos, 10);
            ctx.lineTo(x_pos, height);
            ctx.stroke();
            
            // 在毛管末端添加箭头
            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.moveTo(x_pos - 3, 10);
            ctx.lineTo(x_pos + 3, 10);
            ctx.lineTo(x_pos, 5);
            ctx.fill();
        }
            // 绘制出水器（红点）
        ctx.fillStyle = "red";
        for(let i=1; i<n_zhi ; i++) {
            for(let j=1; j<n_mao+1; j++) {
                const x_pos = i* x_actual   * scaleX;
                const y_pos = j *  y_actual* scaleY;
                ctx.beginPath();
                ctx.arc(x_pos, y_pos,2, 0, Math.PI*2);
                ctx.fill();
            }
        }
}
