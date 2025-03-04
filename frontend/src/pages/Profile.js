import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    yogaLevel: 'beginner',
    fitnessGoals: []
  });
  const [stats, setStats] = useState({
    sessionCount: 0,
    totalTime: 0,
    favoriteSequence: '',
    streak: 0
  });
  
  // 新增: 历史记录数据
  const [history, setHistory] = useState([]);
  // 新增: 收藏序列数据
  const [favorites, setFavorites] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    // 检查用户是否登录
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    // 获取用户数据
    const userData = JSON.parse(storedUser);
    setUser(userData);
    
    // 设置用户表单初始数据
    setUserForm({
      name: userData.name || '',
      email: userData.email || '',
      yogaLevel: userData.yogaLevel || 'beginner',
      fitnessGoals: userData.fitnessGoals || []
    });
    
    // 模拟获取用户统计数据
    setTimeout(() => {
      setStats({
        sessionCount: 24,
        totalTime: 720, // 以分钟为单位
        favoriteSequence: '晨间活力流',
        streak: 5
      });
      
      // 模拟历史记录数据
      setHistory([
        { id: 1, date: '2023-03-01', name: '晨间活力流', duration: 15, completed: true },
        { id: 2, date: '2023-03-03', name: '舒缓放松流', duration: 20, completed: true },
        { id: 3, date: '2023-03-05', name: '核心力量训练', duration: 30, completed: false },
        { id: 4, date: '2023-03-07', name: '全身柔韧流', duration: 25, completed: true },
        { id: 5, date: '2023-03-10', name: '冥想与呼吸练习', duration: 15, completed: true }
      ]);
      
      // 模拟收藏序列数据
      setFavorites([
        { id: 1, title: '核心力量训练', level: 'intermediate', imageUrl: '/api/placeholder/120/120' },
        { id: 2, title: '睡前放松流', level: 'beginner', imageUrl: '/api/placeholder/120/120' },
        { id: 3, title: '阴瑜伽深度伸展', level: 'intermediate', imageUrl: '/api/placeholder/120/120' }
      ]);
      
      setLoading(false);
    }, 800);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  // 处理个人资料更新
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    
    // 在实际应用中，这里会调用API更新用户资料
    // 现在我们只是更新本地存储
    const updatedUser = {
      ...user,
      ...userForm
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
  };
  
  // 获取瑜伽水平显示文本
  const getYogaLevelText = (level) => {
    const levels = {
      beginner: '初学者',
      intermediate: '中级',
      advanced: '高级'
    };
    return levels[level] || '初学者';
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="loading">
            <p>加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          
          {isEditing ? (
            <div className="profile-edit-form">
              <h2>编辑个人资料</h2>
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label htmlFor="name">姓名</label>
                  <input 
                    type="text" 
                    id="name" 
                    value={userForm.name}
                    onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">邮箱</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="yogaLevel">瑜伽水平</label>
                  <select 
                    id="yogaLevel" 
                    value={userForm.yogaLevel}
                    onChange={(e) => setUserForm({...userForm, yogaLevel: e.target.value})}
                  >
                    <option value="beginner">初学者</option>
                    <option value="intermediate">中级</option>
                    <option value="advanced">高级</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>健身目标 (可多选)</label>
                  <div className="checkbox-group">
                    {['灵活性', '力量', '平衡', '减压', '冥想'].map(goal => (
                      <label key={goal} className="checkbox-label">
                        <input 
                          type="checkbox" 
                          checked={userForm.fitnessGoals.includes(goal)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setUserForm({
                                ...userForm, 
                                fitnessGoals: [...userForm.fitnessGoals, goal]
                              });
                            } else {
                              setUserForm({
                                ...userForm, 
                                fitnessGoals: userForm.fitnessGoals.filter(g => g !== goal)
                              });
                            }
                          }}
                        />
                        {goal}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">保存</button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setIsEditing(false)}
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="profile-info">
                <h2>{user?.name}</h2>
                <p>{user?.email}</p>
                <p>瑜伽水平: {getYogaLevelText(user?.yogaLevel)}</p>
                {user?.fitnessGoals && user.fitnessGoals.length > 0 && (
                  <div className="goals-tags">
                    {user.fitnessGoals.map(goal => (
                      <span key={goal} className="goal-tag">{goal}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="profile-actions">
                <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                  编辑资料
                </button>
                <button onClick={handleLogout} className="btn btn-secondary logout-btn">
                  退出登录
                </button>
              </div>
            </>
          )}
        </div>

        <div className="stats-overview">
          <div className="stat-card">
            <h3>{stats.sessionCount}</h3>
            <p>总练习次数</p>
          </div>
          <div className="stat-card">
            <h3>{Math.floor(stats.totalTime / 60)}小时 {stats.totalTime % 60}分钟</h3>
            <p>总练习时间</p>
          </div>
          <div className="stat-card">
            <h3>{stats.favoriteSequence}</h3>
            <p>最喜爱课程</p>
          </div>
          <div className="stat-card">
            <h3>{stats.streak}天</h3>
            <p>连续练习</p>
          </div>
        </div>

        <div className="profile-sections">
          <div className="profile-section">
            <h3>练习历史</h3>
            <div className="history-list">
              {history.map(session => (
                <div key={session.id} className={`history-item ${!session.completed ? 'incomplete' : ''}`}>
                  <div className="history-date">{session.date}</div>
                  <div className="history-details">
                    <span className="history-name">{session.name}</span>
                    <span className="history-duration">{session.duration} 分钟</span>
                  </div>
                  <div className="history-status">
                    {session.completed ? 
                      <span className="status-complete">完成</span> : 
                      <span className="status-incomplete">未完成</span>
                    }
                  </div>
                  <Link to={`/sequence/${session.id}`} className="btn btn-small">
                    {session.completed ? '重新练习' : '继续练习'}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-section">
            <h3>偏好设置</h3>
            <div className="preferences-list">
              <div className="preference-item">
                <span className="preference-label">提醒频率</span>
                <select className="preference-value" defaultValue="daily">
                  <option value="daily">每日</option>
                  <option value="weekly">每周</option>
                  <option value="none">不提醒</option>
                </select>
              </div>
              
              <div className="preference-item">
                <span className="preference-label">训练难度</span>
                <select className="preference-value" defaultValue="adaptive">
                  <option value="easy">简单</option>
                  <option value="moderate">适中</option>
                  <option value="challenging">挑战</option>
                  <option value="adaptive">自适应</option>
                </select>
              </div>
              
              <div className="preference-item toggle-item">
                <span className="preference-label">声音反馈</span>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked={true} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="preference-item toggle-item">
                <span className="preference-label">练习提醒</span>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked={true} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>我的收藏</h3>
            <div className="favorites-grid">
              {favorites.map(favorite => (
                <div key={favorite.id} className="favorite-card">
                  <div className="favorite-image">
                    <img src={favorite.imageUrl} alt={favorite.title} />
                  </div>
                  <div className="favorite-content">
                    <h4>{favorite.title}</h4>
                    <span className={`level-tag ${favorite.level}`}>
                      {getYogaLevelText(favorite.level)}
                    </span>
                    <Link to={`/sequence/${favorite.id}`} className="btn btn-sm">练习</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;