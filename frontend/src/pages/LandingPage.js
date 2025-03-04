import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; 

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>SmartYoga</h1>
            <h2>Your AI-Powered Personal Yoga Coach</h2>
            <p>Bringing personalized, intelligent yoga training to practitioners everywhere.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/sequences" className="btn btn-secondary">Explore Poses</Link>
            </div>
          </div>
          <div className="hero-image">
            <img src="/api/placeholder/600/400" alt="AI Yoga Coach Demo" />
          </div>
        </div>
      </section>
      
      {/* Problem Section */}
      <section className="problems">
        <div className="container">
          <h2>Challenges in Yoga Practice</h2>
          <div className="problem-cards">
            <div className="problem-card">
              <div className="icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3>Injury Risk from Poor Form</h3>
              <p>Without guidance, it's hard to know if poses are done correctly. Misaligned postures often go uncorrected and can lead to pain or injury.</p>
            </div>
            
            <div className="problem-card">
              <div className="icon">
                <i className="fas fa-users-slash"></i>
              </div>
              <h3>One-Size-Fits-All Classes</h3>
              <p>Traditional classes and videos can't tailor to individual needs. Beginners often feel lost and struggle to stick with it, while experienced yogis hit plateaus.</p>
            </div>
            
            <div className="problem-card">
              <div className="icon">
                <i className="fas fa-comment-slash"></i>
              </div>
              <h3>Lack of Feedback & Community</h3>
              <p>Practicing alone offers little feedback or encouragement. The absence of real-time input and community support can reduce motivation and engagement.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Solution Section */}
      <section className="solutions">
        <div className="container">
          <h2>SmartYoga Solution</h2>
          <div className="solution-grid">
            <div className="solution-item">
              <div className="solution-icon">
                <i className="fas fa-camera"></i>
              </div>
              <h3>Real-Time Posture Feedback</h3>
              <p>Our AI visually recognizes your poses via your device's camera and provides instant voice/visual corrections, helping prevent injuries by ensuring proper form.</p>
            </div>
            
            <div className="solution-item">
              <div className="solution-icon">
                <i className="fas fa-user-cog"></i>
              </div>
              <h3>Personalized Training Plans</h3>
              <p>The system creates custom yoga routines adapted to each user's skill level, progress, and goals. Beginners get guided plans, while advanced users receive challenging sequences.</p>
            </div>
            
            <div className="solution-item">
              <div className="solution-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h3>Interactive Motivation</h3>
              <p>Built-in progress tracking, achievements, and community features like group sessions foster engagement and support, so you're not practicing in isolation anymore.</p>
            </div>
            
            <div className="solution-item">
              <div className="solution-icon">
                <i className="fas fa-globe"></i>
              </div>
              <h3>Convenience & Accessibility</h3>
              <p>Available anytime on your phone or laptop, SmartYoga brings the studio experience home. Multi-language support and adaptable difficulty make yoga accessible to everyone.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Transform Your Yoga Practice?</h2>
          <p>Join thousands of yogis already improving with SmartYoga's AI-powered guidance.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-large">Get Started for Free</Link>
            <Link to="/sequences" className="btn btn-secondary btn-large">Explore Sequences</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;