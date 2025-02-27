import api from './api';

// 获取所有序列
export const getSequences = async (filters = {}) => {
  try {
    const response = await api.get('/sequences', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching sequences:', error);
    throw error;
  }
};

// 获取单个序列详情
export const getSequence = async (sequenceId) => {
  try {
    const response = await api.get(`/sequences/${sequenceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching sequence ${sequenceId}:`, error);
    throw error;
  }
};

// 分析当前序列姿势
export const analyzeSequencePose = async (keypoints, sequenceId, poseIndex) => {
  try {
    const response = await api.post(`/sequences/${sequenceId}/analyze`, {
      keypoints,
      poseIndex
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing sequence pose:', error);
    throw error;
  }
};

// 完成序列训练
export const completeSequence = async (sequenceId, poseRecords) => {
  try {
    const response = await api.post(`/sequences/${sequenceId}/complete`, {
      poseRecords
    });
    return response.data;
  } catch (error) {
    console.error('Error completing sequence:', error);
    throw error;
  }
};

// 创建新序列
export const createSequence = async (sequenceData) => {
  try {
    const response = await api.post('/sequences', sequenceData);
    return response.data;
  } catch (error) {
    console.error('Error creating sequence:', error);
    throw error;
  }
};

// 更新序列
export const updateSequence = async (sequenceId, sequenceData) => {
  try {
    const response = await api.put(`/sequences/${sequenceId}`, sequenceData);
    return response.data;
  } catch (error) {
    console.error(`Error updating sequence ${sequenceId}:`, error);
    throw error;
  }
};

// 删除序列
export const deleteSequence = async (sequenceId) => {
  try {
    const response = await api.delete(`/sequences/${sequenceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting sequence ${sequenceId}:`, error);
    throw error;
  }
};