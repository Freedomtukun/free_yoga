/**
 * 设备兼容性检查工具
 * 用于检测用户设备是否支持SmartYoga应用所需的功能
 */

/**
 * 检查浏览器是否支持MediaPipe所需的WebGL功能
 * @returns {boolean} 是否支持WebGL
 */
export const isWebGLSupported = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
};

/**
 * 检查浏览器是否支持摄像头访问
 * @returns {Promise<boolean>} 是否支持摄像头访问
 */
export const isCameraSupported = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return false;
  }
  
  try {
    // 尝试请求摄像头权限
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // 成功获取后释放摄像头
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

/**
 * 检查设备是否支持陀螺仪（用于移动设备姿态检测辅助）
 * @returns {boolean} 是否支持陀螺仪
 */
export const isGyroscopeSupported = () => {
  return window.DeviceOrientationEvent !== undefined;
};

/**
 * 检查设备性能，确保足够运行AI姿势检测
 * @returns {Object} 设备性能评估结果
 */
export const checkDevicePerformance = () => {
  // 检查处理器核心数
  const cpuCores = navigator.hardwareConcurrency || 0;
  
  // 检查设备内存 (不是所有浏览器都支持)
  const deviceMemory = navigator.deviceMemory || 0;
  
  // 检查是否为移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  return {
    cpuCores,
    deviceMemory,
    isMobile,
    // 简单性能评级: high, medium, low
    performanceLevel: cpuCores >= 4 && deviceMemory >= 4 
      ? 'high' 
      : cpuCores >= 2 
        ? 'medium' 
        : 'low'
  };
};

/**
 * 全面检查设备兼容性
 * @returns {Promise<Object>} 兼容性检查结果
 */
export const checkDeviceCompatibility = async () => {
  const webglSupport = isWebGLSupported();
  const cameraSupport = await isCameraSupported();
  const gyroscopeSupport = isGyroscopeSupported();
  const performance = checkDevicePerformance();
  
  // 判断设备总体兼容性
  const isCompatible = webglSupport && cameraSupport;
  
  // 确定适合的模式
  let recommendedMode = 'full'; // 完整模式
  
  if (!isCompatible) {
    recommendedMode = 'incompatible'; // 不兼容
  } else if (performance.performanceLevel === 'low') {
    recommendedMode = 'lite'; // 轻量级模式
  }
  
  return {
    isCompatible,
    webglSupport,
    cameraSupport,
    gyroscopeSupport,
    performance,
    recommendedMode
  };
};

/**
 * 获取MediaPipe配置，根据设备性能调整
 * @param {Object} performanceLevel 设备性能评级
 * @returns {Object} MediaPipe配置
 */
export const getMediaPipeConfig = (performanceLevel) => {
  // 基础配置
  const baseConfig = {
    runtime: 'mediapipe',
    modelType: 'full',
    solutionPath: '/mediapipe/',
    smoothLandmarks: true,
  };
  
  // 根据设备性能调整配置
  switch(performanceLevel) {
    case 'high':
      return {
        ...baseConfig,
        enableSmoothing: true,
        enableSegmentation: true,
        refineFaceLandmarks: true,
        maxPoses: 1,
      };
    case 'medium':
      return {
        ...baseConfig,
        modelType: 'lite',
        enableSmoothing: true,
        enableSegmentation: false,
        refineFaceLandmarks: false,
        maxPoses: 1,
      };
    case 'low':
      return {
        ...baseConfig,
        modelType: 'lite',
        enableSmoothing: false,
        enableSegmentation: false,
        refineFaceLandmarks: false,
        maxPoses: 1,
        detectionConfidence: 0.5, // 降低检测置信度以提高速度
      };
    default:
      return baseConfig;
  }
};

/**
 * 正确配置MediaPipe的文件加载路径
 * @returns {Function} locateFile函数
 */
export const getLocateFileFunction = () => {
  return (file) => {
    // 确保从正确的公共目录加载MediaPipe文件
    return `/mediapipe/${file}`;
  };
};

/**
 * 尝试重新加载摄像头
 * @param {Function} onSuccess 成功回调
 * @param {Function} onError 错误回调
 */
export const retryCameraAccess = async (onSuccess, onError) => {
  try {
    const constraints = {
      video: {
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    if (onSuccess) onSuccess(stream);
    return true;
  } catch (error) {
    if (onError) onError(error);
    return false;
  }
};