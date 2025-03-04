import React from 'react';
import './AccuracyMeter.css';

/**
 * 准确度计量表组件 - 显示姿势准确度评分
 * 
 * @param {Object} props
 * @param {number} props.accuracy - 0-100之间的准确度评分
 * @param {string} props.label - 可选的标签文本，默认为"姿势准确度"
 * @param {boolean} props.showValue - 是否显示准确度数值，默认为true
 * @param {boolean} props.showDial - 是否显示表盘样式，默认为false
 * @param {string} props.className - 可选的额外CSS类名
 */
const AccuracyMeter = ({ 
  accuracy = 0, 
  label = "姿势准确度", 
  showValue = true, 
  showDial = false,
  className = '' 
}) => {
  // 确保准确度在有效范围内
  const validAccuracy = Math.max(0, Math.min(100, accuracy));
  
  // 确定准确度级别
  const getAccuracyLevel = (value) => {
    if (value < 50) return 'poor';
    if (value < 75) return 'average';
    return 'good';
  };
  
  const accuracyLevel = getAccuracyLevel(validAccuracy);

  return (
    <div className={`accuracy-meter ${className}`}>
      <div className="accuracy-label">{label}</div>
      
      {showDial ? (
        // 仪表盘风格
        <div className="meter-container">
          <div className="meter-scale">
            <span className="meter-label low">低</span>
            <span className="meter-label medium">中</span>
            <span className="meter-label high">高</span>
          </div>
          
          <div className="meter-dial">
            <div 
              className={`meter-value ${accuracyLevel}`}
              style={{ 
                transform: `translateX(-50%) rotate(${validAccuracy * 1.8}deg)`
              }}
            ></div>
          </div>
          
          {showValue && (
            <div className={`accuracy-value ${accuracyLevel}`}>
              {Math.round(validAccuracy)}%
            </div>
          )}
        </div>
      ) : (
        // 进度条风格
        <div className="accuracy-bar-container">
          <div className="accuracy-bar">
            <div 
              className={`accuracy-fill ${accuracyLevel}`}
              style={{ width: `${validAccuracy}%` }}
            ></div>
          </div>
          
          {showValue && (
            <div className={`accuracy-value ${accuracyLevel}`}>
              {Math.round(validAccuracy)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccuracyMeter;