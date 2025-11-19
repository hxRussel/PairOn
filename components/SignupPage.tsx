import React, { useState } from 'react';
import { AuthState, Language } from '../types';
import { Eye, EyeOff, Smartphone, ArrowRight, Check } from 'lucide-react';

interface SignupPageProps {
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

const FeatureItem: React.FC<{text: string}> = ({ text }) => (
  <div className="flex items-center gap-3 text-slate-300">
    <div className="min-w-[20px] min-h-[20px] w-5 h-5 rounded-full bg-pairon-mint/20 flex items-center justify-center">
      <Check className="w-3 h-3 text-pairon-mint" />
    </div>
    <span className="text-sm font-medium">{text}</span>
  </div>
);

const SignupPage: React.FC<SignupPageProps> = ({ setAuthState, language, setLanguage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const t = {
    it: {
      createAccount: "Crea Account",
      join: "Unisciti a PairOn oggi.",
      email: "Email",
      password: "Password",
      confirmPassword: "Conferma Password",
      signup: "Registrati",
      haveAccount: "Hai già un account?",
      login: "Accedi qui",
      heroTitle: "Inizia a confrontare.",
      heroDesc: "Crea il tuo account gratuito per salvare i tuoi confronti e accedere a funzionalità esclusive.",
      feat1: "Confronti illimitati",
      feat2: "Salva i tuoi preferiti",
      feat3: "Accesso a Gemini Advanced (Coming Soon)",
      passwordMismatch: "Le password non coincidono"
    },
    en: {
      createAccount: "Create Account",
      join: "Join PairOn today.",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      signup: "Sign Up",
      haveAccount: "Already have an account?",
      login: "Login here",
      heroTitle: "Start comparing.",
      heroDesc: "Create your free account to save your comparisons and access exclusive features.",
      feat1: "Unlimited comparisons",
      feat2: "Save your favorites",
      feat3: "Access to Gemini Advanced (Coming Soon)",
      passwordMismatch: "Passwords do not match"
    }
  };

  const text = t[language];

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert(text.passwordMismatch);
      return;
    }
    // Simulate signup success
    setTimeout(() => {
      setAuthState(AuthState.DASHBOARD);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-slate-900">
      
      {/* Language Switcher - Desktop Position */}
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
            {text.heroDesc}
          </p>

          <div className="space-y-4 mb-10">
            <FeatureItem text={text.feat1} />
            <FeatureItem text={text.feat2} />
            <FeatureItem text={text.feat3} />
          </div>
        </div>

        {/* Right Side: Signup Card */}
        <div className="w-full max-w-md">
            {/* Mobile Logo Header */}
            <div className="lg:hidden flex flex-col items-center text-center mb-6 animate-fade-in">
                 <div className="mb-4">
                    <LanguageToggle language={language} setLanguage={setLanguage} />
                 </div>
                 <h1 className="font-display text-5xl text-transparent bg-clip-text bg-gradient-to-r from-pairon-mint to-pairon-blue inline-block mb-2">
                  PairOn
                </h1>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-fade-in">
              <h3 className="text-2xl font-bold text-white mb-1">{text.createAccount}</h3>
              <p className="text-slate-400 text-sm mb-6">{text.join}</p>

              <form onSubmit={handleSignup} className="space-y-5">
                
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
                  <label className="text-xs font-medium text-pairon-mint uppercase tracking-wider ml-1">{text.password}</label>
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

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-pairon-mint uppercase tracking-wider ml-1">{text.confirmPassword}</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      className="w-full bg-slate-900/50 border border-slate-700 focus:border-pairon-mint focus:ring-1 focus:ring-pairon-mint/50 rounded-xl px-4 py-3 text-white outline-none transition-all placeholder-slate-600 pr-10"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-pairon-indigo to-pairon-blue hover:from-pairon-indigo/90 hover:to-pairon-blue/90 text-white font-bold py-3.5 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-pairon-indigo/25 flex items-center justify-center gap-2 group"
                >
                  {text.signup}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-slate-400 text-sm">
                  {text.haveAccount} {' '}
                  <button 
                    onClick={() => setAuthState(AuthState.LOGIN)}
                    className="text-pairon-mint font-medium hover:underline"
                  >
                    {text.login}
                  </button>
                </p>
              </div>

            </div>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;
