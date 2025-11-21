
import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Dashboard from './components/Dashboard';
import { Loader } from './components/Loader';
import { AuthState, Language, Theme } from './types';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>(AuthState.LOGIN);
  const [language, setLanguage] = useState<Language>('en');
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
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

  // Handle Authentication State Persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, skip login page
        setAuthState(AuthState.DASHBOARD);
      } else {
        // User is signed out
        setAuthState(AuthState.LOGIN);
      }
      // Small delay to ensure smooth transition/loading
      setTimeout(() => setIsAuthChecking(false), 500);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
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

  // Show loading screen while checking for existing session
  if (isAuthChecking) {
    return (
      <div className={`w-full h-screen flex items-center justify-center transition-colors duration-300 ${effectiveTheme === 'light' ? 'bg-pairon-ghost' : 'bg-pairon-obsidian'}`}>
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-10 h-10 text-pairon-mint" />
          <p className={`text-sm font-medium animate-pulse ${effectiveTheme === 'light' ? 'text-pairon-obsidian' : 'text-pairon-ghost'}`}>
            PairOn
          </p>
        </div>
      </div>
    );
  }

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
