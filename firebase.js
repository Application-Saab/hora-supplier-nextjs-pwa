// // Import the functions you need from the SDKs you need
// import { initializeApp } from 'firebase/app';
// import { getMessaging } from 'firebase/messaging';

// // TODO: Replace the following with your app's Firebase project configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyAeV8b6f45_3c2ksc69Xx-U4Zy6yKcxo6o",
//   authDomain: "hora-379ab.firebaseapp.com",
//   projectId: "hora-379ab",
//   storageBucket: "hora-379ab.firebasestorage.app",
//   messagingSenderId: "545787711672",
//   appId: "1:545787711672:web:47fe2f098e71936033a44d"
//   };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Firebase Cloud Messaging and get a reference to the service
// const messaging = getMessaging(app);

// export { app, messaging }; 



import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAeV8b6f45_3c2ksc69Xx-U4Zy6yKcxo6o",
  authDomain: "hora-379ab.firebaseapp.com",
  projectId: "hora-379ab",
  storageBucket: "hora-379ab.firebasestorage.app",
  messagingSenderId: "545787711672",
  appId: "1:545787711672:web:47fe2f098e71936033a44d"
};

const app = initializeApp(firebaseConfig);
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      // Replace this with your actual VAPID key from Firebase Console
      vapidKey: 'BA2t83CZFyh7Wjrif8RzKo1O4UBuks2MmNegk2RiKLccW5m-Ep9ZHupUc8cG4sYP-VOGD9DUhOtJFzqV9lyvUVs' 
    });
    if (currentToken) {
      console.log('Token generated:', currentToken);
      localStorage.setItem("fmcToken", currentToken); // Saving to your key
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
  }
};

// This handles foreground messages (when the app is open in the browser tab)
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { app, messaging };