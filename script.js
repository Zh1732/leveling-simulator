// 水准仪状态变量
let screws = [50, 50, 50]; // 三个脚螺旋的高度 (0-100)
let stepCount = 0;
const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');
const radius = canvas.width / 2;

// 更新显示
function updateDisplay() {
    // 计算倾斜角度 (基于脚螺旋高度差)
    let avgHeight = (screws[0] + screws[1] + screws[2]) / 3;
    let xTilt = ((screws[1] - avgHeight) - (screws[0] - avgHeight)) * 0.5;
    let yTilt = (screws[2] - avgHeight) * 0.866; // sqrt(3)/2
    
    // 更新状态显示
    document.getElementById('xAngle').textContent = xTilt.toFixed(2) + '°';
    document.getElementById('yAngle').textContent = yTilt.toFixed(2) + '°';
    
    // 绘制圆水准器
    drawLevel(xTilt, yTilt);
    
    // 更新UI
    document.getElementById('screw1Value').textContent = screws[0];
    document.getElementById('screw2Value').textContent = screws[1];
    document.getElementById('screw3Value').textContent = screws[2];
    document.getElementById('stepCount').textContent = stepCount;
    
    let bubbleOffset = Math.sqrt(xTilt ** 2 + yTilt ** 2);
    document.getElementById('bubbleOffset').textContent = bubbleOffset.toFixed(2);
    
    let statusElement = document.getElementById('levelStatus');
    // 调平标准：气泡偏移小于30px（黑色小圆半径）
    if (bubbleOffset < 30) {
        statusElement.textContent = '✅ 已调平';
        statusElement.className = 'level-state success';
    } else {
        statusElement.textContent = '⚠️ 需要调平';
        statusElement.className = 'level-state';
    }
}

// 绘制水准仪 - 气泡限制在整个大圆内
function drawLevel(xTilt, yTilt) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制外圈金属质感
    let grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#3e4f5a');
    grad.addColorStop(1, '#1f2e38');
    ctx.beginPath();
    ctx.arc(radius, radius, radius - 10, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#bfd9e8';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 玻璃内底
    ctx.beginPath();
    ctx.arc(radius, radius, radius - 14, 0, Math.PI * 2);
    ctx.fillStyle = '#daeef9';
    ctx.fill();
    
    // 刻度线
    ctx.strokeStyle = '#2c7a8c';
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
        let angle = (i * 30) * Math.PI / 180;
        let x1 = radius + (radius - 24) * Math.cos(angle);
        let y1 = radius + (radius - 24) * Math.sin(angle);
        let x2 = radius + (radius - 14) * Math.cos(angle);
        let y2 = radius + (radius - 14) * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    // 十字基准线
    ctx.beginPath();
    ctx.moveTo(radius - radius + 20, radius);
    ctx.lineTo(radius + radius - 20, radius);
    ctx.moveTo(radius, radius - radius + 20);
    ctx.lineTo(radius, radius + radius - 20);
    ctx.strokeStyle = 'rgba(44, 62, 80, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 粗平目标区 (黑色圆圈) - 半径30px
    ctx.beginPath();
    ctx.arc(radius, radius, 30, 0, Math.PI * 2);
    ctx.strokeStyle = '#000000'; // 黑色
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 内圈目标区 - 半径34px，黑色
    ctx.beginPath();
    ctx.arc(radius, radius, 34, 0, Math.PI * 2);
    ctx.strokeStyle = '#000000'; // 黑色
    ctx.lineWidth = 2.2;
    ctx.stroke();
    
    // 计算气泡位置
    let bubbleX = radius - xTilt * 5;
    let bubbleY = radius - yTilt * 5;
    
    // 限制气泡在大圆内（半径radius-14）
    let maxDist = radius - 14; // 大圆内半径
    let dist = Math.sqrt((bubbleX - radius) ** 2 + (bubbleY - radius) ** 2);
    if (dist > maxDist) {
        let angle = Math.atan2(bubbleY - radius, bubbleX - radius);
        bubbleX = radius + Math.cos(angle) * maxDist;
        bubbleY = radius + Math.sin(angle) * maxDist;
    }
    
    // 绘制气泡 - 更显眼的黄色
    let gradient = ctx.createRadialGradient(bubbleX, bubbleY, 0, bubbleX, bubbleY, 20);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');  // 更亮的黄色
    gradient.addColorStop(0.5, 'rgba(255, 255, 150, 0.9)');
    gradient.addColorStop(1, 'rgba(255, 200, 50, 0.7)');
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, 20, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // 气泡高光 - 扩大到2倍
    ctx.beginPath();
    ctx.arc(bubbleX - 6, bubbleY - 6, 8, 0, Math.PI * 2);  // 从4px扩大到8px
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    
    // 气泡外发光效果
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, 25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 200, 0.2)';
    ctx.fill();
}

// 调整脚螺旋 - 修复3号脚螺旋逻辑
function adjustScrew(screwNum, amount) {
    let index = screwNum - 1;
    screws[index] = Math.max(0, Math.min(100, screws[index] + amount));
    stepCount++;
    updateDisplay();
    highlightScrew(screwNum);
}

// 高亮脚螺旋
function highlightScrew(screwNum) {
    let screwElement = document.querySelector(`.screw${screwNum}`);
    if (screwElement) {
        screwElement.classList.add('screw-highlight');
        setTimeout(() => {
            screwElement.classList.remove('screw-highlight');
        }, 600);
    }
}

// 组合操作 (仅关联1号和2号)
function comboAction(action) {
    switch(action) {
        case 'both_up':
            adjustScrew(1, 5);
            adjustScrew(2, 5);
            break;
        case 'both_down':
            adjustScrew(1, -5);
            adjustScrew(2, -5);
            break;
        case 'inward':
            adjustScrew(1, 5);
            adjustScrew(2, -5);
            break;
        case 'outward':
            adjustScrew(1, -5);
            adjustScrew(2, 5);
            break;
    }
}

// 随机倾斜
function randomTilt() {
    screws = [
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100)
    ];
    stepCount = 0;
    updateDisplay();
}

// 重置水平
function resetLevel() {
    screws = [50, 50, 50];
    stepCount = 0;
    updateDisplay();
}

// 操作提示
function showHint() {
    let xTilt = screws[1] - screws[0];
    let yTilt = screws[2] - 50;
    
    let hint = "💡 操作提示：\n";
    if (Math.abs(xTilt) > 10) {
        hint += `• X轴倾斜较大，请相对旋转螺旋1和螺旋2\n`;
    }
    if (Math.abs(yTilt) > 10) {
        hint += `• Y轴倾斜较大，请调整螺旋3\n`;
    }
    if (Math.abs(xTilt) <= 10 && Math.abs(yTilt) <= 10) {
        hint += "• 接近水平，进行微调即可";
    }
    
    alert(hint);
}

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()) {
        case 'q': adjustScrew(1, 5); break;
        case 'w': adjustScrew(1, -5); break;
        case 'a': adjustScrew(2, 5); break;
        case 's': adjustScrew(2, -5); break;
        case 'z': adjustScrew(3, -5); break;  // 修复：逆时针降低
        case 'x': adjustScrew(3, 5); break;   // 修复：顺时针升高
        case 'r': randomTilt(); break;
    }
});

// 初始化
updateDisplay();