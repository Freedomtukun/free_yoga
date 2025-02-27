const { calculatePoseAccuracy, generatePoseFeedback } = require('./poseAnalysis');

/**
 * 执行序列中当前姿势的分析
 */
const analyzeSequencePose = (userKeypoints, sequence, currentPoseIndex) => {
  if (!sequence || !sequence.poses || currentPoseIndex >= sequence.poses.length) {
    return {
      error: 'Invalid sequence or pose index'
    };
  }
  
  const currentPose = sequence.poses[currentPoseIndex];
  const templateKeypoints = currentPose.pose.keypoints;
  
  // 计算当前姿势准确度
  const accuracy = calculatePoseAccuracy(userKeypoints, templateKeypoints);
  
  // 生成反馈
  const feedback = generatePoseFeedback(userKeypoints, templateKeypoints, currentPose.pose.name);
  
  // 返回分析结果
  return {
    poseId: currentPose.pose._id,
    poseName: currentPose.pose.name,
    currentIndex: currentPoseIndex,
    totalPoses: sequence.poses.length,
    duration: currentPose.duration,
    accuracy,
    feedback,
    isLastPose: currentPoseIndex === sequence.poses.length - 1,
    nextPose: currentPoseIndex < sequence.poses.length - 1 ? {
      name: sequence.poses[currentPoseIndex + 1].pose.name,
      transitionHint: sequence.poses[currentPoseIndex + 1].transitionHint || null
    } : null
  };
};

/**
 * 跟踪序列进度并提供全局反馈
 */
const trackSequenceProgress = (sequenceId, userRecords) => {
  if (!userRecords || userRecords.length === 0) {
    return {
      completed: false,
      averageAccuracy: 0,
      feedback: ['还没有完成任何姿势']
    };
  }
  
  // 计算平均准确度
  const totalAccuracy = userRecords.reduce((sum, record) => sum + record.accuracy, 0);
  const averageAccuracy = totalAccuracy / userRecords.length;
  
  // 生成整体反馈
  let feedback = [];
  if (averageAccuracy >= 85) {
    feedback.push('出色的表现！您掌握了这个序列的大部分姿势。');
  } else if (averageAccuracy >= 70) {
    feedback.push('不错的尝试！继续练习可以提高您的准确度。');
  } else {
    feedback.push('继续练习，随着时间的推移您会看到改进。');
  }
  
  // 找出最不准确的姿势（如果有多个记录）
  if (userRecords.length > 1) {
    const worstPose = userRecords.reduce((worst, current) => 
      current.accuracy < worst.accuracy ? current : worst, userRecords[0]);
    
    if (worstPose.accuracy < 70) {
      feedback.push(`您可能想要多练习"${worstPose.pose.name}"，这是您最具挑战性的姿势。`);
    }
  }
  
  return {
    completed: true,
    averageAccuracy,
    completedPoses: userRecords.length,
    feedback
  };
};

module.exports = {
  analyzeSequencePose,
  trackSequenceProgress
};