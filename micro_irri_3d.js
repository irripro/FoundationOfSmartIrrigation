        let scene, camera, renderer, controls;
        let font;

        function init(containerId) {
            const container = document.getElementById(containerId);
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer();
            renderer.setClearColor(0xf0f0f2); 
            renderer.setSize(container.clientWidth, container.clientHeight);
            container.appendChild(renderer.domElement);

            container.addEventListener('resize', onWindowResize, true);
            // 设置渲染器背景颜色为浅白色
            
            // 添加雾化效果
            scene.fog = new THREE.Fog(0xffffff, 100, 500);



            // 添加环境光
            const ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);

            // 添加光源
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(10, 10, 100).normalize();
            scene.add(light);

            // 设置相机位置
            camera.position.z = 80;
            camera.position.x = -10;
            camera.position.y = -120;



            // 初始化 OrbitControls
            if (typeof THREE.OrbitControls !== 'undefined') {
                controls = new THREE.OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true; // 启用阻尼效果
                controls.dampingFactor = 0.25; // 设置阻尼因子
                controls.screenSpacePanning = true; // 设置为 false 确保左键拖动是平移
                controls.minDistance = 1; // 最小缩放距离
                controls.maxDistance = 500; // 最大缩放距离



                // 允许绕 z 轴旋转
                controls.rotateSpeed = 0.5; // 可调整旋转速度

                
            } else {
                console.error("THREE.OrbitControls is not defined");
            }

            // 加载字体
            const loader = new THREE.FontLoader();
            loader.load('https://cdn.jsdelivr.net/npm/three@0.140.0/examples/fonts/helvetiker_regular.typeface.json', function (loadedFont) {
                font = loadedFont;
                addAxesWithLabels(100);
            });
        }
        init('network3D');
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function createField(length, width) {
            const geometry = new THREE.PlaneGeometry(length, width);
            // 使用更丰富的材质
            const material = new THREE.MeshPhongMaterial({ color: 0x707072, side: THREE.DoubleSide });
            const plane = new THREE.Mesh(geometry, material);

            scene.add(plane);
        }

        function createPipe(startX, startY, startZ, endX, endY, endZ, diameter, color) {
            const points = [];
            points.push(new THREE.Vector3(startX, startY, startZ + 1));
            points.push(new THREE.Vector3(endX, endY, endZ + 1));

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            // 使用更丰富的材质
            const material = new THREE.LineBasicMaterial({ color: color, linewidth: diameter });
            const line = new THREE.Line(geometry, material);
            scene.add(line);
        }

        function addText(text, position, size = 0.6) {
            if (!font) return;
            const geometry = new THREE.TextGeometry(text, {
                font: font,
                size: size,
                height: 0.1
            });
            const material = new THREE.MeshBasicMaterial({ color: 0xfd0000 });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(position);
            scene.add(mesh);
        }

        function addAxesWithLabels(length) {
            const axesHelper = new THREE.AxesHelper(length);
            scene.add(axesHelper);

            // X 轴刻度和标签
            for (let i = 0; i <= length; i += 10) {
                const position = new THREE.Vector3(i, 0, 0);
                addText(i.toString(), position);
            }

            // Y 轴刻度和标签
            for (let i = 0; i <= length; i += 10) {
                const position = new THREE.Vector3(0, i, 0);
                addText(i.toString(), position);
            }

            // Z 轴刻度和标签
            for (let i = 0; i <= length; i += 10) {
                const position = new THREE.Vector3(0, 0, i);
                addText(i.toString(), position);
            }
        }

        function calculate() {
            // 清空 3D 视图
            while (scene.children.length > 0) {
                scene.remove(scene.children[0]);
            }

            // 重新添加坐标轴及标签
            if (font) {
                addAxesWithLabels(100);
            }

            // 获取输入值
            const Length = parseFloat(document.getElementById('L').value);
            const L1 = parseFloat(document.getElementById('L1').value);
            const B = parseFloat(document.getElementById('B').value);
            const y = parseFloat(document.getElementById('y').value);
            const x = parseFloat(document.getElementById('x').value);
            const q = parseFloat(document.getElementById('q').value);
            let H_w = parseFloat(document.getElementById('H_w').value);
            const D_m = parseFloat(document.getElementById('d_m').value); // 毛管直径 mm
            const D_z = parseFloat(document.getElementById('d_z').value); // 支管直径 mm
            const C = parseFloat(document.getElementById('C').value);
            const k = parseFloat(document.getElementById('k').value);
            // 检查 L1 的输入值
            if (L1 < 0 || L1 > Length) {
                alert('支管距离右边线 L1 的值必须在 0 到田块长边 L 的范围内！');
                return;
            }

            L2 = Length - L1;
            const Hw = H_w * 1.2;

            // 创建田块平面
            createField(Length * 2, B * 2);

            // 计算毛管和支管参数
            const numLaterals = Math.floor(B / y) + 1;
            const lateralLength1 = L1;
            const lateralLength2 = L2;

            const numEmittersPerLateral1 = Math.floor(lateralLength1 / x);
            const numEmittersPerLateral2 = Math.floor(lateralLength2 / x);
            const totalEmitterFlow1 = numEmittersPerLateral1 * q;
            const totalEmitterFlow2 = numEmittersPerLateral2 * q;
            const q_m3s_1 = totalEmitterFlow1 * 0.001 / 3600;
            const q_m3s_2 = totalEmitterFlow2 * 0.001 / 3600;
            const q_m3h = (q_m3s_1 + q_m3s_2) * 3600;

            // createField(Length * 2, B * 2,Hw);
            let hmin = 1000;
            let hmax = 0;

            let hf_main = Hw;
            let hf = Hw;
            const D_z_m = D_z / 1000;
            const D_m_m = D_m / 1000;
            const numBranches = numLaterals;
            for (let i = 0; i < numBranches; i++) {
                const segmentFlow = (numBranches - i) * (q_m3s_1 + q_m3s_2);
                const segmentLength = y;
                const hf_segment = k * segmentLength * Math.pow(segmentFlow, 1.85) / (Math.pow(C, 1.85) * Math.pow(D_z_m, 4.87));
                hf_main += hf_segment;
                // 创建支管水头损失线
                createPipe(0, y * i, hf, 0, y * (i + 1), hf_main, D_z_m * 100, 0xff0000);
                hmax = Math.max(hf_main, hmax);

                let hf_lateral = hf_main;
                let hl = hf_main;
                let xPos = 0;
                let yPos = i * y;
                for (let j = 0; j < numEmittersPerLateral1; j++) {
                    const segmentFlow = (numEmittersPerLateral1 - j) * q * 0.001 / 3600;
                    const segmentLength = x;
                    const hf_segment = k * segmentLength * Math.pow(segmentFlow, 1.85) / (Math.pow(C, 1.85) * Math.pow(D_m_m, 4.87));
                    hf_lateral -= hf_segment;
                    xPos += x;
                    createPipe(xPos, yPos, hl, xPos + x, yPos, hf_lateral, D_m_m * 100, 0xf0fa00);
                    hl = hf_lateral;
                    hmin = Math.min(hf_lateral, hmin);
                }
                hf_lateral = Math.floor(hf_lateral * 10) / 10;
                createPipe(xPos + x, yPos, 0, xPos + x, yPos, hf_lateral, D_m_m * 100, 0xf0fa00);
                let txtposition = new THREE.Vector3(xPos + x + 1, yPos + 1, hf_lateral + 1);
                addText(hf_lateral.toString(), txtposition);

                hl = hf_main;
                xPos = 0;
                hf_lateral = hl;
                for (let j = 0; j < numEmittersPerLateral2; j++) {
                    const segmentFlow = (numEmittersPerLateral2 - j) * q * 0.001 / 3600;
                    const segmentLength = x;
                    const hf_segment = k * segmentLength * Math.pow(segmentFlow, 1.85) / (Math.pow(C, 1.85) * Math.pow(D_m_m, 4.87));
                    hf_lateral -= hf_segment;
                    xPos -= x;
                    createPipe(xPos, yPos, hl, xPos - x, yPos, hf_lateral, D_m_m * 100, 0xf0fa00);
                    hl = hf_lateral;
                    hmin = Math.min(hf_lateral, hmin);
                }
                hf_lateral = Math.floor(hf_lateral * 10) / 10;
                createPipe(xPos - x, yPos, 0, xPos - x, yPos, hf_lateral, D_m_m * 100, 0xf0fa00);
                txtposition = new THREE.Vector3(xPos - x - 1, yPos - 1, hf_lateral + 1);
                addText(hf_lateral.toString(), txtposition);

                hf = hf_main;
            }
            createPipe(0, 0, 0, 0, 0, Hw, D_z_m * 100, 0xff0000);
            txtposition = new THREE.Vector3(-1, -1, Hw + 1);
            addText(Hw.toString(), txtposition);


            createPipe(0, B, 0, 0, B, hf_main, D_z_m * 100, 0xff0000);

            hf_main = Math.floor(hf_main * 100) / 100;
            txtposition = new THREE.Vector3(+2, B + 2, hf_main + 1);
            addText(hf_main.toString(), txtposition);

            // 创建主干管
            createPipe(0, 0, 0, 0, B, 0, D_z_m * 100, 0x0000ff);

            // 创建毛管
            for (let i = 0; i < numLaterals; i++) {
                const yPos = i * y;
                createPipe(-L2, yPos, 0, L1, yPos, 0, D_m_m * 100, 0x00fa00);
            }


            const results = `灌水器工作水头：${H_w.toFixed(2)} m , 最小水头：${hmin.toFixed(2)} m , <br> 支管总水头：${hmax.toFixed(2)} m  ， <br> 总流量：${q_m3h.toFixed(2)} m^3/h。`;
            
            if (hmin < H_w*.9) {
                const message=`灌水器工作压力 ${hmin.toFixed(2)} 太低，需要调整管径！！！`
                alert(message);
                
            }
            if ( hmin > H_w*1.2) {
                const message=`灌水器工作压力 ${hmin.toFixed(2)} 太高，可调整管径！`
                alert(message);
                
            }
            document.getElementById('results').innerHTML = results;

            animate();
        }

        function animate() {
            requestAnimationFrame(animate);
            if (controls) {
                controls.update(); // 更新控制器
            }
            renderer.render(scene, camera);
        }

        init('network3D');
        animate();

