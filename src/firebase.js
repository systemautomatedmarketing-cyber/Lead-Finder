// src/firebase.js
// ─────────────────────────────────────────────────────────────
//  Sostituisci i valori qui sotto con quelli del tuo progetto
//  Firebase Console → Project Settings → Your apps → SDK setup
// ─────────────────────────────────────────────────────────────
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKdhPqwoVf-6w7yAGdo1UjqpoVc6UxKIo",
  authDomain: "lead-finder-b5602.firebaseapp.com",
  projectId: "lead-finder-b5602",
  storageBucket: "lead-finder-b5602.firebasestorage.app",
  messagingSenderId: "707007713023",
  appId: "1:707007713023:web:d44f11f573035e0889c6ca",
  measurementId: "G-EEZ2486W3T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db   = getFirestore(app);

