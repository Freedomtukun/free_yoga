import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">404</div>
        <h1>页面未找到</h1>
        <p>很抱歉，您访问的页面不存在或已被移除。</p>
        <div className="not-found-actions">
          <Link to="/" className="btn-primary">返回首页</Link>
          <button 
            className="btn-secondary"
            onClick={() => window.history.back()}
          >
            返回上一页
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;