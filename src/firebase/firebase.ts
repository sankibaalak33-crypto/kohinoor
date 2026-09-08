import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Default config fallback with safe public demo identifiers
const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyDemoKohinoorKey1234567890",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "kohinoor-ff-esports.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "kohinoor-ff-esports",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "kohinoor-ff-esports.appspot.com",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "456026034028",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:456026034028:web:kohinoorffe983"
};

let app: any = null;
let auth: any = null;
let db: any = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase initialized with local fallback mode:", error);
}

export { app, auth, db };
