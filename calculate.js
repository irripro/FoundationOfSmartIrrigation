function calculate() {
    const coordinatesInput = document.getElementById('coordinates').value;
    const formula = document.getElementById('formula').value;
    const diameter = parseFloat(document.getElementById('diameter').value);
    const flowRate = parseFloat(document.getElementById('flowRate').value);
    const density = parseFloat(document.getElementById('density').value) || 1000; // 默认为水的密度
    const viscosity = parseFloat(document.getElementById('viscosity').value) || 0.001; // 默认为水的动力粘度
    const roughness = parseFloat(document.getElementById('roughness').value) || 0.04; // 默认值
    const cFactor = parseFloat(document.getElementById('cFactor').value) || 130; // 默认C系数
  
    // 解析坐标输入
    const lines = coordinatesInput.trim().split('\n');
    const nodes = lines.map(line => line.split(',').map(Number));
  
    // 计算总长度
    let totalLength = 0;
    for (let i = 0; i < nodes.length - 1; i++) {
      const dx = nodes[i + 1][0] - nodes[i][0];
      const dy = nodes[i + 1][1] - nodes[i][1];
      const dz = nodes[i + 1][2] - nodes[i][2];
      totalLength += Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
  
    // 根据公式计算水头损失
    let headLoss = 0;
    if (formula === 'darcy-weisbach') {
      const reynoldsNumber = 4 * flowRate / (Math.PI * diameter * viscosity);
      const frictionFactor = 0.079 / Math.pow(reynoldsNumber, 0.25); // 假设光滑管
      headLoss = (frictionFactor * 8 * totalLength * flowRate * flowRate) / (gravity * diameter * diameter * density);
    } else if (formula === 'hazen-williams') {
      const hydraulicRadius = diameter / 4; // 对于圆形管道
      const velocity = flowRate / (Math.PI * (diameter / 2) * (diameter / 2));
      headLoss = 0.208 * (velocity ** 1.85) * (totalLength / (cFactor ** 1.85)) / (hydraulicRadius ** 0.63);
    }
  
    // 显示结果
    const resultElement = document.getElementById('result');
    resultElement.innerHTML = `总管道长度: ${totalLength.toFixed(2)} m<br/>`;
    resultElement.innerHTML += `水头损失: ${headLoss.toFixed(2)} m`;
  }
  
  const gravity = 9.81; // 重力加速度