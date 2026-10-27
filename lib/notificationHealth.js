// JS bridge to native/android/NotificationHealthPlugin.java
import { registerPlugin } from '@capacitor/core';

const NotificationHealth = registerPlugin('NotificationHealth', {
  // Fallback for the browser (npm run dev) so the UI still renders.
  web: () => ({
    getStatus: async () => ({
      notificationsEnabled: typeof Notification !== 'undefined' && Notification.permission === 'granted',
      channelExists: true,
      channelEnabled: true,
      channelHasSound: true,
      dndActive: false,
      batteryOptimizationIgnored: true,
      backgroundRestricted: false,
      sdkInt: 0,
      manufacturer: 'web',
      brand: 'web',
    }),
    openNotificationSettings: async () => ({ opened: false, screen: 'web' }),
    requestIgnoreBatteryOptimization: async () => ({ opened: false, screen: 'web' }),
    openAutoStartSettings: async () => ({ opened: false, screen: 'web' }),
    openAppSettings: async () => ({ opened: false, screen: 'web' }),
  }),
});

export default NotificationHealth;
