import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Dashboard from './components/Dashboard';
import { AuthState, Language } from './types';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>(AuthState.LOGIN);
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Detect user language on mount
    const browserLang = navigator.language.slice(0, 2).toLowerCase();
    if (browserLang === 'it') {
      setLanguage('it');
    } else {
      setLanguage('en');
    }
  }, []);

  return (
    <main className="w-full h-full">
      {authState === AuthState.LOGIN && (
        <LoginPage 
          setAuthState={setAuthState} 
          language={language} 
          setLanguage={setLanguage} 
        />
      )}
      {authState === AuthState.SIGNUP && (
        <SignupPage 
          setAuthState={setAuthState} 
          language={language} 
          setLanguage={setLanguage} 
        />
      )}
      {authState === AuthState.DASHBOARD && (
        <Dashboard 
          setAuthState={setAuthState} 
          language={language}
        />
      )}
    </main>
  );
};

export default App;