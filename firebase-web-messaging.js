
import './firebase';
import { getApp, getApps } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

let messagingPromise = null;

export function getWebMessaging() {
  if (!messagingPromise) {
    messagingPromise = (async () => {
      try {
        const supported = await isSupported();

        if (!supported) {
          console.warn(
            '[FCM] Firebase Messaging is not supported in this browser.'
          );
          return null;
        }

        if (getApps().length === 0) {
          throw new Error(
            'Firebase app was not initialized by firebase.js'
          );
        }

        return getMessaging(getApp());
      } catch (error) {
        messagingPromise = null;
        console.error('[FCM] Messaging initialization failed:', error);
        throw error;
      }
    })();
  }

  return messagingPromise;
}
