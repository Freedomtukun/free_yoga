import React, { useState, useEffect } from 'react';

/**
 * 错误类型枚举
 */
export const ErrorTypes = {
  CAMERA_ACCESS: 'camera_access',
  NETWORK: 'network',
  POSE_DETECTION: 'pose_detection',
  SERVER: 'server',
  PERMISSION: 'permission',
  UNKNOWN: 'unknown'
};

/**
 * 错误严重程度枚举
 */
export const ErrorSeverity = {
  WARNING: 'warning',  // 警告，不影响主要功能
  ERROR: 'error',      // 错误，影响部分功能
  CRITICAL: 'critical' // 严重错误，应用不可用
};

/**
 * 全局错误处理组件
 * 负责显示错误信息并提供解决建议
 *
 * @param {Object} props
 * @param {Object} props.error 错误对象
 * @param {string} props.errorType 错误类型
 * @param {string} props.severity 错误严重性
 * @param {Function} props.onRetry 重试回调
 * @param {Function} props.onDismiss 忽略回调
 * @param {boolean} props.showDismiss 是否显示忽略按钮
 */
const ErrorHandler = ({
  error,
  errorType = ErrorTypes.UNKNOWN,
  severity = ErrorSeverity.ERROR,
  onRetry,
  onDismiss,
  showDismiss = true,
  children
}) => {
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);
  
  // 当错误变化时重置可见性
  useEffect(() => {
    if (error) {
      setVisible(true);
    }
  }, [error]);
  
  // 如果没有错误，直接渲染子组件
  if (!error || !visible) {
    return children || null;
  }
  
  // 根据错误类型获取提示信息
  const getErrorMessage = () => {
    switch (errorType) {
      case ErrorTypes.CAMERA_ACCESS:
        return '无法访问摄像头。SmartYoga需要摄像头权限才能分析您的瑜伽姿势。';
      
      case ErrorTypes.NETWORK:
        return '网络连接问题。请检查您的互联网连接。';
      
      case ErrorTypes.POSE_DETECTION:
        return '姿势检测失败。可能是您不在摄像头视野内，或者摄像头位置不理想。';
      
      case ErrorTypes.SERVER:
        return '服务器连接问题。我们的服务器可能正在维护或遇到了问题。';
      
      case ErrorTypes.PERMISSION:
        return '权限被拒绝。SmartYoga需要适当的权限才能正常工作。';
      
      default:
        return '发生了未知错误。';
    }
  };
  
  // 根据错误类型获取解决建议
  const getSuggestions = () => {
    switch (errorType) {
      case ErrorTypes.CAMERA_ACCESS:
        return [
          '请确保您已在浏览器设置中允许访问摄像头',
          '检查是否有其他应用正在使用您的摄像头',
          '尝试刷新页面或重启浏览器',
          '如果使用的是移动设备，请尝试退出并重新打开应用'
        ];
      
      case ErrorTypes.NETWORK:
        return [
          '检查您的网络连接是否稳定',
          '如果使用Wi-Fi，请确保信号强度良好',
          '尝试切换到其他网络（如从Wi-Fi切换到移动数据）',
          '关闭可能占用带宽的其他应用或设备'
        ];
      
      case ErrorTypes.POSE_DETECTION:
        return [
          '确保您处于摄像头的视野范围内',
          '调整摄像头位置，使您的全身可见',
          '确保环境光线充足',
          '穿着与背景颜色对比明显的服装可能有助于检测',
          '避免摄像头附近有移动的物体或人'
        ];
      
      case ErrorTypes.SERVER:
        return [
          '等待片刻后再试',
          '检查我们的社交媒体或官方网站，了解可能的服务中断公告',
          '如果问题持续存在，请联系我们的客服团队'
        ];
      
      case ErrorTypes.PERMISSION:
        return [
          '在浏览器设置中重新授予所需权限',
          '检查设备的隐私设置，确保允许应用访问所需资源',
          '如果使用的是企业设备，请咨询您的IT部门'
        ];
      
      default:
        return [
          '尝试刷新页面',
          '检查您的网络连接',
          '确认您的浏览器是最新版本',
          '如果问题持续存在，请联系我们的客服团队'
        ];
    }
  };
  
  // 根据严重程度获取样式
  const getSeverityStyles = () => {
    switch (severity) {
      case ErrorSeverity.WARNING:
        return {
          container: 'error-container warning',
          icon: 'warning-icon',
          title: 'error-title warning-title'
        };
      
      case ErrorSeverity.CRITICAL:
        return {
          container: 'error-container critical',
          icon: 'critical-icon',
          title: 'error-title critical-title'
        };
      
      default: // ERROR
        return {
          container: 'error-container error',
          icon: 'error-icon',
          title: 'error-title error-title'
        };
    }
  };
  
  // 处理忽略错误
  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };
  
  // 处理重试
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };
  
  // 获取样式
  const styles = getSeverityStyles();
  
  // 渲染错误界面
  return (
    <div className={styles.container}>
      <div className="error-content">
        <div className="error-header">
          <div className={styles.icon}></div>
          <h3 className={styles.title}>
            {severity === ErrorSeverity.WARNING ? '警告' : 
             severity === ErrorSeverity.CRITICAL ? '严重错误' : '错误'}
          </h3>
          {showDismiss && (
            <button 
              className="dismiss-button" 
              onClick={handleDismiss}
              aria-label="关闭错误提示"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="error-body">
          <p className="error-message">{getErrorMessage()}</p>
          
          {error && error.message && (
            <div className="error-details">
              <button 
                className="toggle-details-button"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? '隐藏详情' : '显示详情'}
              </button>
              
              {expanded && (
                <pre className="error-stack">{error.message}</pre>
              )}
            </div>
          )}
          
          <div className="error-suggestions">
            <h4>尝试以下解决方法：</h4>
            <ul className="suggestions-list">
              {getSuggestions().map((suggestion, index) => (
                <li key={index} className="suggestion-item">{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="error-footer">
          {onRetry && (
            <button 
              className="retry-button" 
              onClick={handleRetry}
            >
              重试
            </button>
          )}
          
          {/* 对于非关键错误，我们可以显示一个继续按钮，允许用户忽略并继续 */}
          {severity !== ErrorSeverity.CRITICAL && showDismiss && (
            <button 
              className="continue-button" 
              onClick={handleDismiss}
            >
              继续
            </button>
          )}
        </div>
      </div>
      
      {/* 如果是警告级别，仍然可以展示子组件 */}
      {severity === ErrorSeverity.WARNING && children}
    </div>
  );
};

export default ErrorHandler;