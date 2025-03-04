import React, { useState } from 'react';
import './SequenceFlow.css';

const SequenceFlow = ({ sequence }) => {
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 示例序列
  const demoSequence = {
    title: "晨间活力流",
    poses: [
      { name: "山式", duration: 30, imageUrl: "/api/placeholder/300/200" },
      { name: "前屈式", duration: 45, imageUrl: "/api/placeholder/300/200" },
      { name: "战士一式", duration: 60, imageUrl: "/api/placeholder/300/200" },
      { name: "三角式", duration: 60, imageUrl: "/api/placeholder/300/200" },
      { name: "休息式", duration: 30, imageUrl: "/api/placeholder/300/200" }
    ]
  };
  
  const currentSequence = sequence || demoSequence;
  const currentPose = currentSequence.poses[currentPoseIndex];
  
  const nextPose = () => {
    if (currentPoseIndex < currentSequence.poses.length - 1) {
      setCurrentPoseIndex(currentPoseIndex + 1);
    } else {
      // 序列完成
      setIsPlaying(false);
    }
  };
  
  const prevPose = () => {
    if (currentPoseIndex > 0) {
      setCurrentPoseIndex(currentPoseIndex - 1);
    }
  };
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="sequence-flow">
      <h2>{currentSequence.title}</h2>
      
      <div className="sequence-progress">
        <div className="progress-indicator">
          {currentSequence.poses.map((pose, index) => (
            <div 
              key={index} 
              className={`progress-dot ${index === currentPoseIndex ? 'active' : ''}`}
              onClick={() => setCurrentPoseIndex(index)}
            />
          ))}
        </div>
        <div className="progress-text">
          {currentPoseIndex + 1} / {currentSequence.poses.length}
        </div>
      </div>
      
      <div className="pose-display">
        <div className="pose-card">
          <h3>{currentPose.name}</h3>
          <div className="pose-image">
            <img src={currentPose.imageUrl} alt={currentPose.name} />
          </div>
          <p>保持 {currentPose.duration} 秒</p>
        </div>
        
        <div className="pose-feedback">
          <h3>姿势反馈</h3>
          <p>AI 反馈将在这里显示</p>
        </div>
      </div>
      
      <div className="sequence-controls">
        <button 
          className="btn btn-secondary" 
          onClick={prevPose}
          disabled={currentPoseIndex === 0}
        >
          上一个
        </button>
        <button 
          className="btn btn-primary" 
          onClick={togglePlay}
        >
          {isPlaying ? "暂停" : "开始"}
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={nextPose}
          disabled={currentPoseIndex === currentSequence.poses.length - 1}
        >
          下一个
        </button>
      </div>
    </div>
  );
};

export default SequenceFlow;
