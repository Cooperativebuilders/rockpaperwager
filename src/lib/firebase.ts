
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getAnalytics, Analytics } from "firebase/analytics"; // Optional: if you want analytics

// IMPORTANT:
// REPLACE THE PLACEHOLDER VALUES BELOW WITH YOUR ACTUAL FIREBASE PROJECT CONFIGURATION.
// You can find these in your Firebase project settings in the Firebase Console.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // <--- REPLACE
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // <--- REPLACE
  projectId: "YOUR_PROJECT_ID", // <--- REPLACE
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // <--- REPLACE
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // <--- REPLACE
  appId: "YOUR_APP_ID", // <--- REPLACE
  // measurementId: "YOUR_MEASUREMENT_ID" // Optional: if you use Google Analytics
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
