const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const poseRoutes = require('./routes/poseRoutes');
const userRoutes = require('./routes/userRoutes');
const sequenceRoutes = require('./routes/sequenceRoutes');

// 初始化Express
const app = express();

// 连接数据库
connectDB();

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 路由
app.use('/api/poses', poseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sequences', sequenceRoutes);

// 基础路由
app.get('/', (req, res) => {
  res.send('SmartYoga API is running');
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});