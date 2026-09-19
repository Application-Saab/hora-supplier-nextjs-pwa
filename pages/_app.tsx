import '../styles/globals.css'
import type { AppProps } from 'next/app'
import '../styles/login.css';
import './orders-details/OrderDashboard.css';
import { useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../apiconstant/apiconstant';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';
import '../component/OrderList/orderlist.css';

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
   console.log('FCM token sent to backend');
  try {
    localStorage.setItem("fmcToken",tokenValue)  
    console.log('FCM token sent to backend');
  } catch (err) {
    console.error('Failed to send FCM token to backend:', err);
  }
}



function useNotificationAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback(async (sound = 'notification') => {
    try {
      if (!audioRef.current) {
        console.log('Audio element not available');
        return;
      }

      audioRef.current.src =
        sound === 'emergency_notification'
          ? '/emergency_notification.mp3'
          : '/notification.mp3';

      audioRef.current.currentTime = 0;

      await audioRef.current.play();

      console.log(`Notification sound played: ${sound}`);
    } catch (error) {
      console.error('Could not play notification sound:', error);
    }
  }, []);

  return { audioRef, playSound };
}

function useCapacitorPushNotifications(playSound: (sound?: string) => void) {
  const router = useRouter();
  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).Capacitor) return;

    import('@capacitor/push-notifications').then(({ PushNotifications }) => {
      PushNotifications.requestPermissions().then((result: any) => {
        if (result.receive === 'granted') {
          PushNotifications.register();
        }
      });
      


      PushNotifications.createChannel({
      id: 'fcm_custom_sound_channel_v2',
      name: 'Custom Sound Notifications',
      description: 'Notifications with custom sound',
      importance: 4,
      sound: 'notification',
      visibility: 1,
      vibration: true,
      }).then(() => {
        console.log('Push notification channel created');
      }).catch(err => {
        console.error('Push notification channel creation failed:', err);
      });

      PushNotifications.createChannel({
        id: 'fcm_emergency_sound_channel',
        name: 'Emergency Order Notifications',
        description: 'Emergency sound for payment pending orders',
        importance: 4,
        sound: 'emergency_notification',
        visibility: 1,
        vibration: true,
      })
        .then(() => {
          console.log('Emergency notification channel created');
        })
        .catch(err => {
          console.error('Emergency notification channel creation failed:', err);
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
          if (
            !(window as any)._lastNotificationTime ||
            Date.now() - (window as any)._lastNotificationTime > 5000
          ) {
            (window as any)._lastNotificationTime = Date.now();

            const title = notification.title || 'Notification';
            const body = notification.body || '';

            const sound =
              notification?.data?.sound || 'notification';

            console.log('Notification sound:', sound);

            toast.info(
              <div>
                <b>{title}</b>
                <div>{body}</div>
              </div>
            );

            playSound(sound);
          }
        }
      );

      PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
        const url =
        notification?.notification?.data?.url ||
        notification?.data?.url ||
        '/supplier-new-order';

        // Handle notification tap: navigate to /new-order
        if (typeof window !== 'undefined') {
          // window.location.href = '/supplier-new-order';
          router.push(url);
        }
      });
    });
  }, [playSound]);

}


export default function App({ Component, pageProps }: AppProps) {
  const { audioRef, playSound } = useNotificationAudio();
  useCapacitorPushNotifications(playSound);
  return (
    <>
      <audio ref={audioRef} preload="auto" />
      <Component {...pageProps} />
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
}

