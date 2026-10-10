importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// TODO: Replace with your app's Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyAeV8b6f45_3c2ksc69Xx-U4Zy6yKcxo6o",
  authDomain: "hora-379ab.firebaseapp.com",
  projectId: "hora-379ab",
  storageBucket: "hora-379ab.firebasestorage.app",
  messagingSenderId: "545787711672",
  appId: "1:545787711672:web:47fe2f098e71936033a44d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // Firebase/browser handles notification payloads.
  // Do not show a second notification for the same payload.
  if (payload.notification) {
    return;
  }

  // Data-only web push messages need a notification created here.
  const data = payload.data || {};
  const title = data.title || 'HORA Notification';
  const body = data.body || 'You have a new notification.';
  const url =
    typeof data.url === 'string' &&
    data.url.startsWith('/') &&
    !data.url.startsWith('//')
      ? data.url
      : '/supplier-new-order';

  return self.registration.showNotification(title, {
    body,
    icon: '/icon-192x192.png',
    data: { url },
    tag: data.notificationId || undefined,
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const requestedUrl = event.notification.data?.url;
  const url =
    typeof requestedUrl === 'string' &&
    requestedUrl.startsWith('/') &&
    !requestedUrl.startsWith('//')
      ? requestedUrl
      : '/supplier-new-order';

  const targetUrl = new URL(url, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      for (const client of windows) {
        if (client.url.startsWith(self.location.origin)) {
          await client.focus();

          client.postMessage({
            type: 'HORA_NOTIFICATION_CLICK',
            url,
          });

          return;
        }
      }

      await self.clients.openWindow(targetUrl);
    })()
  );
});