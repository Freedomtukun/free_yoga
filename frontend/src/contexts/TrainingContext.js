import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const TrainingContext = createContext();

export const useTraining = () => useContext(TrainingContext);

export const TrainingProvider = ({ children }) => {
  const [poseDetector, setPoseDetector] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [keypoints, setKeypoints] = useState(null);
  const [webcamRef, setWebcamRef] = useState(null);
  const [error, setError] = useState(null);
  
  // 初始化姿势检测器
  const initPoseDetector = useCallback(async () => {
    try {
      if (!window.poseDetection) {
        setError('找不到姿势检测库。请确保MediaPipe资源已正确加载。');
        return;
      }
      
      const detector = await window.poseDetection.createDetector(
        window.poseDetection.SupportedModels.BlazePose,
        {
          runtime: 'mediapipe',
          modelType: 'full',
          solutionPath: '/mediapipe/'
        }
      );
      
      setPoseDetector(detector);
      console.log('姿势检测器初始化成功');
    } catch (error) {
      console.error('初始化姿势检测器时出错:', error);
      setError('无法初始化姿势检测器。请刷新页面或检查设备兼容性。');
    }
  }, []);
  
  // 开始姿势检测
  const startDetection = useCallback(async () => {
    if (!poseDetector) {
      await initPoseDetector();
    }
    
    setIsDetecting(true);
  }, [poseDetector, initPoseDetector]);
  
  // 停止姿势检测
  const stopDetection = useCallback(() => {
    setIsDetecting(false);
  }, []);
  
  // 检测循环
  useEffect(() => {
    if (!isDetecting || !poseDetector || !webcamRef || !webcamRef.current) return;
    
    let detectionFrame;
    
    const detect = async () => {
      if (
        webcamRef.current && 
        webcamRef.current.video && 
        webcamRef.current.video.readyState === 4
      ) {
        try {
          const video = webcamRef.current.video;
          const poses = await poseDetector.estimatePoses(video);
          
          if (poses && poses.length > 0) {
            // 将姿势关键点转换为标准化格式
            const normalizedKeypoints = normalizeKeypoints(poses[0].keypoints);
            setKeypoints(normalizedKeypoints);
          }
        } catch (error) {
          console.error('姿势检测时出错:', error);
        }
      }
      
      if (isDetecting) {
        detectionFrame = requestAnimationFrame(detect);
      }
    };
    
    detect();
    
    return () => {
      if (detectionFrame) {
        cancelAnimationFrame(detectionFrame);
      }
    };
  }, [isDetecting, poseDetector, webcamRef]);
  
  // 将MediaPipe关键点转换为我们的标准格式
  const normalizeKeypoints = (keypointsArray) => {
    const result = {};
    const keypointMap = {
      0: 'nose',
      11: 'leftShoulder',
      12: 'rightShoulder',
      13: 'leftElbow',
      14: 'rightElbow',
      15: 'leftWrist',
      16: 'rightWrist',
      23: 'leftHip',
      24: 'rightHip',
      25: 'leftKnee',
      26: 'rightKnee',
      27: 'leftAnkle',
      28: 'rightAnkle'
    };
    
    keypointsArray.forEach((keypoint, index) => {
      if (keypointMap[index]) {
        result[keypointMap[index]] = {
          x: keypoint.x,
          y: keypoint.y,
          score: keypoint.score || 0
        };
      }
    });
    
    return result;
  };
  
  const setWebcam = (ref) => {
    setWebcamRef(ref);
  };
  
  const value = {
    poseDetector,
    isDetecting,
    keypoints,
    error,
    setWebcam,
    startDetection,
    stopDetection,
    initPoseDetector
  };
  
  return (
    <TrainingContext.Provider value={value}>
      {children}
    </TrainingContext.Provider>
  );
};