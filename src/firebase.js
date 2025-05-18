import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAPyUgOHU0CuvKNiarzd7SQlLZljB3U8QA",
    authDomain: "student-attendance-22e4e.firebaseapp.com",
    databaseURL: "https://student-attendance-22e4e-default-rtdb.firebaseio.com",
    projectId: "student-attendance-22e4e",
    storageBucket: "student-attendance-22e4e.firebasestorage.app",
    messagingSenderId: "794986224873",
    appId: "1:794986224873:web:557349816d652f2e436478",
    measurementId: "G-9QBT5SW516"
    //   apiKey: "YOUR_API_KEY",
    //   authDomain: "YOUR_AUTH_DOMAIN",
    //   projectId: "YOUR_PROJECT_ID",
    //   storageBucket: "YOUR_STORAGE_BUCKET",
    //   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    //   appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const dbs = getDatabase(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { dbs, db, auth ,analytics};