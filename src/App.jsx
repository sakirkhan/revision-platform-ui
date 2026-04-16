import { useState } from 'react';
import './index.css';
import Landing from './components/Landing';
import Wizard from './components/Wizard';
import Dashboard from './components/Dashboard';

import { updatePreferences } from './api';

import FeedbackWidget from './components/FeedbackWidget';
import Unsubscribe from './components/Unsubscribe';
import FeedbackPage from './components/FeedbackPage';

function App() {
  const [view, setView] = useState(() => {
    if (window.location.pathname === '/unsubscribe') return 'UNSUBSCRIBE';
    if (window.location.pathname === '/feedback') return 'FEEDBACK';
    return localStorage.getItem('userEmail') ? 'DASHBOARD' : 'LANDING';
  }); 
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('userPrefs');
    return saved ? JSON.parse(saved) : null;
  });

  const startWizard = () => setView('WIZARD');
  
  const handleWizardComplete = async (prefs) => {
    setPreferences(prefs);
    localStorage.setItem('userPrefs', JSON.stringify(prefs));
    
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      try {
        await updatePreferences(savedEmail, prefs);
      } catch (err) {
        console.error("Failed to sync updated preferences", err);
      }
    }
    
    setView('DASHBOARD');
  };

  const toLanding = () => setView('LANDING');
  const toWizard = () => setView('WIZARD');

  return (
    <main>
      {view === 'LANDING' && <Landing onStart={startWizard} />}
      {view === 'WIZARD' && <Wizard onComplete={handleWizardComplete} onBack={toLanding} />}
      {view === 'DASHBOARD' && preferences && <Dashboard user={preferences} onBack={toWizard} />}
      {view === 'UNSUBSCRIBE' && <Unsubscribe />}
      {view === 'FEEDBACK' && <FeedbackPage />}
      {view !== 'FEEDBACK' && <FeedbackWidget viewName={view} />}
    </main>
  );
}

export default App;
