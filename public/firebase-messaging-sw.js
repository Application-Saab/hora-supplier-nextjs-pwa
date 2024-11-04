// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyAvoh6rojnXiMdttgNZEKgP7cozasAJr1s",
    authDomain: "pwahora.firebaseapp.com",
    projectId: "pwahora",
    storageBucket: "pwahora.firebasestorage.app",
    messagingSenderId: "752958079912",
    appId: "1:752958079912:web:92d4a1c158fb98d1f7d39d",
    measurementId: "G-KG09N155ND"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Received background message ', payload);
    // Customize notification here
});
