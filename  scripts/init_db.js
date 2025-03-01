const mongoose = require('mongoose');
require('dotenv').config();

// 数据库连接
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// 创建索引等初始化操作
const initializeDB = async () => {
  try {
    // 确保数据库已连接
    await connectDB();
    
    // 引入模型
    const PoseTemplate = require('../backend/models/PoseTemplate');
    const PoseSequence = require('../backend/models/PoseSequence');
    const User = require('../backend/models/User');
    
    // 创建索引
    console.log('创建索引...');
    
    // PoseTemplate 索引
    await PoseTemplate.collection.createIndex({ name: 1 }, { unique: true });
    await PoseTemplate.collection.createIndex({ category: 1 });
    await PoseTemplate.collection.createIndex({ difficulty: 1 });
    
    // PoseSequence 索引
    await PoseSequence.collection.createIndex({ name: 1 });
    await PoseSequence.collection.createIndex({ category: 1 });
    await PoseSequence.collection.createIndex({ difficulty: 1 });
    await PoseSequence.collection.createIndex({ createdBy: 1 });
    
    // User 索引
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    
    console.log('数据库初始化完成');
    
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

// 执行初始化
initializeDB();