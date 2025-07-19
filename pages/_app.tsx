import '../styles/globals.css'
import type { AppProps } from 'next/app'
import '../styles/login.css';
import './orders-details/OrderDashboard.css';
import { useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../apiconstant/apiconstant';

// Only import firebase modules on the client side
if (typeof window !== 'undefined') {
  import('../firebase').then(({ messaging }) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .catch((err: unknown) => {
          console.error('Service Worker registration failed:', err);
        });
    }
  });
}

function isUserLoggedIn() {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('token');
  return !!token;
}

async function sendFcmTokenToBackend(tokenValue: string) {
  try {
    localStorage.setItem("fmcToken",tokenValue)  
    console.log('FCM token sent to backend');
  } catch (err) {
    console.error('Failed to send FCM token to backend:', err);
  }
}

function useCapacitorPushNotifications() {
  useEffect(() => {
    console.log("--------");
    
    if (typeof window === 'undefined' || !(window as any).Capacitor) return;
    import('@capacitor/push-notifications').then(({ PushNotifications }) => {
      PushNotifications.requestPermissions().then((result: any) => {
        if (result.receive === 'granted') {
          PushNotifications.register();
        }
      });

      PushNotifications.addListener('registration', (token: { value: string }) => {
        console.log('Push registration success, token: ' + token.value);
        sendFcmTokenToBackend(token.value);
      });

      PushNotifications.addListener('registrationError', (err: any) => {
        console.error('Push registration error: ', err.error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
        console.log('Push received: ', notification);
        // Optionally, show a toast or update UI
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
        console.log('Push action performed: ', notification);
        // Handle notification tap
      });
    });
  }, []);
}


export default function App({ Component, pageProps }: AppProps) {
  useCapacitorPushNotifications();

  return <Component {...pageProps} />
}
