
import React, { useState } from 'react';

const Notification = () => {
  const [message, setMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const showCustomNotification = () => {
    setMessage('notification clicked');
    setShowNotification(true); 
  };

  return (
    <div style={styles.pageContainer}>
      <button onClick={showCustomNotification} style={styles.button}>
        Show Notification
      </button>

      {showNotification && (
        <div style={styles.notificationContainer}>
          <div style={styles.notification}>
            <p style={styles.message}>{message}</p>
            <button onClick={() => setShowNotification(false)} style={styles.closeButton}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column',
    backgroundColor: '#f4f4f4',
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
    transition: 'all 0.3s',
  },
  notificationContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  notification: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    width: '300px',
    textAlign: 'center',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
    animation: 'fadeIn 0.3s',
  },
  message: {
    fontSize: '18px',
    marginBottom: '20px',
    color: '#333',
  },
  closeButton: {
    padding: '10px 20px',
    backgroundColor: '#ff5722',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s',
  },
};

export default Notification;
