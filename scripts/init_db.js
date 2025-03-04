const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env.development' });

// 数据库连接
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartyoga_dev', {
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

// 初始化数据库
const initDB = async () => {
  try {
    await connectDB();
    console.log('数据库连接成功，准备初始化...');
    
    // 创建索引和其他初始化操作可以在这里添加
    
    console.log('数据库初始化完成');
    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

// 运行初始化
initDB();