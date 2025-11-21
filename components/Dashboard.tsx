
import React, { useState, useEffect, useMemo } from 'react';
import { AuthState, Language, Theme } from '../types';
import { Home, Smartphone, Settings, Sparkles, Plus, Battery, Cpu, Moon, Sun, Monitor, Globe, Trash2, LogOut, Edit2, Eye, X, AlertTriangle, Banknote, DollarSign, Euro, PoundSterling, JapaneseYen, IndianRupee, Database, Search, Filter, ArrowUp, ArrowDown, ArrowUpDown, Calendar, Shield, Layers, CheckCircle2, Circle, ArrowLeft, Check, Zap, HardDrive, Aperture, Lock } from 'lucide-react';
import { auth, subscribeToSmartphones, removeSmartphone, PhoneData, logoutUser, setUserCurrency, subscribeToUserSettings, UserSettings, subscribeToCustomOptions, removeCustomOption, CustomOptions, subscribeToUserProfileImage } from '../services/firebase';
import { Loader } from './Loader';
import UserProfile from './UserProfile';
import AddSmartphonePage from './AddSmartphonePage';
import PremiumModal from './PremiumModal';
import AiAdvisor from './AiAdvisor';

interface DashboardProps {
  setAuthState: (state: AuthState) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  themeSetting: Theme;
  setThemeSetting: (theme: Theme) => void;
  effectiveTheme: 'light' | 'dark';
}

// --- CONSTANTS ---
const FREE_PLAN_LIMIT = 10;

// --- CUSTOM ICONS ---
const AiIcon = ({ size = 24, strokeWidth = 2, style, className, ...props }: any) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M10 3C10 3 11 9 17 11C11 13 10 19 10 19C10 19 9 13 3 11C9 9 10 3 10 3Z" />
    <path d="M19 3C19 3 19.5 5 22 6C19.5 7 19 9 19 9C19 9 18.5 7 16 6C18.5 5 19 3 19 3Z" />
  </svg>
);

// --- TYPES & HELPERS FOR SORTING ---
type SortOption = 'alphabetical' | 'date' | 'price' | 'battery' | 'screen' | 'majorUpdates' | 'securityPatches';

