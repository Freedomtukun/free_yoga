import api from './api';

// 获取所有瑜伽姿势
export const getAllPoses = async (filters = {}) => {
  try {
    const response = await api.get('/poses', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching poses:', error);
    throw error;
  }
};

// 获取单个姿势详情
export const getPoseById = async (poseId) => {
  try {
    const response = await api.get(`/poses/${poseId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching pose ${poseId}:`, error);
    throw error;
  }
};

// 分析姿势
export const analyzePose = async (poseId, keypoints, duration = 0) => {
  try {
    const response = await api.post('/poses/analyze', {
      poseId,
      keypoints,
      duration
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing pose:', error);
    throw error;
  }
};

// 获取用户的姿势历史记录
export const getUserPoseHistory = async () => {
  try {
    const response = await api.get('/poses/user/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching user pose history:', error);
    throw error;
  }
};