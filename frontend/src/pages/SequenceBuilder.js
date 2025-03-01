import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getAllPoses } from '../services/poseService';
import { createSequence, updateSequence, getSequence } from '../services/sequenceService';
import './SequenceBuilder.css';

const SequenceBuilder = () => {
  const { id } = useParams();
  const history = useHistory();
  const isEditMode = !!id;
  
  const [sequence, setSequence] = useState({
    name: '',
    description: '',
    difficulty: 'beginner',
    category: 'morning',
    poses: [],
    isPublic: true
  });
  
  const [availablePoses, setAvailablePoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // 加载数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 获取所有可用的姿势
        const poses = await getAllPoses();
        setAvailablePoses(poses);
        
        // 如果是编辑模式，获取序列数据
        if (isEditMode) {
          const sequenceData = await getSequence(id);
          setSequence({
            ...sequenceData,
            poses: sequenceData.poses.map(item => ({
              pose: item.pose._id,
              poseName: item.pose.name,
              duration: item.duration,
              order: item.order,
              transitionHint: item.transitionHint || ''
            }))
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('加载数据时出错，请稍后再试');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditMode]);
  
  // 处理序列信息变化
  const handleSequenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSequence(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // 处理姿势拖放
  const handleDragEnd = (result) => {
    const { source, destination } = result;
    
    if (!destination) return;
    
    if (source.droppableId === 'availablePoses' && destination.droppableId === 'selectedPoses') {
      // 从可用姿势添加到序列
      const pose = availablePoses[source.index];
      
      setSequence(prev => {
        const newPoses = [...prev.poses, {
          pose: pose._id,
          poseName: pose.name,
          duration: 30,
          order: prev.poses.length,
          transitionHint: ''
        }];
        
        return {
          ...prev,
          poses: newPoses
        };
      });
    } else if (source.droppableId === 'selectedPoses' && destination.droppableId === 'selectedPoses') {
      // 重新排序已选姿势
      const newPoses = [...sequence.poses];
      const [removed] = newPoses.splice(source.index, 1);
      newPoses.splice(destination.index, 0, removed);
      
      // 更新顺序
      const reorderedPoses = newPoses.map((pose, index) => ({
        ...pose,
        order: index
      }));
      
      setSequence(prev => ({
        ...prev,
        poses: reorderedPoses
      }));
    } else if (source.droppableId === 'selectedPoses' && destination.droppableId === 'availablePoses') {
      // 从序列中移除姿势
      setSequence(prev => {
        const newPoses = [...prev.poses];
        newPoses.splice(source.index, 1);
        
        // 更新顺序
        const reorderedPoses = newPoses.map((pose, index) => ({
          ...pose,
          order: index
        }));
        
        return {
          ...prev,
          poses: reorderedPoses
        };
      });
    }
  };
  
  // 更新姿势参数
  const updatePoseParams = (index, param, value) => {
    setSequence(prev => {
      const newPoses = [...prev.poses];
      newPoses[index] = {
        ...newPoses[index],
        [param]: value
      };
      
      return {
        ...prev,
        poses: newPoses
      };
    });
  };
  
  // 移除姿势
  const removePose = (index) => {
    setSequence(prev => {
      const newPoses = [...prev.poses];
      newPoses.splice(index, 1);
      
      // 更新顺序
      const reorderedPoses = newPoses.map((pose, idx) => ({
        ...pose,
        order: idx
      }));
      
      return {
        ...prev,
        poses: reorderedPoses
      };
    });
  };
  
  // 保存序列
  const saveSequence = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // 验证必填字段
      if (!sequence.name) {
        setError('请输入序列名称');
        setSaving(false);
        return;
      }
      
      if (sequence.poses.length === 0) {
        setError('请至少添加一个姿势');
        setSaving(false);
        return;
      }
      
      // 准备提交数据
      const sequenceData = {
        ...sequence,
        poses: sequence.poses.map(pose => ({
          pose: pose.pose,
          duration: parseInt(pose.duration) || 30,
          order: pose.order,
          transitionHint: pose.transitionHint
        }))
      };
      
      // 创建或更新序列
      if (isEditMode) {
        await updateSequence(id, sequenceData);
      } else {
        await createSequence(sequenceData);
      }
      
      setSuccess(true);
      setTimeout(() => {
        history.push('/sequences');
      }, 1500);
    } catch (err) {
      console.error('保存序列失败:', err);
      setError('保存序列失败，请稍后再试');
    } finally {
      setSaving(false);
    }
  };
  
  // 取消编辑
  const cancelEdit = () => {
    history.push('/sequences');
  };
  
  if (loading) {
    return <div className="loading">加载中...</div>;
  }
  
  return (
    <div className="sequence-builder">
      <h1>{isEditMode ? '编辑序列' : '创建新序列'}</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">序列保存成功！</div>}
      
      <div className="sequence-info">
        <div className="form-group">
          <label htmlFor="name">序列名称 *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={sequence.name}
            onChange={handleSequenceChange}
            placeholder="给您的序列起个名字"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">描述</label>
          <textarea
            id="description"
            name="description"
            value={sequence.description}
            onChange={handleSequenceChange}
            placeholder="描述这个序列的目标和效果"
            rows="3"
          ></textarea>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="difficulty">难度</label>
            <select
              id="difficulty"
              name="difficulty"
              value={sequence.difficulty}
              onChange={handleSequenceChange}
            >
              <option value="beginner">初学者</option>
              <option value="intermediate">中级</option>
              <option value="advanced">高级</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="category">类别</label>
            <select
              id="category"
              name="category"
              value={sequence.category}
              onChange={handleSequenceChange}
            >
              <option value="morning">晨间瑜伽</option>
              <option value="evening">夜间瑜伽</option>
              <option value="energizing">能量提升</option>
              <option value="relaxing">放松减压</option>
              <option value="strength">力量训练</option>
              <option value="flexibility">灵活性</option>
            </select>
          </div>
        </div>
        
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isPublic"
              checked={sequence.isPublic}
              onChange={handleSequenceChange}
            />
            公开此序列（允许其他用户查看）
          </label>
        </div>
      </div>
      
      <div className="sequence-builder-content">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="available-poses">
            <h2>可用姿势</h2>
            <div className="search-box">
              <input
                type="text"
                placeholder="搜索姿势..."
                onChange={(e) => {
                  // 简单的搜索功能可以在这里实现
                }}
              />
            </div>
            
            <Droppable droppableId="availablePoses">
              {(provided) => (
                <div
                  className="poses-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {availablePoses.map((pose, index) => (
                    <Draggable
                      key={pose._id}
                      draggableId={pose._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className="pose-item"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className="pose-info">
                            <h3>{pose.name}</h3>
                            <p>{pose.englishName}</p>
                            <span className={`difficulty ${pose.difficulty}`}>
                              {pose.difficulty}
                            </span>
                          </div>
                          
                          {pose.imageUrl && (
                            <div className="pose-thumbnail">
                              <img src={pose.imageUrl} alt={pose.name} />
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          
          <div className="selected-poses">
            <h2>序列内容</h2>
            <p className="drag-instruction">拖动姿势调整顺序 ⬅ 从左侧添加姿势</p>
            
            <Droppable droppableId="selectedPoses">
              {(provided) => (
                <div
                  className="sequence-poses"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {sequence.poses.length === 0 ? (
                    <div className="empty-sequence">
                      <p>从左侧列表拖动姿势添加到序列中</p>
                    </div>
                  ) : (
                    sequence.poses.map((pose, index) => (
                      <Draggable
                        key={`${pose.pose}-${index}`}
                        draggableId={`${pose.pose}-${index}`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className="sequence-pose-item"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <div className="pose-order" {...provided.dragHandleProps}>
                              {index + 1}
                            </div>
                            
                            <div className="pose-details">
                              <h3>{pose.poseName}</h3>
                              
                              <div className="pose-params">
                                <div className="param-group">
                                  <label>持续时间 (秒)</label>
                                  <input
                                    type="number"
                                    min="5"
                                    max="300"
                                    value={pose.duration}
                                    onChange={(e) => updatePoseParams(index, 'duration', e.target.value)}
                                  />
                                </div>
                                
                                <div className="param-group">
                                  <label>过渡提示</label>
                                  <input
                                    type="text"
                                    placeholder="可选的过渡提示"
                                    value={pose.transitionHint}
                                    onChange={(e) => updatePoseParams(index, 'transitionHint', e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <button
                              type="button"
                              className="btn-remove"
                              onClick={() => removePose(index)}
                            >
                              &times;
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            
            <div className="sequence-summary">
              <div className="summary-item">
                <span>总姿势数:</span>
                <span>{sequence.poses.length}</span>
              </div>
              <div className="summary-item">
                <span>总时长:</span>
                <span>
                  {sequence.poses.reduce((total, pose) => total + (parseInt(pose.duration) || 0), 0)} 秒
                </span>
              </div>
            </div>
          </div>
        </DragDropContext>
      </div>
      
      <div className="sequence-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={cancelEdit}
        >
          取消
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={saveSequence}
          disabled={saving}
        >
          {saving ? '保存中...' : '保存序列'}
        </button>
      </div>
    </div>
  );
};

export default SequenceBuilder;