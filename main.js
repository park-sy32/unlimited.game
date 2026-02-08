// 전역으로 게임 상태 관리 (Firebase에서 로드되거나 초기화될 예정)
window.isGuestMode = false;
window.assets = {
    money: 1000000,
    // 주식 10종목 (성격별 분류)
    stocks: [
        { id: 's1', name: '한태전자', price: 72000, count: 0, volt: 0.03, desc: '국가 대표 우량주' },
        { id: 's2', name: 'K-자동차', price: 180000, count: 0, volt: 0.04, desc: '안정적인 제조기업' },
        { id: 's3', name: '네오버', price: 210000, count: 0, volt: 0.05, desc: 'IT 플랫폼 대장주' },
        { id: 's4', name: '바이오진', price: 45000, count: 0, volt: 0.12, desc: '신약 개발 테마주' },
        { id: 's5', name: '우주항공', price: 320000, count: 0, volt: 0.08, desc: '미래 핵심 기술주' },
        { id: 's6', name: '한태건설', price: 12000, count: 0, volt: 0.06, desc: '부동산 경기 민감주' },
        { id: 's7', name: '엔터테인', price: 85000, count: 0, volt: 0.09, desc: 'K-컬처 주역' },
        { id: 's8', name: '푸드뱅크', price: 32000, count: 0, volt: 0.02, desc: '경기 불황 방어주' },
        { id: 's9', name: '배터리업', price: 540000, count: 0, volt: 0.15, desc: '고수익 에너지주' },
        { id: 's10', name: '개미지옥', price: 5000, count: 0, volt: 0.25, desc: '상장폐지 위기 종목' }
    ],
    // 코인 5종목
    coins: [
        { id: 'c1', name: '비트코인', price: 65000000, count: 0, volt: 0.15, desc: '디지털 금' },
        { id: 'c2', name: '이더리움', price: 3500000, count: 0, volt: 0.18, desc: '스마트 컨트랙트' },
        { id: 'c3', name: '리플코인', price: 800, count: 0, volt: 0.25, desc: '송금용 가상자산' },
        { id: 'c4', name: '도지코인', price: 150, count: 0, volt: 0.40, desc: '밈 코인의 조상' },
        { id: 'c5', name: '한태코인', price: 10, count: 0, volt: 0.80, desc: '인생 역전 아니면 파산' }
    ],
    buildings: []
};

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
        // 주식 10종목 (성격별 분류) - 초기화 시에도 전체 구조 유지
        stocks: [
            { id: 's1', name: '한태전자', price: 72000, count: 0, volt: 0.03, desc: '국가 대표 우량주' },
            { id: 's2', name: 'K-자동차', price: 180000, count: 0, volt: 0.04, desc: '안정적인 제조기업' },
            { id: 's3', name: '네오버', price: 210000, count: 0, volt: 0.05, desc: 'IT 플랫폼 대장주' },
            { id: 's4', name: '바이오진', price: 45000, count: 0, volt: 0.12, desc: '신약 개발 테마주' },
            { id: 's5', name: '우주항공', price: 320000, count: 0, volt: 0.08, desc: '미래 핵심 기술주' },
            { id: 's6', name: '한태건설', price: 12000, count: 0, volt: 0.06, desc: '부동산 경기 민감주' },
            { id: 's7', name: '엔터테인', price: 85000, count: 0, volt: 0.09, desc: 'K-컬처 주역' },
            { id: 's8', name: '푸드뱅크', price: 32000, count: 0, volt: 0.02, desc: '경기 불황 방어주' },
            { id: 's9', name: '배터리업', price: 540000, count: 0, volt: 0.15, desc: '고수익 에너지주' },
            { id: 's10', name: '개미지옥', price: 5000, count: 0, volt: 0.25, desc: '상장폐지 위기 종목' }
        ],
        // 코인 5종목 - 초기화 시에도 전체 구조 유지
        coins: [
            { id: 'c1', name: '비트코인', price: 65000000, count: 0, volt: 0.15, desc: '디지털 금' },
            { id: 'c2', name: '이더리움', price: 3500000, count: 0, volt: 0.18, desc: '스마트 컨트랙트' },
            { id: 'c3', name: '리플코인', price: 800, count: 0, volt: 0.25, desc: '송금용 가상자산' },
            { id: 'c4', name: '도지코인', price: 150, count: 0, volt: 0.40, desc: '밈 코인의 조상' },
            { id: 'c5', name: '한태코인', price: 10, count: 0, volt: 0.80, desc: '인생 역전 아니면 파산' }
        ],
        buildings: []
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
    renderMarket(); // 시장 정보를 그립니다.
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
    
    // 보유 자산 개수 업데이트 (주식 및 코인은 개별 종목의 합산)
    const totalStocksCount = window.assets.stocks.reduce((sum, s) => sum + s.count, 0);
    const totalCoinsCount = window.assets.coins.reduce((sum, c) => sum + c.count, 0);

    document.getElementById('owned-stock').innerText = totalStocksCount.toLocaleString();
    document.getElementById('owned-coin').innerText = totalCoinsCount.toLocaleString();
    document.getElementById('owned-buildings').innerText = window.assets.buildings.length.toLocaleString(); // buildings는 배열이므로 length 사용

    // 시장 가격 업데이트는 renderMarket에서 처리되므로 여기서는 생략
    // 세금 정보도 업데이트 (초기 로드 시)
    const taxInfo = calculateTax();
    document.getElementById('expected-tax').innerText = taxInfo.amount.toLocaleString() + "원";
    document.getElementById('tax-rate').innerText = taxInfo.rate + "%";
}

