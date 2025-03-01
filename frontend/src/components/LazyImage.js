import React, { useState, useEffect, useRef } from 'react';
import './LazyImage.css';

const LazyImage = ({ src, alt, className = '', placeholderSrc = null, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);
  
  useEffect(() => {
    // 如果浏览器支持 IntersectionObserver
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '100px' } // 提前100px开始加载图片
      );
      
      if (imgRef.current) {
        observer.observe(imgRef.current);
      }
      
      return () => {
        if (imgRef.current) {
          observer.unobserve(imgRef.current);
        }
      };
    } else {
      // 如果不支持，直接加载图片
      setIsInView(true);
    }
  }, []);
  
  return (
    <div 
      className={`lazy-image-container ${isLoaded ? 'loaded' : 'loading'} ${className}`}
      ref={imgRef}
      {...props}
    >
      {!isLoaded && (
        <div className="lazy-image-placeholder">
          {placeholderSrc ? (
            <img 
              src={placeholderSrc} 
              alt={alt} 
              className="placeholder-img"
            />
          ) : (
            <div className="placeholder-skeleton"></div>
          )}
        </div>
      )}
      
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`lazy-image ${isLoaded ? 'visible' : ''}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)} // 即使加载失败也移除占位符
        />
      )}
    </div>
  );
};

export default LazyImage;