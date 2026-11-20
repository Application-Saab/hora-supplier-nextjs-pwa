import React from 'react';

const CircularLoader = ({ size = 21 }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '9px',   
      left: '9px',  
      zIndex: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{
        width: size,
        height: size,
        border: '3px solid #FFFFFF',     
        borderTop: '3px solid #97538C',   
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
      }} />
    </div>
  );
};

export default CircularLoader;