const parseNumericValue = (str: string | undefined): number => {
  if (!str) return 0;
  // Remove all non-numeric characters except dot
  const cleaned = str.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const DeleteConfirmationModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  phoneName: string;
  isDark: boolean;
}> = ({ isOpen, onClose, onConfirm, phoneName, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className={`${isDark ? 'bg-pairon-surface border-white/10' : 'bg-white border-red-100'} border rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden transform transition-all scale-100`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
        
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <AlertTriangle size={24} />
          </div>
          
          <div>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Elimina Smartphone?</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Stai per eliminare <strong>{phoneName}</strong>. Questa azione non può essere annullata.
            </p>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <button 
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              Annulla
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl font-medium bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg shadow-red-500/20"
            >
              Elimina
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- FILTER MODAL ---
const FilterSortModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentSort: SortOption;
  setSort: (s: SortOption) => void;
  isDark: boolean;
  language: Language;
}> = ({ isOpen, onClose, currentSort, setSort, isDark, language }) => {
  if (!isOpen) return null;

  const options: { id: SortOption; label: string; icon: any }[] = [
    { id: 'alphabetical', label: language === 'it' ? 'Ordine Alfabetico' : 'Alphabetical', icon: ArrowUpDown },
    { id: 'date', label: language === 'it' ? 'Data di Lancio' : 'Launch Date', icon: Calendar },
    { id: 'price', label: language === 'it' ? 'Prezzo' : 'Price', icon: Banknote },
    { id: 'battery', label: language === 'it' ? 'Dimensione Batteria' : 'Battery Size', icon: Battery },
    { id: 'screen', label: language === 'it' ? 'Dimensione Schermo' : 'Screen Size', icon: Monitor },
    { id: 'majorUpdates', label: language === 'it' ? 'Major Updates (Anni)' : 'Major Updates (Years)', icon: Layers },
    { id: 'securityPatches', label: language === 'it' ? 'Patch Sicurezza (Anni)' : 'Security Patches (Years)', icon: Shield },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-sm rounded-2xl shadow-2xl flex flex-col ${isDark ? 'bg-pairon-surface border border-white/10' : 'bg-white border border-gray-200'}`}>
        <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
          <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {language === 'it' ? 'Ordina per' : 'Sort by'}
          </h3>
          <button onClick={onClose} className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <X size={20} />
          </button>
        </div>
        <div className="p-2 space-y-1">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setSort(opt.id); onClose(); }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentSort === opt.id ? 'bg-pairon-mint text-pairon-obsidian shadow-lg font-bold' : (isDark ? 'bg-transparent text-gray-300 hover:bg-white/5' : 'bg-transparent text-gray-700 hover:bg-gray-100')}`}
            >
              <opt.icon size={20} />
              <span className="text-sm">{opt.label}</span>
              {currentSort === opt.id && <div className="ml-auto w-2 h-2 rounded-full bg-pairon-obsidian"></div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- CURRENCY MODAL ---
const CurrencySelectorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentCurrency: string;
  onSelect: (curr: string) => void;
  isDark: boolean;
  language: Language;
}> = ({ isOpen, onClose, currentCurrency, onSelect, isDark, language }) => {
  if (!isOpen) return null;

  const currencies = [
    { code: 'EUR', name: 'Euro', icon: Euro },
    { code: 'USD', name: 'Dollar', icon: DollarSign },
    { code: 'GBP', name: 'Pound', icon: PoundSterling },
    { code: 'JPY', name: 'Yen', icon: JapaneseYen },
    { code: 'INR', name: 'Rupee', icon: IndianRupee },
    { code: 'CNY', name: 'Yuan', icon: JapaneseYen }, 
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-sm rounded-2xl shadow-2xl flex flex-col ${isDark ? 'bg-pairon-surface border border-white/10' : 'bg-white border border-gray-200'}`}>
        <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
          <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {language === 'it' ? 'Seleziona Valuta' : 'Select Currency'}
          </h3>
          <button onClick={onClose} className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <X size={20} />
          </button>
        </div>
        <div className="p-2 grid grid-cols-2 gap-2">
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => onSelect(curr.code)}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all ${currentCurrency === curr.code ? 'bg-pairon-mint text-pairon-obsidian shadow-lg' : (isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-50 text-gray-700 hover:bg-gray-100')}`}
            >
              <curr.icon size={24} />
              <span className="font-bold text-sm">{curr.code}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- DATA MANAGEMENT MODAL ---
const DataManagementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  language: Language;
}> = ({ isOpen, onClose, isDark, language }) => {
  const [customOptions, setCustomOptions] = useState<CustomOptions | null>(null);
  
  useEffect(() => {
    if (!isOpen || !auth.currentUser) return;
    const unsubscribe = subscribeToCustomOptions(auth.currentUser.uid, (opts) => {
      setCustomOptions(opts);
    });
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (category: keyof CustomOptions, value: string) => {
    if (!auth.currentUser) return;
    try {
      await removeCustomOption(auth.currentUser.uid, category, value);
    } catch (e) {
      console.error("Error removing option", e);
    }
  };

  // Mapping category keys to readable titles
  const categoryTitles: Record<string, string> = {
    brands: language === 'it' ? "Brand" : "Brands",
    chips: language === 'it' ? "Processori" : "Chips",
    ramTypes: "RAM Types",
    storageTypes: "Storage Types",
    haptics: language === 'it' ? "Vibrazione" : "Haptics",
    fingerprintTypes: language === 'it' ? "Tipi Impronta" : "Fingerprint Types",
    faceIdTypes: language === 'it' ? "Tipi Face ID" : "Face ID Types",
    displayTypes: language === 'it' ? "Tipi Display" : "Display Types",
    cameraTypes: language === 'it' ? "Tipi Fotocamera" : "Camera Types",
    uiVersions: language === 'it' ? "Versioni UI" : "UI Versions",
  };

  const hasData = customOptions && Object.values(customOptions).some(arr => (arr as string[]).length > 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl shadow-2xl ${isDark ? 'bg-pairon-surface border border-white/10' : 'bg-white border border-gray-200'}`}>
        <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
          <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {language === 'it' ? 'Gestione Dati Salvati' : 'Manage Saved Data'}
          </h3>
          <button onClick={onClose} className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!hasData ? (
             <div className={`text-center py-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {language === 'it' ? "Nessun dato personalizzato salvato." : "No custom data saved."}
             </div>
          ) : (
            customOptions && Object.entries(customOptions).map(([key, rawValues]) => {
               const values = rawValues as string[];
               if (!values || values.length === 0) return null;
               
               return (
                 <div key={key}>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {categoryTitles[key] || key}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                       {values.map((val: string) => (
                         <div 
                           key={val} 
                           className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${isDark ? 'bg-white/5 border-white/10 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
                         >
                           <span>{val}</span>
                           <button 
                             onClick={() => handleDelete(key as keyof CustomOptions, val)}
                             className="p-0.5 rounded-full hover:bg-red-500 hover:text-white text-gray-400 transition-colors"
                           >
                             <X size={14} />
                           </button>
                         </div>
                       ))}
                    </div>
                 </div>
               );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ 
  setAuthState, 
  language, 
  setLanguage,
  themeSetting,
  setThemeSetting,
  effectiveTheme
}) => {
  const [userName, setUserName] = useState<string>('Guest');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [savedPhones, setSavedPhones] = useState<PhoneData[]>([]);
  const [loadingPhones, setLoadingPhones] = useState(true);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  
  // Modal States
  const [isAddingPhone, setIsAddingPhone] = useState(false);
  const [editingPhone, setEditingPhone] = useState<PhoneData | null>(null);
  const [viewingPhone, setViewingPhone] = useState<PhoneData | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Settings Modal States
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>({ isPremium: false, currency: 'EUR' });
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  
  // Delete Modal State
  const [phoneToDelete, setPhoneToDelete] = useState<PhoneData | null>(null);

  // Saved Phones View (Tab 1 & 2) State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('alphabetical');
  const [sortAsc, setSortAsc] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Comparison Logic
  const [selectedPhoneIds, setSelectedPhoneIds] = useState<string[]>([]);
  const [showCompareView, setShowCompareView] = useState(false);

  // Colors based on theme
  const isDark = effectiveTheme === 'dark';
  const bgColor = isDark ? 'bg-pairon-obsidian' : 'bg-pairon-ghost';
  const textColor = isDark ? 'text-pairon-ghost' : 'text-pairon-obsidian';
  const subTextColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const navBg = isDark ? 'bg-pairon-surface/90 border-white/5 text-gray-400' : 'bg-[#E5E5EA]/80 border-white/40 text-gray-400';

  useEffect(() => {
    // Get current user name
    if (auth.currentUser?.displayName) {
      setUserName(auth.currentUser.displayName);
    } else if (auth.currentUser?.email) {
      setUserName(auth.currentUser.email.split('@')[0]);
    }

    // Subscribe to real firestore data & settings
    if (auth.currentUser) {
      const unsubscribePhones = subscribeToSmartphones(auth.currentUser.uid, (phones) => {
        setSavedPhones(phones);
        setLoadingPhones(false);
      });

      const unsubscribeSettings = subscribeToUserSettings(auth.currentUser.uid, (settings) => {
         setUserSettings(settings);
      });

      // Subscribe to Profile Image from Firestore
      const unsubscribeProfile = subscribeToUserProfileImage(auth.currentUser.uid, (base64) => {
         setCustomAvatar(base64);
      });

      return () => {
        unsubscribePhones();
        unsubscribeSettings();
        unsubscribeProfile();
      };
    } else {
      setLoadingPhones(false);
    }
  }, [isProfileOpen]); 

  // Determine which phones are locked (the excess new ones for free users)
  // savedPhones is already sorted by createdAt DESC (Newest first) from Firestore
  const lockedPhoneIds = useMemo(() => {
    if (userSettings.isPremium) return new Set<string>();
    
    const ids = new Set<string>();
    const excessCount = Math.max(0, savedPhones.length - FREE_PLAN_LIMIT);
    
    // Lock the first 'excessCount' items (which are the newest ones)
    for (let i = 0; i < excessCount; i++) {
      if (savedPhones[i].id) {
        ids.add(savedPhones[i].id!);
      }
    }
    return ids;
  }, [savedPhones, userSettings.isPremium]);

  // Reset comparison state when changing tabs
  useEffect(() => {
    if (activeTab !== 2) {
      setShowCompareView(false);
      // We keep selectedPhoneIds to be nice to the user if they switch back and forth
    }
  }, [activeTab]);

  const t = {
    it: {
      welcome: `Ciao,`,
      subtitle: "Ecco la tua collezione.",
      empty: "Non hai ancora salvato nessuno smartphone.",
      add: "Aggiungi",
      nav: ["Home", "Salvati", "Confronta", "PairOn AI", "Impostazioni"],
      searchPlaceholder: "Cerca smartphone...",
      settings: {
        title: "Impostazioni",
        appearance: "Aspetto",
        language: "Lingua",
        data: "Dati & Preferenze",
        currency: "Valuta",
        manageData: "Gestione Dati",
        themeAuto: "Automatico",
        themeLight: "Chiaro",
        themeDark: "Scuro",
        logout: "Esci"
      },
      compare: {
         title: "Comparazione",
         select: "Seleziona Smartphone",
         selected: "Selezionati",
         start: "Confronta Ora",
         limitError: "Hai raggiunto il limite di selezione.",
         limitFree: "Max 6 dispositivi (Free)",
         limitPremium: "Max 12 dispositivi (Premium)",
         minSelection: "Seleziona almeno 2 dispositivi",
         back: "Modifica Selezione"
      }
    },
    en: {
      welcome: `Hello,`,
      subtitle: "Here is your collection.",
      empty: "You haven't saved any smartphones yet.",
      add: "Add New",
      nav: ["Home", "Saved", "Compare", "PairOn AI", "Settings"],
      searchPlaceholder: "Search smartphones...",
      settings: {
        title: "Settings",
        appearance: "Appearance",
        language: "Language",
        data: "Data & Preferences",
        currency: "Currency",
        manageData: "Manage Data",
        themeAuto: "Auto",
        themeLight: "Light",
        themeDark: "Dark",
        logout: "Log Out"
      },
      compare: {
         title: "Comparison",
         select: "Select Smartphones",
         selected: "Selected",
         start: "Compare Now",
         limitError: "Selection limit reached.",
         limitFree: "Max 6 devices (Free)",
         limitPremium: "Max 12 devices (Premium)",
         minSelection: "Select at least 2 devices",
         back: "Edit Selection"
      }
    }
  };

  const text = t[language];

  // Labels mapping for sort options
  const sortLabels: Record<SortOption, { it: string, en: string }> = {
    alphabetical: { it: 'Alfabetico', en: 'Alphabetical' },
    date: { it: 'Data Lancio', en: 'Launch Date' },
    price: { it: 'Prezzo', en: 'Price' },
    battery: { it: 'Batteria', en: 'Battery Size' },
    screen: { it: 'Schermo', en: 'Screen Size' },
    majorUpdates: { it: 'Aggiornamenti', en: 'Major Updates' },
    securityPatches: { it: 'Sicurezza', en: 'Security Patches' },
  };

  // HELPER: Generic Phone Sorter and Filter
  const getProcessedPhones = (sourceList: PhoneData[]) => {
     // 1. Filter
     let filtered = sourceList.filter(phone => {
        const searchStr = `${phone.brand} ${phone.model}`.toLowerCase();
        return searchStr.includes(searchTerm.toLowerCase());
      });
  
      // 2. Sort
      return filtered.sort((a, b) => {
        let valA: any, valB: any;
  
        switch (sortOption) {
          case 'alphabetical':
            valA = `${a.brand} ${a.model}`.toLowerCase();
            valB = `${b.brand} ${b.model}`.toLowerCase();
            break;
          case 'date':
            valA = a.launchDate ? new Date(a.launchDate).getTime() : 0;
            valB = b.launchDate ? new Date(b.launchDate).getTime() : 0;
            break;
          case 'price':
            valA = parseNumericValue(a.price);
            valB = parseNumericValue(b.price);
            break;
          case 'battery':
            valA = parseNumericValue(a.battery?.capacity);
            valB = parseNumericValue(b.battery?.capacity);
            break;
          case 'screen':
            valA = parseNumericValue(a.displays?.[0]?.size);
            valB = parseNumericValue(b.displays?.[0]?.size);
            break;
          case 'majorUpdates':
            valA = parseNumericValue(a.majorUpdates);
            valB = parseNumericValue(b.majorUpdates);
            break;
          case 'securityPatches':
            valA = parseNumericValue(a.securityPatches);
            valB = parseNumericValue(b.securityPatches);
            break;
          default:
            return 0;
        }
  
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  };

  // Phones for Tab 1 (Saved)
  const filteredAndSortedPhones = useMemo(() => getProcessedPhones(savedPhones), [savedPhones, searchTerm, sortOption, sortAsc]);

  // Comparison Handlers
  const handleToggleSelection = (phoneId: string) => {
     // Prevent selecting locked phones
     if (lockedPhoneIds.has(phoneId)) {
       setIsPremiumModalOpen(true);
       return;
     }

     if (selectedPhoneIds.includes(phoneId)) {
        setSelectedPhoneIds(prev => prev.filter(id => id !== phoneId));
     } else {
        const limit = userSettings.isPremium ? 12 : 6;
        if (selectedPhoneIds.length >= limit) {
           if (!userSettings.isPremium) {
             setIsPremiumModalOpen(true);
           } else {
             alert(text.compare.limitPremium);
           }
           return;
        }
        setSelectedPhoneIds(prev => [...prev, phoneId]);
     }
  };

  // Phones for Tab 2 (Compare View)
  const comparisonPhones = useMemo(() => {
     const selected = savedPhones.filter(p => p.id && selectedPhoneIds.includes(p.id));
     return getProcessedPhones(selected);
  }, [savedPhones, selectedPhoneIds, searchTerm, sortOption, sortAsc]);


  const handleDeleteClick = (e: React.MouseEvent, phone: PhoneData) => {
    e.stopPropagation();
    setPhoneToDelete(phone);
  };

  const handleConfirmDelete = async () => {
    if (!auth.currentUser || !phoneToDelete || !phoneToDelete.id) return;
    
    try {
      await removeSmartphone(auth.currentUser.uid, phoneToDelete.id);
      setPhoneToDelete(null);
    } catch (error) {
      console.error("Error deleting phone:", error);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setAuthState(AuthState.LOGIN);
  };

  const handleSetCurrency = async (code: string) => {
    if(auth.currentUser) {
      await setUserCurrency(auth.currentUser.uid, code);
      setIsCurrencyModalOpen(false);
    }
  };

  const handleAddPhoneClick = () => {
    if (!userSettings.isPremium && savedPhones.length >= 10) {
      setIsPremiumModalOpen(true);
      return;
    }
    setIsAddingPhone(true);
  };

  // Render Add/Edit/View Phone Page Full Screen Overlay
  if (isAddingPhone || editingPhone || viewingPhone) {
    return (
      <AddSmartphonePage 
        onClose={() => {
          setIsAddingPhone(false);
          setEditingPhone(null);
          setViewingPhone(null);
        }} 
        language={language}
        isDark={isDark}
        initialData={editingPhone || viewingPhone}
        isReadOnly={!!viewingPhone}
      />
    );
  }

  // Function to render content based on active tab
  const renderContent = () => {
    // SETTINGS VIEW (Tab 4)
    if (activeTab === 4) {
      return (
        <div className="px-6 pt-4 pb-32 animate-fade-in">
          <h2 className={`text-2xl font-bold mb-6 ${textColor}`}>{text.settings.title}</h2>
          
          <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-pairon-surface border border-white/5' : 'bg-white border border-gray-200'} mb-6 shadow-sm`}>
            
            {/* Language Section */}
            <div className={`p-4 ${isDark ? 'border-b border-white/5' : 'border-b border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-pairon-blue/20 text-pairon-blue' : 'bg-blue-100 text-blue-600'}`}>
                  <Globe size={20} />
                </div>
                <span className={`font-medium ${textColor}`}>{text.settings.language}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`py-2 rounded-xl text-sm font-medium transition-all ${language === 'en' ? 'bg-pairon-blue text-white shadow-md' : `${isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}`}
                >
                  English
                </button>
                <button 
                  onClick={() => setLanguage('it')}
                  className={`py-2 rounded-xl text-sm font-medium transition-all ${language === 'it' ? 'bg-pairon-blue text-white shadow-md' : `${isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}`}
                >
                  Italiano
                </button>
              </div>
            </div>

            {/* Theme Section */}
            <div className={`p-4 ${isDark ? 'border-b border-white/5' : 'border-b border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                  <Monitor size={20} />
                </div>
                <span className={`font-medium ${textColor}`}>{text.settings.appearance}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setThemeSetting('light')}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-all ${themeSetting === 'light' ? 'bg-pairon-mint text-slate-900 shadow-md ring-1 ring-pairon-mint/50' : `${isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}`}
                >
                  <Sun size={18} className="mb-1" />
                  {text.settings.themeLight}
                </button>
                <button 
                  onClick={() => setThemeSetting('dark')}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-all ${themeSetting === 'dark' ? 'bg-pairon-mint text-slate-900 shadow-md ring-1 ring-pairon-mint/50' : `${isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}`}
                >
                  <Moon size={18} className="mb-1" />
                  {text.settings.themeDark}
                </button>
                <button 
                  onClick={() => setThemeSetting('auto')}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-all ${themeSetting === 'auto' ? 'bg-pairon-mint text-slate-900 shadow-md ring-1 ring-pairon-mint/50' : `${isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}`}
                >
                  <Monitor size={18} className="mb-1" />
                  {text.settings.themeAuto}
                </button>
              </div>
            </div>

            {/* Data & Preferences Section */}
            <div className={`p-4 ${isDark ? 'border-b border-white/5' : 'border-b border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                  <Database size={20} />
                </div>
                <span className={`font-medium ${textColor}`}>{text.settings.data}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Currency Button */}
                <button 
                  onClick={() => setIsCurrencyModalOpen(true)}
                  className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-xs font-medium transition-all ${isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <div className="flex items-center gap-1">
                    <Banknote size={18} className="mb-1" />
                    <span className="mb-1 font-bold text-pairon-mint">{userSettings.currency || 'EUR'}</span>
                  </div>
                  {text.settings.currency}
                </button>
                
                {/* Data Management Button */}
                <button 
                  onClick={() => setIsDataModalOpen(true)}
                  className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-xs font-medium transition-all ${isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <Database size={18} className="mb-1" />
                  {text.settings.manageData}
                </button>
              </div>
            </div>

            {/* Logout Section */}
            <div className="p-4">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors font-medium text-sm"
              >
                <LogOut size={18} />
                {text.settings.logout}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // AI ADVISOR VIEW (Tab 3)
    if (activeTab === 3) {
      // Double check premium status just in case
      if (!userSettings.isPremium) {
        return (
           <div className="flex items-center justify-center h-[60vh]">
             <Loader className="text-pairon-mint" />
           </div>
        );
      }

      return (
        <AiAdvisor 
          savedPhones={savedPhones} 
          language={language} 
          isDark={isDark}
          userName={userName}
          onBack={() => setActiveTab(0)}
          onViewPhone={(phone) => setViewingPhone(phone)}
        />
      );
    }

    // COMPARISON VIEW (Tab 2)
    if (activeTab === 2) {
      // Shared Header Logic
      const commonHeader = (
        <div className="mb-6 space-y-3 sticky top-0 z-20 backdrop-blur-md bg-opacity-90 py-2">
              {!showCompareView && (
                 <div className="flex justify-between items-center px-1">
                    <h2 className="text-xl font-bold">{text.compare.select}</h2>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                       {selectedPhoneIds.length} / {userSettings.isPremium ? 12 : 6}
                    </span>
                 </div>
              )}

              <div className="flex gap-2">
                 {showCompareView && (
                   <button 
                     onClick={() => setShowCompareView(false)}
                     className={`p-3 rounded-xl border transition-colors ${isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                   >
                     <ArrowLeft size={20} />
                   </button>
                 )}

                <div className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white focus-within:border-pairon-mint' : 'bg-white border-gray-200 text-gray-900 focus-within:border-pairon-indigo'}`}>
                   <Search size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                   <input 
                     type="text" 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     placeholder={text.searchPlaceholder}
                     className="bg-transparent w-full outline-none text-sm"
                   />
                </div>
                <button 
                  onClick={() => setIsFilterModalOpen(true)}
                  className={`p-3 rounded-xl border transition-colors ${isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  <Filter size={20} />
                </button>
                <button 
                   onClick={() => setSortAsc(!sortAsc)}
                   className={`p-3 rounded-xl border transition-colors ${isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                   {sortAsc ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                </button>
              </div>
              
              {/* Filter Indicator */}
              <div className="flex flex-wrap gap-2">
                 <div className={`px-2 py-1 rounded-lg text-xs border ${isDark ? 'border-white/10 text-gray-400' : 'border-gray-300 text-gray-600'}`}>
                   {language === 'it' ? 'Ordinato per:' : 'Sorted by:'} {sortLabels[sortOption][language]}
                 </div>
              </div>
        </div>
      );

      if (showCompareView) {
         // COMPARISON GRID VIEW
         return (
          <div className="px-6 pt-2 pb-32 animate-fade-in h-[calc(100vh-100px)] overflow-y-auto">
             {commonHeader}
             
             <div className="flex flex-col gap-4">
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{text.compare.title}</h3>
                
                {/* Horizontal Scrolling Container for Comparison Cards */}
                <div className="flex overflow-x-auto gap-4 pb-6 -mx-6 px-6 snap-x snap-mandatory">
                   {comparisonPhones.map(phone => (
                      <div 
                        key={phone.id}
                        onClick={() => setViewingPhone(phone)}
                        className={`snap-center shrink-0 w-[280px] rounded-3xl border overflow-hidden flex flex-col transition-all hover:scale-[1.01] cursor-pointer ${isDark ? 'bg-pairon-surface border-white/10' : 'bg-white border-gray-200 shadow-lg'}`}
                      >
                         {/* Card Header */}
                         <div className={`h-40 relative bg-gradient-to-br ${phone.color} p-4 flex flex-col justify-end`}>
                            {phone.imageUrl && (
                              <img src={phone.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />
                            )}
                            <span className="relative z-10 text-xs font-bold text-white/80 uppercase tracking-wider bg-black/20 w-fit px-2 py-1 rounded-md backdrop-blur-sm mb-1">
                              {phone.brand}
                            </span>
                            <h4 className="relative z-10 text-xl font-display text-white leading-tight">
                              {phone.model}
                            </h4>
                         </div>

                         {/* Specs List */}
                         <div className="p-4 flex-1 flex flex-col gap-3 text-sm">
                            <div className="flex items-center gap-3">
                               <Cpu size={16} className="text-pairon-mint" />
                               <span className="truncate font-medium opacity-80">{phone.chip}</span>
                            </div>
                            <div className="flex items-center gap-3">
                               <Monitor size={16} className="text-blue-400" />
                               <span className="truncate font-medium opacity-80">
                                 {phone.displays?.[0] ? `${phone.displays[0].size} ${phone.displays[0].type}` : '-'}
                               </span>
                            </div>
                            <div className="flex items-center gap-3">
                               <Battery size={16} className="text-green-400" />
                               <span className="truncate font-medium opacity-80">
                                 {phone.battery?.capacity} {phone.battery?.wiredCharging && `(${phone.battery.wiredCharging})`}
                               </span>
                            </div>
                            <div className="flex items-center gap-3">
                               <Banknote size={16} className="text-yellow-400" />
                               <span className="truncate font-medium opacity-80 font-mono">
                                 {phone.price ? `${userSettings.currency === 'USD' ? '$' : '€'} ${phone.price}` : '-'}
                               </span>
                            </div>
                            
                            {/* Extra info based on sort to highlight why it's ranked */}
                            {sortOption !== 'alphabetical' && sortOption !== 'price' && sortOption !== 'date' && (
                               <div className={`mt-auto pt-3 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                                  <span className="text-xs font-bold opacity-60 uppercase">{sortLabels[sortOption][language]}</span>
                                  <div className="font-bold text-pairon-mint">
                                     {sortOption === 'battery' && phone.battery?.capacity}
                                     {sortOption === 'screen' && phone.displays?.[0]?.size}
                                     {sortOption === 'majorUpdates' && `${phone.majorUpdates} Years`}
                                     {sortOption === 'securityPatches' && `${phone.securityPatches} Years`}
                                  </div>
                               </div>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
         );
      }

      // SELECTION LIST VIEW
      // Reuse logic from Tab 1 but process ALL saved phones to allow selection
      const selectionList = getProcessedPhones(savedPhones);

      return (
        <div className="px-6 pt-2 pb-32 animate-fade-in h-[calc(100vh-100px)] overflow-y-auto relative">
           {commonHeader}
           
           <div className="space-y-3 pb-24">
              {selectionList.length === 0 ? (
                 <div className={`text-center py-10 ${subTextColor}`}>
                    {savedPhones.length === 0 ? text.empty : (language === 'it' ? 'Nessun risultato trovato.' : 'No results found.')}
                 </div>
              ) : (
                selectionList.map((phone) => {
                  const isSelected = selectedPhoneIds.includes(phone.id || '');
                  const isLocked = phone.id ? lockedPhoneIds.has(phone.id) : false;

                  return (
                    <div 
                      key={phone.id}
                      onClick={() => phone.id && handleToggleSelection(phone.id)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] relative overflow-hidden ${
                        isSelected 
                          ? 'bg-pairon-mint/10 border-pairon-mint ring-1 ring-pairon-mint' 
                          : (isDark ? 'bg-pairon-surface border-white/5 hover:border-white/10' : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm')
                      }`}
                    >
                       {/* Lock Overlay for Selection */}
                       {isLocked && (
                         <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center backdrop-blur-[1px]">
                            <Lock size={20} className="text-white/80" />
                         </div>
                       )}

                       <div className="flex items-center gap-4">
                          {/* Selection Circle */}
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-pairon-mint text-pairon-obsidian' : (isDark ? 'bg-white/10 text-transparent' : 'bg-gray-200 text-transparent')}`}>
                             <Check size={14} strokeWidth={4} />
                          </div>

                          {/* Thumbnail */}
                          <div className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br ${phone.color}`}>
                             {phone.imageUrl ? (
                               <img src={phone.imageUrl} alt="" className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-white/20">
                                 <Smartphone size={20} />
                               </div>
                             )}
                          </div>
                          
                          {/* Text Info */}
                          <div>
                             <div className={`text-xs font-medium mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{phone.brand}</div>
                             <h3 className={`font-bold leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>{phone.model}</h3>
                          </div>
                       </div>
                    </div>
                  );
                })
              )}
           </div>
           
           {/* Floating Compare Action Button */}
           <div className="fixed bottom-28 left-0 w-full px-6 z-30 flex justify-center pointer-events-none">
              <button 
                 onClick={() => setShowCompareView(true)}
                 disabled={selectedPhoneIds.length < 2}
                 className={`pointer-events-auto shadow-2xl backdrop-blur-xl px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all duration-500 transform ${selectedPhoneIds.length >= 2 ? 'translate-y-0 opacity-100 bg-gradient-to-r from-pairon-indigo to-pairon-blue text-white' : 'translate-y-10 opacity-0 bg-gray-500 text-gray-300'}`}
              >
                 <span className="font-display text-2xl">P</span>
                 {text.compare.start} ({selectedPhoneIds.length})
              </button>
           </div>
        </div>
      );
    }

    // SAVED SMARTPHONES VIEW (Tab 1)
    if (activeTab === 1) {
       return (
        <div className="px-6 pt-2 pb-32 animate-fade-in h-[calc(100vh-100px)] overflow-y-auto">
           {/* Header & Controls */}
           <div className="mb-6 space-y-3 sticky top-0 z-20 backdrop-blur-md bg-opacity-90 py-2">
              <div className="flex gap-2">
                <div className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white focus-within:border-pairon-mint' : 'bg-white border-gray-200 text-gray-900 focus-within:border-pairon-indigo'}`}>
                   <Search size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                   <input 
                     type="text" 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     placeholder={text.searchPlaceholder}
                     className="bg-transparent w-full outline-none text-sm"
                   />
                </div>
                <button 
                  onClick={() => setIsFilterModalOpen(true)}
                  className={`p-3 rounded-xl border transition-colors ${isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  <Filter size={20} />
                </button>
                <button 
                   onClick={() => setSortAsc(!sortAsc)}
                   className={`p-3 rounded-xl border transition-colors ${isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                   {sortAsc ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                </button>
              </div>
              
              {/* Active Filter Indicators */}
              <div className="flex flex-wrap gap-2">
                 {searchTerm && (
                   <div className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 ${isDark ? 'bg-pairon-mint/20 text-pairon-mint' : 'bg-pairon-indigo/10 text-pairon-indigo'}`}>
                      <span>"{searchTerm}"</span>
                      <button onClick={() => setSearchTerm('')}><X size={12} /></button>
                   </div>
                 )}
                 <div className={`px-2 py-1 rounded-lg text-xs border ${isDark ? 'border-white/10 text-gray-400' : 'border-gray-300 text-gray-600'}`}>
                   {language === 'it' ? 'Ordinato per:' : 'Sorted by:'} {sortLabels[sortOption][language]}
                 </div>
              </div>
           </div>

           {/* List */}
           <div className="space-y-3">
              {filteredAndSortedPhones.length === 0 ? (
                 <div className={`text-center py-10 ${subTextColor}`}>
                    {savedPhones.length === 0 ? text.empty : (language === 'it' ? 'Nessun risultato trovato.' : 'No results found.')}
                 </div>
              ) : (
                filteredAndSortedPhones.map((phone) => {
                  const isLocked = phone.id ? lockedPhoneIds.has(phone.id) : false;
                  
                  return (
                    <div 
                      key={phone.id}
                      onClick={() => isLocked ? setIsPremiumModalOpen(true) : setViewingPhone(phone)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${isDark ? 'bg-pairon-surface border-white/5 hover:border-white/10' : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'}`}
                    >
                       {/* Lock Overlay */}
                       {isLocked && (
                         <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="bg-black/40 p-2 rounded-full backdrop-blur-md border border-white/10">
                               <Lock size={20} className="text-white/80" />
                            </div>
                         </div>
                       )}

                       <div className={`flex items-center gap-4 ${isLocked ? 'opacity-40' : ''}`}>
                          {/* Thumbnail */}
                          <div className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br ${phone.color}`}>
                             {phone.imageUrl ? (
                               <img src={phone.imageUrl} alt="" className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-white/20">
                                 <Smartphone size={20} />
                               </div>
                             )}
                          </div>
                          
                          {/* Text Info */}
                          <div>
                             <div className={`text-xs font-medium mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{phone.brand}</div>
                             <h3 className={`font-bold leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>{phone.model}</h3>
                          </div>
                       </div>

                       {/* Actions */}
                       <div className="flex items-center gap-2 relative z-20">
                          {!isLocked && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingPhone(phone); }}
                              className={`p-2 rounded-full transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          <button 
                            onClick={(e) => handleDeleteClick(e, phone)}
                            className={`p-2 rounded-full transition-colors ${isDark ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-500'}`}
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </div>
                  );
                })
              )}
           </div>
        </div>
       );
    }

    // HOME VIEW (Default)
    if (activeTab === 0) {
      return (
        <div className="pl-6 pb-32">
           {/* Carousel Container */}
           <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 pt-4 pr-6">
            
            {/* Add New Card */}
            <div 
              onClick={handleAddPhoneClick}
              className={`snap-start shrink-0 w-72 h-[26rem] rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group ${isDark ? 'bg-pairon-surface border-white/10 text-gray-500 hover:border-pairon-indigo hover:text-pairon-indigo' : 'bg-white border-gray-300 text-gray-400 hover:border-pairon-indigo hover:text-pairon-indigo'}`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-white/5 group-hover:bg-pairon-indigo/20' : 'bg-gray-100 group-hover:bg-pairon-indigo/10'}`}>
                <Plus className="w-8 h-8" />
              </div>
              <span className="font-semibold">{text.add}</span>
            </div>

            {/* Loading State */}
            {loadingPhones && (
              <div className="snap-start shrink-0 w-72 h-[26rem] flex items-center justify-center">
                <Loader className={`animate-spin w-8 h-8 ${subTextColor}`} />
              </div>
            )}

            {/* Smartphone Cards */}
            {savedPhones.map((phone) => {
              // Helper calculations for the preview card
              // Filter out cameras with empty megapixel string before sorting to avoid "undefined" issues
              const maxCam = phone.cameras?.filter(c => c.megapixels && c.megapixels.trim() !== '').sort((a, b) => parseInt(b.megapixels || '0') - parseInt(a.megapixels || '0'))[0];
              
              // Determine Largest Storage (Filtering empty amounts first)
              const storageInfo = phone.storage?.filter(s => s.amount && s.amount.trim() !== '').sort((a, b) => {
                  const getVal = (s: any) => {
                     const num = parseFloat(s.amount || '0');
                     // Convert TB to GB for comparison
                     const mult = s.unit === 'TB' ? 1024 : 1;
                     return num * mult;
                  };
                  return getVal(b) - getVal(a);
              })[0];

              const currencySymbol = userSettings.currency === 'USD' ? '$' : userSettings.currency === 'GBP' ? '£' : userSettings.currency === 'JPY' ? '¥' : '€';

              const isLocked = phone.id ? lockedPhoneIds.has(phone.id) : false;

              return (
              <div 
                key={phone.id} 
                onClick={() => isLocked ? setIsPremiumModalOpen(true) : setViewingPhone(phone)}
                className="snap-start shrink-0 w-72 h-[26rem] relative rounded-[2rem] overflow-hidden transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer shadow-xl"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${phone.color} opacity-90`}>
                  {phone.imageUrl && (
                    <img src={phone.imageUrl} alt={phone.model} className="w-full h-full object-cover mix-blend-overlay opacity-50" />
                  )}
                </div>

                {/* Lock Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 bg-black/70 z-20 flex flex-col items-center justify-center backdrop-blur-[2px] p-4 text-center">
                     <div className="bg-white/10 p-4 rounded-full mb-3 backdrop-blur-md border border-white/10 shadow-lg">
                       <Lock size={32} className="text-white/90" />
                     </div>
                     <p className="text-white font-bold text-lg">Premium Content</p>
                     <p className="text-white/60 text-xs mt-1 mb-4">
                       {language === 'it' ? 'Sblocca per accedere' : 'Unlock to access'}
                     </p>
                  </div>
                )}
                
                {/* HEADER: Brand & Actions - Moved out of content container to avoid opacity/pointer issues when locked. Z-30 places it above lock overlay. */}
                <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-start z-30 pointer-events-none">
                    <span className={`px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium border border-white/10 ${isLocked ? 'opacity-40' : ''}`}>
                      {phone.brand}
                    </span>
                    
                    <div className="flex gap-1 bg-black/30 backdrop-blur-xl rounded-full p-1 border border-white/10 shadow-lg pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                       {!isLocked && (
                         <>
                            <button 
                              onClick={() => setViewingPhone(phone)}
                              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                            >
                              <Eye size={14} />
                            </button>
                            <button 
                              onClick={() => setEditingPhone(phone)}
                              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                            >
                              <Edit2 size={14} />
                            </button>
                         </>
                       )}
                      {/* Trash Button - Always Visible */}
                      <button 
                        onClick={(e) => handleDeleteClick(e, phone)}
                        className="p-2 hover:bg-red-500/80 rounded-full transition-colors text-red-300 hover:text-white"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                </div>

                {/* Content Container */}
                <div className={`absolute inset-0 p-5 flex flex-col justify-between text-white ${isLocked ? 'opacity-30 pointer-events-none' : ''}`}>
                  
                  {/* Name - Positioned with margin to clear the absolute header */}
                  <div className="mt-10">
                    <h3 className="text-2xl font-bold font-display leading-tight drop-shadow-md">{phone.model}</h3>
                    <div className="w-12 h-1 bg-pairon-mint rounded-full mt-1"></div>
                  </div>

                  {/* NEW STATS CARD - Bottom Anchor */}
                  <div className="mt-auto bg-black/40 backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 shadow-xl z-10">
                    {/* Row 1: Price (Hero) */}
                    <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
                        <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
                          {language === 'it' ? 'Prezzo' : 'Price'}
                        </span>
                        <span className="text-xl font-bold text-pairon-mint font-mono">
                          {phone.price ? `${currencySymbol} ${phone.price}` : '-'}
                        </span>
                    </div>

                    {/* Row 2: Specs Grid */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                        {/* Chip */}
                        <div className="col-span-2 flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-white/10">
                              <Cpu size={14} className="text-white/80" />
                          </div>
                          <div className="flex flex-col min-w-0">
                              <span className="text-[10px] text-white/50 uppercase">Chip</span>
                              <span className="text-xs font-medium truncate">{phone.chip || '-'}</span>
                          </div>
                        </div>

                        {/* ROM */}
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-white/10">
                              <HardDrive size={14} className="text-white/80" />
                          </div>
                          <div className="flex flex-col min-w-0">
                              <span className="text-[10px] text-white/50 uppercase">Rom</span>
                              <span className="text-xs font-medium truncate">
                                {storageInfo ? `${storageInfo.amount}${storageInfo.unit}` : '-'}
                              </span>
                          </div>
                        </div>

                        {/* Camera */}
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-white/10">
                              <Aperture size={14} className="text-white/80" />
                          </div>
                          <div className="flex flex-col min-w-0">
                              <span className="text-[10px] text-white/50 uppercase">Cam</span>
                              <span className="text-xs font-medium truncate">
                                {maxCam ? `${maxCam.megapixels}MP` : '-'}
                              </span>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Glossy Overlay Effect */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
              </div>
            )})}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`min-h-screen w-full relative overflow-hidden font-sans selection:bg-pairon-mint/30 transition-colors duration-300 ${bgColor} ${textColor}`}>
      
      {/* Modal Wrappers */}
      <UserProfile 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        onLogout={handleLogout}
        isDark={isDark}
        language={language}
      />

      <DeleteConfirmationModal 
        isOpen={!!phoneToDelete}
        onClose={() => setPhoneToDelete(null)}
        onConfirm={handleConfirmDelete}
        phoneName={phoneToDelete?.model || 'Smartphone'}
        isDark={isDark}
      />

      <CurrencySelectorModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        currentCurrency={userSettings.currency || 'EUR'}
        onSelect={handleSetCurrency}
        isDark={isDark}
        language={language}
      />

      <DataManagementModal 
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        isDark={isDark}
        language={language}
      />

      <FilterSortModal
         isOpen={isFilterModalOpen}
         onClose={() => setIsFilterModalOpen(false)}
         currentSort={sortOption}
         setSort={setSortOption}
         isDark={isDark}
         language={language}
      />

      <PremiumModal 
         isOpen={isPremiumModalOpen}
         onClose={() => setIsPremiumModalOpen(false)}
         isDark={isDark}
         language={language}
      />

      {/* Hidden SVG Definition for AI Gradient */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="ai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" /> {/* Indigo */}
            <stop offset="50%" stopColor="#3B82F6" /> {/* Blue */}
            <stop offset="100%" stopColor="#34D399" /> {/* Mint */}
          </linearGradient>
        </defs>
      </svg>

      {/* Header Section (Only Show if NOT in Settings, or change title in Settings) */}
      {/* Also hide if in AI Chat Mode (Tab 3) to give space */}
      {activeTab !== 3 && (
        <header className="pt-12 pb-2 px-6 animate-fade-in">
          <div className="flex justify-between items-start">
            <div>
              {activeTab === 4 || activeTab === 1 || activeTab === 2 ? (
                 // Minimal Header for Settings, Saved, Compare (to save space)
                 <div className="h-[52px] flex items-center"> 
                    {activeTab === 1 && <h2 className="text-2xl font-bold tracking-tight">{language === 'it' ? 'I tuoi Smartphone' : 'Your Smartphones'}</h2>}
                 </div>
              ) : (
                 <>
                  <h2 className="text-3xl font-bold tracking-tight leading-tight">
                    {text.welcome} <br/> 
                    <span className="text-pairon-indigo">{auth.currentUser?.displayName || userName}</span>
                  </h2>
                  <p className={`${subTextColor} mt-2 text-sm font-medium tracking-wide uppercase opacity-80`}>{text.subtitle}</p>
                 </>
              )}
            </div>
            
            {/* User Profile Section - CLICKABLE */}
            <div className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" onClick={() => setIsProfileOpen(true)}>
              <div className={`w-12 h-12 rounded-full p-1 shadow-sm border ${isDark ? 'bg-pairon-surface border-white/10' : 'bg-white border-gray-100'}`}>
                 <div className="w-full h-full rounded-full overflow-hidden bg-pairon-indigo/10 flex items-center justify-center text-pairon-indigo font-bold text-lg">
                   {customAvatar ? (
                     <img src={customAvatar} alt="User" className="w-full h-full object-cover" />
                   ) : auth.currentUser?.photoURL ? (
                     <img src={auth.currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                   ) : (
                     (auth.currentUser?.displayName || userName).charAt(0).toUpperCase()
                   )}
                 </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main>
        {renderContent()}
      </main>

      {/* Bottom Navigation Bar - iOS Style */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md transition-all duration-500 ease-in-out ${activeTab === 3 ? 'translate-y-[200%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <div className={`backdrop-blur-2xl border rounded-[2rem] p-1.5 shadow-xl shadow-black/5 flex justify-between items-center relative transition-colors duration-300 ${navBg}`}>
          
          {/* Navigation Items */}
          {[
            { icon: Home, label: text.nav[0] },
            { icon: Smartphone, label: text.nav[1] },
            { isLogo: true, label: text.nav[2] }, // Comparison (Center "P")
            { icon: AiIcon, label: text.nav[3], isAi: true }, // AI
            { icon: Settings, label: text.nav[4] }
          ].map((item, index) => {
            const isActive = activeTab === index;
            
            return (
              <button
                key={index}
                onClick={() => {
                   if (item.isAi && !userSettings.isPremium) {
                     setIsPremiumModalOpen(true);
                     return;
                   }
                   setActiveTab(index);
                }}
                className={`relative w-full h-12 flex flex-col items-center justify-center gap-0.5 transition-all duration-300 rounded-[1.5rem] z-10 ${isActive ? (isDark ? 'text-white' : 'text-black') + ' shadow-[0_2px_8px_rgba(0,0,0,0.1)]' : 'hover:opacity-80'}`}
              >
                {/* Background for active state */}
                {isActive && (
                   <div className={`absolute inset-0 rounded-[1.5rem] -z-10 transition-all duration-300 animate-fade-in ${isDark ? 'bg-white/10 border border-white/5' : 'bg-white'}`}></div>
                )}
                
                {item.isLogo ? (
                  <span 
                    className={`font-display text-2xl transition-transform duration-300 select-none ${isActive ? 'scale-110 bg-gradient-to-br from-pairon-indigo to-pairon-blue bg-clip-text text-transparent' : (isDark ? 'text-gray-500' : 'text-gray-400')}`}
                  >
                    P
                  </span>
                ) : (
                  <item.icon 
                    size={isActive ? 24 : 22} 
                    strokeWidth={isActive ? 2.5 : 2}
                    style={item.isAi ? { stroke: "url(#ai-gradient)", fill: isActive ? (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)") : "none" } : {}}
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
