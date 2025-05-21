import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseApp,
} from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  initializeFirestore,
  enableIndexedDbPersistence,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

/* -------------------------------------------------------------------------- */
/* Config                                                                     */
/* -------------------------------------------------------------------------- */
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

/* -------------------------------------------------------------------------- */
/* Bootstrap                                                                  */
/* -------------------------------------------------------------------------- */
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth: Auth       = getAuth(app);

/* -------------------------------------------------------------------------- */
/* Firestore (safe defaults for SSR & dev hot-reloads)                        */
/* -------------------------------------------------------------------------- */
const db: Firestore = initializeFirestore(app, {
  // First-paint speed & tab-to-tab sync
  localCache: persistentLocalCache(persistentMultipleTabManager()),

  // Force long-polling when running server-side (e.g. Next.js API routes)
  experimentalForceLongPolling: typeof window === "undefined",
});

/* Enable IndexedDB persistence only in the browser */
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch(() => {
    /* ignore “failed-precondition” when multiple tabs are open */
  });
}

export { app, auth, db };
