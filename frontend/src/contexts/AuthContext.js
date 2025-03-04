import React, { createContext, useContext, useState, useEffect } from 'react';

// 创建认证上下文
const AuthContext = createContext();

// 创建认证提供者组件
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 登录函数
  const login = (userData) => {
    // 在实际应用中，这里会调用API进行登录
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentUser(userData);
  };
  
  // 注销函数
  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };
  
  // 注册函数
  const register = (userData) => {
    // 在实际应用中，这里会调用API进行注册
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentUser(userData);
  };
  
  // 初始化时检查本地存储中是否有用户信息
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);
  
  // 提供给上下文的值
  const value = {
    currentUser,
    login,
    logout,
    register,
    loading
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 自定义钩子，便于在组件中访问认证上下文
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
