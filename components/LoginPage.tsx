import React, { useState } from 'react';
import { AuthState, Language } from '../types';
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
      heroSubtitle: "Inizia a comparare smartphone!",
      feat1: "Analisi basata su AI",
      feat2: "Confronto specifiche in tempo reale",
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
      heroSubtitle: "Start comparing smartphones!",
      feat1: "AI powered analysis",
      feat2: "Real-time specs comparison",
      googleError: "Error signing in with Google. Please try again.",
    }
  };

  const text = t[language];

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
        
        {/* Left Side: Brand & Info (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col items-start max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-pairon-mint to-pairon-blue rounded-xl flex items-center justify-center shadow-lg shadow-pairon-mint/20">
              <Smartphone className="text-white w-7 h-7" />
            </div>
            <h1 className="font-display text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-pairon-mint to-pairon-blue tracking-wide">
              PairOn
            </h1>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            {text.heroTitle}
          </h2>
          
          <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-2 mb-8">
             <p className="text-pairon-mint font-medium">
              {text.heroSubtitle}
             </p>
          </div>

          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="min-w-[20px] min-h-[20px] w-5 h-5 rounded-full bg-pairon-mint/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-pairon-mint" />
              </div>
              <span className="text-sm font-medium">{text.feat1}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="min-w-[20px] min-h-[20px] w-5 h-5 rounded-full bg-pairon-mint/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-pairon-mint" />
              </div>
              <span className="text-sm font-medium">{text.feat2}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full max-w-md">
            {/* Mobile Logo Header */}
            <div className="lg:hidden flex flex-col items-center text-center mb-6 animate-fade-in">
                 <div className="mb-4">
                    <LanguageToggle language={language} setLanguage={setLanguage} />
                 </div>
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-pairon-mint to-pairon-blue rounded-lg flex items-center justify-center">
                      <Smartphone className="text-white w-4 h-4" />
                    </div>
                    <h1 className="font-display text-4xl text-transparent bg-clip-text bg-gradient-to-r from-pairon-mint to-pairon-blue">
                      PairOn
                    </h1>
                 </div>
                 <p className="text-pairon-mint font-medium text-sm">
                  {text.heroSubtitle}
                 </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-fade-in">
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
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-pairon-mint uppercase tracking-wider ml-1">{text.password}</label>
                    <button type="button" className="text-xs text-slate-400 hover:text-white transition-colors">
                      {text.forgot}
                    </button>
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

              <button 
                type="button"
                onClick={handleGuestAccess}
                className="w-full mt-3 bg-slate-700/50 hover:bg-slate-700 text-slate-200 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5"
              >
                <User size={18} />
                {text.guest}
              </button>

              <div className="relative py-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-transparent text-slate-500 bg-slate-800/50 backdrop-blur-xl uppercase tracking-widest">
                    {text.or}
                  </span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 group"
              >
                {isGoogleLoading ? (
                  <Loader className="w-5 h-5 text-white" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Google</span>
                  </>
                )}
              </button>

              <div className="mt-6 text-center">
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

export default LoginPage;