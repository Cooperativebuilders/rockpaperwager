
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getAnalytics, Analytics } from "firebase/analytics"; // Optional: if you want analytics

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3StV1wQr6YYbj8rnP7Y2iTnE5gFL-tmo",
  authDomain: "rock-paper-wager.firebaseapp.com",
  projectId: "rock-paper-wager",
  storageBucket: "rock-paper-wager.firebasestorage.app",
  messagingSenderId: "279365393217",
  appId: "1:279365393217:web:8a291134bab4bba51a1fc0"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
// let analytics: Analytics; // Optional

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);
// if (typeof window !== 'undefined') { // Optional: Initialize analytics only on client side
//   analytics = getAnalytics(app);
// }

export { app, auth, db }; // Optionally export analytics