// 리스트 그리기 함수
function renderMarket() {
    console.log("renderMarket called.");
    const sContainer = document.getElementById('stock-list-container');
    const cContainer = document.getElementById('coin-list-container');
    
    // 주식 리스트 생성
    sContainer.innerHTML = window.assets.stocks.map(s => `
        <div class="invest-item" style="border-bottom: 1px solid var(--log-border); padding: 10px 0;">
            <strong>${s.name}</strong> <span id="price-${s.id}">${s.price.toLocaleString()}원</span>
            <br><small>${s.desc} (보유: ${s.count}주)</small>
            <div style="margin-top:5px;">
                <button onclick="trade('stocks', '${s.id}', 'buy')">매수</button>
                <button onclick="trade('stocks', '${s.id}', 'sell')">매도</button>
            </div>
        </div>
    `).join('');

    // 코인 리스트 생성 (동일 방식)
    cContainer.innerHTML = window.assets.coins.map(c => `
        <div class="invest-item" style="border-bottom: 1px solid var(--log-border); padding: 10px 0;">
            <strong>${c.name}</strong> <span id="price-${c.id}">${c.price.toLocaleString()}원</span>
            <br><small>${c.desc} (보유: ${c.count}개)</small>
            <div style="margin-top:5px;">
                <button onclick="trade('coins', '${c.id}', 'buy')">매수</button>
                <button onclick="trade('coins', '${c.id}', 'sell')">매도</button>
            </div>
        </div>
    `).join('');
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
    const MAX_STOCK_CHANGE = 0.30; // 30%

    // 주식 가격 변동
    window.assets.stocks.forEach(s => {
        let change = (Math.random() * (s.volt * 2) - s.volt); // -volt ~ +volt
        // 주식은 최대 30% 상승/하락 제한
        change = Math.min(Math.max(change, -MAX_STOCK_CHANGE), MAX_STOCK_CHANGE);
        
        s.price = Math.max(100, Math.floor(s.price * (1 + change)));
        // 개별 주식 가격 업데이트 (UI)
        const priceElement = document.getElementById(`price-${s.id}`);
        if (priceElement) priceElement.innerText = s.price.toLocaleString() + "원";
    });

    // 코인 가격 변동
    window.assets.coins.forEach(c => {
        const change = (Math.random() * (c.volt * 2) - c.volt); // -volt ~ +volt
        // 코인은 제한 없이 변동 (최저가 1원)
        c.price = Math.max(1, Math.floor(c.price * (1 + change)));
        // 개별 코인 가격 업데이트 (UI)
        const priceElement = document.getElementById(`price-${c.id}`);
        if (priceElement) priceElement.innerText = c.price.toLocaleString() + "원";
    });
    
    updateUI();
}

// 부동산 자동 수익 시스템
function applyBuildingIncome() {
    console.log("applyBuildingIncome called.");
    if (window.assets.buildings.length > 0) { // buildings가 배열이므로 length 사용
        const totalIncome = window.assets.buildings.length * window.assets.buildings.income; // 이 부분은 buildings 배열 안의 객체들이 income 속성을 가져야 합니다.
        // 현재는 buildings 객체에 income이 없으므로, 모든 빌딩이 동일한 income을 가진다고 가정
        const singleBuildingIncome = 500000; // 강남 빌딩 하나당 초당 50만원 수익
        const totalActualIncome = window.assets.buildings.length * singleBuildingIncome;

        window.assets.money += totalActualIncome;
        addLog(`부동산 수익 +${totalActualIncome.toLocaleString()}원`);
        updateUI();
        if (!window.isGuestMode) window.saveGameData();
    }
}

