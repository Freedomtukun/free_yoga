const mongoose = require('mongoose');

const PoseSequenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  poses: [{
    pose: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoseTemplate',
      required: true
    },
    duration: {
      type: Number,
      default: 30, // 默认30秒
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    transitionHint: String
  }],
  totalDuration: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['morning', 'evening', 'energizing', 'relaxing', 'strength', 'flexibility'],
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PoseSequence', PoseSequenceSchema);