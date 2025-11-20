import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Check } from 'lucide-react';
import { auth, addCustomOption, subscribeToCustomOptions, CustomOptions } from '../services/firebase';

interface SmartSelectorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  optionsCategory: keyof CustomOptions; // Connects to Firebase field
  defaultOptions: string[];
  isReadOnly?: boolean;
  isDark: boolean;
  placeholder?: string;
}

const SmartSelector: React.FC<SmartSelectorProps> = ({
  label,
  value,
  onChange,
  optionsCategory,
  defaultOptions,
  isReadOnly = false,
  isDark,
  placeholder = "Seleziona..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  
  // Subscribe to user's custom options for this category
  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = subscribeToCustomOptions(auth.currentUser.uid, (data) => {
      if (data && data[optionsCategory]) {
        setCustomOptions(data[optionsCategory]);
      }
    });
    return () => unsubscribe();
  }, [optionsCategory]);

  // Combine default + custom, remove duplicates, sort
  const allOptions = Array.from(new Set([...defaultOptions, ...customOptions])).sort();

  // Filter based on search
  const filteredOptions = allOptions.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleAddNew = async () => {
    if (!searchTerm.trim() || !auth.currentUser) return;
    
    const newValue = searchTerm.trim();
    
    // Optimistic update (handled by parent state)
    onChange(newValue);
    
    // Save to firebase for future
    try {
      await addCustomOption(auth.currentUser.uid, optionsCategory, newValue);
    } catch (e) {
      console.error("Error saving custom option", e);
    }
    
    setIsOpen(false);
    setSearchTerm('');
  };

  const inputBg = isReadOnly 
  ? (isDark ? 'bg-transparent border-b border-white/20 text-white' : 'bg-transparent border-b border-gray-300 text-gray-900')
  : (isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900');

  const labelColor = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <>
      {/* Trigger Input */}
      <div className="w-full">
        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
          {label}
        </label>
        <div 
          onClick={() => !isReadOnly && setIsOpen(true)}
          className={`w-full p-3 rounded-xl border text-left min-h-[46px] flex items-center ${inputBg} ${!isReadOnly ? 'cursor-pointer hover:border-pairon-mint/50 transition-colors' : ''}`}
        >
          {value ? (
             <span className={isDark ? 'text-white' : 'text-gray-900'}>{value}</span>
          ) : (
             <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>{placeholder}</span>
          )}
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl shadow-2xl ${isDark ? 'bg-pairon-surface border border-white/10' : 'bg-white border border-gray-200'}`}>
            
            {/* Header & Search */}
            <div className={`p-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Seleziona {label}</h3>
                <button 
                   onClick={() => setIsOpen(false)}
                   className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="relative">
                <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                {/* Removed autoFocus here to prevent keyboard pop-up */}
                <input 
                  type="text" 
                  placeholder={`Cerca o aggiungi ${label}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none border ${isDark ? 'bg-black/30 border-white/10 text-white focus:border-pairon-mint' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-pairon-indigo'}`}
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2">
              {filteredOptions.length === 0 && searchTerm && (
                 <button 
                    onClick={handleAddNew}
                    className="w-full p-4 rounded-xl flex items-center gap-3 text-pairon-mint hover:bg-pairon-mint/10 transition-colors text-left group"
                 >
                    <div className="w-8 h-8 rounded-full bg-pairon-mint/20 flex items-center justify-center group-hover:bg-pairon-mint group-hover:text-black transition-colors">
                       <Plus size={16} />
                    </div>
                    <div>
                       <span className="block text-sm font-bold">Aggiungi "{searchTerm}"</span>
                       <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Tocca per salvare e selezionare</span>
                    </div>
                 </button>
              )}

              {filteredOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`w-full p-3 rounded-xl text-left text-sm font-medium flex items-center justify-between group mb-1 transition-colors ${value === opt ? 'bg-pairon-mint text-pairon-obsidian' : (isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50')}`}
                >
                  {opt}
                  {value === opt && <Check size={16} />}
                </button>
              ))}

              {filteredOptions.length === 0 && !searchTerm && (
                <div className={`p-8 text-center text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  Nessuna opzione disponibile. <br/> Inizia a scrivere per aggiungere.
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default SmartSelector;