import React, { useState, useEffect } from 'react';
import { AuthState, Language } from '../types';
import { Home, Smartphone, Settings, Sparkles, Plus, Battery, Cpu } from 'lucide-react';
import { auth } from '../services/firebase';

interface DashboardProps {
  setAuthState: (state: AuthState) => void;
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ setAuthState, language }) => {
  const [userName, setUserName] = useState<string>('Guest');
  const [activeTab, setActiveTab] = useState<number>(0);

  // Mock data for the carousel
  const savedPhones = [
    { id: 1, model: 'iPhone 15 Pro', brand: 'Apple', color: 'from-zinc-700 to-zinc-900', battery: '3274 mAh', chip: 'A17 Pro' },
    { id: 2, model: 'Galaxy S24 Ultra', brand: 'Samsung', color: 'from-slate-700 to-slate-900', battery: '5000 mAh', chip: 'SD 8 Gen 3' },
    { id: 3, model: 'Pixel 8 Pro', brand: 'Google', color: 'from-sky-700 to-sky-900', battery: '5050 mAh', chip: 'Tensor G3' },
  ];

  useEffect(() => {
    // Get current user name
    if (auth.currentUser?.displayName) {
      setUserName(auth.currentUser.displayName);
    } else if (auth.currentUser?.email) {
      // Fallback to part of email if no display name
      setUserName(auth.currentUser.email.split('@')[0]);
    }
  }, []);

  const t = {
    it: {
      welcome: `Ciao,`,
      subtitle: "Ecco la tua collezione.",
      empty: "Non hai ancora salvato nessuno smartphone.",
      add: "Aggiungi",
      nav: ["Home", "Salvati", "Confronta", "AI Advisor", "Opzioni"]
    },
    en: {
      welcome: `Hello,`,
      subtitle: "Here is your collection.",
      empty: "You haven't saved any smartphones yet.",
      add: "Add New",
      nav: ["Home", "Saved", "Compare", "AI Advisor", "Settings"]
    }
  };

  const text = t[language];

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#F8F8FF] text-[#08100C] font-sans selection:bg-pairon-mint/30">
      
      {/* Hidden SVG Definition for Rainbow Gradient */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF0000" />
            <stop offset="20%" stopColor="#FFA500" />
            <stop offset="40%" stopColor="#FFFF00" />
            <stop offset="60%" stopColor="#008000" />
            <stop offset="80%" stopColor="#0000FF" />
            <stop offset="100%" stopColor="#8B00FF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Header Section */}
      <header className="pt-12 pb-6 px-6 animate-fade-in">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold tracking-tight leading-tight">
              {text.welcome} <br/> 
              <span className="text-pairon-indigo">{userName}</span>
            </h2>
            <p className="text-gray-500 mt-2 text-sm font-medium tracking-wide uppercase opacity-80">{text.subtitle}</p>
          </div>
          
          {/* User Profile Section */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-white p-1 shadow-sm border border-gray-100">
               <div className="w-full h-full rounded-full overflow-hidden bg-pairon-indigo/10 flex items-center justify-center text-pairon-indigo font-bold text-lg">
                 {auth.currentUser?.photoURL ? (
                   <img src={auth.currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                 ) : (
                   userName.charAt(0).toUpperCase()
                 )}
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Horizontal Carousel */}
      <main className="pl-6 pb-32">
        
        {/* Carousel Container */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-10 pt-4 pr-6 hide-scrollbar">
          
          {/* Add New Card */}
          <div className="snap-start shrink-0 w-64 h-96 rounded-[2rem] bg-white border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-pairon-indigo hover:text-pairon-indigo transition-all cursor-pointer group shadow-sm hover:shadow-md">
            <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-pairon-indigo/10 flex items-center justify-center transition-colors">
              <Plus className="w-8 h-8" />
            </div>
            <span className="font-semibold">{text.add}</span>
          </div>

          {/* Smartphone Cards */}
          {savedPhones.map((phone) => (
            <div key={phone.id} className="snap-start shrink-0 w-72 h-96 relative rounded-[2rem] overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer">
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${phone.color} opacity-90`}></div>
              
              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium border border-white/10">
                    {phone.brand}
                  </span>
                </div>

                <div className="space-y-1 mb-8 relative z-10">
                  <h3 className="text-2xl font-bold font-display leading-tight">{phone.model}</h3>
                  <div className="w-12 h-1 bg-pairon-mint rounded-full"></div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-3 bg-black/20 backdrop-blur-xl p-4 rounded-2xl border border-white/5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-white/60 text-xs">
                      <Battery size={12} />
                      <span>Battery</span>
                    </div>
                    <span className="font-semibold text-sm">{phone.battery}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-white/60 text-xs">
                      <Cpu size={12} />
                      <span>Chip</span>
                    </div>
                    <span className="font-semibold text-sm">{phone.chip}</span>
                  </div>
                </div>
              </div>

              {/* Glossy Overlay Effect */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Navigation Bar - iOS Style */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
        <div className="bg-[#E5E5EA]/80 backdrop-blur-2xl border border-white/40 rounded-[2rem] p-1.5 shadow-xl shadow-black/5 flex justify-between items-center relative">
          
          {/* Navigation Items */}
          {[
            { icon: Home, label: text.nav[0] },
            { icon: Smartphone, label: text.nav[1] },
            { isLogo: true, label: text.nav[2] }, // Comparison (Center "P")
            { icon: Sparkles, label: text.nav[3], isAi: true }, // AI Rainbow
            { icon: Settings, label: text.nav[4] }
          ].map((item, index) => {
            const isActive = activeTab === index;
            
            return (
              <button
                key={index}
                onClick={() => {
                   setActiveTab(index);
                }}
                className={`relative w-full h-12 flex flex-col items-center justify-center gap-0.5 transition-all duration-300 rounded-[1.5rem] z-10 ${isActive ? 'text-black shadow-[0_2px_8px_rgba(0,0,0,0.1)]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {/* Background for active state */}
                {isActive && (
                   <div className="absolute inset-0 bg-white rounded-[1.5rem] -z-10 transition-all duration-300 animate-fade-in"></div>
                )}
                
                {item.isLogo ? (
                  <span 
                    className={`font-display text-2xl transition-transform duration-300 select-none ${isActive ? 'scale-110 bg-gradient-to-br from-pairon-indigo to-pairon-blue bg-clip-text text-transparent' : 'text-gray-400'}`}
                  >
                    P
                  </span>
                ) : (
                  <item.icon 
                    size={isActive ? 24 : 22} 
                    strokeWidth={isActive ? 2.5 : 2}
                    style={item.isAi ? { stroke: "url(#rainbow-gradient)", fill: isActive ? "rgba(255,255,255,0.1)" : "none" } : {}}
                    className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}
                  />
                )}
                
              </button>
            );
          })}
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;