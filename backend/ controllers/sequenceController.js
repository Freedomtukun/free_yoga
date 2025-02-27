const PoseTemplate = require('../models/PoseTemplate');
const PoseSequence = require('../models/PoseSequence');
const PoseRecord = require('../models/PoseRecord');
const { analyzeSequencePose, trackSequenceProgress } = require('../utils/poseComparison');

// 获取所有序列
exports.getAllSequences = async (req, res) => {
  try {
    const { difficulty, category } = req.query;
    let query = {};
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (category) {
      query.category = category;
    }
    
    // 如果非公开序列，需要检查用户是否是创建者
    if (req.user) {
      query.$or = [
        { isPublic: true },
        { createdBy: req.user._id }
      ];
    } else {
      query.isPublic = true;
    }
    
    const sequences = await PoseSequence.find(query)
      .populate('poses.pose', 'name englishName imageUrl')
      .populate('createdBy', 'username');
    
    res.json(sequences);
  } catch (error) {
    console.error('Error fetching sequences:', error);
    res.status(500).json({ message: '获取序列列表失败' });
  }
};

// 获取单个序列详情
exports.getSequenceById = async (req, res) => {
  try {
    const sequence = await PoseSequence.findById(req.params.id)
      .populate('poses.pose')
      .populate('createdBy', 'username');
    
    if (!sequence) {
      return res.status(404).json({ message: '找不到该序列' });
    }
    
    // 检查私有序列的访问权限
    if (!sequence.isPublic && (!req.user || !sequence.createdBy.equals(req.user._id))) {
      return res.status(403).json({ message: '没有权限访问该序列' });
    }
    
    res.json(sequence);
  } catch (error) {
    console.error(`Error fetching sequence ${req.params.id}:`, error);
    res.status(500).json({ message: '获取序列详情失败' });
  }
};

// 分析序列中的当前姿势
exports.analyzeCurrentPose = async (req, res) => {
  try {
    const { keypoints, poseIndex } = req.body;
    const sequenceId = req.params.id;
    
    if (!keypoints || poseIndex === undefined) {
      return res.status(400).json({ message: '缺少必要参数' });
    }
    
    const sequence = await PoseSequence.findById(sequenceId)
      .populate('poses.pose');
    
    if (!sequence) {
      return res.status(404).json({ message: '找不到该序列' });
    }
    
    // 分析当前姿势
    const analysis = analyzeSequencePose(keypoints, sequence, poseIndex);
    
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing sequence pose:', error);
    res.status(500).json({ message: '姿势分析失败' });
  }
};

// 完成序列训练
exports.completeSequence = async (req, res) => {
  try {
    const { poseRecords } = req.body;
    const sequenceId = req.params.id;
    
    if (!poseRecords || !Array.isArray(poseRecords)) {
      return res.status(400).json({ message: '缺少必要参数' });
    }
    
    const sequence = await PoseSequence.findById(sequenceId);
    
    if (!sequence) {
      return res.status(404).json({ message: '找不到该序列' });
    }
    
    // 保存用户记录 (如果已登录)
    if (req.user) {
      const savedRecords = [];
      
      for (const record of poseRecords) {
        const poseRecord = new PoseRecord({
          user: req.user._id,
          pose: record.poseId,
          sequence: sequenceId,
          accuracy: record.accuracy,
          feedback: record.feedback,
          duration: record.duration || 0
        });
        
        const saved = await poseRecord.save();
        savedRecords.push(saved);
      }
      
      // 跟踪进度并提供反馈
      const progress = trackSequenceProgress(sequenceId, savedRecords);
      res.json(progress);
    } else {
      // 未登录用户，只返回基本分析
      res.json({
        completed: true,
        averageAccuracy: poseRecords.reduce((sum, r) => sum + r.accuracy, 0) / poseRecords.length,
        completedPoses: poseRecords.length,
        feedback: ['完成序列训练！登录以保存您的进度。']
      });
    }
  } catch (error) {
    console.error('Error completing sequence:', error);
    res.status(500).json({ message: '完成序列训练失败' });
  }
};

// 创建新序列
exports.createSequence = async (req, res) => {
  try {
    const sequenceData = { ...req.body };
    
    // 如果有用户登录，添加为创建者
    if (req.user) {
      sequenceData.createdBy = req.user._id;
    }
    
    // 计算总时长
    sequenceData.totalDuration = sequenceData.poses.reduce(
      (total, pose) => total + pose.duration, 0
    );
    
    const newSequence = new PoseSequence(sequenceData);
    const savedSequence = await newSequence.save();
    
    res.status(201).json(savedSequence);
  } catch (error) {
    console.error('Error creating sequence:', error);
    res.status(500).json({ message: '创建序列失败' });
  }
};

// 更新序列
exports.updateSequence = async (req, res) => {
  try {
    const sequence = await PoseSequence.findById(req.params.id);
    
    if (!sequence) {
      return res.status(404).json({ message: '找不到该序列' });
    }
    
    // 检查权限（只有创建者或管理员可以修改）
    if (sequence.createdBy && req.user && !sequence.createdBy.equals(req.user._id) && !req.user.isAdmin) {
      return res.status(403).json({ message: '没有权限修改该序列' });
    }
    
    // 计算总时长
    if (req.body.poses) {
      req.body.totalDuration = req.body.poses.reduce(
        (total, pose) => total + pose.duration, 0
      );
    }
    
    const updatedSequence = await PoseSequence.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json(updatedSequence);
  } catch (error) {
    console.error(`Error updating sequence ${req.params.id}:`, error);
    res.status(500).json({ message: '更新序列失败' });
  }
};

// 删除序列
exports.deleteSequence = async (req, res) => {
  try {
    const sequence = await PoseSequence.findById(req.params.id);
    
    if (!sequence) {
      return res.status(404).json({ message: '找不到该序列' });
    }
    
    // 检查权限（只有创建者或管理员可以删除）
    if (sequence.createdBy && req.user && !sequence.createdBy.equals(req.user._id) && !req.user.isAdmin) {
      return res.status(403).json({ message: '没有权限删除该序列' });
    }
    
    await PoseSequence.findByIdAndDelete(req.params.id);
    
    res.json({ message: '序列已删除' });
  } catch (error) {
    console.error(`Error deleting sequence ${req.params.id}:`, error);
    res.status(500).json({ message: '删除序列失败' });
  }
};