import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SequenceList.css';

const SequenceList = () => {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    level: 'all',
    duration: 'all',
    focus: 'all',
  });

  useEffect(() => {
    // 模拟从API获取瑜伽序列数据
    setTimeout(() => {
      const mockSequences = [
        {
          id: 1,
          title: '早晨活力流',
          description: '唤醒身体，激活能量的晨间序列',
          level: 'beginner',
          duration: 15,
          focus: 'energize',
          imageUrl: '/api/placeholder/400/250',
          popularity: 92
        },
        {
          id: 2,
          title: '舒缓放松流',
          description: '缓解压力，帮助放松身心的温和序列',
          level: 'beginner',
          duration: 20,
          focus: 'relaxation',
          imageUrl: '/api/placeholder/400/250',
          popularity: 88
        },
        {
          id: 3,
          title: '核心力量训练',
          description: '专注腹部和核心肌群的强化训练',
          level: 'intermediate',
          duration: 30,
          focus: 'strength',
          imageUrl: '/api/placeholder/400/250',
          popularity: 85
        },
        {
          id: 4,
          title: '全身柔韧流',
          description: '改善全身灵活性和关节活动度',
          level: 'beginner',
          duration: 25,
          focus: 'flexibility',
          imageUrl: '/api/placeholder/400/250',
          popularity: 79
        },
        {
          id: 5,
          title: '高级平衡挑战',
          description: '提升平衡能力和专注力的复杂体式序列',
          level: 'advanced',
          duration: 45,
          focus: 'balance',
          imageUrl: '/api/placeholder/400/250',
          popularity: 76
        },
        {
          id: 6,
          title: '下班减压序列',
          description: '适合工作后放松肩颈和背部紧张',
          level: 'intermediate',
          duration: 20,
          focus: 'relaxation',
          imageUrl: '/api/placeholder/400/250',
          popularity: 90
        },
        {
          id: 7,
          title: '冥想与呼吸练习',
          description: '专注呼吸和内观的冥想序列',
          level: 'beginner',
          duration: 15,
          focus: 'mindfulness',
          imageUrl: '/api/placeholder/400/250',
          popularity: 82
        },
        {
          id: 8,
          title: '阴瑜伽深度伸展',
          description: '长时间温和保持姿势，深度拉伸结缔组织',
          level: 'intermediate',
          duration: 40,
          focus: 'flexibility',
          imageUrl: '/api/placeholder/400/250',
          popularity: 78
        }
      ];
      
      setSequences(mockSequences);
      setLoading(false);
    }, 1000);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredSequences = sequences.filter(seq => {
    return (filter.level === 'all' || seq.level === filter.level) &&
           (filter.focus === 'all' || seq.focus === filter.focus) &&
           (filter.duration === 'all' || 
            (filter.duration === 'short' && seq.duration <= 15) ||
            (filter.duration === 'medium' && seq.duration > 15 && seq.duration <= 30) ||
            (filter.duration === 'long' && seq.duration > 30));
  });

  // 等级、时长和专注点的中文标签
  const levelLabels = {
    'beginner': '初学者',
    'intermediate': '中级',
    'advanced': '高级'
  };

  const focusLabels = {
    'energize': '提升能量',
    'relaxation': '放松减压',
    'strength': '力量训练',
    'flexibility': '柔韧伸展',
    'balance': '平衡挑战',
    'mindfulness': '正念冥想'
  };

  const durationLabels = (mins) => {
    return `${mins} 分钟`;
  };

  return (
    <div className="sequence-list-page">
      <div className="container">
        <div className="sequence-header">
          <h1>瑜伽训练序列</h1>
          <p>选择适合您的瑜伽训练，开始您的练习之旅</p>
        </div>

        <div className="sequence-filters">
          <div className="filter-group">
            <label htmlFor="level">难度</label>
            <select
              id="level"
              name="level"
              value={filter.level}
              onChange={handleFilterChange}
            >
              <option value="all">全部难度</option>
              <option value="beginner">初学者</option>
              <option value="intermediate">中级</option>
              <option value="advanced">高级</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="duration">时长</label>
            <select
              id="duration"
              name="duration"
              value={filter.duration}
              onChange={handleFilterChange}
            >
              <option value="all">全部时长</option>
              <option value="short">短 (≤15分钟)</option>
              <option value="medium">中 (16-30分钟)</option>
              <option value="long">长 (>30分钟)</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="focus">专注点</label>
            <select
              id="focus"
              name="focus"
              value={filter.focus}
              onChange={handleFilterChange}
            >
              <option value="all">全部类型</option>
              <option value="energize">提升能量</option>
              <option value="relaxation">放松减压</option>
              <option value="strength">力量训练</option>
              <option value="flexibility">柔韧伸展</option>
              <option value="balance">平衡挑战</option>
              <option value="mindfulness">正念冥想</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <p>加载中...</p>
          </div>
        ) : filteredSequences.length === 0 ? (
          <div className="no-results">
            <p>没有找到符合条件的训练序列，请尝试其他筛选条件</p>
          </div>
        ) : (
          <div className="sequence-grid">
            {filteredSequences.map(sequence => (
              <div key={sequence.id} className="sequence-card">
                <div className="sequence-image">
                  <img src={sequence.imageUrl} alt={sequence.title} />
                  <div className="sequence-duration">{durationLabels(sequence.duration)}</div>
                </div>
                <div className="sequence-content">
                  <h3>{sequence.title}</h3>
                  <p>{sequence.description}</p>
                  <div className="sequence-meta">
                    <span className={`level-badge ${sequence.level}`}>
                      {levelLabels[sequence.level]}
                    </span>
                    <span className="focus-tag">{focusLabels[sequence.focus]}</span>
                  </div>
                  <div className="sequence-popularity">
                    <div className="popularity-bar">
                      <div 
                        className="popularity-fill" 
                        style={{width: `${sequence.popularity}%`}}
                      ></div>
                    </div>
                    <span>{sequence.popularity}% 用户喜欢</span>
                  </div>
                  <Link to={`/sequence/${sequence.id}`} className="btn btn-primary btn-sm">
                    开始练习
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SequenceList;