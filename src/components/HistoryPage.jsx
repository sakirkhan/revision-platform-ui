import React, { useState, useEffect } from 'react';
import { getUserQuestionHistory, triggerNotificationEmail, getHistoryByTopic, resetTopicHistory } from '../api';

const HistoryPage = ({ email, onBack }) => {
  const [history, setHistory] = useState([]);
  const [topicHistory, setTopicHistory] = useState({});
  const [historyTab, setHistoryTab] = useState('recent'); // 'recent' or 'topics'
  const [historyPage, setHistoryPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(0);
  const [isTriggering, setIsTriggering] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const HISTORY_PAGE_SIZE = 10;

  const showToast = (msg, isError = false) => {
    setToastMessage({ text: msg, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (email) {
      fetchHistory(0);
      fetchTopicHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const fetchHistory = (page) => {
    getUserQuestionHistory(email, page, HISTORY_PAGE_SIZE)
      .then(data => {
        if (data && data.content) {
          setHistory(data.content);
          setTotalPages(data.totalPages);
          setHistoryPage(data.number);
        } else if (Array.isArray(data)) {
          setHistory(data.slice(page * HISTORY_PAGE_SIZE, (page + 1) * HISTORY_PAGE_SIZE));
          setTotalPages(Math.ceil(data.length / HISTORY_PAGE_SIZE));
          setHistoryPage(page);
        } else {
          setHistory([]);
          setTotalPages(0);
        }
      })
      .catch((/* err */) => {
        setHistory([]);
      });
  };

  const fetchTopicHistory = () => {
    getHistoryByTopic(email)
      .then(data => setTopicHistory(data || {}))
      .catch(() => console.error("Failed to fetch topic history"));
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

  const handleResetTopic = async (topic) => {
    if (!window.confirm(`Are you sure you want to reset your progress for ${topic}? This will queue these questions again.`)) return;
    try {
      await resetTopicHistory(email, topic);
      showToast(`Topic ${topic} has been reset.`, false);
      fetchTopicHistory();
      fetchHistory(0);
    } catch {
      showToast('Failed to reset topic.', true);
    }
  };

  const getTopicColor = (topicStr) => {
    let hash = 0;
    for (let i = 0; i < topicStr.length; i++) {
      hash = topicStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 65%)`;
  };

  return (
    <div className="container center-content" style={{ padding: '2rem 1rem', position: 'relative' }}>
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
          background: toastMessage.isError ? 'rgba(220, 38, 38, 0.9)' : 'rgba(16, 185, 129, 0.9)',
          backdropFilter: 'blur(8px)', color: '#fff', padding: '12px 24px', borderRadius: '30px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 9999,
          animation: 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)', fontWeight: 600, fontSize: '0.95rem'
        }}>
          {toastMessage.text}
        </div>
      )}

      <div className="glass-panel animate-fade-up" style={{ width: '100%', maxWidth: '800px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button type="button" className="outline-btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={onBack}>
            &larr; Back to Dashboard
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <h1 className="wizard-title" style={{ margin: 0, fontSize: '1.8rem' }}>Archive</h1>
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <button 
                onClick={() => setHistoryTab('recent')} 
                style={{ background: historyTab === 'recent' ? 'var(--primary-accent)' : 'transparent', color: historyTab === 'recent' ? '#fff' : 'var(--text-secondary)', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s' }}
              >Recent</button>
              <button 
                onClick={() => setHistoryTab('topics')} 
                style={{ background: historyTab === 'topics' ? 'var(--primary-accent)' : 'transparent', color: historyTab === 'topics' ? '#fff' : 'var(--text-secondary)', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s' }}
              >By Topic</button>
            </div>
          </div>
          <button onClick={handleTriggerEmail} disabled={isTriggering} className="primary-btn" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            {isTriggering ? 'Triggering...' : 'Force Trigger Email Now'}
          </button>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--surface-border)' }}>
          {historyTab === 'recent' ? (
            history.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', padding: '2rem 0', textAlign: 'center' }}>
                No past questions found in your archive yet.
              </div>
            ) : (
              <div>
                <div style={{ paddingRight: '8px', minHeight: '100px' }}>
                  {history.map((record) => {
                    const q = record.question;
                    return (
                      <div key={record.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', opacity: 0.85 }}>
                        <div>
                          <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>{q.title}</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                            {q.topicUrl || q.topic?.name || 'DSA'} • {q.difficulty} • Sent: {new Date(record.sentDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'flex-end', marginLeft: '16px' }}>
                          <a href={q.url} target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>Solve on LeetCode</a>
                          {q.neetcodeUrl && (
                            <a href={q.neetcodeUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#34d399', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>Solve on NeetCode</a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                      onClick={() => fetchHistory(Math.max(0, historyPage - 1))}
                      disabled={historyPage === 0}
                      className="outline-btn" style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: historyPage === 0 ? 0.5 : 1 }}
                    >
                      &larr; Previous
                    </button>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Page {historyPage + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => fetchHistory(Math.min(totalPages - 1, historyPage + 1))}
                      disabled={historyPage === totalPages - 1}
                      className="outline-btn" style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: historyPage === totalPages - 1 ? 0.5 : 1 }}
                    >
                      Next &rarr;
                    </button>
                  </div>
                )}
              </div>
            )
          ) : (
            Object.keys(topicHistory).length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', padding: '2rem 0', textAlign: 'center' }}>
                No topic progress found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {Object.entries(topicHistory).map(([topic, qs]) => {
                  const topicColor = getTopicColor(topic);
                  return (
                    <div key={topic} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', borderLeft: `4px solid ${topicColor}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: topicColor }}>{topic} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>({qs.length} questions sent)</span></h4>
                      <button 
                        onClick={() => handleResetTopic(topic)} 
                        className="outline-btn" 
                        title="Restart Topic"
                        style={{ padding: '6px', borderRadius: '50%', borderColor: 'transparent', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', background: 'rgba(255,255,255,0.05)' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = 'var(--accent-red)'; e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                          <path d="M3 3v5h5"></path>
                        </svg>
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                      {qs.map(q => (
                        <div key={q.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', fontSize: '0.85rem' }}>
                          <div style={{ fontWeight: 500, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.title}</div>
                          <div style={{ color: 'var(--text-secondary)' }}>{q.difficulty}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )})}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
