window.isGuestMode = false;
let taxTimer = 60; // 60초마다 징수
let taxInterval;
let priceUpdateInterval;
let buildingIncomeInterval;
let autoSaveInterval;
let isGameRunning = false; // 전역으로 선언하고 false로 초기화

// 게스트 모드 시작 함수
function startAsGuest() {
    console.log("startAsGuest called.");
    window.isGuestMode = true;
    // 게스트 모드일 때는 항상 초기 자산으로 리셋
    window.assets = {
        money: 1000000,
        coin: { count: 0, price: 50000000, volatility: 0.2 },
        stock: { count: 0, price: 70000, volatility: 0.05 },
        buildings: { count: 0, income: 500000 }
    };
    startGame('게스트');
    addLog('게스트 모드는 데이터가 저장되지 않습니다.');
}

// 게임 시작 함수
function startGame(userDisplayName) {
    console.log("startGame called with:", userDisplayName);
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('game-main').style.display = 'block';
    document.getElementById('user-info').innerText = `사용자: ${userDisplayName}`;
    
    // 기존 인터벌이 있다면 제거 (중복 실행 방지)
    if (priceUpdateInterval) clearInterval(priceUpdateInterval);
    if (buildingIncomeInterval) clearInterval(buildingIncomeInterval);
    if (autoSaveInterval) clearInterval(autoSaveInterval);
    if (taxInterval) clearInterval(taxInterval); // 세금 타이머 클리어

    isGameRunning = true; // 게임 실행 상태 설정

    // UI 초기화 및 탭 표시
    updateUI();
    showTab('work'); 

    // 시세 변동 및 부동산 수익 시작
    priceUpdateInterval = setInterval(updateMarketPrices, 3000);
    buildingIncomeInterval = setInterval(applyBuildingIncome, 1000);
    
    if (!window.isGuestMode) {
        autoSaveInterval = setInterval(window.saveGameData, 5000);
    }

    // 세금 타이머 시작
    taxTimer = 60; // 타이머 초기화
    taxInterval = setInterval(() => {
        if (!isGameRunning) return;
        console.log("Tax interval ticking. taxTimer:", taxTimer);
        taxTimer--;
        const taxInfo = calculateTax();
        
        document.getElementById('tax-timer').innerText = taxTimer + "초";
        document.getElementById('expected-tax').innerText = taxInfo.amount.toLocaleString() + "원";
        document.getElementById('tax-rate').innerText = taxInfo.rate + "%";

        if (taxTimer <= 0) {
            collectTax(taxInfo.amount);
            taxTimer = 60; // 타이머 초기화
        }
    }, 1000);
}

// UI 업데이트 함수
function updateUI() {
    console.log("updateUI called. Current assets:", window.assets);
    document.getElementById('money').innerText = window.assets.money.toLocaleString() + "원";
    document.getElementById('owned-coin').innerText = window.assets.coin.count.toLocaleString();
    document.getElementById('owned-stock').innerText = window.assets.stock.count.toLocaleString();
    document.getElementById('owned-buildings').innerText = window.assets.buildings.count.toLocaleString();

    document.getElementById('coin-price').innerText = window.assets.coin.price.toLocaleString() + "원";
    document.getElementById('stock-price').innerText = window.assets.stock.price.toLocaleString() + "원";
    
    document.getElementById('building1-price').innerText = "10,000,000,000원";

    // 세금 정보도 업데이트 (초기 로드 시)
    const taxInfo = calculateTax();
    document.getElementById('expected-tax').innerText = taxInfo.amount.toLocaleString() + "원";
    document.getElementById('tax-rate').innerText = taxInfo.rate + "%";
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
    console.log("updateMarketPrices called.");
    const coinChange = (Math.random() * (window.assets.coin.volatility * 2) - window.assets.coin.volatility); 
    window.assets.coin.price = Math.max(1000, Math.floor(window.assets.coin.price * (1 + coinChange)));
    
    const stockChange = (Math.random() * (window.assets.stock.volatility * 2) - window.assets.stock.volatility); 
    window.assets.stock.price = Math.max(100, Math.floor(window.assets.stock.price * (1 + stockChange)));
    
    updateUI();
}

// 부동산 자동 수익 시스템
function applyBuildingIncome() {
    console.log("applyBuildingIncome called.");
    if (window.assets.buildings.count > 0) {
        const totalIncome = window.assets.buildings.count * window.assets.buildings.income;
        window.assets.money += totalIncome;
        addLog(`부동산 수익 +${totalIncome.toLocaleString()}원`);
        updateUI();
        if (!window.isGuestMode) window.saveGameData();
    }
}

// 1. 세율 계산 함수 (누진세 적용)
function calculateTax() {
    let rate = 0;
    const totalAssets = window.assets.money + (window.assets.coin.count * window.assets.coin.price) + (window.assets.stock.count * window.assets.stock.price) + (window.assets.buildings.count * 10000000000); // 빌딩 가격 합산

    if (totalAssets < 10000000) rate = 0.05;       // 1천만 원 미만: 5%
    else if (totalAssets < 100000000) rate = 0.15; // 1억 미만: 15%
    else if (totalAssets < 1000000000) rate = 0.3; // 10억 미만: 30%
    else rate = 0.5;                               // 10억 이상: 50% (부유세)

    const expectedTax = Math.floor(totalAssets * rate);
    return { rate: rate * 100, amount: expectedTax };
}

// 3. 실제 징수 함수
function collectTax(amount) {
    if (window.assets.money >= amount) {
        window.assets.money -= amount;
        addLog(`[국세청] 정기 재산세 ${amount.toLocaleString()}원이 징수되었습니다.`, "#e74c3c");
    } else {
        // 현금이 부족할 경우 강제 압류 로직 (보유 주식/코인 매각)
        window.assets.money = 0; // 일단 현금은 0으로 만들고
        addLog(`[국세청] 현금 부족으로 자산 일부가 압류 및 강제 징수되었습니다!`, "#e74c3c");
        // 여기에 주식이나 코인 개수를 줄이는 로직을 추가할 수 있습니다.
        // 예를 들어, 부족한 금액만큼 코인/주식을 강제 매도하는 로직
    }
    updateUI();
    if (!window.isGuestMode) window.saveGameData();
}


// === 게임 액션 함수 ===

function work() {
    window.assets.money += 10000;
    addLog("업무 보상으로 10,000원을 벌었습니다.");
    updateUI();
    if (!window.isGuestMode) window.saveGameData();
}

// 자산 구매 통합 함수
function buyAsset(type) {
    const asset = window.assets[type];
    if (window.assets.money >= asset.price) {
        window.assets.money -= asset.price;
        asset.count++;
        addLog(`${type === 'coin' ? '비트코인' : '한태전자'} 매수 완료: ${asset.price.toLocaleString()}원`);
        updateUI();
        if (!window.isGuestMode) window.saveGameData();
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
        if (!window.isGuestMode) window.saveGameData();
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
        if (!window.isGuestMode) window.saveGameData();
    } else {
        addLog("잔액이 부족합니다!");
    }
}

// 로그 추가 함수
function addLog(msg, color = '#7f8c8d') {
    const logBox = document.getElementById('log');
    const logEntry = document.createElement('div');
    logEntry.style.color = color;
    logEntry.innerHTML = `> ${msg}`;
    logBox.prepend(logEntry); // 최신 로그가 위에 오도록
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