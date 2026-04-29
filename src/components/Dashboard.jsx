import React, { useState, useEffect } from 'react';
import { registerOrUpdateUser, getTodayQuestions, requestEmailOtp, validateEmailOtp, getPreviewQuestions, triggerNotificationEmail } from '../api';

const Dashboard = ({ user, onBack, onViewHistory }) => {
  const [isRegistered, setIsRegistered] = useState(() => !!localStorage.getItem('userEmail'));
  const [showModal, setShowModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [isTriggering, setIsTriggering] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [meme, setMeme] = useState(null);
  const HISTORY_PAGE_SIZE = 5;

  const showToast = (msg, isError = false) => {
    setToastMessage({ text: msg, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Registration State
  const [regStep, setRegStep] = useState(1);
  const [email, setEmail] = useState(() => localStorage.getItem('userEmail') || '');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isRegistered && email) {
      getTodayQuestions(email)
        .then(data => setQuestions(data))
        .catch(err => console.error("Failed to fetch questions", err));
    }
  }, [isRegistered, email]);

  useEffect(() => {
    if (!isRegistered) {
      getPreviewQuestions(user.difficulty, user.questionsPerDay, user.topics)
        .then(data => setPreviewQuestions(data))
        .catch(err => console.error("Failed to fetch preview questions", err));
    }
  }, [isRegistered, user.difficulty, user.questionsPerDay, user.topics]);

  const HINDI_MEMES = [
    {
      title: "Arey bhai, abhi coding nahi karega to kab karega?",
      url: "https://media.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif"
    },
    {
      title: "Jo daily karta rahega kaam, wo kabhi nahi hoga fail! 🚀",
      url: "https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif"
    },
    {
      title: "Bug fix karte karte subah ho gayi bro... 😭",
      url: "https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif"
    },
    {
      title: "Jab production code first time mein chal jaye! 🕺",
      url: "https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif"
    },
    {
      title: "Bhai bas ek chota sa feature hai, 5 minute lagenge... 😅",
      url: "https://media.giphy.com/media/3o6wrebnKWmvx4ZBio/giphy.gif"
    },
    {
      title: "Production me fat gaya toh mera naam mat lena! 🏃",
      url: "https://media.giphy.com/media/jUwpcgza92QC8/giphy.gif"
    },
    {
      title: "Weekend plan: Neetcode 150... Reality: 😴",
      url: "https://media.giphy.com/media/mguPrVJAnEHIY/giphy.gif"
    },
    {
      title: "Me explaining my code to the senior developer 🤯",
      url: "https://media.giphy.com/media/l0IylOPIQiGW9ODlK/giphy.gif"
    },
    {
      title: "Bina StackOverflow ke ek line code bhi likh du toh... 😂",
      url: "https://media.giphy.com/media/YQitE4YNQxWuOhmDfb/giphy.gif"
    },
    {
      title: "HR: 'We have a very chilled out work culture'... The culture: 🫠",
      url: "https://media.giphy.com/media/tZCkL6BsL2AAo/giphy.gif"
    },
    {
      title: "Jab manager bole 'Urgent hai, aaj hi chahiye!' ⌨️💨",
      url: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif"
    },
    {
      title: "Me pushing code directly to production on Friday evening 🧨",
      url: "https://media.giphy.com/media/oe33xf3B50fsc/giphy.gif"
    },
    {
      title: "Freshers looking at the legacy codebase for the first time 😵",
      url: "https://media.giphy.com/media/g01ZnwAUvutuK8GIQn/giphy.gif"
    },
    {
      title: "Code review comments padhne ke baad meri halat 🥲",
      url: "https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif"
    }
  ];

  useEffect(() => {
    const randomMeme = HINDI_MEMES[Math.floor(Math.random() * HINDI_MEMES.length)];
    setMeme(randomMeme);
  }, []);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleSendCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      showToast("Please enter a valid email address.", true);
      return;
    }

    if (mobile) {
      const cleanMobile = mobile.replace(/[\s-()]/g, '');
      const mobileRegex = /^\+?[0-9]{10,15}$/;
      if (!mobileRegex.test(cleanMobile)) {
        showToast("Please enter a valid mobile number.", true);
        return;
      }
    }

    setIsLoading(true);
    try {
      await requestEmailOtp(normalizedEmail);
      setEmail(normalizedEmail);
      setOtp(['', '', '', '']);
      setRegStep(2);
      showToast("Verification code deployed to your inbox!");
    } catch {
      showToast('Failed to send verification code. Please check your email.', true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const enteredOtp = otp.join('').replace(/\s+/g, '');
    setIsLoading(true);
    try {
      const isValid = await validateEmailOtp(normalizedEmail, enteredOtp);
      if (!isValid) {
        showToast('Invalid or expired code. Please try again.', true);
        setIsLoading(false);
        return;
      }

      await registerOrUpdateUser(normalizedEmail, user);
      localStorage.setItem('userEmail', normalizedEmail);
      setIsRegistered(true);
      setShowModal(false);
      showToast("Success! Plan activated natively.", false);
    } catch {
      showToast('Failed to verify. Please check console for details.', true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPrefs');
    window.location.reload();
  };

  const handleTriggerEmail = async () => {
    setIsTriggering(true);
    try {
      const msg = await triggerNotificationEmail(email);
      showToast(msg);
    } catch {
      showToast('Failed to trigger email. Please try again.', true);
    } finally {
      setIsTriggering(false);
    }
  };
  return (
    <div className="container center-content" style={{ padding: '2rem 1rem', position: 'relative' }}>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: toastMessage.isError ? 'rgba(220, 38, 38, 0.9)' : 'rgba(16, 185, 129, 0.9)',
          backdropFilter: 'blur(8px)',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '30px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 9999,
          animation: 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          fontWeight: 600,
          fontSize: '0.95rem'
        }}>
          {toastMessage.isError ? (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          )}
          {toastMessage.text}
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className={`glass-panel animate-fade-up ${showModal ? 'blur-bg' : ''}`} style={{ width: '100%', maxWidth: '800px', transition: 'filter 0.3s ease' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button type="button" className="outline-btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={onBack}>
            &larr; Edit Preferences
          </button>
          {isRegistered && (
            <button type="button" className="outline-btn" style={{ padding: '8px 16px', fontSize: '0.85rem', borderColor: 'var(--accent-red)', color: 'var(--text-secondary)', marginLeft: 'auto' }} onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 className="wizard-title" style={{ marginBottom: '8px' }}>
              {isRegistered ? <span>Welcome, <span className="gradient-text">{email.split('@')[0]}</span></span> : 'Your Blueprint'}
            </h1>
            <p className="wizard-subtitle" style={{ margin: 0 }}>
              {isRegistered ? 'Your personalized DSA dashboard.' : 'Preview of your custom plan.'}
            </p>
          </div>
        </div>

        <div className="options-grid" style={{ marginBottom: '2rem' }}>
          <div className="option-card" style={{ background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }}>
            <h3 style={{ fontSize: '2.5rem', color: 'var(--primary-accent)', marginBottom: '4px' }}>
              {user.questionsPerDay}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Questions / Day</p>
          </div>
          <div className="option-card" style={{ background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }}>
            <h3 style={{ fontSize: '2.5rem', color: 'var(--secondary-accent)', marginBottom: '4px' }}>
              {user.questionCountPerWeekend || user.questionsPerDay}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Weekend Target</p>
          </div>
        </div>

        {!isRegistered && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.15))',
            borderRadius: '16px', padding: '28px', marginBottom: '2rem', border: '1px solid rgba(139, 92, 246, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.1)'
          }}>
            <div style={{ flex: '1 1 300px' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#grad1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span className="gradient-text">Unlock Your Full Dashboard</span>
              </h3>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Save your preferences, track your topic-wise progress, and get your personalized daily DSA challenges delivered straight to your inbox.
              </p>
            </div>
            <button className="primary-btn animate-pulse-glow" onClick={() => setShowModal(true)} style={{ fontSize: '1.05rem', padding: '12px 28px', whiteSpace: 'nowrap', boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)' }}>
              Login / Signup to Activate
            </button>
          </div>
        )}

        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--surface-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>{isRegistered ? "Today's Mission" : "Today's Mission (Mock)"}</h3>
              {isRegistered && (
                <button type="button" className="primary-btn" disabled={isTriggering} style={{ padding: '6px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleTriggerEmail}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                  {isTriggering ? 'Sending...' : 'Email Me Now'}
                </button>
              )}
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>0 / {isRegistered && questions.length > 0 ? questions.length : user.questionsPerDay} pending</span>
          </div>

          {isRegistered && questions.length === 0 && (
            <div style={{ color: 'var(--text-secondary)', padding: '2rem 0', textAlign: 'center' }}>
              No questions found for your preferences today! Check back tomorrow.
            </div>
          )}

          {(!isRegistered) ? (
            previewQuestions.length > 0 ? previewQuestions.map((q, idx) => (
              <div key={q.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${idx % 2 === 0 ? 'var(--primary-accent)' : 'var(--secondary-accent)'}`, marginTop: idx > 0 ? '12px' : '0' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{q.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{q.topicUrl || q.topic?.name || 'DSA'} • {q.difficulty}</p>
                </div>
                <a href={q.url} target="_blank" rel="noopener noreferrer" className="outline-btn" style={{ padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none' }}>View Challenge</a>
              </div>
            )) : (
              <div style={{ color: 'var(--text-secondary)', padding: '2rem 0', textAlign: 'center' }}>
                <div className="loader" style={{ width: '24px', height: '24px', margin: '0 auto 12px' }} />
                Loading preview dataset...
              </div>
            )
          ) : (
            questions.map((q, idx) => (
              <div key={q.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${idx % 2 === 0 ? 'var(--primary-accent)' : 'var(--secondary-accent)'}`, marginTop: idx > 0 ? '12px' : '0' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{q.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{q.topicUrl || q.topic?.name || 'DSA'} • {q.difficulty}</p>
                </div>
                <a href={q.url} target="_blank" rel="noopener noreferrer" className="outline-btn" style={{ padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none' }}>View Challenge</a>
              </div>
            ))
          )}
        </div>

        {/* Meme Section */}
        {meme && (
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--surface-border)', marginTop: '2rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-light)' }}>Ek Break Toh Banta Hai Boss! ☕</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{meme.title}</p>
            <img src={meme.url} alt="Tech Meme" style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '400px', objectFit: 'contain' }} />
          </div>
        )}

        {isRegistered && (
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <button 
              className="primary-btn" 
              onClick={onViewHistory} 
              style={{ padding: '14px 28px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              View Full History & Topics Progress
            </button>
          </div>
        )}
      </div>

      {/* Registration Modal Overlay */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="glass-panel animate-fade-up" style={{ maxWidth: '450px', background: 'var(--bg-color)', position: 'relative' }}>
            <button
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', color: 'var(--text-secondary)', fontSize: '1.5rem' }}
            >
              &times;
            </button>

            {regStep === 1 ? (
              <div style={{ marginTop: '16px' }}>
                <h2 className="wizard-title" style={{ fontSize: '1.6rem' }}>Enable Daily Revision</h2>
                <p className="wizard-subtitle" style={{ fontSize: '0.95rem' }}>Where should we send your daily questions?</p>

                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input type="email" className="glass-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Mobile Number (Optional)</label>
                  <input type="tel" className="glass-input" placeholder="+1 (555) 000-0000" value={mobile} onChange={e => setMobile(e.target.value)} />
                </div>

                <button className="primary-btn" style={{ width: '100%' }} onClick={handleSendCode} disabled={!email || isLoading}>
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </div>
            ) : (
              <div style={{ marginTop: '16px' }}>
                <h2 className="wizard-title" style={{ fontSize: '1.6rem' }}>Verify Email</h2>
                <p className="wizard-subtitle" style={{ fontSize: '0.95rem' }}>Enter the 4-digit code sent to <span className="gradient-text">{email}</span></p>

                <div className="otp-container" style={{ marginBottom: '2rem' }}>
                  {otp.map((digit, i) => (
                    <input key={i} id={`otp-${i}`} type="text" className="otp-input" value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Backspace' && !digit && i > 0) document.getElementById(`otp-${i - 1}`)?.focus(); }}
                    />
                  ))}
                </div>

                <button className="primary-btn" style={{ width: '100%' }} onClick={handleVerify} disabled={otp.join('').length < 4 || isLoading}>
                  {isLoading ? <div className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px' }} /> : 'Verify & Enable'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .blur-bg { filter: blur(5px); }
      `}</style>
    </div>
  );
};

export default Dashboard;
