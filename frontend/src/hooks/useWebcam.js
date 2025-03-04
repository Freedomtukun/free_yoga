import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getMediaPipeConfig, 
  getLocateFileFunction, 
  retryCameraAccess 
} from '../utils/DeviceUtils';

/**
 * 摄像头和姿势检测 Hook
 * 
 * @param {Object} options 配置选项
 * @param {string} options.mode 模式 ('full', 'lite', 'disabled')
 * @param {boolean} options.autoStart 是否自动开始检测
 * @param {number} options.detectionInterval 检测间隔 (ms)
 * @param {Function} options.onPoseDetected 姿势检测回调
 * @param {Function} options.onError 错误回调
 * @returns {Object} 摄像头和姿势检测状态与控制方法
 */
const useWebcam = ({
  mode = 'full',
  autoStart = false,
  detectionInterval = 100, // 每100ms进行一次姿势检测
  onPoseDetected = null,
  onError = null,
}) => {
  // 状态管理
  const [status, setStatus] = useState('initializing'); // initializing, ready, running, error
  const [error, setError] = useState(null);
  const [poses, setPoses] = useState([]);
  const [webcamDimensions, setWebcamDimensions] = useState({ width: 0, height: 0 });
  const [isMirrored, setIsMirrored] = useState(true); // 默认镜像显示
  
  // 引用管理
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const poseDetectorRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const detectingRef = useRef(false); // 防止重叠检测
  const retryCountRef = useRef(0); // 追踪重试次数
  const performanceLevelRef = useRef('medium'); // 性能级别，将由外部设置
  
  // 重置所有状态
  const reset = useCallback(() => {
    // 清除定时器
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    // 停止视频流
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // 重置状态
    setStatus('initializing');
    setPoses([]);
    setError(null);
    detectingRef.current = false;
    retryCountRef.current = 0;
  }, []);
  
  // 初始化 MediaPipe 姿势检测器
  const initializePoseDetector = useCallback(async () => {
    try {
      // 确保 MediaPipe 库已加载
      if (!window.poseDetection) {
        const errorMsg = 'MediaPipe库未加载，请刷新页面或检查网络连接';
        setError(errorMsg);
        if (onError) onError(new Error(errorMsg));
        setStatus('error');
        return false;
      }
      
      // 根据性能级别获取配置
      const config = getMediaPipeConfig(performanceLevelRef.current);
      
      // 设置文件加载函数
      window.poseDetection.createDetector.locateFile = getLocateFileFunction();
      
      // 创建检测器
      const detector = await window.poseDetection.createDetector(
        window.poseDetection.SupportedModels.BlazePose,
        config
      );
      
      poseDetectorRef.current = detector;
      setStatus('ready');
      
      return true;
    } catch (err) {
      const errorMsg = `初始化姿势检测器失败: ${err.message}`;
      console.error(errorMsg, err);
      setError(errorMsg);
      if (onError) onError(err);
      setStatus('error');
      return false;
    }
  }, [onError]);
  
  // 初始化摄像头
  const initializeCamera = useCallback(async () => {
    try {
      // 检查是否支持摄像头
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('您的浏览器不支持摄像头访问');
      }
      
      // 根据性能级别调整分辨率
      let constraints = { video: { facingMode: 'user' } };
      
      if (performanceLevelRef.current === 'high') {
        constraints.video.width = { ideal: 640 };
        constraints.video.height = { ideal: 480 };
      } else {
        // 低性能设备使用较低分辨率
        constraints.video.width = { ideal: 320 };
        constraints.video.height = { ideal: 240 };
      }
      
      // 请求摄像头权限
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // 设置视频源
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // 等待视频元数据加载
        return new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            // 更新视频尺寸
            setWebcamDimensions({
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight
            });
            
            // 开始播放
            videoRef.current.play().then(() => {
              resolve(true);
            }).catch(err => {
              console.error('视频播放失败:', err);
              resolve(false);
            });
          };
        });
      }
      
      return false;
    } catch (err) {
      const errorMsg = `初始化摄像头失败: ${err.message}`;
      console.error(errorMsg, err);
      setError(errorMsg);
      if (onError) onError(err);
      setStatus('error');
      return false;
    }
  }, [onError]);
  
  // 单次姿势检测
  const detectPose = useCallback(async () => {
    // 防止重叠检测
    if (detectingRef.current || !poseDetectorRef.current || !videoRef.current) return;
    
    detectingRef.current = true;
    
    try {
      // 执行姿势检测
      const detectedPoses = await poseDetectorRef.current.estimatePoses(videoRef.current, {
        flipHorizontal: isMirrored
      });
      
      if (detectedPoses && detectedPoses.length > 0) {
        // 更新姿势数据
        setPoses(detectedPoses);
        retryCountRef.current = 0; // 重置重试计数
        
        // 调用回调函数
        if (onPoseDetected) {
          onPoseDetected(detectedPoses);
        }
      } else if (retryCountRef.current < 5) {
        // 如果未检测到姿势且重试次数小于5，增加重试计数
        retryCountRef.current++;
      } else {
        // 如果连续5次未检测到姿势，发出警告
        console.warn('未检测到人体姿势，请确保您在摄像头视野内');
      }
    } catch (err) {
      console.error('姿势检测错误:', err);
      // 只在严重错误时设置状态，避免中断用户体验
      if (retryCountRef.current > 10) {
        setError(`姿势检测持续失败: ${err.message}`);
        setStatus('error');
        if (onError) onError(err);
        stopDetection();
      } else {
        retryCountRef.current++;
      }
    } finally {
      detectingRef.current = false;
    }
  }, [isMirrored, onPoseDetected, onError, stopDetection]);
  
  // 开始连续姿势检测
  const startDetection = useCallback(async () => {
    // 如果已在运行，则不执行任何操作
    if (status === 'running') return;
    
    // 初始化过程
    if (status === 'initializing') {
      const detectorInitialized = await initializePoseDetector();
      if (!detectorInitialized) return;
    }
    
    // 确保摄像头已初始化
    if (!streamRef.current) {
      const cameraInitialized = await initializeCamera();
      if (!cameraInitialized) return;
    }
    
    // 开始定时检测
    setStatus('running');
    detectionIntervalRef.current = setInterval(detectPose, detectionInterval);
    
    // 执行一次立即检测
    detectPose();
  }, [status, initializePoseDetector, initializeCamera, detectPose, detectionInterval]);
  
  // 停止检测
  const stopDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    if (status === 'running') {
      setStatus('ready');
    }
  }, [status]);
  
  // 切换摄像头镜像模式
  const toggleMirror = useCallback(() => {
    setIsMirrored(prev => !prev);
  }, []);
  
  // 尝试重新连接摄像头
  const retryCamera = useCallback(async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    const success = await retryCameraAccess(
      (stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
        setError(null);
        setStatus('ready');
      },
      (err) => {
        setError(`重试摄像头访问失败: ${err.message}`);
        if (onError) onError(err);
      }
    );
    
    return success;
  }, [onError]);
  
  // 设置性能级别
  const setPerformanceLevel = useCallback((level) => {
    if (['high', 'medium', 'low'].includes(level)) {
      performanceLevelRef.current = level;
      
      // 如果检测器已初始化，需要重新初始化以应用新配置
      if (poseDetectorRef.current) {
        // 暂停当前检测
        const wasRunning = status === 'running';
        if (wasRunning) {
          stopDetection();
        }
        
        // 重新初始化检测器
        initializePoseDetector().then(success => {
          if (success && wasRunning) {
            startDetection();
          }
        });
      }
    }
  }, [status, stopDetection, initializePoseDetector, startDetection]);
  
  // 自动启动
  useEffect(() => {
    if (autoStart && !detectionIntervalRef.current && mode !== 'disabled') {
      startDetection();
    }
    
    // 清理函数
    return () => {
      reset();
    };
  }, [autoStart, mode, startDetection, reset]);
  
  // 处理mode变化
  useEffect(() => {
    if (mode === 'disabled') {
      reset();
    } else if (mode === 'lite') {
      setPerformanceLevel('low');
    } else {
      setPerformanceLevel('high');
    }
  }, [mode, reset, setPerformanceLevel]);
  
  return {
    videoRef,
    status,
    error,
    poses,
    webcamDimensions,
    isMirrored,
    startDetection,
    stopDetection,
    toggleMirror,
    retryCamera,
    setPerformanceLevel,
    reset
  };
};

export default useWebcam;