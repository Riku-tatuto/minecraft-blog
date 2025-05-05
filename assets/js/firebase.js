// Import Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getFirestore, doc, getDoc, updateDoc, increment, getDocs, collection } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyCgKYxdOg2jEEltsACaN6Wp8K-Z2iX18f4",
  authDomain: "minecraft-tatuto-blog.firebaseapp.com",
  projectId: "minecraft-tatuto-blog",
  storageBucket: "minecraft-tatuto-blog.firebasestorage.app",
  messagingSenderId: "63127091394",
  appId: "1:63127091394:web:e018675b35f4d07a2a235b"
};

// 初期化
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
