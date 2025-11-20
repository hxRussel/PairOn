import React, { useState } from 'react';
import { AuthState, Language } from '../types';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';

interface SignupPageProps {
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

const FeatureItem: React.FC<{text: string; isDark: boolean}> = ({ text, isDark }) => (
  <div className={`flex items-center gap-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
    <div className="min-w-[20px] min-h-[20px] w-5 h-5 rounded-full bg-pairon-mint/20 flex items-center justify-center">
      <Check className="w-3 h-3 text-pairon-mintDark" />
    </div>
    <span className="text-sm font-medium">{text}</span>
  </div>
);

const SignupPage: React.FC<SignupPageProps> = ({ setAuthState, language, setLanguage, theme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isDark = theme === 'dark';

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
    <div className={`min-h-screen w-full relative flex items-center justify-center overflow-hidden transition-colors duration-300 ${isDark ? 'bg-pairon-obsidian' : 'bg-pairon-ghost'}`}>
      
      {/* Language Switcher - Desktop Position */}
      <div className="absolute top-6 right-6 z-50 hidden lg:block">
        <LanguageToggle language={language} setLanguage={setLanguage} isDark={isDark} />
      </div>

      {/* Animated Background Blobs - Opacity adjusted for light mode */}
      <div className={`absolute top-0 -left-4 w-72 h-72 bg-pairon-indigo rounded-full mix-blend-multiply filter blur-xl animate-blob ${isDark ? 'opacity-30' : 'opacity-10'}`}></div>
      <div className={`absolute top-0 -right-4 w-72 h-72 bg-pairon-mint rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000 ${isDark ? 'opacity-30' : 'opacity-10'}`}></div>
      <div className={`absolute -bottom-8 left-20 w-72 h-72 bg-pairon-blue rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000 ${isDark ? 'opacity-30' : 'opacity-10'}`}></div>

      <div className="container mx-auto px-4 h-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 relative z-10">
        
        {/* Left Side: Brand & Info */}
        <div className="hidden lg:flex flex-col items-start max-w-lg">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="font-display text-6xl text-transparent bg-clip-text bg-gradient-to-r from-pairon-indigo via-pairon-mint to-pairon-blue tracking-wide">
              PairOn
            </h1>
          </div>
          
          <h2 className={`text-3xl font-bold mb-4 leading-tight ${isDark ? 'text-pairon-ghost' : 'text-pairon-obsidian'}`}>
            {text.heroTitle}
          </h2>
          <p className={`text-lg mb-8 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {text.heroDesc}
          </p>

          <div className="space-y-4 mb-10">
            <FeatureItem text={text.feat1} isDark={isDark} />
            <FeatureItem text={text.feat2} isDark={isDark} />
            <FeatureItem text={text.feat3} isDark={isDark} />
          </div>
        </div>

        {/* Right Side: Signup Card */}
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
            </div>

            <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white'} backdrop-blur-xl border p-8 rounded-3xl shadow-2xl animate-fade-in`}>
              <h3 className={`text-2xl font-bold mb-1 ${isDark ? 'text-pairon-ghost' : 'text-pairon-obsidian'}`}>{text.createAccount}</h3>
              <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{text.join}</p>

              <form onSubmit={handleSignup} className="space-y-5">
                
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
                  <label className="text-xs font-medium text-pairon-mintDark uppercase tracking-wider ml-1">{text.password}</label>
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

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-pairon-mintDark uppercase tracking-wider ml-1">{text.confirmPassword}</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      className={`w-full border rounded-xl px-4 py-3 outline-none transition-all pr-10 focus:ring-1 focus:ring-pairon-mint/50 ${isDark ? 'bg-pairon-surface border-white/10 text-white placeholder-gray-500 focus:border-pairon-mint' : 'bg-white border-gray-200 text-pairon-obsidian placeholder-gray-400 focus:border-pairon-mintDark'}`}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'}`}
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
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {text.haveAccount} {' '}
                  <button 
                    onClick={() => setAuthState(AuthState.LOGIN)}
                    className="text-pairon-mintDark font-medium hover:underline"
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