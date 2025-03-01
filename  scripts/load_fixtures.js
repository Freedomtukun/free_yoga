const mongoose = require('mongoose');
require('dotenv').config();
const PoseTemplate = require('../backend/models/PoseTemplate');
const PoseSequence = require('../backend/models/PoseSequence');
const User = require('../backend/models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

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

// 加载测试数据
const loadFixtures = async () => {
  try {
    await connectDB();
    
    // 清空现有数据
    console.log('清空现有数据...');
    await PoseTemplate.deleteMany({});
    await PoseSequence.deleteMany({});
    await User.deleteMany({});
    
    // 创建管理员用户
    console.log('创建管理员用户...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const admin = new User({
      username: 'admin',
      email: 'admin@smartyoga.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    await admin.save();
    
    // 读取瑜伽体式数据
    console.log('加载瑜伽体式数据...');
    const poseDataPath = path.join(__dirname, '../docs/30个瑜伽体式.txt');
    const poseData = fs.readFileSync(poseDataPath, 'utf8');
    
    // 解析体式数据并创建模板
    const poses = parsePoseData(poseData);
    await PoseTemplate.insertMany(poses);
    
    // 创建示例序列
    console.log('创建示例训练序列...');
    const poseTemplates = await PoseTemplate.find();
    
    // 晨间瑜伽序列
    const morningSequence = new PoseSequence({
      name: '晨间唤醒序列',
      description: '开启活力一天的晨间瑜伽练习',
      difficulty: 'beginner',
      poses: [
        {
          pose: poseTemplates.find(p => p.name.includes('山式')),
          duration: 30,
          order: 1,
          transitionHint: '深呼吸，放松身体'
        },
        {
          pose: poseTemplates.find(p => p.name.includes('站立前屈')),
          duration: 45,
          order: 2,
          transitionHint: '缓慢向前弯曲，感受腿后部的拉伸'
        },
        {
          pose: poseTemplates.find(p => p.name.includes('战士二式')),
          duration: 60,
          order: 3,
          transitionHint: '右腿向前迈出，打开胯部'
        },
        {
          pose: poseTemplates.find(p => p.name.includes('战士二式')),
          duration: 60,
          order: 4,
          transitionHint: '换边，左腿向前'
        },
        {
          pose: poseTemplates.find(p => p.name.includes('婴儿式')),
          duration: 60,
          order: 5,
          transitionHint: '放松下来，深呼吸'
        }
      ],
      totalDuration: 255,
      category: 'morning',
      createdBy: admin._id,
      isPublic: true
    });
    
    await morningSequence.save();
    
    // 放松序列
    const relaxSequence = new PoseSequence({
      name: '压力缓解序列',
      description: '帮助放松身心，缓解压力的瑜伽序列',
      difficulty: 'beginner',
      poses: [
        {
          pose: poseTemplates.find(p => p.name.includes('孩子式')),
          duration: 60,
          order: 1,
          transitionHint: '放松背部，深呼吸'
        },
        {
          pose: poseTemplates.find(p => p.name.includes('鸽子式')),
          duration: 45,
          order: 2,
          transitionHint: '右腿前伸，打开髋部'
        },
        {
          pose: poseTemplates.find(p => p.name.includes('鸽子式')),
          duration: 45,
          order: 3,
          transitionHint: '换边，左腿前伸'
        },
        {
          pose: poseTemplates.find(p => p.name.includes('骆驼式')),
          duration: 30,
          order: 4,
          transitionHint: '打开胸部，感受前侧拉伸'
        },
        {
          pose: poseTemplates.find(p => p.name.includes('尸式')),
          duration: 120,
          order: 5,
          transitionHint: '完全放松，享受宁静'
        }
      ],
      totalDuration: 300,
      category: 'relaxing',
      createdBy: admin._id,
      isPublic: true
    });
    
    await relaxSequence.save();
    
    console.log('测试数据加载完成');
    
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
    
  } catch (error) {
    console.error('加载测试数据失败:', error);
    process.exit(1);
  }
};

// 解析体式数据的辅助函数
function parsePoseData(data) {
  // 这里需要根据实际文件格式实现解析逻辑
  // 示例实现 - 假设每个体式由名称、描述和分类组成
  const lines = data.split('\n').filter(line => line.trim());
  const poses = [];
  
  for (let i = 0; i < lines.length; i += 3) {
    if (i + 2 < lines.length) {
      const name = lines[i].trim();
      const englishName = generateEnglishName(name);
      const description = lines[i + 1].trim();
      const category = determineCategory(name);
      const difficulty = determineDifficulty(name);
      
      // 生成模拟关键点数据
      const keypoints = generateMockKeypoints();
      
      poses.push({
        name,
        englishName,
        description,
        category,
        difficulty,
        keypoints,
        benefits: generateBenefits(name, description),
        imageUrl: `/images/poses/${englishName.toLowerCase().replace(/\s+/g, '-')}.jpg`
      });
    }
  }
  
  return poses;
}

// 辅助函数：生成英文名称
function generateEnglishName(chineseName) {
  // 这里应该有一个中英文对照表，简单起见使用模拟数据
  const poseMap = {
    '山式': 'Mountain Pose',
    '战士一式': 'Warrior I',
    '战士二式': 'Warrior II',
    '战士三式': 'Warrior III',
    '下犬式': 'Downward Facing Dog',
    '三角式': 'Triangle Pose',
    '树式': 'Tree Pose',
    '鸽子式': 'Pigeon Pose',
    '婴儿式': 'Child Pose',
    '尸式': 'Corpse Pose',
    '眼镜蛇式': 'Cobra Pose',
    '鱼式': 'Fish Pose',
    '骆驼式': 'Camel Pose',
    '船式': 'Boat Pose',
    '桥式': 'Bridge Pose',
    '站立前屈': 'Standing Forward Bend',
    '坐姿前屈': 'Seated Forward Bend',
    '半月式': 'Half Moon Pose'
  };
  
  // 查找匹配的英文名
  for (const [key, value] of Object.entries(poseMap)) {
    if (chineseName.includes(key)) {
      return value;
    }
  }
  
  // 默认返回
  return 'Yoga Pose';
}

// 辅助函数：确定分类
function determineCategory(name) {
  if (name.includes('站立') || name.includes('山式') || name.includes('战士')) {
    return 'standing';
  } else if (name.includes('坐') || name.includes('莲花')) {
    return 'seated';
  } else if (name.includes('树式') || name.includes('半月')) {
    return 'balancing';
  } else if (name.includes('扭转')) {
    return 'twisting';
  } else if (name.includes('眼镜蛇') || name.includes('上犬') || name.includes('骆驼')) {
    return 'backbend';
  } else if (name.includes('前屈') || name.includes('下犬')) {
    return 'forward_bend';
  } else if (name.includes('倒立') || name.includes('肩倒立')) {
    return 'inversion';
  }
  
  // 默认分类
  return 'standing';
}

// 辅助函数：确定难度
function determineDifficulty(name) {
  const advancedPoses = ['倒立', '肩倒立', '手倒立', '飞鸟', '孔雀', '全莲花'];
  const intermediatePoses = ['半月', '战士三式', '侧鸽子', '鸽子王', '轮式'];
  
  for (const pose of advancedPoses) {
    if (name.includes(pose)) return 'advanced';
  }
  
  for (const pose of intermediatePoses) {
    if (name.includes(pose)) return 'intermediate';
  }
  
  return 'beginner';
}

// 辅助函数：生成收益点
function generateBenefits(name, description) {
  const benefitsMap = {
    '山式': ['改善姿势', '增强核心稳定性', '提高专注力'],
    '战士': ['增强腿部力量', '改善平衡感', '打开胸部和肩膀'],
    '下犬': ['拉伸全身', '减轻背部疼痛', '增强上肢力量'],
    '树式': ['改善平衡感', '增强专注力', '强化脚踝和核心'],
    '桥式': ['打开胸部', '强化脊柱', '改善姿势'],
    '眼镜蛇': ['强化背部肌肉', '打开胸部', '提高脊柱灵活性'],
    '鱼式': ['打开胸部和喉咙', '拉伸腹部', '改善呼吸'],
    '婴儿': ['放松背部', '缓解压力', '舒展肩膀'],
    '尸式': ['全身放松', '减轻压力', '改善睡眠'],
    '前屈': ['拉伸腿后部肌肉', '放松背部', '平衡神经系统']
  };
  
  // 查找匹配的收益
  for (const [key, benefits] of Object.entries(benefitsMap)) {
    if (name.includes(key)) {
      return benefits;
    }
  }
  
  // 默认收益
  return ['增强身体力量', '提高灵活性', '平衡身心'];
}

// 辅助函数：生成模拟关键点数据
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

// 执行数据加载
loadFixtures();