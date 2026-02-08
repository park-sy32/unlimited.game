// 전역 변수로 게임 상태 관리 (firebase.js에서 값을 채워줌)
window.money = 1000000;
window.stockCount = 0;

let currentPrice = 10000;
let isGameRunning = false;

// 게임 시작 함수
function startGame(userType) {
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('game-main').style.display = 'block';
    document.getElementById('user-info').innerText = `사용자: ${userType}`;
    updateUI(); // UI 초기화
    if (!isGameRunning) {
        isGameRunning = true;
        startPriceUpdate(); // 게임 시작 시 시세 변동 개시
    }
}

function updateUI() {
    document.getElementById('money').innerText = window.money.toLocaleString() + "원";
    document.getElementById('assets').innerText = `보유 주식: ${window.stockCount}주`;
    document.getElementById('stock-price').innerText = currentPrice.toLocaleString() + "원";
}

function work() {
    window.money += 10000;
    addLog("업무 보상으로 10,000원을 벌었습니다.");
    updateUI();
    window.saveGameData();
}

function buyStock() {
    if (window.money >= currentPrice) {
        window.money -= currentPrice;
        window.stockCount++;
        addLog(`매수 완료: ${currentPrice.toLocaleString()}원`);
        updateUI();
        window.saveGameData();
    } else { addLog("자산이 부족합니다!"); }
}

function sellStock() {
    if (window.stockCount > 0) {
        window.money += currentPrice;
        window.stockCount--;
        addLog(`매도 완료: ${currentPrice.toLocaleString()}원`);
        updateUI();
        window.saveGameData();
    } else { addLog("보유 주식이 없습니다!"); }
}

function startPriceUpdate() {
    setInterval(() => {
        if(!isGameRunning) return;
        const changePercent = (Math.random() * 40 - 20); 
        currentPrice = Math.max(1000, Math.floor(currentPrice * (1 + changePercent / 100)));
        const priceElement = document.getElementById('stock-price');
        priceElement.className = changePercent > 0 ? 'price-up' : 'price-down';
        updateUI();
    }, 3000);
}

function addLog(msg) {
    const logBox = document.getElementById('log');
    logBox.innerHTML = `> ${msg}<br>${logBox.innerHTML}`;
}

// === 테마 관리 로직 ===
document.addEventListener('DOMContentLoaded', () => {
    // --- 테마 관리 ---
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        let theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
    });
});
