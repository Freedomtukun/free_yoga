import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera } from '@mediapipe/camera_utils';
import { Pose, POSE_LANDMARKS } from '@mediapipe/pose';
import './SequenceTraining.css';

// 组件代码假设省略部分...

const SequenceTraining = () => {
  const { sequenceId } = useParams();
  const navigate = useNavigate();
  const [sequence, setSequence] = useState(null);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [feedback, setFeedback] = useState({ message: '', accuracy: 0 });
  const [isPortrait, setIsPortrait] = useState(true);
  const [showPlacementGuide, setShowPlacementGuide] = useState(true);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const poseRef = useRef(null);
  const timerRef = useRef(null);
  
  // 检测设备方向
  useEffect(() => {
    const checkOrientation = () => {
      if (window.orientation !== undefined) {
        // 基于window.orientation
        setIsPortrait(window.orientation === 0 || window.orientation === 180);
      } else if (window.screen && window.screen.orientation) {
        // 基于screen.orientation API
        const orientation = window.screen.orientation.type;
        setIsPortrait(orientation.includes('portrait'));
      } else {
        // 回退：基于视口尺寸
        setIsPortrait(window.innerHeight > window.innerWidth);
      }
    };
    
    // 初始检查
    checkOrientation();
    
    // 设置事件监听器
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);
    
    // 尝试锁定竖屏
    const lockScreenOrientation = async () => {
      try {
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('portrait');
        }
      } catch (error) {
        console.log('无法锁定屏幕方向:', error);
      }
    };
    
    lockScreenOrientation();
    
    return () => {
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('resize', checkOrientation);
      // 解锁屏幕方向
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    };
  }, []);
  
  // 获取瑜伽序列数据
  useEffect(() => {
    const fetchSequence = async () => {
      try {
        setIsLoading(true);
        // 这里应该是您的API调用，获取序列数据
        const response = await fetch(`/api/sequences/${sequenceId}`);
        if (!response.ok) throw new Error('无法获取序列数据');
        const data = await response.json();
        setSequence(data);
        setIsLoading(false);
      } catch (error) {
        console.error('获取序列数据失败:', error);
        setIsLoading(false);
        // 可以添加错误处理，如显示错误消息或重定向
      }
    };
    
    fetchSequence();
  }, [sequenceId]);
  
  // 初始化MediaPipe姿势检测
  useEffect(() => {
    if (!showInstructions && videoRef.current) {
      // 创建Pose实例
      poseRef.current = new Pose({
        locateFile: (file) => {
          return `/mediapipe/${file}`;
        }
      });
      
      // 设置选项
      poseRef.current.setOptions({
        modelComplexity: 1, // 在移动设备上使用中等复杂度模型平衡性能和准确性
        smoothLandmarks: true,
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
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
        facingMode: 'user' // 使用前置摄像头
      });
      
      // 启动摄像头
      cameraRef.current.start()
        .then(() => {
          console.log('摄像头启动成功');
        })
        .catch(error => {
          console.error('摄像头启动失败:', error);
          // 显示摄像头错误消息
          showCameraError(error);
        });
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
  }, [showInstructions]);
  
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
      showOverlayMessage('无法检测到姿势，请确保您的全身在画面中', 'warning');
      return;
    }
    
    // 绘制姿势标记点和连接线
    drawPoseLandmarks(ctx, results.poseLandmarks, width, height);
    
    // 与目标姿势进行比较
    if (sequence.poses && sequence.poses[currentPoseIndex]) {
      const currentPoseTemplate = sequence.poses[currentPoseIndex].template;
      const accuracy = comparePoseWithTemplate(results.poseLandmarks, currentPoseTemplate);
      
      // 更新反馈信息
      updateFeedback(results.poseLandmarks, currentPoseTemplate, accuracy);
    }
  };
  
  // 绘制姿势标记点
  const drawPoseLandmarks = (ctx, landmarks, width, height) => {
    if (!landmarks) return;
    
    // 设置线条样式
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    
    // 绘制骨架连接线（使用POSE_CONNECTIONS）
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
      // 使用更小的点在移动设备上
      const pointSize = isPortrait ? 4 : 6;
      ctx.arc(landmark.x * width, landmark.y * height, pointSize, 0, 2 * Math.PI);
      ctx.fill();
    });
  };
  
  // 将当前姿势与模板进行比较
  const comparePoseWithTemplate = (landmarks, template) => {
    // 这里是您的姿势比较逻辑
    // 简化版示例:
    if (!landmarks || !template) return 0;
    
    // 使用欧几里得距离计算关键点的相似度
    // 注意：这只是一个简化的示例，实际项目需要更复杂的算法
    const keyPoints = [
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.LEFT_ELBOW,
      POSE_LANDMARKS.RIGHT_ELBOW,
      POSE_LANDMARKS.LEFT_WRIST,
      POSE_LANDMARKS.RIGHT_WRIST,
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.RIGHT_HIP,
      POSE_LANDMARKS.LEFT_KNEE,
      POSE_LANDMARKS.RIGHT_KNEE,
      POSE_LANDMARKS.LEFT_ANKLE,
      POSE_LANDMARKS.RIGHT_ANKLE,
    ];
    
    let totalDistance = 0;
    let validPoints = 0;
    
    keyPoints.forEach(pointIndex => {
      const detected = landmarks[pointIndex];
      const reference = template[pointIndex];
      
      if (detected && detected.visibility > 0.5 && reference) {
        const distance = Math.sqrt(
          Math.pow(detected.x - reference.x, 2) + 
          Math.pow(detected.y - reference.y, 2)
        );
        totalDistance += distance;
        validPoints++;
      }
    });
    
    if (validPoints === 0) return 0;
    
    // 计算平均距离，并转换为百分比准确度
    const avgDistance = totalDistance / validPoints;
    // 距离越小，准确度越高
    const accuracyPercentage = Math.max(0, Math.min(100, (1 - avgDistance * 10) * 100));
    
    return accuracyPercentage;
  };
  
  // 更新反馈信息
  const updateFeedback = (landmarks, template, accuracy) => {
    let feedbackMessage = '';
    
    if (accuracy < 50) {
      feedbackMessage = '请调整您的姿势，确保身体对齐';
    } else if (accuracy < 80) {
      feedbackMessage = '您的姿势近乎正确，请继续保持并进行微调';
    } else {
      feedbackMessage = '非常好！您的姿势非常准确';
    }
    
    // 检查特定部位的对齐情况，添加具体反馈
    if (landmarks && template) {
      // 检查肩膀对齐
      const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
      const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
      const shoulderYDiff = Math.abs(leftShoulder.y - rightShoulder.y);
      
      if (shoulderYDiff > 0.05) {
        feedbackMessage += '。尝试让您的肩膀保持水平';
      }
      
      // 可以添加更多部位的检查...
    }
    
    setFeedback({
      message: feedbackMessage,
      accuracy: accuracy
    });
    
    // 如果准确度足够高，在计时器启动时记录已完成的姿势
    if (accuracy >= 80 && isPlaying) {
      // 可以在这里添加记录完成度的逻辑
    }
  };
  
  // 显示覆盖消息
  const showOverlayMessage = (message, type = 'info') => {
    const overlay = document.querySelector('.pose-feedback-overlay');
    if (!overlay) return;
    
    overlay.textContent = message;
    overlay.className = `pose-feedback-overlay visible ${type}`;
    
    // 3秒后隐藏消息
    setTimeout(() => {
      overlay.classList.remove('visible');
    }, 3000);
  };
  
  // 显示摄像头错误
  const showCameraError = (error) => {
    console.error('摄像头错误:', error);
    
    // 创建错误提示元素
    const errorContainer = document.createElement('div');
    errorContainer.className = 'camera-error';
    errorContainer.innerHTML = `
      <h3>摄像头访问失败</h3>
      <p>${error.message || '请确保您已授予摄像头权限，并刷新页面重试。'}</p>
      <button onclick="window.location.reload()">刷新页面</button>
    `;
    
    // 添加到摄像头视图
    const cameraView = document.querySelector('.camera-view');
    if (cameraView) {
      cameraView.appendChild(errorContainer);
    }
  };
  
  // 开始训练
  const startTraining = () => {
    setShowInstructions(false);
  };
  
  // 计时器控制
  const toggleTimer = () => {
    if (isPlaying) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    } else {
      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // 下一个姿势
  const nextPose = () => {
    if (!sequence || currentPoseIndex >= sequence.poses.length - 1) return;
    
    // 重置计时器
    setTime(0);
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setCurrentPoseIndex(currentPoseIndex + 1);
  };
  
  // 上一个姿势
  const prevPose = () => {
    if (!sequence || currentPoseIndex <= 0) return;
    
    // 重置计时器
    setTime(0);
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setCurrentPoseIndex(currentPoseIndex - 1);
  };
  
  // 确认手机放置位置
  const confirmPlacement = () => {
    setShowPlacementGuide(false);
  };
  
  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 回到序列列表
  const exitTraining = () => {
    navigate('/sequences');
  };
  
  if (isLoading) {
    return (
      <div className="training-container">
        <div className="loading">加载序列训练数据...</div>
      </div>
    );
  }
  
  // 这里是渲染训练指导页面
  if (showInstructions) {
    return (
      <div className="training-container">
        <div className="training-instructions">
          <h2>{sequence?.name || '瑜伽序列训练'}</h2>
          <p className="instruction-desc">
            在开始练习之前，请了解以下重要信息以获得最佳体验
          </p>
          
          <div className="instruction-details">
            <div className="instruction-item">
              <div className="instruction-icon">⏱️</div>
              <div className="instruction-text">
                <h3>持续时间</h3>
                <p>{sequence?.duration || '15-20分钟'}</p>
              </div>
            </div>
            
            <div className="instruction-item">
              <div className="instruction-icon">🧘</div>
              <div className="instruction-text">
                <h3>难度级别</h3>
                <p>{sequence?.level || '初级'}</p>
              </div>
            </div>
            
            <div className="instruction-item">
              <div className="instruction-icon">🔄</div>
              <div className="instruction-text">
                <h3>体式数量</h3>
                <p>{sequence?.poses?.length || 0}个姿势</p>
              </div>
            </div>
          </div>
          
          <div className="instruction-tips">
            <h3>训练建议</h3>
            <ul>
              <li>确保您的全身能在摄像头画面中看到，特别是在进行站立姿势时</li>
              <li>选择一个光线良好、空间充足的地方进行练习</li>
              <li>最好保持竖屏模式以获得最佳效果</li>
              <li>建议使用瑜伽垫，穿着舒适且能清晰显示身体轮廓的服装</li>
              <li>根据提示调整姿势，接近80%准确度即可进入下一姿势</li>
            </ul>
          </div>
          
          <div className="instruction-actions">
            <button 
              className="btn-lg play-btn" 
              onClick={startTraining}
            >
              开始训练
            </button>
            <button 
              className="btn-lg prev-btn" 
              onClick={exitTraining}
            >
              返回列表
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // 手机放置指南
  if (showPlacementGuide) {
    return (
      <div className="training-container">
        <div className="device-placement-guide">
          <div className="placement-illustration"></div>
          <div className="placement-instructions">
            <h3>设置您的手机</h3>
            <p>将手机放置在距离您1-2米的稳定位置，确保您的全身能在画面中看到。竖向放置手机以获得最佳体验。</p>
          </div>
          <button className="start-button" onClick={confirmPlacement}>
            我已准备好
          </button>
        </div>
      </div>
    );
  }
  
  // 渲染训练会话页面
  const currentPose = sequence?.poses?.[currentPoseIndex];
  
  return (
    <div className="training-container">
      <div className="training-session">
        <div className="training-header">
          <h2>{sequence?.name || '瑜伽序列训练'}</h2>
          <div className="training-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(currentPoseIndex / (sequence?.poses?.length - 1)) * 100}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {`姿势 ${currentPoseIndex + 1}/${sequence?.poses?.length || 0}`}
            </div>
          </div>
        </div>
        
        <div className="pose-container">
          <div className={`camera-view ${isPortrait ? 'portrait-optimized' : ''}`}>
            <video 
              ref={videoRef} 
              style={{ display: 'none' }}
            ></video>
            <canvas 
              ref={canvasRef}
              width={640}
              height={480}
            ></canvas>
            
            <div className="camera-placeholder">
              正在加载摄像头...
            </div>
            
            <div className="pose-reference">
              {currentPose && (
                <img 
                  src={currentPose.imageUrl || '/images/poses/placeholder.jpg'} 
                  alt={currentPose.name} 
                />
              )}
            </div>
            
            <div className="pose-verification">
              <div className="verification-icon">✓</div>
              <div className="verification-progress">
                <svg width="100%" height="100%" viewBox="0 0 36 36">
                  <circle 
                    className="verification-bg"
                    cx="18" 
                    cy="18" 
                    r="16"
                  ></circle>
                  <circle 
                    className="verification-circle"
                    cx="18" 
                    cy="18" 
                    r="16" 
                    strokeDasharray="100" 
                    strokeDashoffset={100 - feedback.accuracy}
                  ></circle>
                </svg>
              </div>
            </div>
            
            <div className="pose-feedback-overlay">
              姿势反馈信息
            </div>
            
            <div className="camera-controls">
              <button className="camera-btn">
                <span className="visually-hidden">切换摄像头</span>
                📷
              </button>
            </div>
          </div>
          
          <div className="pose-info">
            <div className="pose-header">
              <h3>{currentPose?.name || '姿势名称'}</h3>
              <div className="pose-sanskrit">{currentPose?.sanskritName || ''}</div>
            </div>
            
            <div className="pose-timer">
              <div className="timer-display">{formatTime(time)}</div>
              <div className="timer-controls">
                <button 
                  className="timer-btn prev-btn" 
                  onClick={prevPose}
                  disabled={currentPoseIndex <= 0}
                >
                  上一个
                </button>
                <button 
                  className="timer-btn play-btn" 
                  onClick={toggleTimer}
                >
                  {isPlaying ? '暂停' : '开始'}
                </button>
                <button 
                  className="timer-btn next-btn" 
                  onClick={nextPose}
                  disabled={!sequence || currentPoseIndex >= sequence.poses.length - 1}
                >
                  下一个
                </button>
              </div>
            </div>
            
            <div className="pose-description">
              {currentPose?.description || '姿势描述将在这里显示。'}
            </div>
            
            <div className={`pose-feedback ${feedback.accuracy < 50 ? 'poor' : (feedback.accuracy < 80 ? 'average' : 'good')}`}>
              <h4>
                <span className="feedback-icon">
                  {feedback.accuracy < 50 ? '⚠️' : (feedback.accuracy < 80 ? '⚙️' : '✅')}
                </span>
                实时反馈
              </h4>
              <div className="feedback-content">
                <p>{feedback.message || '保持姿势，等待反馈...'}</p>
                
                <div className="accuracy-meter">
                  <div className="accuracy-label">
                    <span>姿势准确度</span>
                    <span className={`accuracy-value ${feedback.accuracy < 50 ? 'poor' : (feedback.accuracy < 80 ? 'average' : 'good')}`}>
                      {Math.round(feedback.accuracy)}%
                    </span>
                  </div>
                  <div className="accuracy-bar">
                    <div 
                      className={`accuracy-fill ${feedback.accuracy < 50 ? 'poor' : (feedback.accuracy < 80 ? 'average' : 'good')}`}
                      style={{ width: `${feedback.accuracy}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pose-tips">
              <h4>
                <span className="feedback-icon">💡</span>
                姿势要点
              </h4>
              <p>
                {currentPose?.tips || '保持呼吸均匀，放松肩膀，专注于体式的稳定性。'}
              </p>
            </div>
            
            <button className="exit-btn" onClick={exitTraining}>
              结束训练
            </button>
          </div>
        </div>
      </div>
      
      {isPortrait && (
        <div className="mobile-controls">
          <div className={`mobile-btn ${isPlaying ? 'active' : ''}`} onClick={toggleTimer}>
            <div className="mobile-btn-icon">
              {isPlaying ? '⏸️' : '▶️'}
            </div>
            <span>{isPlaying ? '暂停' : '开始'}</span>
          </div>
          
          <div className="mobile-btn" onClick={prevPose} style={{ opacity: currentPoseIndex <= 0 ? 0.5 : 1 }}>
            <div className="mobile-btn-icon">⬅️</div>
            <span>上一个</span>
          </div>
          
          <div className="mobile-btn" onClick={nextPose} style={{ opacity: !sequence || currentPoseIndex >= sequence.poses.length - 1 ? 0.5 : 1 }}>
            <div className="mobile-btn-icon">➡️</div>
            <span>下一个</span>
          </div>
          
          <div className="mobile-btn" onClick={exitTraining}>
            <div className="mobile-btn-icon">✖️</div>
            <span>退出</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SequenceTraining;