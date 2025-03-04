import React, { useState } from 'react';
import PoseFeedback from './components/Feedback/PoseFeedback';
import AccuracyMeter from './components/Feedback/AccuracyMeter';
import useWebcam from './hooks/useWebcam';

const YogaPractice = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState({
    message: '',
    items: [],
    accuracy: 0
  });
  
  const { 
    webcamRef, 
    canvasRef, 
    isPoseDetectorReady,
    poseLandmarks,
    analyzePose,
    error
  } = useWebcam();
  
  // 分析当前姿势
  const handleAnalyzePose = () => {
    setIsAnalyzing(true);
    
    // 模拟分析延迟
    setTimeout(() => {
      if (poseLandmarks) {
        const analysis = analyzePose('山式');
        
        // 生成详细反馈项目
        const feedbackItems = [];
        if (analysis.accuracy < 70) {
          feedbackItems.push('注意脊柱对齐，保持挺直');
          feedbackItems.push('双脚并拢，重量均匀分布');
        }
        
        setFeedback({
          message: analysis.message,
          items: feedbackItems,
          accuracy: analysis.accuracy
        });
      } else {
        setFeedback({
          message: '无法检测到姿势，请确保您的全身在画面中',
          items: [],
          accuracy: 0
        });
      }
      
      setIsAnalyzing(false);
    }, 1500);
  };
  
  return (
    <div className="yoga-practice">
      <h2>瑜伽姿势分析</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="camera-container">
        <video 
          ref={webcamRef}
          style={{ display: 'none' }}
          autoPlay
          playsInline
        />
        <canvas 
          ref={canvasRef}
          width={640}
          height={480}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      
      <div className="controls">
        <button 
          onClick={handleAnalyzePose}
          disabled={!isPoseDetectorReady || isAnalyzing}
          className="analyze-btn"
        >
          {isAnalyzing ? '分析中...' : '分析当前姿势'}
        </button>
      </div>
      
      <div className="feedback-container">
        <PoseFeedback 
          message={feedback.message}
          feedbackItems={feedback.items}
          isLoading={isAnalyzing}
        />
        
        <AccuracyMeter 
          accuracy={feedback.accuracy}
          label="姿势准确度"
        />
        
        <h3>仪表盘样式</h3>
        <AccuracyMeter 
          accuracy={feedback.accuracy}
          showDial={true}
        />
      </div>
    </div>
  );
};

export default YogaPractice;