import React from 'react';
import { AuthState, Language } from '../types';
import { Sparkles, LogOut } from 'lucide-react';

interface DashboardProps {
  setAuthState: (state: AuthState) => void;
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ setAuthState, language }) => {
  const t = {
    it: {
      logout: "Esci",
      welcome: "Bentornato in PairOn",
      desc: "Questa è la dashboard principale. Qui implementerai le funzionalità complete di confronto basate su Gemini Pro per analisi approfondite.",
      cta: "Inizia un nuovo confronto"
    },
    en: {
      logout: "Log Out",
      welcome: "Welcome back to PairOn",
      desc: "This is the main dashboard. Here you will implement full comparison features powered by Gemini Pro for in-depth analysis.",
      cta: "Start new comparison"
    }
  };

  const text = t[language];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
           <h1 className="font-display text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pairon-mint to-pairon-blue">
              PairOn
           </h1>
           <button 
             onClick={() => setAuthState(AuthState.LOGIN)}
             className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
           >
             <LogOut size={16} />
             {text.logout}
           </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-12">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pairon-mint to-pairon-blue rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-pairon-blue/20">
             <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">{text.welcome}</h2>
          <p className="text-slate-400 mb-8 text-lg">
            {text.desc}
          </p>
          <button className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors">
            {text.cta}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;