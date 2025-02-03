import { initializeApp,  } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDkwvMTSqRnB57sKjPfNE_UMjrnBDURzDI",
  authDomain: "garden-app-63f67.firebaseapp.com",
  projectId: "garden-app-63f67",
  storageBucket: "garden-app-63f67.firebasestorage.app",
  messagingSenderId: "448937654330",
  appId: "1:448937654330:web:3e2dcad6e5fa3becaf5d03",
  measurementId: "G-DXFTP95XGW"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);

const auth = getAuth(app);

export { auth, db };
