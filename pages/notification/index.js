import React, { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';

const DummyNotification = () => {
  useEffect(() => {
    PushNotifications.requestPermissions().then(permission => {
      if (permission.receive === 'granted') {
        console.log('Permission granted for push notifications');
      } else {
        console.log('Push notification permission denied');
      }
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Notification action performed: ', action);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Notification received: ', notification);
    });
  }, []);

  const showNotification = () => {
    PushNotifications.createChannel({
      id: 'default',
      name: 'Default Channel',
      description: 'The default channel for notifications',
      importance: 3, 
      visibility: 1,
    }).then(() => {
      PushNotifications.schedule({
        notifications: [
          {
            title: 'Dummy Notification',
            body: 'This is a dummy notification for testing.',
            id: 1,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
            attachments: null,
            actionTypeId: '',
            extra: null,
          },
        ],
      });
    }).catch(err => console.error('Error creating notification channel', err));
  };

  return (
    <div style={styles.page}>
      <h2>Push Notification Test</h2>
      <button style={styles.button} onClick={showNotification}>
        Show Dummy Notification
      </button>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
};

export default DummyNotification;
