const PoseTemplate = require('../models/PoseTemplate');
const PoseRecord = require('../models/PoseRecord');
const { calculatePoseAccuracy, generatePoseFeedback } = require('../utils/poseAnalysis');

// 获取所有姿势模板
exports.getAllPoses = async (req, res) => {
  try {
    const { difficulty, category } = req.query;
    let query = {};
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (category) {
      query.category = category;
    }
    
    const poses = await PoseTemplate.find(query);
    res.json(poses);
  } catch (error) {
    console.error('Error fetching poses:', error);
    res.status(500).json({ message: '获取姿势列表失败' });
  }
};

// 获取单个姿势详情
exports.getPoseById = async (req, res) => {
  try {
    const pose = await PoseTemplate.findById(req.params.id);
    
    if (!pose) {
      return res.status(404).json({ message: '找不到该姿势' });
    }
    
    res.json(pose);
  } catch (error) {
    console.error(`Error fetching pose ${req.params.id}:`, error);
    res.status(500).json({ message: '获取姿势详情失败' });
  }
};

// 分析姿势并提供反馈
exports.analyzePose = async (req, res) => {
  try {
    const { poseId, keypoints } = req.body;
    
    if (!poseId || !keypoints) {
      return res.status(400).json({ message: '缺少必要参数' });
    }
    
    const poseTemplate = await PoseTemplate.findById(poseId);
    
    if (!poseTemplate) {
      return res.status(404).json({ message: '找不到该姿势模板' });
    }
    
    // 计算姿势准确度
    const accuracy = calculatePoseAccuracy(keypoints, poseTemplate.keypoints);
    
    // 生成反馈
    const feedback = generatePoseFeedback(keypoints, poseTemplate.keypoints, poseTemplate.name);
    
    // 如果用户已登录，保存记录
    if (req.user) {
      const poseRecord = new PoseRecord({
        user: req.user._id,
        pose: poseId,
        accuracy,
        keypoints,
        feedback,
        duration: req.body.duration || 0
      });
      
      await poseRecord.save();
    }
    
    res.json({
      poseName: poseTemplate.name,
      accuracy,
      feedback
    });
  } catch (error) {
    console.error('Error analyzing pose:', error);
    res.status(500).json({ message: '姿势分析失败' });
  }
};

// 创建新姿势模板 (仅管理员)
exports.createPose = async (req, res) => {
  try {
    const newPose = new PoseTemplate(req.body);
    const savedPose = await newPose.save();
    res.status(201).json(savedPose);
  } catch (error) {
    console.error('Error creating pose:', error);
    res.status(500).json({ message: '创建姿势失败' });
  }
};

// 更新姿势模板 (仅管理员)
exports.updatePose = async (req, res) => {
  try {
    const updatedPose = await PoseTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!updatedPose) {
      return res.status(404).json({ message: '找不到该姿势' });
    }
    
    res.json(updatedPose);
  } catch (error) {
    console.error(`Error updating pose ${req.params.id}:`, error);
    res.status(500).json({ message: '更新姿势失败' });
  }
};

// 删除姿势模板 (仅管理员)
exports.deletePose = async (req, res) => {
  try {
    const deletedPose = await PoseTemplate.findByIdAndDelete(req.params.id);
    
    if (!deletedPose) {
      return res.status(404).json({ message: '找不到该姿势' });
    }
    
    res.json({ message: '姿势已删除' });
  } catch (error) {
    console.error(`Error deleting pose ${req.params.id}:`, error);
    res.status(500).json({ message: '删除姿势失败' });
  }
};

// 获取用户姿势历史记录
exports.getUserPoseHistory = async (req, res) => {
  try {
    const records = await PoseRecord.find({ user: req.user._id })
      .populate('pose', 'name englishName category')
      .sort({ date: -1 });
    
    res.json(records);
  } catch (error) {
    console.error('Error fetching user pose history:', error);
    res.status(500).json({ message: '获取历史记录失败' });
  }
};