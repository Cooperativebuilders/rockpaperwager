
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
// import { getAnalytics, Analytics } from "firebase/analytics"; // Optional: if you want analytics

// Your web app's Firebase configuration
// IMPORTANT: Replace these with your actual Firebase project's configuration!
const firebaseConfig = {
  apiKey: "YOUR_NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "YOUR_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_NEXT_PUBLIC_FIREBASE_APP_ID",
  // measurementId: "YOUR_NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" // Optional: if you want analytics
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
