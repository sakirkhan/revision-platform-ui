import React, { useState } from 'react';
import { submitFeedback } from '../api';

const FeedbackPage = () => {
  const params = new URLSearchParams(window.location.search);
  const presetEmail = params.get('email') || localStorage.getItem('userEmail') || '';

  const [email, setEmail] = useState(presetEmail);
  const [type, setType] = useState('FEATURE');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');
    try {
      await submitFeedback(normalizedEmail, type, `[Page: EMAIL_FLOW] ${description}`, image);
      localStorage.setItem('userEmail', normalizedEmail);
      setSuccessMessage('Thank you! Your feedback has been received. 🚀');
      setTimeout(() => window.location.href = '/', 3000);
    } catch {
      setSuccessMessage('Oops! Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container center-content" style={{ padding: '2rem 1rem' }}>
      <div className="glass-panel animate-fade-up" style={{ maxWidth: '560px', width: '100%' }}>
        <h2 className="wizard-title" style={{ fontSize: '1.8rem' }}>Share Feedback</h2>
        <p className="wizard-subtitle">Tell us what to improve in the revision experience.</p>

        {successMessage && (
          <div style={{ marginBottom: '1rem', color: 'var(--primary-accent)', fontWeight: 600 }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              className="glass-input"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setType('FEATURE')}
                className="outline-btn"
                style={{ flex: 1, borderColor: type === 'FEATURE' ? 'var(--primary-accent)' : '', background: type === 'FEATURE' ? 'rgba(139,92,246,0.1)' : '' }}
              >
                Feature Request
              </button>
              <button
                type="button"
                onClick={() => setType('BUG')}
                className="outline-btn"
                style={{ flex: 1, borderColor: type === 'BUG' ? 'var(--accent-red)' : '', background: type === 'BUG' ? 'rgba(239,68,68,0.1)' : '' }}
              >
                Report a Bug
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea
              className="glass-input"
              rows="5"
              required
              placeholder="Share your issue, suggestion, or idea..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Attach Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              className="glass-input"
              style={{ padding: '10px' }}
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <a href="/" className="outline-btn" style={{ flex: 1, textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}>
              Back to Home
            </a>
            <button type="submit" className="primary-btn" style={{ flex: 1 }} disabled={isSubmitting || !description.trim()}>
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;
