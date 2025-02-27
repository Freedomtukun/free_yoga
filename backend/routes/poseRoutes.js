const express = require('express');
const router = express.Router();
const poseController = require('../controllers/poseController');
const authMiddleware = require('../middlewares/auth');

// 公开路由
router.get('/', poseController.getAllPoses);
router.get('/:id', poseController.getPoseById);
router.post('/analyze', poseController.analyzePose);

// 需要用户认证的路由
router.get('/user/history', authMiddleware.protect, poseController.getUserPoseHistory);

// 仅管理员路由
router.post('/', authMiddleware.protect, authMiddleware.restrictTo('admin'), poseController.createPose);
router.put('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), poseController.updatePose);
router.delete('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), poseController.deletePose);

module.exports = router;