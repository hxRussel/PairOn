import React, { useState, useEffect } from 'react';
import { AuthState, Language } from '../types';
import { getWelcomeMessage } from '../services/gemini';
import { signInWithGoogle } from '../services/firebase';
import { Eye, EyeOff, Smartphone, ArrowRight, Check, User, Loader as LoaderIcon, AlertCircle, X } from 'lucide-react';
import { Loader } from './Loader';

interface LoginPageProps {
  setAuthState: (state: AuthState) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageToggle: React.FC<{ language: Language; setLanguage: (l: Language) => void }> = ({ language, setLanguage }) => (
  <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/10">
    <button 
      onClick={() => setLanguage('it')}
      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'it' ? 'bg-pairon-mint text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
    >
      IT
    </button>
    <button 
      onClick={() => setLanguage('en')}
      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-pairon-mint text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
    >
      EN
    </button>
  </div>
);

const ErrorModal: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
    <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden transform transition-all scale-100">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
      >
        <X size={20} />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="bg-red-500/10 p-3 rounded-full shrink-0">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white mb-2">Attenzione</h3>
          <div className="bg-black/50 rounded-lg p-3 border border-white/5 mb-4 select-text cursor-text">
             <p className="text-slate-300 text-sm font-mono break-words whitespace-pre-wrap leading-relaxed select-text cursor-text">
               {message}
             </p>
          </div>
          <button 
            onClick={onClose}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2.5 rounded-lg transition-colors border border-white/10"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  </div>
);

