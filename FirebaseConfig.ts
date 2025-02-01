// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkwvMTSqRnB57sKjPfNE_UMjrnBDURzDI",
  authDomain: "garden-app-63f67.firebaseapp.com",
  projectId: "garden-app-63f67",
  storageBucket: "garden-app-63f67.firebasestorage.app",
  messagingSenderId: "448937654330",
  appId: "1:448937654330:web:3e2dcad6e5fa3becaf5d03",
  measurementId: "G-DXFTP95XGW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);