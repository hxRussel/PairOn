import React from 'react';
import { X, Check, Crown, Smartphone, Layers, Sparkles, Shield } from 'lucide-react';
import { Language } from '../types';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  language: Language;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, isDark, language }) => {
  if (!isOpen) return null;

  const t = {
    it: {
      title: "Passa a Premium",
      subtitle: "Sblocca il massimo potenziale della tua collezione.",
      freePlan: "Piano Free",
      premiumPlan: "Piano Premium",
      upgrade: "Sblocca Premium",
      restore: "Ripristina acquisti",
      features: [
        { name: "Smartphone Salvati", free: "Max 10", premium: "Illimitati", icon: Smartphone },
        { name: "Comparazione", free: "Max 6", premium: "Max 12", icon: Layers },
        { name: "AI Assistant", free: false, premium: true, icon: Sparkles },
        { name: "Nessuna Pubblicità", free: true, premium: true, icon: Shield },
      ]
    },
    en: {
      title: "Go Premium",
      subtitle: "Unlock the full potential of your collection.",
      freePlan: "Free Plan",
      premiumPlan: "Premium Plan",
      upgrade: "Unlock Premium",
      restore: "Restore purchases",
      features: [
        { name: "Saved Smartphones", free: "Max 10", premium: "Unlimited", icon: Smartphone },
        { name: "Comparison", free: "Max 6", premium: "Max 12", icon: Layers },
        { name: "AI Assistant", free: false, premium: true, icon: Sparkles },
        { name: "No Ads", free: true, premium: true, icon: Shield },
      ]
    }
  };

  const text = t[language];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden ${isDark ? 'bg-pairon-obsidian border border-white/10' : 'bg-white border border-gray-200'}`}>
        
        {/* Close Button - Adaptive Style (Glassy on mobile blue bg, Solid on desktop white/dark bg) */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 z-30 p-2.5 rounded-full transition-all hover:scale-105 active:scale-95 bg-black/20 hover:bg-black/30 text-white backdrop-blur-md md:bg-gray-100 md:text-gray-500 md:hover:bg-gray-200 md:dark:bg-white/10 md:dark:text-gray-300 md:dark:hover:bg-white/20"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* Left Side: Visual & Hook */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-pairon-indigo to-pairon-blue p-10 flex flex-col justify-between text-white relative overflow-hidden">
           {/* Background Decorations - Softer */}
           <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 mix-blend-overlay"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-pairon-mint/30 rounded-full blur-3xl -ml-10 -mb-10 mix-blend-overlay"></div>
           
           <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
             {/* Crown Icon - Larger & Circular */}
             <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center mb-6 shadow-xl border border-white/30 ring-4 ring-white/5">
                <Crown size={42} className="text-yellow-300 fill-yellow-300 drop-shadow-lg" strokeWidth={2.5} />
             </div>
             <h2 className="text-3xl font-display font-bold mb-3 leading-tight tracking-wide">{text.title}</h2>
             <p className="text-white/90 text-base font-medium leading-relaxed max-w-xs">{text.subtitle}</p>
           </div>

           <div className="relative z-10 mt-10 md:mt-0 flex flex-col items-center md:items-start">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-80 mb-3 bg-black/20 px-3 py-1 rounded-full">
                 <span>PairOn Elite</span>
              </div>
              <div className="flex items-baseline gap-1">
                <h3 className="text-5xl font-bold tracking-tight">4.99€</h3>
              </div>
              <span className="text-sm opacity-80 mt-1 font-medium text-white/70">/ {language === 'it' ? 'una tantum' : 'lifetime'}</span>
           </div>
        </div>

        {/* Right Side: Comparison Table */}
        <div className="w-full md:w-3/5 p-6 md:p-10 flex flex-col">
           <h3 className={`text-xl font-bold mb-8 text-center md:text-left ${isDark ? 'text-white' : 'text-gray-900'}`}>
             {language === 'it' ? 'Confronta i piani' : 'Compare Plans'}
           </h3>

           <div className="flex-1 space-y-2">
              {/* Header Row */}
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 pb-4 border-b border-gray-200/10 text-xs font-bold uppercase tracking-wider opacity-50 mb-2 text-center">
                 <div className="text-left pl-2">Feature</div>
                 <div>Free</div>
                 <div className="text-pairon-mint">Premium</div>
              </div>

              {/* Feature Rows */}
              {text.features.map((feat, idx) => (
                <div 
                  key={idx} 
                  className={`grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-3.5 items-center rounded-2xl transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                >
                   <div className="flex items-center gap-3 pl-2">
                      <div className={`p-2 rounded-xl shrink-0 ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                         <feat.icon size={16} />
                      </div>
                      <span className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{feat.name}</span>
                   </div>
                   
                   {/* FREE Column */}
                   <div className="flex justify-center">
                      {typeof feat.free === 'boolean' ? (
                        feat.free ? (
                            // Green Check for Free
                            <div className="p-1 rounded-full bg-pairon-mint text-pairon-obsidian shadow-sm shadow-pairon-mint/20">
                                <Check size={14} strokeWidth={4} />
                            </div>
                        ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                        )
                      ) : (
                        <span className={`text-sm font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{feat.free}</span>
                      )}
                   </div>

                   {/* PREMIUM Column */}
                   <div className="flex justify-center">
                      {typeof feat.premium === 'boolean' ? (
                        feat.premium ? (
                            <div className="p-1 rounded-full bg-pairon-mint text-pairon-obsidian shadow-sm shadow-pairon-mint/20">
                                <Check size={14} strokeWidth={4} />
                            </div>
                        ) : <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                      ) : (
                        <span className="text-sm font-bold text-pairon-mint">{feat.premium}</span>
                      )}
                   </div>
                </div>
              ))}
           </div>

           {/* CTA Section */}
           <div className="mt-8 space-y-4">
              <button 
                onClick={() => alert(language === 'it' ? 'Pagamenti in arrivo presto!' : 'Payments coming soon!')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pairon-indigo to-pairon-blue hover:from-pairon-indigo/90 hover:to-pairon-blue/90 text-white font-bold text-lg shadow-xl shadow-pairon-indigo/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 group"
              >
                <Crown size={22} className="fill-white/20 group-hover:fill-white/40 transition-colors" />
                {text.upgrade}
              </button>
              <button className={`w-full text-xs font-medium text-center hover:underline opacity-60 hover:opacity-100 transition-opacity ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {text.restore}
              </button>
           </div>

        </div>

      </div>
    </div>
  );
};

export default PremiumModal;