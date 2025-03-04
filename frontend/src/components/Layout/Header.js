import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="app-header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>SmartYoga</h1>
        </Link>
        <nav className="nav">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link">首页</Link>
            </li>
            <li className="nav-item">
              <Link to="/sequences" className="nav-link">序列训练</Link>
            </li>
            <li className="nav-item">
              <Link to="/train/free" className="nav-link">自由训练</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;