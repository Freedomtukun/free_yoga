const express = require('express');
const router = express.Router();
const sequenceController = require('../controllers/sequenceController');
const authMiddleware = require('../middlewares/auth');

// 公开路由
router.get('/', sequenceController.getAllSequences);
router.get('/:id', sequenceController.getSequenceById);
router.post('/:id/analyze', sequenceController.analyzeCurrentPose);
router.post('/:id/complete', sequenceController.completeSequence);

// 需要用户认证的路由
router.post('/', authMiddleware.protect, sequenceController.createSequence);
router.put('/:id', authMiddleware.protect, sequenceController.updateSequence);
router.delete('/:id', authMiddleware.protect, sequenceController.deleteSequence);

module.exports = router;