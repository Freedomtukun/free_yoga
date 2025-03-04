import React, { useState, useEffect } from 'react';
import { checkDeviceCompatibility } from '../utils/DeviceUtils';

/**
 * 设备兼容性检查组件
 * 在应用启动时检查设备兼容性并提供反馈
 */
const CompatibilityCheck = ({ onCompatibilityChecked, children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [compatibility, setCompatibility] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const checkCompatibility = async () => {
      try {
        const result = await checkDeviceCompatibility();
        setCompatibility(result);
        setIsChecking(false);
        
        // 将兼容性结果传递给父组件
        if (onCompatibilityChecked) {
          onCompatibilityChecked(result);
        }
      } catch (error) {
        console.error('兼容性检查失败:', error);
        setCompatibility({
          isCompatible: false,
          error: error.message
        });
        setIsChecking(false);
      }
    };

    checkCompatibility();
  }, [onCompatibilityChecked]);

  // 检查过程中显示加载状态
  if (isChecking) {
    return (
      <div className="compatibility-check loading">
        <div className="spinner"></div>
        <p>正在检查设备兼容性...</p>
      </div>
    );
  }

  // 如果设备完全兼容，直接渲染子组件
  if (compatibility && compatibility.isCompatible && compatibility.recommendedMode === 'full') {
    return children;
  }

  // 轻量级模式提示
  if (compatibility && compatibility.isCompatible && compatibility.recommendedMode === 'lite') {
    return (
      <div className="compatibility-check warning">
        <div className="compatibility-header">
          <h2>设备兼容性提示</h2>
          <p>您的设备可以运行SmartYoga，但可能会遇到性能问题。我们将为您启用轻量级模式。</p>
          
          <button 
            className="continue-button"
            onClick={() => onCompatibilityChecked({ ...compatibility, confirmed: true })}
          >
            继续使用轻量级模式
          </button>
          
          <button 
            className="details-button"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '隐藏详情' : '查看详情'}
          </button>
          
          {showDetails && (
            <div className="compatibility-details">
              <h3>设备检测结果：</h3>
              <ul>
                <li>处理器核心数: {compatibility.performance.cpuCores || '未知'}</li>
                <li>设备内存: {compatibility.performance.deviceMemory || '未知'} GB</li>
                <li>移动设备: {compatibility.performance.isMobile ? '是' : '否'}</li>
                <li>WebGL支持: {compatibility.webglSupport ? '是' : '否'}</li>
                <li>摄像头支持: {compatibility.cameraSupport ? '是' : '否'}</li>
              </ul>
              <p className="performance-note">轻量级模式会降低视频分辨率和检测精度，以确保流畅体验。</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 设备不兼容
  return (
    <div className="compatibility-check error">
      <div className="compatibility-header">
        <h2>设备不兼容</h2>
        <p>抱歉，您的设备不支持SmartYoga所需的一些功能。</p>
        
        <div className="error-details">
          <h3>兼容性问题：</h3>
          <ul>
            {!compatibility.webglSupport && (
              <li>您的浏览器不支持WebGL，这是运行瑜伽姿势检测所必需的。</li>
            )}
            {!compatibility.cameraSupport && (
              <li>无法访问摄像头。请确保您已授予摄像头访问权限。</li>
            )}
            {compatibility.error && (
              <li>出现错误: {compatibility.error}</li>
            )}
          </ul>
          
          <div className="suggestions">
            <h3>建议：</h3>
            <ul>
              <li>尝试使用更现代的浏览器，如Chrome、Firefox或Safari的最新版本</li>
              <li>确保您的浏览器设置中允许访问摄像头</li>
              <li>如果您使用的是移动设备，请尝试使用性能更好的设备</li>
            </ul>
          </div>
          
          <button 
            className="retry-button"
            onClick={async () => {
              setIsChecking(true);
              const result = await checkDeviceCompatibility();
              setCompatibility(result);
              setIsChecking(false);
              if (onCompatibilityChecked) {
                onCompatibilityChecked(result);
              }
            }}
          >
            重试
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityCheck;