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
        window.isGuestMode = false; // 로그인 시도 시 게스트 모드 해제
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("로그인 실패:", error);
        alert("로그인 중 오류가 발생했습니다.");
    }
};

// 3. 유저 상태 감지 (회원가입 여부 확인 및 데이터 로드)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        window.isGuestMode = false; // 로그인된 사용자는 게스트가 아님
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            // 기존 유저: DB에서 데이터 불러오기
            const loadedAssets = userSnap.data().assets;
            // 로드된 데이터와 기본 데이터 구조를 병합하여 누락된 필드 방지
            window.assets = { ...window.assets, ...loadedAssets };
            addLog(`${user.displayName}님, 자산을 성공적으로 불러왔습니다.`);
            startGame(user.displayName);
        } else {
            // 신규 유저: 등록되지 않음
            alert("회원가입이 필요한 사용자입니다. 먼저 회원가입을 진행해주세요.");
            await signOut(auth);
        }
    }
});

// 회원가입 함수 (placeholder)
window.registerUser = async () => {
    // 이 부분은 나중에 구현해야 합니다.
    alert("회원가입 기능은 현재 개발 중입니다.");
    // 1. 구글 팝업으로 사용자 정보 가져오기
    // const result = await signInWithPopup(auth, provider);
    // const user = result.user;
    // 2. DB에 해당 사용자 정보가 이미 있는지 확인
    // const userRef = doc(db, "users", user.uid);
    // const userSnap = await getDoc(userRef);
    // 3. 없다면, DB에 새로운 사용자 데이터 생성
    // if (!userSnap.exists()) {
    //     await setDoc(userRef, {
    //         name: user.displayName,
    //         email: user.email,
    //         assets: window.assets, // 초기 자산 설정
    //         createdAt: new Date()
    //     });
    //     addLog(`반갑습니다, ${user.displayName}님! 회원가입이 완료되었습니다.`);
    //     startGame(user.displayName);
    // } else {
    //     alert("이미 가입된 사용자입니다. 로그인해주세요.");
    //     await signOut(auth);
    // }
};

// 4. 데이터 저장 함수
window.saveGameData = async () => {
    // 게스트 모드이거나 로그인한 유저가 없으면 저장하지 않음
    if (window.isGuestMode || !auth.currentUser) {
        return;
    }
    const userRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(userRef, {
        assets: window.assets // 전체 자산 객체 저장
    }, { merge: true });
};
