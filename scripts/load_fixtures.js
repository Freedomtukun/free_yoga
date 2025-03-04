const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env.development' });
const fs = require('fs');
const path = require('path');

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

// 加载测试数据
const loadFixtures = async () => {
  try {
    await connectDB();
    console.log('数据库连接成功，准备加载测试数据...');
    
    // 导入模型
    const PoseTemplate = require('../backend/models/PoseTemplate');
    
    // 读取瑜伽体式文件
    const posesFilePath = path.join(__dirname, '../docs/30个瑜伽体式.txt');
    
    if (fs.existsSync(posesFilePath)) {
      const poseData = fs.readFileSync(posesFilePath, 'utf8');
      const poses = parsePoseData(poseData);
      
      // 清空现有数据
      await PoseTemplate.deleteMany({});
      
      // 插入新数据
      if (poses.length > 0) {
        await PoseTemplate.insertMany(poses);
        console.log(`成功加载 ${poses.length} 个瑜伽体式`);
      } else {
        console.log('没有找到可加载的瑜伽体式数据');
      }
    } else {
      console.error('瑜伽体式文件不存在:', posesFilePath);
    }
    
    console.log('测试数据加载完成');
    process.exit(0);
  } catch (error) {
    console.error('加载测试数据失败:', error);
    process.exit(1);
  }
};

// 解析瑜伽体式数据
function parsePoseData(data) {
  const lines = data.split('\n').filter(line => line.trim());
  const poses = [];
  
  for (let i = 0; i < lines.length; i += 3) {
    if (i + 2 < lines.length) {
      const name = lines[i].trim();
      const description = lines[i + 1].trim();
      const keywords = lines[i + 2].trim().split('、');
      
      poses.push({
        name,
        englishName: generateEnglishName(name),
        description,
        difficulty: determineDifficulty(name),
        category: determineCategory(name),
        benefits: keywords,
        keypoints: generateMockKeypoints(),
      });
    }
  }
  
  return poses;
}

// 生成英文名称
function generateEnglishName(chineseName) {
  const nameMap = {
    '山式': 'Mountain Pose',
    '战士一式': 'Warrior I',
    '战士二式': 'Warrior II',
    '战士三式': 'Warrior III',
    '下犬式': 'Downward Facing Dog',
    '树式': 'Tree Pose',
    '鸽子式': 'Pigeon Pose',
    '眼镜蛇式': 'Cobra Pose',
    '婴儿式': 'Child Pose',
    '三角式': 'Triangle Pose',
    '船式': 'Boat Pose',
    '鱼式': 'Fish Pose'
  };
  
  for (const [key, value] of Object.entries(nameMap)) {
    if (chineseName.includes(key)) {
      return value;
    }
  }
  
  return 'Yoga Pose';
}

// 确定难度
function determineDifficulty(name) {
  const advanced = ['倒立', '手倒立', '孔雀', '乌鸦'];
  const intermediate = ['半月', '战士三式', '侧鸽子'];
  
  for (const pose of advanced) {
    if (name.includes(pose)) return 'advanced';
  }
  
  for (const pose of intermediate) {
    if (name.includes(pose)) return 'intermediate';
  }
  
  return 'beginner';
}

// 确定分类
function determineCategory(name) {
  if (name.includes('站立') || name.includes('山式') || name.includes('战士')) {
    return 'standing';
  } else if (name.includes('坐') || name.includes('蝴蝶')) {
    return 'seated';
  } else if (name.includes('树式') || name.includes('半月')) {
    return 'balancing';
  } else if (name.includes('扭转')) {
    return 'twisting';
  } else if (name.includes('眼镜蛇') || name.includes('上犬')) {
    return 'backbend';
  } else if (name.includes('前屈') || name.includes('下犬')) {
    return 'forward_bend';
  } else if (name.includes('倒立')) {
    return 'inversion';
  }
  
  return 'standing';
}

// 生成模拟关键点
function generateMockKeypoints() {
  return {
    nose: { x: 0.5, y: 0.2, score: 0.9 },
    leftShoulder: { x: 0.4, y: 0.3, score: 0.8 },
    rightShoulder: { x: 0.6, y: 0.3, score: 0.8 },
    leftElbow: { x: 0.3, y: 0.4, score: 0.8 },
    rightElbow: { x: 0.7, y: 0.4, score: 0.8 },
    leftWrist: { x: 0.3, y: 0.5, score: 0.7 },
    rightWrist: { x: 0.7, y: 0.5, score: 0.7 },
    leftHip: { x: 0.45, y: 0.6, score: 0.9 },
    rightHip: { x: 0.55, y: 0.6, score: 0.9 },
    leftKnee: { x: 0.4, y: 0.75, score: 0.8 },
    rightKnee: { x: 0.6, y: 0.75, score: 0.8 },
    leftAnkle: { x: 0.4, y: 0.9, score: 0.7 },
    rightAnkle: { x: 0.6, y: 0.9, score: 0.7 }
  };
}

// 运行加载测试数据
loadFixtures();