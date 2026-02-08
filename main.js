// 자산 데이터 객체화 (Firebase에서 로드되거나 초기화될 예정)
window.assets = {
    money: 1000000,
    coin: { count: 0, price: 50000000, volatility: 0.2 }, // 코인은 변동성 큼
    stock: { count: 0, price: 70000, volatility: 0.05 },  // 주식은 상대적으로 안정적
    buildings: { count: 0, income: 500000 } // 강남 빌딩 하나당 초당 50만원 수익
};

let isGameRunning = false;
let autoSaveInterval;
let priceUpdateInterval;
let buildingIncomeInterval;

// 게임 시작 함수
function startGame(userDisplayName) {
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('game-main').style.display = 'block';
    document.getElementById('user-info').innerText = `사용자: ${userDisplayName}`;
    
    // 초기 UI 업데이트 및 탭 표시
    updateUI();
    showTab('work'); // 기본적으로 업무 탭 표시

    if (!isGameRunning) {
        isGameRunning = true;
        // 기존 인터벌이 있다면 제거 (중복 실행 방지)
        if (priceUpdateInterval) clearInterval(priceUpdateInterval);
        if (buildingIncomeInterval) clearInterval(buildingIncomeInterval);
        if (autoSaveInterval) clearInterval(autoSaveInterval);

        // 시세 변동 및 부동산 수익 시작
        priceUpdateInterval = setInterval(updateMarketPrices, 3000);
        buildingIncomeInterval = setInterval(applyBuildingIncome, 1000);
        
        // 5초마다 자동 저장
        autoSaveInterval = setInterval(window.saveGameData, 5000);
    }
}

// UI 업데이트 함수
function updateUI() {
    document.getElementById('money').innerText = window.assets.money.toLocaleString() + "원";
    document.getElementById('owned-coin').innerText = window.assets.coin.count.toLocaleString();
    document.getElementById('owned-stock').innerText = window.assets.stock.count.toLocaleString();
    document.getElementById('owned-buildings').innerText = window.assets.buildings.count.toLocaleString();

    // 시세 업데이트
    document.getElementById('coin-price').innerText = window.assets.coin.price.toLocaleString() + "원";
    document.getElementById('stock-price').innerText = window.assets.stock.price.toLocaleString() + "원";
    
    // 부동산 가격 (하드코딩된 값 사용)
    document.getElementById('building1-price').innerText = "10,000,000,000원";
}

// 탭 전환 함수
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.getElementById('tab-' + tabName).style.display = 'block';

    document.querySelectorAll('.tab-menu button').forEach(button => {
        button.style.background = 'var(--stats-bg)';
        button.style.color = 'var(--stats-text)';
    });

    const selectedButton = document.querySelector(`.tab-menu button[onclick="showTab('${tabName}')"]`);
    if (selectedButton) {
        // 특정 탭에 대한 색상 유지 (HTML에 인라인 스타일로 지정된 경우)
        if (tabName === 'investment') {
            selectedButton.style.background = '#f1c40f';
            selectedButton.style.color = '#000';
        } else if (tabName === 'realestate') {
            selectedButton.style.background = '#9b59b6';
            selectedButton.style.color = 'white';
        } else {
            selectedButton.style.background = 'var(--button-bg)';
            selectedButton.style.color = 'var(--button-text)';
        }
    }
}


// 재테크 통합 시세 변동
function updateMarketPrices() {
    // 코인 변동
    const coinChange = (Math.random() * (window.assets.coin.volatility * 2) - window.assets.coin.volatility); 
    window.assets.coin.price = Math.max(1000, Math.floor(window.assets.coin.price * (1 + coinChange)));
    
    // 주식 변동
    const stockChange = (Math.random() * (window.assets.stock.volatility * 2) - window.assets.stock.volatility); 
    window.assets.stock.price = Math.max(100, Math.floor(window.assets.stock.price * (1 + stockChange)));
    
    updateUI();
}

// 부동산 자동 수익 시스템
function applyBuildingIncome() {
    if (window.assets.buildings.count > 0) {
        const totalIncome = window.assets.buildings.count * window.assets.buildings.income;
        window.assets.money += totalIncome;
        addLog(`부동산 수익 +${totalIncome.toLocaleString()}원`);
        updateUI();
        window.saveGameData();
    }
}


// === 게임 액션 함수 ===

function work() {
    window.assets.money += 10000;
    addLog("업무 보상으로 10,000원을 벌었습니다.");
    updateUI();
    window.saveGameData();
}

// 자산 구매 통합 함수
function buyAsset(type) {
    const asset = window.assets[type];
    if (window.assets.money >= asset.price) {
        window.assets.money -= asset.price;
        asset.count++;
        addLog(`${type === 'coin' ? '비트코인' : '한태전자'} 매수 완료: ${asset.price.toLocaleString()}원`);
        updateUI();
        window.saveGameData();
    } else {
        addLog("잔액이 부족합니다!");
    }
}

// 자산 판매 통합 함수
function sellAsset(type) {
    const asset = window.assets[type];
    if (asset.count > 0) {
        window.assets.money += asset.price;
        asset.count--;
        addLog(`${type === 'coin' ? '비트코인' : '한태전자'} 매도 완료: ${asset.price.toLocaleString()}원`);
        updateUI();
        window.saveGameData();
    } else {
        addLog("보유 자산이 없습니다!");
    }
}

// 건물 구매 함수
function buyBuilding(buildingId) {
    const buildingPrice = 10000000000; // 강남 빌딩 가격
    if (window.assets.money >= buildingPrice) {
        window.assets.money -= buildingPrice;
        window.assets.buildings.count++;
        addLog(`강남 빌딩 구매 완료!`);
        updateUI();
        window.saveGameData();
    } else {
        addLog("잔액이 부족합니다!");
    }
}

// 로그 추가 함수
function addLog(msg) {
    const logBox = document.getElementById('log');
    // 최신 로그가 위에 오도록
    logBox.innerHTML = `> ${msg}<br>${logBox.innerHTML}`;
    // 로그가 너무 길어지면 오래된 로그 제거
    while (logBox.children.length > 50) {
        logBox.removeChild(logBox.lastChild);
    }
}

// === 테마 관리 로직 ===
document.addEventListener('DOMContentLoaded', () => {
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

