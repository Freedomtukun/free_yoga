const mongoose = require('mongoose');

const PoseTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  englishName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  keypoints: {
    type: Object,
    required: true
  },
  benefits: [String],
  imageUrl: String,
  category: {
    type: String,
    enum: ['standing', 'seated', 'balancing', 'twisting', 'backbend', 'forward_bend', 'inversion'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PoseTemplate', PoseTemplateSchema);