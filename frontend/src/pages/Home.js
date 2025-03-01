import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>智能瑜伽助手</h1>
            <p>利用AI技术实时分析姿势，提升您的瑜伽练习体验</p>
            
            <div className="hero-buttons">
              {isAuthenticated ? (
                <>
                  <Link to="/train/free" className="btn-primary">开始练习</Link>
                  <Link to="/sequences" className="btn-secondary">浏览序列</Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn-primary">免费注册</Link>
                  <Link to="/login" className="btn-secondary">立即登录</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">主要功能</h2>
          
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-icon">AI</div>
              <h3>智能姿势分析</h3>
              <p>实时检测和分析您的瑜伽姿势，提供即时反馈</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>数据追踪</h3>
              <p>记录您的练习历史和进步，帮助您持续提高</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🧘</div>
              <h3>专业序列</h3>
              <p>多种瑜伽序列满足不同需求，从初学者到高级练习者</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>随时随地练习</h3>
              <p>无需专业设备，随时随地进行瑜伽练习</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">如何使用</h2>
          
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>选择训练模式</h3>
              <p>选择自由训练或预设的序列训练</p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h3>打开摄像头</h3>
              <p>保证您的整个身体在画面中可见</p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h3>开始练习</h3>
              <p>跟随指导，获得实时反馈和改进建议</p>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <h3>追踪进度</h3>
              <p>查看您的练习历史和进步</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>开始您的瑜伽之旅</h2>
          <p>智能助手帮助您提升瑜伽技能，改善身体健康</p>
          <Link to={isAuthenticated ? "/train/free" : "/register"} className="btn-primary btn-large">
            {isAuthenticated ? "立即开始" : "免费注册"}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;