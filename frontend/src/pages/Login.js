import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPages.css'; // 我们会创建一个共享的CSS文件

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 这里应该是真实的登录API调用
      // const response = await api.post('/auth/login', formData);
      
      // 模拟登录成功
      setTimeout(() => {
        localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Demo User' }));
        setLoading(false);
        navigate('/sequences');
      }, 1000);
    } catch (err) {
      setError('登录失败，请检查邮箱和密码');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-form-container">
          <div className="auth-header">
            <h2>登录到SmartYoga</h2>
            <p>欢迎回来！请登录您的账户</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">邮箱</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">密码</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <div className="forgot-password">
                <Link to="/forgot-password">忘记密码？</Link>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="auth-footer">
            <p>还没有账户？ <Link to="/register">立即注册</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;