/**
 * 设备信息检测工具
 * 针对中国智能手机用户优化
 */

// 检测是否为移动设备
export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };
  
  // 检测是否为iOS设备
  export const isIosDevice = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  };
  
  // 检测是否为安卓设备
  export const isAndroidDevice = () => {
    return /Android/.test(navigator.userAgent);
  };
  
  // 检测是否为微信浏览器
  export const isWechatBrowser = () => {
    return /MicroMessenger/i.test(navigator.userAgent);
  };
  
  // 检测是否支持WebGL (用于高级图形功能)
  export const hasWebGLSupport = () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  };
  
  // 获取设备的像素比
  export const getDevicePixelRatio = () => {
    return window.devicePixelRatio || 1;
  };
  
  // 检测设备可用内存 (某些浏览器支持)
  export const getDeviceMemory = () => {
    return navigator.deviceMemory || 'unknown';
  };
  
  // 检测设备性能级别
  export const getDevicePerformance = () => {
    // 基于设备内存和处理器核心数进行评估
    const memory = navigator.deviceMemory || 4; // 默认假设4GB
    const cores = navigator.hardwareConcurrency || 4; // 默认假设4核
    
    if (memory >= 4 && cores >= 8) {
      return 'high';
    } else if (memory >= 2 && cores >= 4) {
      return 'medium';
    } else {
      return 'low';
    }
  };
  
  // 获取合适的图片质量
  export const getAppropriateImageQuality = () => {
    const performance = getDevicePerformance();
    const isOnline = navigator.onLine;
    const connection = navigator.connection || 
                       navigator.mozConnection || 
                       navigator.webkitConnection;
    
    // 离线状态下使用最低质量
    if (!isOnline) return 'low';
    
    // 根据网络状态调整
    if (connection) {
      // 2G或慢速连接使用低质量
      if (connection.type === 'cellular' && 
         (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
        return 'low';
      }
      
      // 3G使用中等质量
      if (connection.effectiveType === '3g') {
        return 'medium';
      }
    }
    
    // 根据设备性能返回
    return performance;
  };