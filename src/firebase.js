import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAm_rHG_AKPm9wytklPuvPyCRcH2pIxvw4",
  authDomain: "salon-chillo.firebaseapp.com",
  projectId: "salon-chillo",
  storageBucket: "salon-chillo.firebasestorage.app",
  messagingSenderId: "1073189377000",
  appId: "1:1073189377000:web:25ab95d4d11a5ac8ae8a5d"
};

// Firebase アプリの初期化
const app = initializeApp(firebaseConfig);

// Firestore のインスタンスを取得
export const db = getFirestore(app);

// Firebase Authentication のインスタンスを取得
export const auth = getAuth(app);

// Google 認証プロバイダを作成
export const googleAuthProvider = new GoogleAuthProvider();

export default app;
