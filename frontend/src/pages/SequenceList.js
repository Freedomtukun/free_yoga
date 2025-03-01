import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSequences } from '../services/sequenceService';
import './SequenceList.css';

const SequenceList = () => {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: '',
    category: ''
  });
  
  // 加载序列数据
  useEffect(() => {
    const fetchSequences = async () => {
      try {
        setLoading(true);
        const data = await getSequences(filters);
        setSequences(data);
        setError(null);
      } catch (err) {
        console.error('获取序列列表时出错:', err);
        setError('无法加载序列列表。请稍后再试。');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSequences();
  }, [filters]);
  
  // 处理过滤器变化
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 清除过滤器
  const clearFilters = () => {
    setFilters({
      difficulty: '',
      category: ''
    });
  };
  
  // 格式化时长
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} 分钟`;
  };
  
  if (loading) {
    return <div className="loading">加载中...</div>;
  }
  
  return (
    <div className="sequence-list-container">
      <header className="sequence-header">
        <h1>瑜伽序列</h1>
        <p>探索多样化的瑜伽训练序列，提升您的练习体验</p>
      </header>
      
      <div className="sequence-filters">
        <div className="filter-group">
          <label htmlFor="difficulty">难度</label>
          <select
            id="difficulty"
            name="difficulty"
            value={filters.difficulty}
            onChange={handleFilterChange}
          >
            <option value="">所有难度</option>
            <option value="beginner">初学者</option>
            <option value="intermediate">中级</option>
            <option value="advanced">高级</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="category">类别</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">所有类别</option>
            <option value="morning">晨间瑜伽</option>
            <option value="evening">夜间瑜伽</option>
            <option value="energizing">能量提升</option>
            <option value="relaxing">放松减压</option>
            <option value="strength">力量训练</option>
            <option value="flexibility">灵活性</option>
          </select>
        </div>
        
        <button className="btn-clear" onClick={clearFilters}>
          清除筛选
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {sequences.length === 0 ? (
        <div className="no-sequences">
          <p>没有找到符合条件的序列</p>
        </div>
      ) : (
        <div className="sequence-grid">
          {sequences.map(sequence => (
            <div className="sequence-card" key={sequence._id}>
              <div className="sequence-difficulty">
                <span className={`difficulty-badge ${sequence.difficulty}`}>
                  {sequence.difficulty === 'beginner' ? '初学者' :
                   sequence.difficulty === 'intermediate' ? '中级' : '高级'}
                </span>
              </div>
              
              <h3 className="sequence-title">{sequence.name}</h3>
              <p className="sequence-description">{sequence.description}</p>
              
              <div className="sequence-meta">
                <span><i className="fa fa-clock-o"></i> {formatDuration(sequence.totalDuration)}</span>
                <span><i className="fa fa-th-list"></i> {sequence.poses.length} 个姿势</span>
              </div>
              
              <div className="sequence-category">
                <span className="category-tag">{sequence.category}</span>
              </div>
              
              <Link to={`/train/sequence/${sequence._id}`} className="btn-start-sequence">
                开始训练
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SequenceList;