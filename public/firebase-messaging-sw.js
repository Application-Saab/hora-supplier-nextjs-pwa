importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// TODO: Replace with your app's Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyD8mkyjHXX_fGcdENJJnU3GWI60YWMItl0",
  authDomain: "wonderland-inapp-chat.firebaseapp.com",
  projectId: "wonderland-inapp-chat",
  storageBucket: "wonderland-inapp-chat.firebasestorage.app",
  messagingSenderId: "336745779010",
  appId: "1:336745779010:web:0f2125b937da40189942db",
  measurementId: "G-QF6S6NZQL6"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png', // You can customize this
    data: {
      url: '/supplier-new-order', // Hardcoded URL to open on click
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click event
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/supplier-new-order';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        // If there's already a tab/window open with the URL, focus it.
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new tab/window with the URL.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
