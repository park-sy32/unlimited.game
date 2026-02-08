import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. 한태님의 Firebase 설정값 (콘솔에서 복사해오세요)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "unlimited-hantae.firebaseapp.com",
    projectId: "unlimited-hantae",
    storageBucket: "unlimited-hantae.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// 2. 구글 로그인 함수
window.loginWithGoogle = async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("로그인 실패:", error);
        alert("로그인 중 오류가 발생했습니다.");
    }
};

// 3. 유저 상태 감지 (회원가입 여부 확인 및 데이터 로드)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid); // 유저 고유 ID로 문서 참조
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            // 기존 유저: DB에서 데이터 불러오기
            window.money = userSnap.data().money;
            window.stockCount = userSnap.data().stockCount;
            addLog(`${user.displayName}님, 자산을 성공적으로 불러왔습니다.`);
            startGame(user.displayName);
        } else {
            // 신규 유저: доступ запрещен
            alert("회원가입이 필요한 사용자입니다. 먼저 회원가입을 진행해주세요.");
            await signOut(auth);
        }
    }
});

// 회원가입 함수 (placeholder)
window.registerUser = async () => {
    // 이 부분은 나중에 구현해야 합니다.
    // 1. 구글 팝업으로 사용자 정보 가져오기
    // 2. DB에 해당 사용자 정보가 이미 있는지 확인
    // 3. 없다면, DB에 새로운 사용자 데이터 생성
    alert("회원가입 기능은 현재 개발 중입니다.");
};


// 4. 데이터 저장 함수 (돈이 변할 때마다 호출)
window.saveGameData = async () => {
    if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, {
            money: window.money,
            stockCount: window.stockCount
        }, { merge: true }); // 기존 데이터에 덮어쓰기
    }
};