const LoginPage: React.FC<LoginPageProps> = ({ setAuthState, language, setLanguage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorState, setErrorState] = useState<{show: boolean, message: string}>({show: false, message: ''});

  const t = {
    it: {
      welcome: "Bentornato",
      enterCreds: "Inserisci le tue credenziali per accedere.",
      email: "Email",
      password: "Password",
      forgot: "Password dimenticata?",
      login: "Accedi",
      or: "OPPURE",
      noAccount: "Non hai un account?",
      register: "Registrati qui",
      guest: "Continua come ospite",
      heroTitle: "Trova il tuo smartphone perfetto.",
      defaultWelcome: "Comparazione intelligente.",
      feat1: "Analisi basata su Gemini AI",
      feat2: "Confronto specifiche in tempo reale",
      feat3: "Prezzi aggiornati dai migliori store",
      googleError: "Errore durante l'accesso con Google. Riprova.",
    },
    en: {
      welcome: "Welcome Back",
      enterCreds: "Enter your credentials to sign in.",
      email: "Email",
      password: "Password",
      forgot: "Forgot password?",
      login: "Sign In",
      or: "OR",
      noAccount: "Don't have an account?",
      register: "Sign up here",
      guest: "Continue as Guest",
      heroTitle: "Find your perfect smartphone.",
      defaultWelcome: "Smart comparison.",
      feat1: "Gemini AI powered analysis",
      feat2: "Real-time specs comparison",
      feat3: "Best prices from top stores",
      googleError: "Error signing in with Google. Please try again.",
    }
  };

  const text = t[language];

  useEffect(() => {
    setWelcomeMsg(text.defaultWelcome);
    getWelcomeMessage(language).then(setWelcomeMsg);
  }, [language]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setAuthState(AuthState.DASHBOARD);
    }, 800);
  };

  const handleGuestAccess = () => {
    setAuthState(AuthState.DASHBOARD);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      setAuthState(AuthState.DASHBOARD);
    } catch (error: any) {
      console.error(error);
      setErrorState({ show: true, message: error.message || text.googleError });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-slate-900">
      
      {/* Error Modal Overlay */}
      {errorState.show && (
        <ErrorModal 
          message={errorState.message} 
          onClose={() => setErrorState({ ...errorState, show: false })} 
        />
      )}

      {/* Language Switcher - Desktop Position (Absolute) */}
      <div className="absolute top-6 right-6 z-50 hidden lg:block">
        <LanguageToggle language={language} setLanguage={setLanguage} />
      </div>

      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-pairon-indigo rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-pairon-mint rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pairon-blue rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 h-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 relative z-10">
        
        {/* Left Side: Brand & Info */}
        <div className="hidden lg:flex flex-col items-start max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-pairon-mint to-pairon-blue rounded-xl flex items-center justify-center shadow-lg shadow-pairon-mint/20">
              <Smartphone className="text-white w-7 h-7" />
            </div>
            <h1 className="font-display text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-pairon-mint to-pairon-blue tracking-wide">
              PairOn
            </h1>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            {text.heroTitle}
          </h2>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            {welcomeMsg}
          </p>

          <div className="space-y-4 mb-10">
            <FeatureItem text={text.feat1} />
            <FeatureItem text={text.feat2} />
            <FeatureItem text={text.feat3} />
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full max-w-md">
            {/* Mobile Logo Header */}
            <div className="lg:hidden flex flex-col items-center text-center mb-6 animate-fade-in">
                 {/* Mobile Language Switcher - Inline Position */}
                 <div className="mb-4">
                    <LanguageToggle language={language} setLanguage={setLanguage} />
                 </div>

                 <h1 className="font-display text-5xl text-transparent bg-clip-text bg-gradient-to-r from-pairon-mint to-pairon-blue inline-block mb-2">
                  PairOn
                </h1>
                <p className="text-slate-400 text-sm">{welcomeMsg}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-fade-in">
              <h3 className="text-2xl font-bold text-white mb-1">{text.welcome}</h3>
              <p className="text-slate-400 text-sm mb-6">{text.enterCreds}</p>

              <form onSubmit={handleLogin} className="space-y-5">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-pairon-mint uppercase tracking-wider ml-1">{text.email}</label>
                  <input 
                    type="email" 
                    required
                    className="w-full bg-slate-900/50 border border-slate-700 focus:border-pairon-mint focus:ring-1 focus:ring-pairon-mint/50 rounded-xl px-4 py-3 text-white outline-none transition-all placeholder-slate-600"
                    placeholder="nome@esempio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-medium text-pairon-mint uppercase tracking-wider">{text.password}</label>
                    <a href="#" className="text-xs text-slate-400 hover:text-white transition-colors">{text.forgot}</a>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full bg-slate-900/50 border border-slate-700 focus:border-pairon-mint focus:ring-1 focus:ring-pairon-mint/50 rounded-xl px-4 py-3 text-white outline-none transition-all placeholder-slate-600 pr-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-pairon-indigo to-pairon-blue hover:from-pairon-indigo/90 hover:to-pairon-blue/90 text-white font-bold py-3.5 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-pairon-indigo/25 flex items-center justify-center gap-2 group"
                >
                  {text.login}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              {/* Guest Access Button */}
              <button 
                onClick={handleGuestAccess}
                className="mt-3 w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600"
              >
                <User size={16} />
                {text.guest}
              </button>

              <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="mx-4 text-slate-500 text-xs font-medium">{text.or}</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   {isGoogleLoading ? (
                     <Loader className="w-5 h-5 text-white" />
                   ) : (
                     <>
                       <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
                       <span className="text-sm font-medium">Google</span>
                     </>
                   )}
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-slate-400 text-sm">
                  {text.noAccount} {' '}
                  <button 
                    onClick={() => setAuthState(AuthState.SIGNUP)}
                    className="text-pairon-mint font-medium hover:underline"
                  >
                    {text.register}
                  </button>
                </p>
              </div>

            </div>
        </div>

      </div>
    </div>
  );
};

const FeatureItem: React.FC<{text: string}> = ({ text }) => (
  <div className="flex items-center gap-3 text-slate-300">
    <div className="min-w-[20px] min-h-[20px] w-5 h-5 rounded-full bg-pairon-mint/20 flex items-center justify-center">
      <Check className="w-3 h-3 text-pairon-mint" />
    </div>
    <span className="text-sm font-medium">{text}</span>
  </div>
);

export default LoginPage;