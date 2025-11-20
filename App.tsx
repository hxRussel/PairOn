import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Dashboard from './components/Dashboard';
import { AuthState, Language, Theme } from './types';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>(AuthState.LOGIN);
  const [language, setLanguage] = useState<Language>('en');
  
  // Theme State
  const [themeSetting, setThemeSetting] = useState<Theme>('auto');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Detect user language on mount
    const browserLang = navigator.language.slice(0, 2).toLowerCase();
    if (browserLang === 'it') {
      setLanguage('it');
    } else {
      setLanguage('en');
    }
  }, []);

  // Handle Theme Logic
  useEffect(() => {
    const handleThemeChange = () => {
      if (themeSetting === 'auto') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setEffectiveTheme(systemPrefersDark ? 'dark' : 'light');
      } else {
        setEffectiveTheme(themeSetting);
      }
    };

    handleThemeChange(); // Initial check

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    // Listen for system changes if in auto mode
    const listener = (e: MediaQueryListEvent) => {
      if (themeSetting === 'auto') {
        setEffectiveTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [themeSetting]);

  return (
    <main className={`w-full h-full transition-colors duration-300 ${effectiveTheme === 'light' ? 'bg-pairon-ghost text-pairon-obsidian' : 'bg-pairon-obsidian text-pairon-ghost'}`}>
      {authState === AuthState.LOGIN && (
        <LoginPage 
          setAuthState={setAuthState} 
          language={language} 
          setLanguage={setLanguage} 
          theme={effectiveTheme}
        />
      )}
      {authState === AuthState.SIGNUP && (
        <SignupPage 
          setAuthState={setAuthState} 
          language={language} 
          setLanguage={setLanguage}
          theme={effectiveTheme}
        />
      )}
      {authState === AuthState.DASHBOARD && (
        <Dashboard 
          setAuthState={setAuthState} 
          language={language}
          setLanguage={setLanguage}
          themeSetting={themeSetting}
          setThemeSetting={setThemeSetting}
          effectiveTheme={effectiveTheme}
        />
      )}
    </main>
  );
};

export default App;