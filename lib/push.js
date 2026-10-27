import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import {
  ORDER_CHANNEL_ID,
  ORDER_SOUND_FILE,
  EMERGENCY_CHANNEL_ID,
  EMERGENCY_SOUND_FILE,
} from './pushConfig';
import {
  BASE_URL,
  UPDATE_USER_DETAIL_ENDPOINT,
} from '../apiconstant/apiconstant';

let listenersAdded = false;
let currentToken = null;

const handlers = {
  onNotificationReceived: null,
  onNotificationTap: null,
};

export const isNativeAndroid = () =>
  Capacitor.getPlatform() === 'android';

export const getCurrentToken = () => currentToken;

async function sendTokenToServer(token) {
  if (typeof window === 'undefined' || !token) return;

  localStorage.setItem('fmcToken', token);

  const supplierID = localStorage.getItem('supplierID');

  if (!supplierID) {
    console.warn('[push] Token saved locally; waiting for supplier login.');
    return;
  }

  if (!BASE_URL) {
    console.error('[push] BASE_URL is missing.');
    return;
  }

  try {
    const endpoint = (UPDATE_USER_DETAIL_ENDPOINT || '').replace(/\/+$/, '');
    const baseURL = BASE_URL.replace(/\/+$/, '');

    const url = endpoint
      ? `${baseURL}/${endpoint.replace(/^\/+/, '')}/${encodeURIComponent(supplierID)}`
      : `${baseURL}/user_update/${encodeURIComponent(supplierID)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_token: token }),
    });

    const result = await response.json();

    if (!response.ok || result?.error) {
      throw new Error(result?.message || `HTTP ${response.status}`);
    }

    console.log('[push] HORA backend token updated.');
  } catch (error) {
    console.error('[push] Backend token update failed:', error);
  }
}

export async function ensureOrderChannel() {
  if (!isNativeAndroid()) return;

  await PushNotifications.createChannel({
    id: ORDER_CHANNEL_ID,
    name: 'HORA Notifications',
    description: 'Regular HORA notifications',
    importance: 5,
    visibility: 1,
    sound: ORDER_SOUND_FILE,
    vibration: true,
    lights: true,
    lightColor: '#E8590C',
  });

  await PushNotifications.createChannel({
    id: EMERGENCY_CHANNEL_ID,
    name: 'HORA Emergency Notifications',
    description: 'Urgent HORA notifications',
    importance: 5,
    visibility: 1,
    sound: EMERGENCY_SOUND_FILE,
    vibration: true,
    lights: true,
    lightColor: '#E8590C',
  });
}

function addListenersOnce() {
  if (listenersAdded) return;
  listenersAdded = true;

  PushNotifications.addListener('registration', ({ value }) => {
    currentToken = value;
    void sendTokenToServer(value);
  });

  PushNotifications.addListener('registrationError', (error) => {
    console.error('[push] Registration failed:', error);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    handlers.onNotificationReceived?.(notification);
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    handlers.onNotificationTap?.(action.notification);
  });
}

export async function requestPermissionAndRegister() {
  if (!isNativeAndroid()) return 'denied';

  let { receive } = await PushNotifications.checkPermissions();

  if (receive === 'prompt' || receive === 'prompt-with-rationale') {
    ({ receive } = await PushNotifications.requestPermissions());
  }

  if (receive === 'granted') {
    await PushNotifications.register();
  }

  return receive;
}

export async function initPush(options = {}) {
  if (!isNativeAndroid()) return;

  if (options.onNotificationReceived) {
    handlers.onNotificationReceived = options.onNotificationReceived;
  }

  if (options.onNotificationTap) {
    handlers.onNotificationTap = options.onNotificationTap;
  }

  await ensureOrderChannel();
  addListenersOnce();
  await requestPermissionAndRegister();
}

// Call this after login so an existing token is sent once supplierID is available.
export async function setPushUser() {
  const token = currentToken || localStorage.getItem('fmcToken');
  if (token) await sendTokenToServer(token);
}