// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCCXSgvHZYBrE-a5yKy4_RZ4DgEgb9p_3E",
  authDomain: "taf-yaa-3eb6f.firebaseapp.com",
  projectId: "taf-yaa-3eb6f",
  storageBucket: "taf-yaa-3eb6f.firebasestorage.app",
  messagingSenderId: "710407575853",
  appId: "1:710407575853:web:01edcc1d65c96be6721ba4",
  measurementId: "G-QBMWYJG1KY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
// export const storage = getStorage(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    // connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    console.log('Emulator connection error:', error);
  }
}

export default app;
