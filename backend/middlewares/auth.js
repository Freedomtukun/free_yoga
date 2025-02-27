const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 保护路由 - 需要用户登录
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // 从请求头或cookie中获取token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    
    if (!token) {
      return res.status(401).json({ message: '请登录以访问此资源' });
    }
    
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 检查用户是否存在
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: '此令牌所属的用户不再存在' });
    }
    
    // 将用户添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: '未授权访问' });
  }
};

// 限制角色访问
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '您没有权限执行此操作' });
    }
    next();
  };
};