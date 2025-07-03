// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLW1pMnrz9GDb8Ng2JNhtkiK0vpKl4PWc",
  authDomain: "mymindscape-4573a.firebaseapp.com",
  projectId: "mymindscape-4573a",
  storageBucket: "mymindscape-4573a.firebasestorage.app",
  messagingSenderId: "904351736897",
  appId: "1:904351736897:web:f18b995ba4af9cee2052c0",
  measurementId: "G-EM0W8WY98M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);