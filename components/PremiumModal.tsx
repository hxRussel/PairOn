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
      subtitle: "Sblocca il massimo potenziale.",
      upgrade: "Sblocca Premium",
      restore: "Ripristina acquisti",
      lifetime: "una tantum",
      features: [
        { name: "Smartphone Salvati", free: "Max 10", premium: "Illimitati", icon: Smartphone },
        { name: "Comparazione", free: "Max 6", premium: "Max 12", icon: Layers },
        { name: "AI Assistant", free: false, premium: true, icon: Sparkles },
        { name: "Nessuna Pubblicità", free: true, premium: true, icon: Shield },
      ]
    },
    en: {
      title: "Go Premium",
      subtitle: "Unlock full potential.",
      upgrade: "Unlock Premium",
      restore: "Restore purchases",
      lifetime: "lifetime",
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
      <div className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl flex flex-col ${isDark ? 'bg-pairon-obsidian border border-white/10' : 'bg-white border border-gray-200'}`}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 z-30 p-2 rounded-full transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}
        >
          <X size={20} />
        </button>

        <div className="p-6 pt-10 flex flex-col items-center text-center">
           
           {/* Icon & Title - Clean & Centered */}
           <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-yellow-500/20 dark:to-amber-500/20 flex items-center justify-center mb-5 shadow-inner ring-1 ring-yellow-500/20">
              <Crown size={36} className="text-yellow-500 fill-yellow-500 drop-shadow-sm" />
           </div>
           
           <h2 className={`text-2xl font-display font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
             {text.title}
           </h2>
           <p className={`text-sm font-medium mb-6 opacity-60 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
             {text.subtitle}
           </p>

           {/* Price Tag */}
           <div className="mb-8 flex items-baseline gap-1">
             <span className={`text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>4.99€</span>
             <span className={`text-sm font-medium uppercase tracking-wide opacity-60 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/ {text.lifetime}</span>
           </div>

           {/* Comparison Table Container */}
           <div className={`w-full rounded-2xl p-1 border ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
              
              {/* Table Headers */}
              <div className="grid grid-cols-[1.2fr_1fr_1fr] py-3 border-b border-dashed border-gray-400/20 text-[10px] font-bold uppercase tracking-wider opacity-50">
                 <div className="text-left pl-3">Feature</div>
                 <div>Free</div>
                 <div className="text-pairon-mint">Premium</div>
              </div>

              {/* Rows */}
              <div className="px-1">
                 {text.features.map((feat, idx) => (
                    <div key={idx} className={`grid grid-cols-[1.2fr_1fr_1fr] py-3 items-center border-b border-gray-400/10 last:border-0`}>
                       <div className="flex items-center gap-2 pl-1 text-left">
                          <feat.icon size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                          <span className={`text-xs font-bold leading-tight ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{feat.name}</span>
                       </div>
                       
                       {/* Free */}
                       <div className="flex justify-center">
                          {typeof feat.free === 'boolean' ? (
                             feat.free ? (
                                <div className="p-0.5 rounded-full bg-pairon-mint text-pairon-obsidian">
                                   <Check size={12} strokeWidth={4} />
                                </div>
                             ) : <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 opacity-50"></div>
                          ) : (
                             <span className={`text-xs font-bold opacity-60 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{feat.free}</span>
                          )}
                       </div>

                       {/* Premium */}
                       <div className="flex justify-center">
                          {typeof feat.premium === 'boolean' ? (
                             feat.premium ? (
                                <div className="p-0.5 rounded-full bg-pairon-mint text-pairon-obsidian shadow-sm shadow-pairon-mint/30">
                                   <Check size={12} strokeWidth={4} />
                                </div>
                             ) : <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                          ) : (
                             <span className="text-xs font-bold text-pairon-mint">{feat.premium}</span>
                          )}
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* CTA */}
           <div className="w-full mt-8 space-y-4">
              <button 
                onClick={() => alert(language === 'it' ? 'Pagamenti in arrivo presto!' : 'Payments coming soon!')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pairon-indigo to-pairon-blue hover:from-pairon-indigo/90 hover:to-pairon-blue/90 text-white font-bold shadow-lg shadow-pairon-indigo/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Crown size={18} className="fill-white/20" />
                {text.upgrade}
              </button>
              <button className={`text-xs font-medium hover:underline opacity-50 hover:opacity-100 transition-opacity ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {text.restore}
              </button>
           </div>

        </div>
      </div>
    </div>
  );
};

export default PremiumModal;