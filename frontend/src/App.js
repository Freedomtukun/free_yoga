import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import LandingPage from './pages/LandingPage';
import SequenceList from './pages/SequenceList';
import SequenceDetail from './pages/SequenceDetail'; // 新增导入
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import SequenceTraining from './components/TrainingModes/SequenceTraining';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/sequences" element={<SequenceList />} />
              <Route path="/sequence/:id" element={<SequenceDetail />} /> {/* 新增路由 */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/train/sequence/:id" element={<SequenceTraining />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;