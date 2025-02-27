/**
 * 分析用户的瑜伽姿势与模板姿势的匹配度
 */
const calculatePoseAccuracy = (userKeypoints, templateKeypoints) => {
    // 计算关键点间的相似度
    let totalScore = 0;
    let validKeypoints = 0;
    
    // 关键点包括：肩膀、手肘、手腕、臀部、膝盖、脚踝等
    const keypointPairs = [
      ['leftShoulder', 'rightShoulder'],
      ['leftElbow', 'rightElbow'],
      ['leftWrist', 'rightWrist'],
      ['leftHip', 'rightHip'],
      ['leftKnee', 'rightKnee'],
      ['leftAnkle', 'rightAnkle']
    ];
    
    // 计算每个关键点对的角度差异
    for (const [left, right] of keypointPairs) {
      if (userKeypoints[left] && userKeypoints[right] && 
          templateKeypoints[left] && templateKeypoints[right]) {
        
        // 计算用户关键点的角度
        const userAngle = calculateAngle(
          userKeypoints[left].x, userKeypoints[left].y,
          userKeypoints[right].x, userKeypoints[right].y
        );
        
        // 计算模板关键点的角度
        const templateAngle = calculateAngle(
          templateKeypoints[left].x, templateKeypoints[left].y,
          templateKeypoints[right].x, templateKeypoints[right].y
        );
        
        // 计算角度差异（0-180度）
        const angleDiff = Math.abs(userAngle - templateAngle);
        const normalizedDiff = 1 - (angleDiff / 180);
        
        totalScore += normalizedDiff;
        validKeypoints++;
      }
    }
    
    // 计算总体相似度（百分比）
    const accuracy = validKeypoints > 0 ? (totalScore / validKeypoints) * 100 : 0;
    return Math.round(accuracy);
  };
  
  /**
   * 计算两点之间的角度
   */
  const calculateAngle = (x1, y1, x2, y2) => {
    const radians = Math.atan2(y2 - y1, x2 - x1);
    const degrees = radians * (180 / Math.PI);
    return (degrees + 360) % 360; // 确保角度在0-360之间
  };
  
  /**
   * 生成姿势反馈
   */
  const generatePoseFeedback = (userKeypoints, templateKeypoints, poseName) => {
    const feedback = [];
    
    // 检查各部位的对齐情况
    const bodyParts = {
      shoulders: ['leftShoulder', 'rightShoulder'],
      arms: ['leftElbow', 'rightElbow', 'leftWrist', 'rightWrist'],
      hips: ['leftHip', 'rightHip'],
      legs: ['leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle']
    };
    
    for (const [part, keypoints] of Object.entries(bodyParts)) {
      const partScore = calculatePartAccuracy(userKeypoints, templateKeypoints, keypoints);
      
      if (partScore < 70) {
        switch (part) {
          case 'shoulders':
            feedback.push('尝试调整肩膀的位置，保持肩膀放松下沉。');
            break;
          case 'arms':
            feedback.push('注意手臂的伸展和角度，尝试更好地对齐。');
            break;
          case 'hips':
            feedback.push('检查髋部的旋转和位置，保持骨盆的正确定位。');
            break;
          case 'legs':
            feedback.push('调整腿部姿势，注意膝盖和脚踝的对齐。');
            break;
        }
      }
    }
    
    // 如果没有特定反馈，提供一般性鼓励
    if (feedback.length === 0) {
      feedback.push(`您的${poseName}姿势看起来不错，继续保持！`);
    }
    
    return feedback;
  };
  
  /**
   * 计算特定部位的准确度
   */
  const calculatePartAccuracy = (userKeypoints, templateKeypoints, keypointList) => {
    let totalScore = 0;
    let validPoints = 0;
    
    for (const point of keypointList) {
      if (userKeypoints[point] && templateKeypoints[point]) {
        const userPoint = userKeypoints[point];
        const templatePoint = templateKeypoints[point];
        
        // 计算点的归一化距离
        const distance = Math.sqrt(
          Math.pow(userPoint.x - templatePoint.x, 2) + 
          Math.pow(userPoint.y - templatePoint.y, 2)
        );
        
        // 将距离转换为相似度分数（越近越高）
        const similarity = 1 - Math.min(distance, 1);
        totalScore += similarity;
        validPoints++;
      }
    }
    
    return validPoints > 0 ? (totalScore / validPoints) * 100 : 0;
  };
  
  module.exports = {
    calculatePoseAccuracy,
    generatePoseFeedback
  };