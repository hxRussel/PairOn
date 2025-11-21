
import React, { useState } from 'react';
import { AuthState, Language } from '../types';
import { signInWithGoogle, loginWithEmail, resetUserPassword } from '../services/firebase';
import { Eye, EyeOff, ArrowRight, Check, User, Loader as LoaderIcon, AlertCircle, X } from 'lucide-react';
import { Loader } from './Loader';

interface LoginPageProps {
  setAuthState: (state: AuthState) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'light' | 'dark';
}

const LanguageToggle: React.FC<{ language: Language; setLanguage: (l: Language) => void; isDark: boolean }> = ({ language, setLanguage, isDark }) => (
  <div className={`flex items-center backdrop-blur-md rounded-full p-1 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/50 border-gray-200'}`}>
    <button 
      onClick={() => setLanguage('it')}
      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'it' ? 'bg-pairon-mint text-pairon-obsidian shadow-lg' : `${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}`}
    >
      IT
    </button>
    <button 
      onClick={() => setLanguage('en')}
      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-pairon-mint text-pairon-obsidian shadow-lg' : `${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}`}
    >
      EN
    </button>
  </div>
);

const ErrorModal: React.FC<{ message: string; onClose: () => void; isDark: boolean }> = ({ message, onClose, isDark }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
    <div className={`${isDark ? 'bg-pairon-surface border-red-500/30' : 'bg-white border-red-200'} border rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden transform transition-all scale-100`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
      <button 
        onClick={onClose} 
        className={`absolute top-4 right-4 transition-colors ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'}`}
      >
        <X size={20} />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="bg-red-500/10 p-3 rounded-full shrink-0">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-pairon-obsidian'}`}>Attenzione</h3>
          <div className={`rounded-lg p-3 border mb-4 select-text cursor-text ${isDark ? 'bg-black/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
             <p className={`text-sm font-medium break-words whitespace-pre-wrap leading-relaxed select-text cursor-text ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
               {message}
             </p>
          </div>
          <button 
            onClick={onClose}
            className={`w-full font-medium py-2.5 rounded-lg transition-colors border ${isDark ? 'bg-white/10 hover:bg-white/20 text-white border-white/10' : 'bg-gray-100 hover:bg-gray-200 text-pairon-obsidian border-gray-200'}`}
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  </div>
);

const LoginPage: React.FC<LoginPageProps> = ({ setAuthState, language, setLanguage, theme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<{show: boolean, message: string}>({show: false, message: ''});

  const isDark = theme === 'dark';

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
      googleBtn: "Accedi con Google",
      genericError: "Errore di connessione. Riprova.",
      emailReq: "Inserisci la tua email nel campo sopra per reimpostare la password.",
      emailSent: "Email di recupero inviata! Controlla la tua posta (anche nello spam)."
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
      googleBtn: "Sign in with Google",
      genericError: "Connection error. Please try again.",
      emailReq: "Please enter your email in the field above to reset your password.",
      emailSent: "Recovery email sent! Check your inbox (and spam folder)."
    }
  };

  const text = t[language];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginWithEmail(email, password);
      setAuthState(AuthState.DASHBOARD);
    } catch (error: any) {
      console.error(error);
      
      // Simplify error message for user experience
      let displayMessage = text.genericError;
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
         displayMessage = language === 'it' 
           ? "Email o password errata. Riprova."
           : "Incorrect email or password. Please try again.";
      } else if (error.code === 'auth/too-many-requests') {
         displayMessage = language === 'it'
           ? "Troppi tentativi falliti. Riprova più tardi."
           : "Too many failed attempts. Please try again later.";
      } else if (error.code === 'auth/invalid-email') {
         displayMessage = language === 'it'
           ? "Formato email non valido."
           : "Invalid email format.";
      }

      setErrorState({ show: true, message: displayMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setErrorState({ show: true, message: text.emailReq });
      return;
    }
    setIsLoading(true);
    try {
      await resetUserPassword(email);
      alert(text.emailSent);
    } catch (error: any) {
      console.error(error);
      // Simple error for reset too
      const msg = language === 'it' ? "Impossibile inviare email. Verifica l'indirizzo." : "Could not send email. Check the address.";
      setErrorState({ show: true, message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    setAuthState(AuthState.DASHBOARD);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      setAuthState(AuthState.DASHBOARD);
    } catch (error: any) {
      console.error(error);
      setErrorState({ show: true, message: text.googleError });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full relative flex items-center justify-center overflow-hidden transition-colors duration-300 ${isDark ? 'bg-pairon-obsidian' : 'bg-pairon-ghost'}`}>
      
      {/* Error Modal Overlay */}
      {errorState.show && (
        <ErrorModal 
          message={errorState.message} 
          onClose={() => setErrorState({ ...errorState, show: false })} 
          isDark={isDark}
        />
      )}

      {/* Language Switcher - Desktop Position */}
      <div className="absolute top-6 right-6 z-50 hidden lg:block">
        <LanguageToggle language={language} setLanguage={setLanguage} isDark={isDark} />
      </div>

      {/* Animated Background Blobs - Opacity adjusted for light mode */}
      <div className={`absolute top-0 -left-4 w-72 h-72 bg-pairon-indigo rounded-full mix-blend-multiply filter blur-xl animate-blob ${isDark ? 'opacity-30' : 'opacity-10'}`}></div>
      <div className={`absolute top-0 -right-4 w-72 h-72 bg-pairon-mint rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000 ${isDark ? 'opacity-30' : 'opacity-10'}`}></div>
      <div className={`absolute -bottom-8 left-20 w-72 h-72 bg-pairon-blue rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000 ${isDark ? 'opacity-30' : 'opacity-10'}`}></div>

      <div className="container mx-auto px-4 h-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 relative z-10">
        
        {/* Left Side: Brand & Info (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col items-start max-w-lg">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="font-display text-6xl text-transparent bg-clip-text bg-gradient-to-r from-pairon-indigo via-pairon-mint to-pairon-blue tracking-wide">
              PairOn
            </h1>
          </div>
          
          <h2 className={`text-4xl font-bold mb-4 leading-tight ${isDark ? 'text-pairon-ghost' : 'text-pairon-obsidian'}`}>
            {text.heroTitle}
          </h2>
          
          <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-gray-200'} border rounded-xl px-4 py-2 mb-8 backdrop-blur-sm`}>
             <p className="text-pairon-mintDark font-medium">
              {text.heroSubtitle}
             </p>
          </div>

          <div className="space-y-4 mb-10">
            <div className={`flex items-center gap-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="min-w-[20px] min-h-[20px] w-5 h-5 rounded-full bg-pairon-mint/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-pairon-mintDark" />
              </div>
              <span className="text-sm font-medium">{text.feat1}</span>
            </div>
            <div className={`flex items-center gap-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="min-w-[20px] min-h-[20px] w-5 h-5 rounded-full bg-pairon-mint/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-pairon-mintDark" />
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
                    <LanguageToggle language={language} setLanguage={setLanguage} isDark={isDark} />
                 </div>
                 <div className="flex items-center gap-3 mb-2">
                    <h1 className="font-display text-4xl text-transparent bg-clip-text bg-gradient-to-r from-pairon-mint to-pairon-blue">
                      PairOn
                    </h1>
                 </div>
                 <p className="text-pairon-mintDark font-medium text-sm mb-3">
                  {text.heroSubtitle}
                 </p>
            </div>

            <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white'} backdrop-blur-xl border p-8 rounded-3xl shadow-2xl animate-fade-in`}>
              <h3 className={`text-2xl font-bold mb-1 ${isDark ? 'text-pairon-ghost' : 'text-pairon-obsidian'}`}>{text.welcome}</h3>
              <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{text.enterCreds}</p>

              <form onSubmit={handleLogin} className="space-y-5">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-pairon-mintDark uppercase tracking-wider ml-1">{text.email}</label>
                  <input 
                    type="email" 
                    required
                    className={`w-full border rounded-xl px-4 py-3 outline-none transition-all focus:ring-1 focus:ring-pairon-mint/50 ${isDark ? 'bg-pairon-surface border-white/10 text-white placeholder-gray-500 focus:border-pairon-mint' : 'bg-white border-gray-200 text-pairon-obsidian placeholder-gray-400 focus:border-pairon-mintDark'}`}
                    placeholder="nome@esempio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-pairon-mintDark uppercase tracking-wider ml-1">{text.password}</label>
                    <button 
                      type="button" 
                      onClick={handleResetPassword}
                      className={`text-xs transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                    >
                      {text.forgot}
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      className={`w-full border rounded-xl px-4 py-3 outline-none transition-all pr-10 focus:ring-1 focus:ring-pairon-mint/50 ${isDark ? 'bg-pairon-surface border-white/10 text-white placeholder-gray-500 focus:border-pairon-mint' : 'bg-white border-gray-200 text-pairon-obsidian placeholder-gray-400 focus:border-pairon-mintDark'}`}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'}`}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-pairon-indigo to-pairon-blue hover:from-pairon-indigo/90 hover:to-pairon-blue/90 text-white font-bold py-3.5 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-pairon-indigo/25 flex items-center justify-center gap-2 group"
                >
                   {isLoading ? <Loader className="animate-spin w-5 h-5" /> : (
                    <>
                      {text.login}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                   )}
                </button>
              </form>

              <button 
                type="button"
                onClick={handleGuestAccess}
                className={`w-full mt-3 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 border ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-200 border-white/5' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'}`}
              >
                <User size={18} />
                {text.guest}
              </button>

              <div className="relative py-6">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className={`px-2 uppercase tracking-widest rounded-full ${isDark ? 'bg-pairon-obsidian text-gray-500' : 'bg-white text-gray-400'}`}>
                    {text.or}
                  </span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className={`w-full border font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 group ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-800'}`}
              >
                {isLoading ? (
                  <Loader className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-800'}`} />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>{text.googleBtn}</span>
                  </>
                )}
              </button>

              <div className="mt-8 text-center">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {text.noAccount} {' '}
                  <button 
                    onClick={() => setAuthState(AuthState.SIGNUP)}
                    className="text-pairon-mintDark font-medium hover:underline"
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
