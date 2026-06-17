import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAYdYsWwnQ9kTxRR_pUJrSxLiAiZ-OQ9s8",
  authDomain: "e-commerce-fe344.firebaseapp.com",
  projectId: "e-commerce-fe344",
  storageBucket: "e-commerce-fe344.firebasestorage.app",
  messagingSenderId: "1055279559938",
  appId: "1:1055279559938:web:cb59fe59206ea68fa53e1b",
  measurementId: "G-3FT3XHKJKZ",
};

// Check for missing config in development
if (process.env.NODE_ENV !== "production") {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_api_key" || firebaseConfig.apiKey === "") {
    console.warn("Firebase configuration is missing or incomplete. Check your .env.local file.");
  }
}

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Analytics is only supported in browser environments
let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storage, analytics };
