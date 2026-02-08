window.isGuestMode = false;
let taxTimer = 60; // 60초마다 징수
let taxInterval;

// 게스트 모드 시작 함수
function startAsGuest() {
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

// ... (다른 함수들은 그대로 유지)

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

