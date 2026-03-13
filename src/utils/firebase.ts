import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB7LLGwZ7GNeRMV0tDQW74ZGvEz9yXyJ0U",
  authDomain: "work-9c5d0.firebaseapp.com",
  projectId: "work-9c5d0",
  storageBucket: "work-9c5d0.firebasestorage.app",
  messagingSenderId: "1000902118491",
  appId: "1:1000902118491:web:c6ff9bb8c4e3472f5cc37e",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
