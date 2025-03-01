import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { getSequence } from '../services/sequenceService';
import './SequenceDetail.css';

const SequenceDetail = () => {
  const { id } = useParams();
  const history = useHistory();
  const [sequence, setSequence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 加载序列详情
  useEffect(() => {
    const fetchSequence = async () => {
      try {
        setLoading(true);
        const data = await getSequence(id);
        setSequence(data);
        setError(null);
      } catch (err) {
        console.error('获取序列详情时出错:', err);
        setError('无法加载序列详情。请稍后再试。');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSequence();
  }, [id]);
  
  // 开始训练
  const startTraining = () => {
    history.push(`/train/sequence/${id}`);
  };
  
  // 返回序列列表
  const goBack = () => {
    history.push('/sequences');
  };
  
  // 格式化时长
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  if (loading) {
    return <div className="loading">加载中...</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button className="btn-secondary" onClick={goBack}>
          返回序列列表
        </button>
      </div>
    );
  }
  
  if (!sequence) {
    return (
      <div className="error-container">
        <div className="error-message">找不到该序列</div>
        <button className="btn-secondary" onClick={goBack}>
          返回序列列表
        </button>
      </div>
    );
  }
  
  return (
    <div className="sequence-detail-container">
      <div className="sequence-detail-header">
        <button className="btn-back" onClick={goBack}>
          &larr; 返回
        </button>
        
        <div className="sequence-title-section">
          <h1>{sequence.name}</h1>
          
          <div className="sequence-meta">
            <span className={`difficulty-badge ${sequence.difficulty}`}>
              {sequence.difficulty === 'beginner' ? '初学者' :
              sequence.difficulty === 'intermediate' ? '中级' : '高级'}
            </span>
            <span className="category-tag">{sequence.category}</span>
            <span className="duration-tag">
              <i className="fa fa-clock-o"></i> 总时长: {formatDuration(sequence.totalDuration)}
            </span>
            <span className="pose-count-tag">
              <i className="fa fa-th-list"></i> {sequence.poses.length} 个姿势
            </span>
          </div>
        </div>
      </div>
      
      <div className="sequence-description">
        <h2>序列描述</h2>
        <p>{sequence.description}</p>
      </div>
      
      <div className="sequence-poses">
        <h2>姿势列表</h2>
        <div className="pose-timeline">
          {sequence.poses.map((poseItem, index) => (
            <div className="pose-item" key={index}>
              <div className="pose-order">{index + 1}</div>
              <div className="pose-details">
                <h3>{poseItem.pose.name}</h3>
                <p className="pose-english-name">{poseItem.pose.englishName}</p>
                <p className="pose-duration">
                  持续时间: {formatDuration(poseItem.duration)}
                </p>
                {poseItem.transitionHint && (
                  <p className="transition-hint">
                    <strong>过渡提示:</strong> {poseItem.transitionHint}
                  </p>
                )}
              </div>
              {poseItem.pose.imageUrl && (
                <div className="pose-image">
                  <img src={poseItem.pose.imageUrl} alt={poseItem.pose.name} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="sequence-actions">
        <button className="btn-primary btn-start" onClick={startTraining}>
          开始训练
        </button>
      </div>
    </div>
  );
};

export default SequenceDetail;