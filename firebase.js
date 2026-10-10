// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAeV8b6f45_3c2ksc69Xx-U4Zy6yKcxo6o",
  authDomain: "hora-379ab.firebaseapp.com",
  projectId: "hora-379ab",
  storageBucket: "hora-379ab.firebasestorage.app",
  messagingSenderId: "545787711672",
  appId: "1:545787711672:web:47fe2f098e71936033a44d"
  };

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export { app };


