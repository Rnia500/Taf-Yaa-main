// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAALCHC5ZLA-My7HsXwLEZnhgmSrAeaZDI",
  authDomain: "taf-yaa.firebaseapp.com",
  projectId: "taf-yaa",
  storageBucket: "taf-yaa.firebasestorage.app",
  messagingSenderId: "850737718221",
  appId: "1:850737718221:web:11e4ea55972db14ebd9a84",
  measurementId: "G-ZCT8H83EJR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);