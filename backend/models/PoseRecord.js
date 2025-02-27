const mongoose = require('mongoose');

const PoseRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pose: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PoseTemplate',
    required: true
  },
  sequence: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PoseSequence'
  },
  accuracy: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  duration: {
    type: Number,
    required: true,
    default: 0
  },
  keypoints: Object,
  feedback: [String],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PoseRecord', PoseRecordSchema);