import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Camera } from '@mediapipe/camera_utils';
import { Pose, POSE_LANDMARKS } from '@mediapipe/pose';
import CompatibilityCheck from '../CompatibilityCheck';
import ErrorHandler, { ErrorTypes, ErrorSeverity } from '../ErrorHandler';
import OfflineAlert from '../OfflineAlert';
import { checkDeviceCompatibility, getLocateFileFunction } from '../../utils/DeviceUtils';
import './SequenceTraining.css';
import '../ErrorHandler.css';

const FreeTraining = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sequence, setSequence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [feedback, setFeedback] = useState({ message: '', accuracy: 0 });
  
  // 设备兼容性和错误处理状态
  const [compatibility, setCompatibility] = useState(null);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // 添加媒体管道引用
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const poseRef = useRef(null);
  
  // 处理兼容性检查结果
  const handleCompatibilityResult = (result) => {
    setCompatibility(result);
    
    // 如果设备不兼容，设置错误
    if (!result.isCompatible) {
      setError(new Error('设备不兼容'));
      setErrorType(ErrorTypes.CAMERA_ACCESS);
      return;
    }
    
    // 根据设备性能配置MediaPipe选项
    if (result.performance && result.performance.performanceLevel === 'low') {
      // 低性能设备使用更轻量级的模型配置
      if (poseRef.current) {
        poseRef.current.setOptions({
          modelComplexity: 0, // 使用最轻量级模型
          smoothLandmarks: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      }
    }
  };
  
  // 获取序列数据
  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      const mockSequence = {
        id: parseInt(id),
        title: '舒缓放松流',
        description: '这个序列旨在减轻压力，放松身心。',
        level: 'beginner',
        poses: [
          {
            id: 1,
            name: '山式',
            sanskritName: 'Tadasana',
            duration: 30,
            description: '基础站姿，培养稳定性和姿势意识',
            imageUrl: '/api/placeholder/400/400',
            tips: '双脚并拢，均匀分配重量，脊柱延展'
          },
          // 其他姿势保持不变...
        ]
      };
      
      setSequence(mockSequence);
      setTimeLeft(mockSequence.poses[0].duration);
      setLoading(false);
    }, 800);
  }, [id]);
  
  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // 初始化MediaPipe姿势检测 - 增强错误处理
  useEffect(() => {
    if (!showInstructions && videoRef.current) {
      // 检查设备是否支持所需功能
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError(new Error('您的浏览器不支持访问摄像头'));
        setErrorType(ErrorTypes.CAMERA_ACCESS);
        return;
      }
      
      try {
        // 创建Pose实例
        poseRef.current = new Pose({
          locateFile: getLocateFileFunction() // 使用我们的工具函数
        });
        
        // 根据设备性能设置选项
        const modelComplexity = compatibility?.performance?.performanceLevel === 'low' ? 0 : 1;
        
        // 设置选项
        poseRef.current.setOptions({
          modelComplexity: modelComplexity, // 根据设备性能调整
          smoothLandmarks: compatibility?.performance?.performanceLevel !== 'low',
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
          selfieMode: true, // 镜像模式，使用户更容易对齐
        });
        
        // 设置结果回调
        poseRef.current.onResults(handlePoseResults);
        
        // 创建Camera实例
        cameraRef.current = new Camera(videoRef.current, {
          onFrame: async () => {
            if (poseRef.current) {
              try {
                await poseRef.current.send({ image: videoRef.current });
              } catch (err) {
                console.error('姿势检测错误:', err);
                // 尝试自动恢复而不立即中断体验
                if (!error) {
                  setError(new Error('姿势检测暂时中断，正在尝试恢复'));
                  setErrorType(ErrorTypes.POSE_DETECTION);
                  
                  // 5秒后自动清除错误，让用户继续练习
                  setTimeout(() => {
                    setError(null);
                    setErrorType(null);
                  }, 5000);
                }
              }
            }
          },
          width: compatibility?.performance?.performanceLevel === 'low' ? 320 : 640, // 低性能设备降低分辨率
          height: compatibility?.performance?.performanceLevel === 'low' ? 240 : 480,
          facingMode: 'user' // 使用前置摄像头
        });
        
        // 启动摄像头 - 增强错误处理
        cameraRef.current.start()
          .then(() => {
            console.log('摄像头启动成功');
            // 成功时清除可能的旧错误
            if (errorType === ErrorTypes.CAMERA_ACCESS) {
              setError(null);
              setErrorType(null);
            }
          })
          .catch(error => {
            console.error('摄像头启动失败:', error);
            // 显示更有用的摄像头错误消息
            let errorMessage = '摄像头访问失败';
            
            if (error.name === 'NotAllowedError') {
              errorMessage = '您拒绝了摄像头访问权限。请在浏览器设置中允许访问摄像头并刷新页面。';
              setErrorType(ErrorTypes.PERMISSION);
            } else if (error.name === 'NotFoundError') {
              errorMessage = '未找到摄像头设备。请确保您的设备有可用的摄像头。';
              setErrorType(ErrorTypes.CAMERA_ACCESS);
            } else if (error.name === 'NotReadableError') {
              errorMessage = '摄像头可能被其他应用程序占用。请关闭可能使用摄像头的其他应用程序后重试。';
              setErrorType(ErrorTypes.CAMERA_ACCESS);
            } else {
              errorMessage = `摄像头访问失败: ${error.message || '请确保您已授予摄像头权限，并刷新页面重试。'}`;
              setErrorType(ErrorTypes.CAMERA_ACCESS);
            }
            
            setError(new Error(errorMessage));
          });
      } catch (err) {
        console.error('初始化MediaPipe错误:', err);
        setError(new Error(`初始化姿势检测失败: ${err.message}`));
        setErrorType(ErrorTypes.POSE_DETECTION);
      }
    }
    
    // 清理函数
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, [showInstructions, compatibility, error, errorType]);
  
  // 处理姿势检测结果
  const handlePoseResults = (results) => {
    if (!canvasRef.current || !sequence) return;
    
    const ctx = canvasRef.current.getContext('2d');
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    
    // 清除画布
    ctx.clearRect(0, 0, width, height);
    
    // 如果没有检测到姿势，不绘制任何内容
    if (!results.poseLandmarks) {
      setFeedback({
        message: '无法检测到姿势，请确保您的全身在画面中',
        accuracy: 0
      });
      return;
    }
    
    // 绘制姿势标记点和连接线
    drawPoseLandmarks(ctx, results.poseLandmarks, width, height);
    
    // 与目标姿势进行比较
    if (sequence.poses && sequence.poses[currentPoseIndex]) {
      // 简单模拟姿势分析 - 实际项目中应该使用更复杂的比较算法
      analyzeCurrentPose(results.poseLandmarks);
    }
  };
  
  // 绘制姿势标记点
  const drawPoseLandmarks = (ctx, landmarks, width, height) => {
    if (!landmarks) return;
    
    // 设置线条样式
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    
    // 绘制骨架连接线
    const connections = [
      // 躯干
      [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
      [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
      [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
      [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
      // 左臂
      [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
      [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
      // 右臂
      [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
      [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
      // 左腿
      [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
      [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
      // 右腿
      [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
      [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
    ];
    
    connections.forEach(([i, j]) => {
      const start = landmarks[i];
      const end = landmarks[j];
      
      if (start && end) {
        ctx.beginPath();
        ctx.moveTo(start.x * width, start.y * height);
        ctx.lineTo(end.x * width, end.y * height);
        ctx.stroke();
      }
    });
    
    // 绘制关键点
    ctx.fillStyle = '#4caf50';
    landmarks.forEach((landmark) => {
      ctx.beginPath();
      const pointSize = 5;
      ctx.arc(landmark.x * width, landmark.y * height, pointSize, 0, 2 * Math.PI);
      ctx.fill();
    });
  };
  
  // 分析当前姿势 - 简化版
  const analyzeCurrentPose = (landmarks) => {
    if (!landmarks) return;
    
    // 在实际应用中，这里应该有针对特定姿势的分析算法
    // 这里我们使用一个简单的模拟来生成反馈
    
    // 模拟姿势分析 - 在实际项目中替换为真实算法
    const currentPose = sequence.poses[currentPoseIndex];
    let feedbackMsg = '';
    let accuracy = 0;
    
    // 检查是否站立姿势 (基于肩膀和髋部位置)
    const isStanding = landmarks[POSE_LANDMARKS.LEFT_SHOULDER].y < 0.5 && 
                       landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].y < 0.5;
    
    // 基于当前姿势名称模拟特定反馈
    switch(currentPose.name) {
      case '山式':
        accuracy = isStanding ? Math.random() * 30 + 65 : Math.random() * 40 + 30;
        feedbackMsg = accuracy > 75 
          ? '很好！保持脊柱挺直，肩膀放松' 
          : '尝试保持双脚平行，重量均匀分布';
        break;
      case '站立前屈式':
        // 检查弯曲程度 (基于头部和臀部高度差)
        const bendingForward = landmarks[POSE_LANDMARKS.NOSE].y > 
                             landmarks[POSE_LANDMARKS.LEFT_HIP].y;
        accuracy = bendingForward ? Math.random() * 30 + 65 : Math.random() * 40 + 30;
        feedbackMsg = accuracy > 75 
          ? '很好！保持腿部伸直，放松颈部' 
          : '尝试弯曲髋部而非背部，保持脊柱延展';
        break;
      case '下犬式':
        // 检查是否形成倒V形
        const isInvertedV = landmarks[POSE_LANDMARKS.LEFT_HIP].y < 
                           landmarks[POSE_LANDMARKS.LEFT_SHOULDER].y;
        accuracy = isInvertedV ? Math.random() * 30 + 65 : Math.random() * 40 + 30;
        feedbackMsg = accuracy > 75 
          ? '很好！保持手臂伸直，坐骨向上抬起' 
          : '尝试拉长脊柱，脚跟往地面方向延展';
        break;
      default:
        // 对于其他姿势的通用反馈
        accuracy = Math.random() * 50 + 40;
        feedbackMsg = accuracy > 75 
          ? '保持姿势稳定，专注于呼吸' 
          : '注意身体对齐，保持核心肌群稳定';
    }
    
    setFeedback({
      message: feedbackMsg,
      accuracy: accuracy
    });
  };
  
  // 计时器逻辑
  useEffect(() => {
    let timer;
    
    if (isPlaying && !isPaused && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      // 当前姿势完成，进入下一个
      if (currentPoseIndex < sequence?.poses.length - 1) {
        setCurrentPoseIndex(prev => {
          const nextIndex = prev + 1;
          setTimeLeft(sequence.poses[nextIndex].duration);
          return nextIndex;
        });
      } else {
        // 整个序列完成
        setIsPlaying(false);
        // 这里可以显示完成界面或其他逻辑
      }
    }
    
    return () => {
      clearInterval(timer);
    };
  }, [isPlaying, isPaused, timeLeft, currentPoseIndex, sequence]);
  
  const startTraining = () => {
    setShowInstructions(false);
    setIsPlaying(true);
  };
  
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };
  
  const nextPose = () => {
    if (currentPoseIndex < sequence?.poses.length - 1) {
      setCurrentPoseIndex(prev => {
        const nextIndex = prev + 1;
        setTimeLeft(sequence.poses[nextIndex].duration);
        return nextIndex;
      });
    }
  };
  
  const prevPose = () => {
    if (currentPoseIndex > 0) {
      setCurrentPoseIndex(prev => {
        const prevIndex = prev - 1;
        setTimeLeft(sequence.poses[prevIndex].duration);
        return prevIndex;
      });
    }
  };
  
  const exitTraining = () => {
    navigate(`/sequence/${id}`);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // 处理重试
  const handleRetry = () => {
    if (errorType === ErrorTypes.CAMERA_ACCESS || errorType === ErrorTypes.PERMISSION) {
      // 尝试重新请求摄像头权限
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      
      // 重新请求摄像头
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          // 成功获取后释放摄像头
          stream.getTracks().forEach(track => track.stop());
          
          // 清除错误
          setError(null);
          setErrorType(null);
          
          // 重新启动训练
          setShowInstructions(false);
          setIsPlaying(true);
        })
        .catch(err => {
          console.error("重新请求摄像头失败:", err);
          setError(new Error("无法访问摄像头，请检查浏览器权限设置"));
          setErrorType(ErrorTypes.CAMERA_ACCESS);
        });
    } else if (errorType === ErrorTypes.POSE_DETECTION) {
      // 尝试重新初始化姿势检测
      if (poseRef.current) {
        poseRef.current.close();
        poseRef.current = null;
      }
      
      // 清除错误状态
      setError(null);
      setErrorType(null);
      
      // 重新启动指令将触发useEffect重新初始化
      setShowInstructions(false);
      setIsPlaying(true);
    } else {
      // 对于其他类型的错误，重新检查设备兼容性
      checkDeviceCompatibility().then(handleCompatibilityResult);
    }
  };
  
  if (loading) {
    return (
      <div className="training-container">
        <div className="loading">
          <p>加载中...</p>
        </div>
      </div>
    );
  }
  
  // 使用我们的CompatibilityCheck和ErrorHandler组件替代原始错误处理
  return (
    <CompatibilityCheck onCompatibilityChecked={handleCompatibilityResult}>
      <div className="training-container">
        {/* 离线提醒 */}
        {isOffline && (
          <OfflineAlert
            message="您当前处于离线状态。部分功能可能不可用，但基本的姿势检测仍然可以使用。"
          />
        )}
        
        {/* 使用增强的错误处理组件 */}
        <ErrorHandler
          error={error}
          errorType={errorType}
          severity={
            errorType === ErrorTypes.CAMERA_ACCESS || errorType === ErrorTypes.PERMISSION
              ? ErrorSeverity.CRITICAL
              : ErrorSeverity.ERROR
          }
          onRetry={handleRetry}
          onDismiss={() => {
            setError(null);
            setErrorType(null);
          }}
          showDismiss={errorType !== ErrorTypes.CAMERA_ACCESS}
        >
          {showInstructions ? (
            <div className="training-instructions">
              <h2>准备开始 {sequence.title}</h2>
              <p className="instruction-desc">{sequence.description}</p>
              
              <div className="instruction-details">
                <div className="instruction-item">
                  <span className="instruction-icon">🕒</span>
                  <div className="instruction-text">
                    <h3>总时长</h3>
                    <p>{sequence.poses.reduce((total, pose) => total + pose.duration, 0) / 60} 分钟</p>
                  </div>
                </div>
                
                <div className="instruction-item">
                  <span className="instruction-icon">🧘‍♀️</span>
                  <div className="instruction-text">
                    <h3>体式数量</h3>
                    <p>{sequence.poses.length} 个体式</p>
                  </div>
                </div>
                
                <div className="instruction-item">
                  <span className="instruction-icon">💪</span>
                  <div className="instruction-text">
                    <h3>难度等级</h3>
                    <p>{sequence.level === 'beginner' ? '初学者' : 
                        sequence.level === 'intermediate' ? '中级' : '高级'}</p>
                  </div>
                </div>
              </div>
              
              <div className="instruction-tips">
                <h3>训练提示</h3>
                <ul>
                  <li>确保您有足够的空间进行练习</li>
                  <li>准备好瑜伽垫或其他柔软的表面</li>
                  <li>穿着舒适的衣物</li>
                  <li>保持专注于呼吸</li>
                  <li>如果感到不适，随时可以暂停或调整姿势</li>
                </ul>
              </div>
              
              {/* 显示性能相关提示 */}
              {compatibility && compatibility.performance && compatibility.performance.performanceLevel !== 'high' && (
                <div className="performance-note">
                  <h3>设备兼容性提示</h3>
                  <p>
                    检测到您的设备性能{compatibility.performance.performanceLevel === 'low' ? '较低' : '中等'}。
                    我们已自动调整设置以确保流畅体验。可能会稍微降低检测精度，但不会影响主要功能。
                  </p>
                </div>
              )}
              
              <div className="instruction-actions">
                <button className="btn btn-primary btn-lg" onClick={startTraining}>
                  开始练习
                </button>
                <button className="btn btn-secondary btn-lg" onClick={exitTraining}>
                  返回详情
                </button>
              </div>
            </div>
          ) : (
            <div className="training-session">
              <div className="training-header">
                <h2>{sequence.title}</h2>
                <div className="training-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${((currentPoseIndex) / sequence.poses.length) * 100}%` }}></div>
                  </div>
                  <div className="progress-text">
                    {currentPoseIndex + 1} / {sequence.poses.length}
                  </div>
                </div>
              </div>
              
              <div className="pose-container">
                <div className="camera-view">
                  {/* 视频和Canvas */}
                  <video 
                    ref={videoRef} 
                    style={{ display: 'none' }}
                  ></video>
                  <canvas 
                    ref={canvasRef}
                    width={compatibility?.performance?.performanceLevel === 'low' ? 320 : 640}
                    height={compatibility?.performance?.performanceLevel === 'low' ? 240 : 480}
                  ></canvas>
                  
                  {!isPlaying && (
                    <div className="camera-loading">
                      <div className="camera-loading-spinner"></div>
                      <p>准备摄像头中...</p>
                    </div>
                  )}
                  
                  <div className="pose-reference">
                    <img src={sequence.poses[currentPoseIndex].imageUrl} alt={sequence.poses[currentPoseIndex].name} />
                  </div>
                </div>
                
                <div className="pose-info">
                  <div className="pose-header">
                    <h3>{sequence.poses[currentPoseIndex].name}</h3>
                    <div className="pose-sanskrit">{sequence.poses[currentPoseIndex].sanskritName}</div>
                  </div>
                  
                  <div className="pose-timer">
                    <div className="timer-display">{formatTime(timeLeft)}</div>
                    <div className="timer-controls">
                      <button 
                        className="timer-btn prev-btn" 
                        onClick={prevPose}
                        disabled={currentPoseIndex === 0}
                      >
                        上一个
                      </button>
                      <button 
                        className="timer-btn play-btn" 
                        onClick={togglePause}
                      >
                        {isPaused ? '继续' : '暂停'}
                      </button>
                      <button 
                        className="timer-btn next-btn" 
                        onClick={nextPose}
                        disabled={currentPoseIndex === sequence.poses.length - 1}
                      >
                        下一个
                      </button>
                    </div>
                  </div>
                  
                  <div className="pose-description">
                    <p>{sequence.poses[currentPoseIndex].description}</p>
                  </div>
                  
                  <div className="pose-feedback">
                    <h4>AI 反馈</h4>
                    <div className="feedback-content">
                      <p>{feedback.message || '保持姿势稳定，注意呼吸。'}</p>
                      <div className="accuracy-meter">
                        <div className="accuracy-label">姿势准确度</div>
                        <div className="accuracy-bar">
                          <div 
                            className="accuracy-fill" 
                            style={{ 
                              width: `${feedback.accuracy}%`,
                              backgroundColor: feedback.accuracy < 50 ? '#ff9800' : 
                                            feedback.accuracy < 75 ? '#8bc34a' : '#4caf50'
                            }}
                          ></div>
                        </div>
                        <div className="accuracy-value">{Math.round(feedback.accuracy)}%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pose-tips">
                    <h4>提示</h4>
                    <p>{sequence.poses[currentPoseIndex].tips}</p>
                  </div>
                  
                  <button className="exit-btn" onClick={exitTraining}>
                    退出练习
                  </button>
                </div>
              </div>
            </div>
          )}
        </ErrorHandler>
      </div>
    </CompatibilityCheck>
  );
};

export default FreeTraining;