/**
 * 网络状态监测和处理工具
 * 针对中国网络环境优化
 */

// 检查网络状态
export const checkNetworkStatus = () => {
  return {
    online: navigator.onLine,
    connectionType: getConnectionType()
  };
};

// 获取网络连接类型 (如果支持)
export const getConnectionType = () => {
  const connection = navigator.connection || 
                      navigator.mozConnection || 
                      navigator.webkitConnection;
  
  if (connection) {
    return {
      type: connection.type,
      effectiveType: connection.effectiveType,
      downlinkMax: connection.downlinkMax,
      rtt: connection.rtt
    };
  }
  
  return null;
};

// 添加网络状态变化监听器
export const addNetworkListener = (onlineCallback, offlineCallback) => {
  window.addEventListener('online', onlineCallback);
  window.addEventListener('offline', offlineCallback);
  
  // 返回移除监听器的函数
  return () => {
    window.removeEventListener('online', onlineCallback);
    window.removeEventListener('offline', offlineCallback);
  };
};

// 针对不稳定网络的请求重试
export const fetchWithRetry = async (url, options = {}, maxRetries = 3, delayMs = 1000) => {
  let lastError = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      lastError = error;
      
      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      // 等待延迟，再次尝试
      await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
  
  throw lastError;
};

// 针对中国网络的资源预加载
export const preloadCriticalResources = (resources) => {
  if (!resources || !Array.isArray(resources)) return;
  
  resources.forEach(resource => {
    if (typeof resource !== 'string') return;
    
    if (resource.endsWith('.js')) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'script';
      preloadLink.href = resource;
      document.head.appendChild(preloadLink);
    } else if (resource.endsWith('.css')) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'style';
      preloadLink.href = resource;
      document.head.appendChild(preloadLink);
    } else if (resource.match(/\.(jpe?g|png|gif|webp)$/i)) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = resource;
      document.head.appendChild(preloadLink);
    }
  });
};