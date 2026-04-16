import React from 'react';

const Landing = ({ onStart }) => {
  return (
    <div className="center-content">
      <div className="hero-container animate-fade-up">
        <div className="hero-badge">
          ✨ The Premium DSA Journey
        </div>
        
        <h1 className="hero-title">
          Master DSA. <br />
          <span className="gradient-text">Ace Your Interviews.</span>
        </h1>
        
        <p className="hero-subtitle">
          Whether you're navigating layoffs, seeking your first tech role, or aiming for a major career leap, preparation is your ultimate defense.<br/> 
          The NeetCode 150 covers the most crucial interview patterns. Configure your timeline, commit to the grind, and unlock your potential with tailored daily missions.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button type="button" className="primary-btn animate-pulse-glow" onClick={onStart} style={{ padding: '18px 40px', fontSize: '1.2rem' }}>
            Get Started
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
