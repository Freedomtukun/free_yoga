const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 生成JWT令牌
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

// 注册新用户
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }
    
    // 检查用户名是否已存在
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: '该用户名已被使用' });
    }
    
    // 创建新用户
    const newUser = await User.create({
      username,
      email,
      password, // 密码会在模型的pre-save中间件中加密
      yogaLevel: 'beginner' // 默认瑜伽等级
    });
    
    // 生成令牌
    const token = generateToken(newUser._id);
    
    // 返回用户数据，不包括密码
    res.status(201).json({
      status: 'success',
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        yogaLevel: newUser.yogaLevel,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('注册用户时出错:', error);
    res.status(500).json({ message: '服务器错误，请稍后再试' });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 验证请求体
    if (!email || !password) {
      return res.status(400).json({ message: '请提供邮箱和密码' });
    }
    
    // 查找用户并包括密码字段
    const user = await User.findOne({ email }).select('+password');
    
    // 检查用户和密码
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: '邮箱或密码不正确' });
    }
    
    // 生成JWT
    const token = generateToken(user._id);
    
    // 响应，不包括密码
    res.status(200).json({
      status: 'success',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        yogaLevel: user.yogaLevel,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('用户登录时出错:', error);
    res.status(500).json({ message: '服务器错误，请稍后再试' });
  }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user 由 auth 中间件设置
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('获取当前用户时出错:', error);
    res.status(500).json({ message: '服务器错误，请稍后再试' });
  }
};

// 更新用户资料
exports.updateProfile = async (req, res) => {
  try {
    // 不允许通过此路由更新密码
    if (req.body.password) {
      return res.status(400).json({ message: '此路由不用于密码更新。请使用 /api/users/update-password' });
    }
    
    // 允许更新的字段
    const allowedFields = ['username', 'email', 'yogaLevel', 'avatar'];
    
    // 过滤请求体中不允许的字段
    const filteredBody = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });
    
    // 检查用户名唯一性（如果要更新）
    if (filteredBody.username && filteredBody.username !== req.user.username) {
      const existingUsername = await User.findOne({ username: filteredBody.username });
      if (existingUsername) {
        return res.status(400).json({ message: '该用户名已被使用' });
      }
    }
    
    // 检查邮箱唯一性（如果要更新）
    if (filteredBody.email && filteredBody.email !== req.user.email) {
      const existingEmail = await User.findOne({ email: filteredBody.email });
      if (existingEmail) {
        return res.status(400).json({ message: '该邮箱已被注册' });
      }
    }
    
    // 更新用户
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      filteredBody,
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('更新用户资料时出错:', error);
    res.status(500).json({ message: '服务器错误，请稍后再试' });
  }
};

// 更新密码
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // 验证请求体
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: '请提供当前密码和新密码' });
    }
    
    // 获取用户（包括密码字段）
    const user = await User.findById(req.user._id).select('+password');
    
    // 验证当前密码
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: '当前密码不正确' });
    }
    
    // 更新密码
    user.password = newPassword;
    await user.save();
    
    // 生成新JWT
    const token = generateToken(user._id);
    
    // 响应，不包括密码
    res.status(200).json({
      status: 'success',
      message: '密码已成功更新',
      token
    });
  } catch (error) {
    console.error('更新密码时出错:', error);
    res.status(500).json({ message: '服务器错误，请稍后再试' });
  }
};

// 获取用户统计信息
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // 从PoseRecord模型获取用户统计信息
    const PoseRecord = require('../models/PoseRecord');
    
    // 获取用户的姿势记录总数
    const totalRecords = await PoseRecord.countDocuments({ user: userId });
    
    // 获取用户的平均准确度
    const accuracyResult = await PoseRecord.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, averageAccuracy: { $avg: '$accuracy' } } }
    ]);
    
    const averageAccuracy = accuracyResult.length > 0 
      ? Math.round(accuracyResult[0].averageAccuracy * 10) / 10 
      : 0;
    
    // 获取用户练习的总时长（分钟）
    const durationResult = await PoseRecord.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, totalDuration: { $sum: '$duration' } } }
    ]);
    
    const totalDuration = durationResult.length > 0 
      ? Math.round(durationResult[0].totalDuration / 60) 
      : 0;
    
    // 返回统计信息
    res.status(200).json({
      totalRecords,
      averageAccuracy,
      totalDuration,
      lastActive: req.user.updatedAt
    });
  } catch (error) {
    console.error('获取用户统计信息时出错:', error);
    res.status(500).json({ message: '服务器错误，请稍后再试' });
  }
};