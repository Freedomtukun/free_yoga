import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './SequenceDetail.css';

const SequenceDetail = () => {
  const [sequence, setSequence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 模拟API调用获取序列详情
    setTimeout(() => {
      // 假数据，模拟从API获取
      const mockSequence = {
        id: parseInt(id),
        title: '舒缓放松流',
        description: '这个序列旨在减轻压力，放松身心。它包含轻柔的体式，专注于深呼吸和舒展，帮助您释放身体和心灵的紧张。',
        level: 'beginner',
        duration: 20,
        focus: 'relaxation',
        imageUrl: '/api/placeholder/800/400',
        createdBy: 'SmartYoga团队',
        popularity: 88,
        poses: [
          {
            id: 1,
            name: '山式',
            sanskritName: 'Tadasana',
            duration: 30,
            description: '基础站姿，培养稳定性和姿势意识',
            imageUrl: '/api/placeholder/200/200',
            tips: '双脚并拢，均匀分配重量，脊柱延展'
          },
          {
            id: 2,
            name: '站立前屈式',
            sanskritName: 'Uttanasana',
            duration: 45,
            description: '拉伸腿筋和脊柱，促进血液循环',
            imageUrl: '/api/placeholder/200/200',
            tips: '膝盖可以微微弯曲，重点放在拉长脊柱而不是触碰地面'
          },
          {
            id: 3,
            name: '下犬式',
            sanskritName: 'Adho Mukha Svanasana',
            duration: 60,
            description: '全身伸展，舒缓压力',
            imageUrl: '/api/placeholder/200/200',
            tips: '双手按压地面，坐骨向上提升，脚跟尽量靠近地面'
          },
          {
            id: 4,
            name: '儿童式',
            sanskritName: 'Balasana',
            duration: 45,
            description: '温和的休息姿势，放松背部',
            imageUrl: '/api/placeholder/200/200',
            tips: '保持呼吸均匀，放松肩膀和背部'
          },
          {
            id: 5,
            name: '猫牛式',
            sanskritName: 'Marjaryasana/Bitilasana',
            duration: 60,
            description: '增加脊柱灵活性，舒缓背部',
            imageUrl: '/api/placeholder/200/200',
            tips: '跟随呼吸流动，吸气时向上看，呼气时弓背'
          },
          {
            id: 6,
            name: '鸽子式',
            sanskritName: 'Eka Pada Rajakapotasana',
            duration: 60,
            description: '打开髋部，减轻下背部紧张',
            imageUrl: '/api/placeholder/200/200',
            tips: '保持骨盆正对前方，不要倾斜'
          },
          {
            id: 7,
            name: '仰卧扭转',
            sanskritName: 'Jathara Parivartanasana',
            duration: 45,
            description: '温和扭转，舒缓背部和腹部',
            imageUrl: '/api/placeholder/200/200',
            tips: '保持肩膀贴地，呼气时进入扭转'
          },
          {
            id: 8,
            name: '尸式',
            sanskritName: 'Savasana',
            duration: 120,
            description: '深度放松，整合练习效果',
            imageUrl: '/api/placeholder/200/200',
            tips: '尽量让身体完全放松，注意觉察呼吸'
          }
        ],
        benefits: [
          '减轻压力和焦虑',
          '改善睡眠质量',
          '缓解肌肉紧张',
          '促进整体放松',
          '提高专注力'
        ]
      };
      
      setSequence(mockSequence);
      
      // 检查是否已收藏
      const favoritesStr = localStorage.getItem('favoriteSequences');
      if (favoritesStr) {
        const favorites = JSON.parse(favoritesStr);
        setIsFavorited(favorites.includes(parseInt(id)));
      }
      
      setLoading(false);
    }, 800);
  }, [id]);

  const handleStartTraining = () => {
    // 跳转到训练页面
    navigate(`/train/sequence/${id}`);
  };
  
  const toggleFavorite = () => {
    const newFavoritedState = !isFavorited;
    setIsFavorited(newFavoritedState);
    
    // 保存到本地存储
    const favoritesStr = localStorage.getItem('favoriteSequences');
    let favorites = favoritesStr ? JSON.parse(favoritesStr) : [];
    
    if (newFavoritedState) {
      // 添加到收藏
      if (!favorites.includes(parseInt(id))) {
        favorites.push(parseInt(id));
      }
    } else {
      // 从收藏中移除
      favorites = favorites.filter(favId => favId !== parseInt(id));
    }
    
    localStorage.setItem('favoriteSequences', JSON.stringify(favorites));
  };
  
  // 计算总时长
  const calculateTotalDuration = (poses) => {
    return poses ? poses.reduce((total, pose) => total + pose.duration, 0) : 0;
  };

  if (loading) {
    return (
      <div className="sequence-detail-page">
        <div className="container">
          <div className="loading">
            <p>加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  // 难度、专注点和时长的中文标签
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
  
  // 计算总时长（分钟:秒）
  const totalDuration = calculateTotalDuration(sequence.poses);
  const minutes = Math.floor(totalDuration / 60);
  const seconds = totalDuration % 60;

  return (
    <div className="sequence-detail-page">
      <div className="container">
        <div className="sequence-header">
          <div className="sequence-image">
            <img src={sequence.imageUrl} alt={sequence.title} />
            <div className="sequence-duration-badge">
              {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </div>
          </div>
          
          <div className="sequence-info">
            <div className="sequence-title-row">
              <h1>{sequence.title}</h1>
              <button 
                className={`favorite-button ${isFavorited ? 'favorited' : ''}`}
                onClick={toggleFavorite}
                aria-label={isFavorited ? '取消收藏' : '收藏'}
              >
                {isFavorited ? '★' : '☆'}
              </button>
            </div>
            
            <div className="sequence-meta">
              <span className={`detail-badge level-${sequence.level}`}>
                {levelLabels[sequence.level]}
              </span>
              <span className="detail-badge duration-badge">
                {sequence.duration} 分钟
              </span>
              <span className="detail-badge focus-badge">
                {focusLabels[sequence.focus]}
              </span>
            </div>
            
            <p className="sequence-description">
              {sequence.description}
            </p>
            
            <div className="sequence-stats">
              <div className="sequence-stat">
                <span className="stat-value">{sequence.poses.length}</span>
                <span className="stat-label">体式数量</span>
              </div>
              <div className="sequence-stat">
                <span className="stat-value">{sequence.popularity}%</span>
                <span className="stat-label">用户满意度</span>
              </div>
              <div className="sequence-stat">
                <span className="stat-value">{Math.floor(totalDuration / 60)} 分钟</span>
                <span className="stat-label">总时长</span>
              </div>
            </div>
            
            <div className="action-buttons">
              <button className="btn btn-primary btn-lg" onClick={handleStartTraining}>
                开始训练
              </button>
              <button className="btn btn-secondary btn-lg" onClick={toggleFavorite}>
                {isFavorited ? '取消收藏' : '收藏序列'}
              </button>
              <button className="btn btn-outline btn-lg">
                分享
              </button>
            </div>
          </div>
        </div>
        
        <div className="sequence-content">
          <div className="sequence-tabs">
            <button className="tab-button active">体式序列</button>
            <button className="tab-button">训练收益</button>
            <button className="tab-button">注意事项</button>
          </div>
          
          <div className="tab-content">
            <div className="pose-sequence">
              <h2>体式序列 ({sequence.poses.length})</h2>
              <div className="sequence-timeline">
                {sequence.poses.map((pose, index) => (
                  <div key={pose.id} className="pose-item">
                    <div className="pose-number">{index + 1}</div>
                    <div className="pose-card">
                      <div className="pose-image">
                        <img src={pose.imageUrl} alt={pose.name} />
                        <div className="pose-duration">{Math.floor(pose.duration / 60)}:{pose.duration % 60 < 10 ? `0${pose.duration % 60}` : pose.duration % 60}</div>
                      </div>
                      <div className="pose-details">
                        <h3>{pose.name}</h3>
                        <div className="pose-sanskrit">{pose.sanskritName}</div>
                        <p>{pose.description}</p>
                        <div className="pose-tips">
                          <h4>提示</h4>
                          <p>{pose.tips}</p>
                        </div>
                      </div>
                    </div>
                    {index < sequence.poses.length - 1 && (
                      <div className="timeline-connector"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="sequence-benefits">
          <h2>训练收益</h2>
          <ul className="benefits-list">
            {sequence.benefits.map((benefit, index) => (
              <li key={index} className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span className="benefit-text">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="sequence-related">
          <h2>相关推荐</h2>
          <div className="related-sequences">
            <div className="related-card">
              <img src="/api/placeholder/300/200" alt="相关序列" />
              <h3>睡前放松流</h3>
              <span className="level-badge beginner">初学者</span>
              <button className="btn btn-sm">查看详情</button>
            </div>
            <div className="related-card">
              <img src="/api/placeholder/300/200" alt="相关序列" />
              <h3>冥想与呼吸练习</h3>
              <span className="level-badge beginner">初学者</span>
              <button className="btn btn-sm">查看详情</button>
            </div>
            <div className="related-card">
              <img src="/api/placeholder/300/200" alt="相关序列" />
              <h3>全身柔韧流</h3>
              <span className="level-badge intermediate">中级</span>
              <button className="btn btn-sm">查看详情</button>
            </div>
          </div>
        </div>
        
        <div className="back-link">
          <Link to="/sequences">← 返回序列列表</Link>
        </div>
      </div>
    </div>
  );
};

export default SequenceDetail;