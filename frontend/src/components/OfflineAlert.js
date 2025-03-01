import React, { useState, useEffect } from 'react';
import './OfflineAlert.css';

const OfflineAlert = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showAlert, setShowAlert] = useState(false);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // 显示已恢复在线的提示，几秒后自动消失
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setShowAlert(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (!showAlert) return null;
  
  return (
    <div className={`offline-alert ${isOffline ? 'offline' : 'online'}`}>
      {isOffline ? (
        <>
          <span className="offline-icon">⚠️</span>
          <p>网络连接已断开，部分功能可能不可用</p>
        </>
      ) : (
        <>
          <span className="online-icon">✓</span>
          <p>网络连接已恢复</p>
        </>
      )}
      <button className="close-btn" onClick={() => setShowAlert(false)}>
        ×
      </button>
    </div>
  );
};

export default OfflineAlert;