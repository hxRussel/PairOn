import React, { useState } from 'react';
import { getSmartphoneComparison } from '../services/gemini';
import { Loader } from './Loader';
import { Sparkles } from 'lucide-react';

const QuickCompareWidget: React.FC = () => {
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone1.trim() || !phone2.trim()) return;

    setLoading(true);
    setResult(null);
    
    const response = await getSmartphoneComparison(phone1, phone2);
    
    setResult(response);
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-4 py-3 rounded-full transition-all duration-300 text-sm font-medium text-white shadow-lg hover:shadow-pairon-mint/20"
      >
        <Sparkles className="w-4 h-4 text-pairon-mint group-hover:animate-pulse" />
        <span>Chiedi all'AI un consiglio rapido</span>
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-pairon-mint font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          AI Quick Compare
        </h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleCompare} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="iPhone 15"
            value={phone1}
            onChange={(e) => setPhone1(e.target.value)}
            className="bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pairon-mint placeholder-slate-500"
          />
          <input
            type="text"
            placeholder="Pixel 8"
            value={phone2}
            onChange={(e) => setPhone2(e.target.value)}
            className="bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pairon-mint placeholder-slate-500"
          />
        </div>
        
        <button 
          type="submit"
          disabled={loading || !phone1 || !phone2}
          className="w-full bg-gradient-to-r from-pairon-indigo to-pairon-blue hover:from-pairon-indigo/90 hover:to-pairon-blue/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-all flex justify-center items-center gap-2"
        >
          {loading ? <Loader /> : 'Confronta ora'}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-300 leading-relaxed italic">
            "{result}"
          </p>
          <div className="mt-2 flex justify-end">
            <span className="text-[10px] text-pairon-mint uppercase tracking-wider font-bold">Powered by Gemini</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickCompareWidget;