// 기존 게임 로직
let money = 1000000;
let stockCount = 0;
let currentPrice = 10000;
let isGameRunning = false;

// 게임 시작 함수
function startGame(userType) {
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('game-main').style.display = 'block';
    document.getElementById('user-info').innerText = `접속 모드: ${userType}`;
    addLog(`${userType} 모드로 게임을 시작합니다.`);
    isGameRunning = true;
    startPriceUpdate(); // 게임 시작 시 시세 변동 개시
}

function updateUI() {
    document.getElementById('money').innerText = money.toLocaleString() + "원";
    document.getElementById('assets').innerText = `보유 주식: ${stockCount}주`;
    document.getElementById('stock-price').innerText = currentPrice.toLocaleString() + "원";
}

function work() {
    money += 10000;
    addLog("업무 보상으로 10,000원을 벌었습니다.");
    updateUI();
}

function buyStock() {
    if (money >= currentPrice) {
        money -= currentPrice;
        stockCount++;
        addLog(`매수 완료: ${currentPrice.toLocaleString()}원`);
        updateUI();
    } else { addLog("자산이 부족합니다!"); }
}

function sellStock() {
    if (stockCount > 0) {
        money += currentPrice;
        stockCount--;
        addLog(`매도 완료: ${currentPrice.toLocaleString()}원`);
        updateUI();
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

// === 테마 및 모달 관리 로직 ===
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

    // --- 로그인 모달 관리 ---
    const loginButton = document.querySelector('.btn-login');
    const loginModal = document.getElementById('login-modal');
    const closeModalButton = document.querySelector('.btn-close-modal');
    const loginForm = document.getElementById('login-form');

    function showLoginModal() {
        loginModal.classList.remove('hidden');
    }

    function hideLoginModal() {
        loginModal.classList.add('hidden');
    }

    loginButton.addEventListener('click', showLoginModal);
    closeModalButton.addEventListener('click', hideLoginModal);

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        alert('로그인 되었습니다! (현재는 시뮬레이션)');
        // 실제 로그인을 하게 된다면 여기서 사용자 이름을 받아 게임을 시작할 수 있습니다.
        // 예: startGame('사용자ID');
        hideLoginModal();
    });

    // 모달 외부 클릭 시 닫기
    loginModal.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            hideLoginModal();
        }
    });
});
