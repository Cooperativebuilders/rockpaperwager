
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// IMPORTANT: ENSURE THESE VALUES ARE CORRECT AND MATCH YOUR FIREBASE PROJECT
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

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized."); // Kept this one as it's less sensitive and indicates initialization
} else {
  app = getApp();
  console.log("Firebase app already initialized."); // Kept this one
}

auth = getAuth(app);
db = getFirestore(app);

export { app, auth, db };
