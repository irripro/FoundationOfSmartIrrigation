    <div class="container">
        <h1>水头损失计算器</h1>
        <form id="headLossForm">
            <label for="diameter">管道直径 (m):</label>
            <input type="number" id="diameter" step="0.01" required><br><br>

            <label for="length">管道长度 (m):</label>
            <input type="number" id="length" step="0.1" required><br><br>

            <label for="flowRate">流量 (m³/s):</label>
            <input type="number" id="flowRate" step="0.0001" required><br><br>

            <label for="roughness">管道粗糙度 (m):</label>
            <input type="number" id="roughness" step="0.0001" required><br><br>

            <label for="viscosity">流体粘度 (Pa·s):</label>
            <input type="number" id="viscosity" step="0.000001" required><br><br>

            <button type="button" onclick="calculate()">计算</button>
        </form>

        <h2>计算结果</h2>
        <p id="result"></p>

        <h2>水头损失曲线图</h2>
        <canvas id="headLossChart" width="400" height="200"></canvas>
    </div>

    <script>
        function calculate() {
            const diameter = document.getElementById('diameter').value;
            const length = document.getElementById('length').value;
            const flowRate = document.getElementById('flowRate').value;
            const roughness = document.getElementById('roughness').value;
            const viscosity = document.getElementById('viscosity').value;

            // 计算水头损失
            const headLoss = calculateHeadLoss(diameter, length, flowRate, roughness, viscosity);

            // 显示结果
            document.getElementById('result').innerText = `水头损失: ${headLoss.toFixed(4)} m`;

            // 绘制曲线图
            plotChart(diameter, length, roughness, viscosity);
        }

        function calculateHeadLoss(diameter, length, flowRate, roughness, viscosity) {
            // ...水头损失的计算逻辑...
            // 返回计算结果
            return calculatedHeadLoss;
        }

        function plotChart(diameter, length, roughness, viscosity) {
            const ctx = document.getElementById('headLossChart').getContext('2d');
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: generateFlowRates(),
                    datasets: [{
                        label: '水头损失 (m)',
                        data: generateHeadLossData(diameter, length, roughness, viscosity),
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        function generateFlowRates() {
            // 生成一系列流量值
            // ...
            return flowRates;
        }

        function generateHeadLossData(diameter, length, roughness, viscosity) {
            // 根据不同的流量值生成水头损失数据
            // ...
            return headLossData;
        }
    </script>
