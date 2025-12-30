// import '../styles/globals.css'
// import type { AppProps } from 'next/app'
// import '../styles/login.css';
// import './orders-details/OrderDashboard.css';
// import { useEffect, useRef } from 'react';
// import axios from 'axios';
// import { BASE_URL } from '../apiconstant/apiconstant';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useRouter } from 'next/router';

// // Only import firebase modules on the client side
// if (typeof window !== 'undefined') {
//   import('../firebase').then(({ messaging }) => {
//     if ('serviceWorker' in navigator) {
//       navigator.serviceWorker
//         .register('/firebase-messaging-sw.js')
//         .catch((err: unknown) => {
//           console.error('Service Worker registration failed:', err);
//         });
//     }
//   });
// }

// function isUserLoggedIn() {
//   if (typeof window === 'undefined') return false;
//   const token = localStorage.getItem('token');
//   return !!token;
// }

// async function sendFcmTokenToBackend(tokenValue: string) {
//    console.log('FCM token sent to backend');
//   try {
//     localStorage.setItem("fmcToken",tokenValue)  
//     console.log('FCM token sent to backend');
//   } catch (err) {
//     console.error('Failed to send FCM token to backend:', err);
//   }
// }

// function useNotificationAudio() {
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const playSound = () => {
//     if (audioRef.current) {
//       audioRef.current.currentTime = 0;
//       audioRef.current.play();
//     }
//   };
//   return { audioRef, playSound };
// }

// function useCapacitorPushNotifications(playSound: () => void) {
//   const router = useRouter();
//   useEffect(() => {
//     if (typeof window === 'undefined' || !(window as any).Capacitor) return;
//     import('@capacitor/push-notifications').then(({ PushNotifications }) => {
//       PushNotifications.requestPermissions().then((result: any) => {
//         if (result.receive === 'granted') {
//           PushNotifications.register();
//         }
//       });
      
//       PushNotifications.createChannel({
//         id: 'fcm_custom_sound_channel', // A unique ID for this channel
//         name: 'Custom Sound Notifications',
//         importance: 4, // High importance is needed for sound
//         sound: 'notification.mp3', // The filename from 'android/app/src/main/res/raw'
//         visibility: 1,
//         vibration: true,
//       }).then(() => {
//         console.log('Push notification channel created');
//       }).catch(err => {
//         console.error('Push notification channel creation failed:', err);
//       });


//       PushNotifications.addListener('registration', (token: { value: string }) => {
//         console.log('Push registration success, token: ' + token.value);
//         sendFcmTokenToBackend(token.value);
//       });

//       PushNotifications.addListener('registrationError', (err: any) => {
//         console.error('Push registration error: ', err.error);
//       });

//       PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
//         console.log('Push received: ', notification);
//         // Optionally, show a toast or update UI
//         // Prevent multiple triggers within 5 seconds
//         if (!(window as any)._lastNotificationTime || Date.now() - (window as any)._lastNotificationTime > 5000) {
//           (window as any)._lastNotificationTime = Date.now();
//           const title = notification.title || 'Notification';
//           const body = notification.body || '';
//           toast.info(<div><b>{title}</b><div>{body}</div></div>);
//           playSound();
//         }
//       });

//       PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
//         // Handle notification tap: navigate to /new-order
//         if (typeof window !== 'undefined') {
//           // window.location.href = '/supplier-new-order';
//           router.push('/supplier-new-order');
//         }
//       });
//     });
//   }, [playSound]);

// }


// export default function App({ Component, pageProps }: AppProps) {
//   const { audioRef, playSound } = useNotificationAudio();
//   useCapacitorPushNotifications(playSound);
//   return (
//     <>
//       <Component {...pageProps} />
//       <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
//       <audio ref={audioRef} src="/notification.mp3" preload="auto" />
//     </>
//   );
// }


import '../styles/globals.css'
import type { AppProps } from 'next/app'
import '../styles/login.css';
import './orders-details/OrderDashboard.css';
import { useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';

// Helper to send token to backend
async function sendFcmTokenToBackend(tokenValue: string) {
  try {
    localStorage.setItem("fmcToken", tokenValue);
    console.log('Token saved to storage:', tokenValue);
    // Add your axios.post here to update your database
  } catch (err) {
    console.error('Failed to save token:', err);
  }
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play blocked by browser"));
    }
  };

  useEffect(() => {
    // Ensure this only runs in the browser
    if (typeof window === 'undefined') return;

    const initNotifications = async () => {
      // --- 1. CAPACITOR (MOBILE) LOGIC ---
      if ((window as any).Capacitor) {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        
        const permission = await PushNotifications.requestPermissions();
        if (permission.receive === 'granted') {
          PushNotifications.register();
        }

        PushNotifications.addListener('registration', (token) => {
          sendFcmTokenToBackend(token.value);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
          // Check for NEW_ORDER type
          if (notification.data?.type === 'NEW_ORDER') {
            toast.info(<div><b>{notification.title}</b><div>{notification.body}</div></div>);
            playSound();
          }
        });
      } 
      
      // --- 2. WEB BROWSER (LOCAL) LOGIC ---
      else {
        try {
          // Dynamically import your firebase.js logic
          const { requestForToken, onMessageListener } = await import('../firebase');
          
          const token = await requestForToken();
          if (token) {
            sendFcmTokenToBackend(token);
          }

          // Listen for messages while the tab is open (Foreground)
          onMessageListener().then((payload: any) => {
            console.log("Web foreground message:", payload);
            if (payload.data?.type === 'NEW_ORDER' || payload.notification) {
              toast.info(<div><b>{payload.notification?.title}</b><div>{payload.notification?.body}</div></div>);
              playSound();
            }
          });
        } catch (err) {
          console.error("Web notification setup failed:", err);
        }
      }
    };

    initNotifications();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <>
      <Component {...pageProps} />
      <ToastContainer position="top-right" autoClose={5000} />
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
    </>
  );
}