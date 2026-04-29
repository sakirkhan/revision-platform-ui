import React, { useState, useEffect } from 'react';
import { getTopics } from '../api';

const TOTAL_QUESTIONS = 150;

const Wizard = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(1);
  const [topicsList, setTopicsList] = useState([]);
  
  // User Preferences
  const [questionsPerDay, setQuestionsPerDay] = useState(3);
  const [weekendQuestions, setWeekendQuestions] = useState(null);
  const [difficulty, setDifficulty] = useState('Medium');
  const [selectedTopics, setSelectedTopics] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getTopics().then(data => setTopicsList(data)).catch(console.error);
  }, []);

  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  const handleFinish = (e) => {
    if (e) e.preventDefault();
    setStep(4);
    setIsLoading(true);
    setTimeout(() => {
      onComplete({
        days: Math.ceil(TOTAL_QUESTIONS / questionsPerDay), 
        difficulty, 
        topics: selectedTopics,
        questionsPerDay: questionsPerDay,
        questionCountPerWeekend: weekendQuestions !== null ? weekendQuestions : questionsPerDay
      });
    }, 1500);
  };

  return (
    <div className="center-content">
      <div className="glass-panel animate-fade-up" style={{ maxWidth: '500px' }}>
        
        {/* Stepper */}
        {step < 4 && (
          <div className="stepper">
            {[1, 2, 3].map(s => (
              <div key={s} className={`step-dot ${step >= s ? 'active' : ''}`} />
            ))}
          </div>
        )}

        {/* --- STEP 1: TIMELINE --- */}
        {step === 1 && (
          <div className="animate-fade-up">
            <h2 className="wizard-title">Daily Target</h2>
            <p className="wizard-subtitle">How many questions do you want to practice each day?</p>
            
            <div style={{ background: 'rgba(0,0,0,0.1)', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', textAlign: 'center', border: '1px solid var(--surface-border)' }}>
              <input 
                type="number" 
                value={questionsPerDay} 
                onChange={(e) => setQuestionsPerDay(Math.max(1, Number(e.target.value)))}
                style={{ 
                  fontSize: '3.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)', 
                  color: 'var(--primary-accent)', lineHeight: 1, background: 'transparent',
                  border: 'none', textAlign: 'center', width: '120px', outline: 'none'
                }} 
              />
              <div style={{ color: 'var(--text-secondary)', fontWeight: 500, marginTop: '8px' }}>Questions per day</div>
              <div style={{ marginTop: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                Estimated completion: <span className="gradient-text" style={{ fontSize: '1.2rem' }}>{Math.ceil(TOTAL_QUESTIONS / questionsPerDay)} days</span>
              </div>
            </div>

            <input 
              type="range" 
              min="1" max="10" step="1"
              value={questionsPerDay}
              onChange={(e) => setQuestionsPerDay(Number(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <span>Relaxed (1/day)</span>
              <span>Intense (10/day)</span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.1)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', textAlign: 'center', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>Weekend Quota (Sat/Sun)</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Leave empty to keep your daily pace. Set to 0 to rest!</div>
              </div>
              <input 
                type="number" 
                min="0" max="20"
                placeholder={questionsPerDay}
                value={weekendQuestions === null ? '' : weekendQuestions}
                onChange={(e) => setWeekendQuestions(e.target.value === '' ? null : Number(e.target.value))}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--primary-accent)',
                  color: 'var(--primary-light)', padding: '10px', borderRadius: '8px', width: '70px',
                  fontSize: '1.2rem', fontWeight: '700', textAlign: 'center', outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="outline-btn" style={{ flex: 1 }} onClick={onBack}>Back to Home</button>
              <button type="button" className="primary-btn" style={{ flex: 1 }} onClick={nextStep}>Next Step</button>
            </div>
          </div>
        )}

        {/* --- STEP 2: TOPICS --- */}
        {step === 2 && (
          <div className="animate-fade-up">
            <h2 className="wizard-title">Prioritize Topics</h2>
            <p className="wizard-subtitle">Select which topics to master first. We'll prioritize these until exhausted.</p>
            
            <div className="options-grid" style={{ marginBottom: '2rem', maxHeight: '320px', overflowY: 'auto' }}>
              <div 
                className={`option-card ${selectedTopics.length === 0 ? 'selected' : ''}`} 
                onClick={() => setSelectedTopics([])}
                style={{ padding: '16px', gridColumn: '1 / -1', background: 'rgba(139, 92, 246, 0.1)', borderColor: 'var(--primary-accent)' }}
              >
                <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--primary-light)' }}>✨ Surprise Me (Any Topic)</div>
              </div>
              {topicsList.map(t => {
                const isSelected = selectedTopics.includes(t.name);
                return (
                  <div 
                    key={t.id} 
                    className={`option-card ${isSelected ? 'selected' : ''}`} 
                    onClick={() => setSelectedTopics(prev => isSelected ? prev.filter(x => x !== t.name) : [...prev, t.name])}
                    style={{ padding: '16px' }}
                  >
                    <div style={{ fontWeight: '600', fontSize: '1rem' }}>{t.name}</div>
                  </div>
                )
              })}
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="outline-btn" onClick={() => setStep(1)}>Back</button>
              <button type="button" className="outline-btn" onClick={onBack}>Home</button>
              <button type="button" className="primary-btn" style={{ flex: 1 }} onClick={nextStep}>
                 {selectedTopics.length === 0 ? 'Continue with Any Topic' : 'Next Step'}
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: DIFFICULTY --- */}
        {step === 3 && (
          <div className="animate-fade-up">
            <h2 className="wizard-title">Difficulty Preference</h2>
            <p className="wizard-subtitle">What mix of questions do you prefer? <br/><span style={{fontSize: '0.85rem', opacity: 0.7}}>(This will apply evenly across all your selected topics)</span></p>
            
            <div className="options-grid" style={{ marginBottom: '2rem' }}>
              {['Easy', 'Medium', 'Hard', 'Random'].map(opt => (
                <div 
                  key={opt}
                  className={`option-card ${difficulty === opt ? 'selected' : ''}`}
                  onClick={() => setDifficulty(opt)}
                >
                  <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{opt}</div>
                  {opt === 'Easy' && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Build confidence</div>}
                  {opt === 'Medium' && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Standard prep</div>}
                  {opt === 'Hard' && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Push your limits</div>}
                  {opt === 'Random' && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Surprise me</div>}
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="outline-btn" onClick={() => setStep(2)}>Back</button>
              <button type="button" className="outline-btn" onClick={onBack}>Home</button>
              <button type="button" className="primary-btn" style={{ flex: 1 }} onClick={handleFinish}>See My Plan</button>
            </div>
          </div>
        )}

        {/* --- STEP 4: GENERATING --- */}
        {step === 4 && (
          <div className="animate-fade-up" style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div className="loader" style={{ width: '60px', height: '60px', marginBottom: '2rem' }} />
            <h2 className="wizard-title">Generating Curriculum...</h2>
            <p className="wizard-subtitle">Setting up your personalized DSA roadmap based on your choices.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Wizard;
