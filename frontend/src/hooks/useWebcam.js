import { useState, useEffect, useRef } from 'react';

/**
 * 自定义Hook - 用于处理webcam视频流
 * @returns {Object} webcam相关的状态和引用
 */
const useWebcam = () => {
  const webcamRef = useRef(null);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [error, setError] = useState(null);
  const [webcamDimensions, setWebcamDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let stream = null;

    const setupCamera = async () => {
      try {
        // 请求摄像头权限
        const constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
          
          // 当视频元数据加载完成时设置准备状态
          webcamRef.current.onloadedmetadata = () => {
            setWebcamDimensions({
              width: webcamRef.current.videoWidth,
              height: webcamRef.current.videoHeight
            });
            setIsWebcamReady(true);
          };
        }
      } catch (err) {
        console.error('访问摄像头时出错:', err);
        
        // 设置用户友好的错误信息
        if (err.name === 'NotAllowedError') {
          setError('摄像头访问被拒绝。请授权访问您的摄像头以使用此功能。');
        } else if (err.name === 'NotFoundError') {
          setError('未找到摄像头设备。请确保您的设备有可用的摄像头。');
        } else {
          setError(`无法访问摄像头: ${err.message}`);
        }
      }
    };

    setupCamera();

    // 清理函数 - 停止所有视频流
    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const takeSnapshot = () => {
    if (!webcamRef.current || !isWebcamReady) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = webcamRef.current.videoWidth;
    canvas.height = webcamRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(webcamRef.current, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/jpeg');
  };

  return { 
    webcamRef, 
    isWebcamReady, 
    error, 
    webcamDimensions,
    takeSnapshot
  };
};

export default useWebcam;