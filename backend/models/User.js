const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '请提供用户名'],
    trim: true,
    unique: true,
    minlength: [3, '用户名至少需要3个字符']
  },
  email: {
    type: String,
    required: [true, '请提供电子邮箱'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, '请提供有效的电子邮箱']
  },
  password: {
    type: String,
    required: [true, '请提供密码'],
    minlength: [6, '密码至少需要6个字符'],
    select: false
  },
  avatar: {
    type: String,
    default: '/images/default-avatar.png'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  yogaLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      enum: ['zh', 'en'],
      default: 'zh'
    }
  }
});

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  // 只在密码被修改时执行
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // 生成盐并哈希密码
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 更新最后活跃时间
UserSchema.pre('save', function(next) {
  this.lastActive = Date.now();
  next();
});

// 比较密码方法
UserSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = mongoose.model('User', UserSchema);