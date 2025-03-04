import React from 'react';
import './PoseFeedback.css';

/**
 * 姿势反馈组件 - 显示AI评估的姿势反馈信息
 * 
 * @param {Object} props
 * @param {string} props.message - 反馈信息文本
 * @param {Array} props.feedbackItems - 可选的反馈项列表
 * @param {boolean} props.isLoading - 是否处于加载状态
 * @param {string} props.className - 可选的额外CSS类名
 */
const PoseFeedback = ({ message, feedbackItems = [], isLoading = false, className = '' }) => {
  // 如果没有反馈信息且不在加载中，显示空状态
  if (!message && !isLoading && feedbackItems.length === 0) {
    return (
      <div className="pose-feedback-empty">
        等待姿势分析中...
      </div>
    );
  }

  return (
    <div className={`pose-feedback ${className}`}>
      <h4>
        <span className="feedback-icon">💬</span>
        AI 反馈
      </h4>
      
      <div className="feedback-content">
        {isLoading ? (
          <div className="feedback-loading">
            <div className="feedback-loading-spinner"></div>
            <p>正在分析您的姿势...</p>
          </div>
        ) : (
          <>
            {message && <p className="feedback-message">{message}</p>}
            
            {feedbackItems.length > 0 && (
              <ul className="feedback-list">
                {feedbackItems.map((item, index) => (
                  <li key={index} className="feedback-item">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PoseFeedback;