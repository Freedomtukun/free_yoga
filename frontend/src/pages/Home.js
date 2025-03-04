import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { useAuth } from '../contexts/AuthContext';
import LandingPage from './LandingPage';

const Home = () => {
  const { currentUser } = useAuth();

  // 如果用户未登录，显示LandingPage
  if (!currentUser) {
    return <LandingPage />;
  }

  return (
    <div className="home-dashboard">
      <div className="container">
        {/* 新增: 个性化欢迎横幅 */}
        <div className="welcome-banner">
          <div className="user-greeting">
            <h1>欢迎回来，{currentUser.name}！</h1>
            <p className="last-activity">上次练习：2天前 · 完成了"舒缓放松流"</p>
          </div>
          <div className="quick-stats">
            <div className="stat">
              <span className="stat-number">7</span>
              <span className="stat-label">总练习次数</span>
            </div>
            <div className="stat">
              <span className="stat-number">3</span>
              <span className="stat-label">本周练习</span>
            </div>
            <div className="stat">
              <span className="stat-number">5</span>
              <span className="stat-label">连续天数</span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>继续您的练习</h2>
            <div className="last-session">
              <div className="session-image">
                <img src="/api/placeholder/100/100" alt="上次练习" />
              </div>
              <div className="session-details">
                <h3>舒缓放松流</h3>
                <p>已完成 15 分钟，还剩 5 分钟</p>
                <Link to="/sequence/2?resume=true" className="btn btn-primary btn-sm">继续练习</Link>
              </div>
            </div>
          </div>
          
          <div className="dashboard-card">
            <h2>您的进度</h2>
            <div className="stats">
              <div className="stat-item">
                <span className="stat-value">5</span>
                <span className="stat-label">已完成练习</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">3</span>
                <span className="stat-label">连续天数</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">120</span>
                <span className="stat-label">总分钟数</span>
              </div>
            </div>
            <Link to="/profile" className="btn btn-secondary">查看详情</Link>
          </div>
          
          {/* 更新: 个性化推荐部分 */}
          <div className="dashboard-card">
            <h2>为您推荐</h2>
            <div className="personalized-recommendations">
              <div className="recommendation-item">
                <img src="/api/placeholder/240/160" alt="专为您推荐的序列" />
                <div className="recommendation-details">
                  <h3>柔韧度提升计划</h3>
                  <p>基于您的练习历史，我们认为这个序列很适合您</p>
                  <Link to="/sequence/5" className="btn btn-sm btn-primary">开始练习</Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-card">
            <h2>今日提示</h2>
            <div className="daily-tip">
              <p>"深呼吸是瑜伽练习的基础。在每次体式转换之间，记得回到呼吸。"</p>
            </div>
          </div>

          {/* 新增: 收藏的序列 */}
          <div className="dashboard-card">
            <h2>我的收藏</h2>
            <div className="favorites-list">
              {[
                { id: 1, title: '核心力量训练', level: '中级', imageUrl: '/api/placeholder/80/80' },
                { id: 2, title: '睡前放松流', level: '初级', imageUrl: '/api/placeholder/80/80' },
              ].map(item => (
                <div key={item.id} className="favorite-item">
                  <img src={item.imageUrl} alt={item.title} />
                  <div className="favorite-details">
                    <h4>{item.title}</h4>
                    <span className="level-badge">{item.level}</span>
                  </div>
                  <Link to={`/sequence/${item.id}`} className="btn btn-sm btn-outline">练习</Link>
                </div>
              ))}
            </div>
            <Link to="/favorites" className="btn btn-text">查看全部收藏</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;