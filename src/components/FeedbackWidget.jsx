import React, { useState } from 'react';
import { submitFeedback } from '../api';

const FeedbackWidget = ({ viewName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('FEATURE');
  const [email, setEmail] = useState(() => localStorage.getItem('userEmail') || '');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullDesc = `[Page: ${viewName}] ${description}`;
      await submitFeedback(normalizedEmail, type, fullDesc, image);
      localStorage.setItem('userEmail', normalizedEmail);
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setDescription('');
        setImage(null);
      }, 3000);
    } catch (err) {
      alert("Failed to submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Fixed Feedback Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="primary-btn animate-pulse-glow"
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          borderRadius: '999px',
          minHeight: '48px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 90
        }}
      >
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Feedback
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="glass-panel animate-fade-up" style={{ maxWidth: '450px', width: '90%', background: 'var(--bg-color)', position: 'relative' }}>
            <button 
              onClick={() => setIsOpen(false)}
              className="outline-btn"
              style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', padding: '4px', height: 'fit-content' }}
            >
              &times;
            </button>
            
            <h2 className="wizard-title" style={{ fontSize: '1.4rem' }}>Share Feedback</h2>
            <p className="wizard-subtitle" style={{ fontSize: '0.9rem' }}>Help us improve the DSA platform!</p>

            {success ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--primary-accent)' }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '48px', height: '48px', margin: '0 auto 16px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3>Thank you!</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Your feedback has been submitted.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input
                    type="email"
                    className="glass-input"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" 
                      onClick={() => setType('FEATURE')}
                      className={`outline-btn ${type === 'FEATURE' ? 'active' : ''}`}
                      style={{ flex: 1, borderColor: type === 'FEATURE' ? 'var(--primary-accent)' : '', background: type === 'FEATURE' ? 'rgba(139,92,246,0.1)' : '' }}
                    >Feature Request</button>
                    <button type="button" 
                      onClick={() => setType('BUG')}
                      className={`outline-btn ${type === 'BUG' ? 'active' : ''}`}
                      style={{ flex: 1, borderColor: type === 'BUG' ? 'var(--accent-red)' : '', background: type === 'BUG' ? 'rgba(239,68,68,0.1)' : '' }}
                    >Report a Bug</button>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Description</label>
                  <textarea 
                    className="glass-input" 
                    rows="4" 
                    required 
                    placeholder="Tell us what's on your mind..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Attach Image (Optional)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="glass-input" 
                    style={{ padding: '10px' }}
                    onChange={e => setImage(e.target.files[0])}
                  />
                </div>

                <button type="submit" className="primary-btn" style={{ width: '100%', marginTop: '16px' }} disabled={isSubmitting || !description.trim()}>
                  {isSubmitting ? <div className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px' }} /> : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;