// 1. 세율 계산 함수 (누진세 적용)
function calculateTax() {
    let rate = 0;
    // 모든 자산 가치 합산
    let totalAssetsValue = window.assets.money;
    window.assets.stocks.forEach(s => { totalAssetsValue += s.count * s.price; });
    window.assets.coins.forEach(c => { totalAssetsValue += c.count * c.price; });
    // 건물은 고정 가격으로 일단 계산 (나중에 buildings 배열 내부에 price 속성 추가 필요)
    totalAssetsValue += window.assets.buildings.length * 10000000000; // 강남 빌딩 가격

    if (totalAssetsValue < 10000000) rate = 0.05;       // 1천만 원 미만: 5%
    else if (totalAssetsValue < 100000000) rate = 0.15; // 1억 미만: 15%
    else if (totalAssetsValue < 1000000000) rate = 0.3; // 10억 미만: 30%
    else rate = 0.5;                               // 10억 이상: 50% (부유세)

    const expectedTax = Math.floor(totalAssetsValue * rate);
    return { rate: rate * 100, amount: expectedTax };
}

// 3. 실제 징수 함수
function collectTax(amount) {
    if (window.assets.money >= amount) {
        window.assets.money -= amount;
        addLog(`[국세청] 정기 재산세 ${amount.toLocaleString()}원이 징수되었습니다.`, "#e74c3c");
    } else {
        // 현금이 부족할 경우 강제 압류 로직 (보유 주식/코인 매각)
        addLog(`[국세청] 현금 부족으로 자산 일부가 압류 및 강제 징수되었습니다!`, "#e74c3c");
        // 현금을 0으로 만들고 부족한 세액만큼 자산을 강제 매각
        let 부족액 = amount - window.assets.money;
        window.assets.money = 0;

        // 코인부터 매각
        for (const coin of window.assets.coins) {
            while (coin.count > 0 && 부족액 > 0) {
                if (부족액 >= coin.price) {
                    coin.count--;
                    부족액 -= coin.price;
                } else {
                    // 코인 일부를 팔아 세금을 충당할 수 없는 경우 (한 개 가격보다 부족액이 적음)
                    // 현재는 그냥 넘어감. 더 복잡한 로직 필요하면 추가
                    break;
                }
            }
            if (부족액 <= 0) break;
        }

        // 주식 매각
        if (부족액 > 0) {
            for (const stock of window.assets.stocks) {
                while (stock.count > 0 && 부족액 > 0) {
                    if (부족액 >= stock.price) {
                        stock.count--;
                        부족액 -= stock.price;
                    } else {
                        break;
                    }
                }
                if (부족액 <= 0) break;
            }
        }
        
        // 그래도 부족하면 건물 압류 (현재는 구현 안함)
        if (부족액 > 0) {
            addLog(`[국세청] 심각한 세금 체납으로 건물 일부가 압류됩니다!`, "#e74c3c");
            // 건물 압류 로직 추가
        }
    }
    updateUI();
    if (!window.isGuestMode) window.saveGameData();
}


// === 게임 액션 함수 ===

// 통합 거래 함수 (매수/매도)
function trade(category, id, action) {
    const list = window.assets[category];
    const item = list.find(i => i.id === id);
    
    if (!item) {
        console.error(`Error: Asset with id ${id} not found in category ${category}`);
        return;
    }

    if (action === 'buy') {
        if (window.assets.money >= item.price) {
            window.assets.money -= item.price;
            item.count++;
            addLog(`${item.name} 매수 완료! (현재 ${item.count} ${category === 'stocks' ? '주' : '개'})`);
        } else { addLog("돈이 부족합니다!"); }
    } else if (action === 'sell') {
        if (item.count > 0) {
            window.assets.money += item.price;
            item.count--;
            addLog(`${item.name} 매도 완료! (현재 ${item.count} ${category === 'stocks' ? '주' : '개'})`);
        } else { addLog("보유 수량이 없습니다!"); }
    } else {
        console.error(`Unknown trade action: ${action}`);
    }
    updateUI();
    renderMarket(); // 개수 업데이트를 위해 다시 그림
    if (!window.isGuestMode) window.saveGameData();
}


function work() {
    window.assets.money += 10000;
    addLog("업무 보상으로 10,000원을 벌었습니다.");
    updateUI();
    if (!window.isGuestMode) window.saveGameData();
}

// 건물 구매 함수
function buyBuilding(buildingId) {
    // buildingId는 추후 여러 건물 타입에 사용될 수 있으나 현재는 '강남 빌딩' 고정
    const buildingPrice = 10000000000; // 강남 빌딩 가격
    if (window.assets.money >= buildingPrice) {
        window.assets.money -= buildingPrice;
        window.assets.buildings.push({ id: `building-${window.assets.buildings.length + 1}`, name: '강남 빌딩', price: buildingPrice, income: 500000 });
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
