import React, { useState } from 'react';
import { API_BASE_URL } from '../api';

const Unsubscribe = () => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Extract email from URL safely
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/unsubscribe?email=${encodeURIComponent(email)}&reason=${encodeURIComponent(reason)}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error("Failed");
      setSuccess(true);
      // Also clear local storage so the UI resets
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userPrefs');
    } catch (err) {
      alert("Failed to unsubscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!email) {
    return (
      <div className="container center-content" style={{ padding: '2rem 1rem' }}>
        <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <h2>Invalid Link</h2>
          <p>No email parameter found. Return to dashboard.</p>
          <a href="/" className="primary-btn" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>Go Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container center-content" style={{ padding: '2rem 1rem' }}>
      <div className="glass-panel animate-fade-up" style={{ maxWidth: '500px', width: '100%' }}>
        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <h2 style={{ color: 'var(--accent-red)' }}>Successfully Unsubscribed</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              We've paused your daily DSA revision emails for {email}.
            </p>
            <a href="/" className="outline-btn" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>Back to Home</a>
          </div>
        ) : (
          <form onSubmit={handleUnsubscribe}>
            <h2 className="wizard-title" style={{ fontSize: '1.8rem', color: 'var(--accent-red)' }}>Pause Daily Revisions</h2>
            <p className="wizard-subtitle">We hate to see your streak end.</p>

            <div className="input-group" style={{ marginTop: '24px' }}>
              <label className="input-label">Why are you leaving? (Optional)</label>
              <textarea 
                className="glass-input" 
                rows="4" 
                placeholder="E.g., Too many questions, found a job, completed the list..."
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <a href="/" className="outline-btn" style={{ flex: 1, textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}>
                Never Mind, Stay
              </a>
              <button type="submit" className="primary-btn" style={{ flex: 1, background: 'var(--accent-red)' }} disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Confirm Pause'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
