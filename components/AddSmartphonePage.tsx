import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Plus, Trash2, Save, Check, Cpu, HardDrive, Smartphone, Volume2, Fingerprint, Activity, Eye, AlertTriangle, X } from 'lucide-react';
import { Language } from '../types';
import { PhoneData, RamVariant, StorageVariant, addSmartphone, updateSmartphone, uploadSmartphoneImage, auth } from '../services/firebase';
import { Loader } from './Loader';
import SmartSelector from './SmartSelector';

interface AddSmartphonePageProps {
  onClose: () => void;
  language: Language;
  isDark: boolean;
  initialData?: PhoneData | null; // If present, we are in EDIT mode
  isReadOnly?: boolean; // If true, disable inputs
}

// --- DEFAULTS FOR SMART SELECTORS ---
const DEFAULT_BRANDS = [
  "Samsung", "Apple", "Xiaomi", "Google", "OnePlus", "Honor", "Motorola", 
  "Sony", "Asus", "Nothing", "Huawei", "Oppo", "Vivo", "Realme", "Poco", "Redmi"
];

const DEFAULT_CHIPS = [
  "Snapdragon 8 Gen 3", "Snapdragon 8 Gen 2", "Dimensity 9300", "Dimensity 9200", 
  "A17 Pro", "A16 Bionic", "Tensor G3", "Tensor G2", "Exynos 2400", "Snapdragon 7+ Gen 2"
];

const DEFAULT_RAM_TYPES = [
  "LPDDR5X", "LPDDR5", "LPDDR4X", "LPDDR4", "LPDDR5T"
];

const DEFAULT_STORAGE_TYPES = [
  "UFS 4.0", "UFS 3.1", "UFS 3.0", "UFS 2.2", "UFS 2.1", "NVMe", "eMMC 5.1"
];

const DEFAULT_HAPTICS = [
  "Buona", "Aptica", "Scarsa", "Eccellente", "Motore X-Axis"
];

const DEFAULT_FINGERPRINT_TYPES = [
  "Sotto display (Ottico)", 
  "Sotto display (Ultrasonico)", 
  "Laterale (Tasto accensione)", 
  "Posteriore",
  "Tasto Home (Frontale)"
];

const AddSmartphonePage: React.FC<AddSmartphonePageProps> = ({ 
  onClose, 
  language, 
  isDark,
  initialData,
  isReadOnly = false 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // General
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Hardware
  const [chip, setChip] = useState('');
  const [ipRating, setIpRating] = useState('');
  
  // Dynamic RAM
  const [rams, setRams] = useState<RamVariant[]>([{ amount: '', type: '' }]);
  
  // Dynamic Storage
  const [storages, setStorages] = useState<StorageVariant[]>([{ amount: '', type: '' }]);

  // Features
  const [hasStereo, setHasStereo] = useState(false);
  const [hasJack, setHasJack] = useState(false);
  
  // Biometrics
  const [hasFingerprint, setHasFingerprint] = useState(true);
  const [fingerprintType, setFingerprintType] = useState('Sotto display (Ottico)');
  
  // Haptics
  const [haptics, setHaptics] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Colors helper
  const inputBg = isReadOnly 
    ? (isDark ? 'bg-transparent border-b border-white/20 text-white' : 'bg-transparent border-b border-gray-300 text-gray-900')
    : (isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900');
  
  const labelColor = isDark ? 'text-gray-400' : 'text-gray-500';

  // Load initial data if editing or viewing
  useEffect(() => {
    if (initialData) {
      setBrand(initialData.brand);
      setModel(initialData.model);
      setPreviewUrl(initialData.imageUrl || null);
      setChip(initialData.chip);
      setIpRating(initialData.ipRating);
      if (initialData.ram && initialData.ram.length > 0) setRams(initialData.ram);
      if (initialData.storage && initialData.storage.length > 0) setStorages(initialData.storage);
      setHasStereo(initialData.hasStereo);
      setHasJack(initialData.hasJack);
      setHasFingerprint(initialData.hasFingerprint);
      setFingerprintType(initialData.fingerprintType || 'Sotto display (Ottico)');
      setHaptics(initialData.haptics || '');
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddRam = () => {
    if (isReadOnly) return;
    setRams([...rams, { amount: '', type: '' }]);
  };
  
  const handleRemoveRam = (index: number) => {
    if (isReadOnly) return;
    if (rams.length > 1) {
      setRams(rams.filter((_, i) => i !== index));
    }
  };
  
  const updateRam = (index: number, field: keyof RamVariant, value: string) => {
    if (isReadOnly) return;
    const newRams = [...rams];
    newRams[index][field] = value;
    setRams(newRams);
  };

  const handleAddStorage = () => {
    if (isReadOnly) return;
    setStorages([...storages, { amount: '', type: '' }]);
  };

  const handleRemoveStorage = (index: number) => {
    if (isReadOnly) return;
    if (storages.length > 1) {
      setStorages(storages.filter((_, i) => i !== index));
    }
  };

  const updateStorage = (index: number, field: keyof StorageVariant, value: string) => {
    if (isReadOnly) return;
    const newStorages = [...storages];
    newStorages[index][field] = value;
    setStorages(newStorages);
  };

  const generateRandomGradient = () => {
    const colors = [
      'from-blue-600 to-indigo-900',
      'from-purple-600 to-pink-900',
      'from-emerald-600 to-teal-900',
      'from-orange-500 to-red-900',
      'from-slate-700 to-black',
      'from-zinc-700 to-stone-900'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isReadOnly) return;

    // Validate required fields only
    if (!brand.trim() || !model.trim()) {
      setError(language === 'it' ? "Per salvare lo smartphone inserisci Casa Produttrice e Modello." : "Please enter Brand and Model to save the smartphone.");
      return;
    }

    if (!auth.currentUser) return;

    setIsLoading(true);

    let uploadedImageUrl = initialData?.imageUrl || '';

    // Try upload image if exists and changed
    if (imageFile) {
      try {
        uploadedImageUrl = await uploadSmartphoneImage(auth.currentUser.uid, imageFile);
      } catch (error) {
        console.error("Image upload failed, saving data anyway", error);
      }
    }

    const phoneData: Omit<PhoneData, 'id'> = {
      brand,
      model,
      chip,
      ipRating,
      ram: rams,
      storage: storages,
      hasStereo,
      hasJack,
      hasFingerprint,
      fingerprintType: hasFingerprint ? fingerprintType : '',
      haptics: haptics || (language === 'it' ? 'Non specificato' : 'Not specified'),
      // If creating new, random color. If editing, keep existing.
      color: initialData?.color || generateRandomGradient(),
      imageUrl: uploadedImageUrl,
      battery: initialData?.battery || 'Unknown'
    };

    try {
      if (initialData && initialData.id) {
        // Update existing
        await updateSmartphone(auth.currentUser.uid, initialData.id, phoneData);
      } else {
        // Create new
        await addSmartphone(auth.currentUser.uid, phoneData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving phone:", error);
      setError(language === 'it' ? "Errore nel salvataggio." : "Error saving data.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (isReadOnly) return language === 'it' ? 'Dettagli Smartphone' : 'Smartphone Details';
    if (initialData) return language === 'it' ? 'Modifica Smartphone' : 'Edit Smartphone';
    return language === 'it' ? 'Aggiungi Smartphone' : 'Add Smartphone';
  };

  // Inline Error Modal
  const ErrorPopup = () => {
    if (!error) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl border relative overflow-hidden ${isDark ? 'bg-pairon-surface border-red-500/30' : 'bg-white border-red-100'}`}>
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
           
           <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 animate-pulse">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Attenzione</h3>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className={`w-full py-3 rounded-xl font-bold transition-all ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-black'}`}
              >
                Ho capito
              </button>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isDark ? 'bg-pairon-obsidian' : 'bg-pairon-ghost'} overflow-hidden animate-fade-in`}>
      
      <ErrorPopup />

      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/10 bg-pairon-surface/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md z-10`}>
        <div className="flex items-center gap-4">
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
            <ArrowLeft size={24} className={isDark ? 'text-white' : 'text-gray-800'} />
          </button>
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {getTitle()}
          </h1>
        </div>
        
        {!isReadOnly && (
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-pairon-mint text-pairon-obsidian font-bold rounded-xl shadow-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Save size={18} />}
            <span className="hidden sm:inline">{language === 'it' ? 'Salva' : 'Save'}</span>
          </button>
        )}

        {isReadOnly && (
            <div className="px-4 py-2 bg-white/10 rounded-xl flex items-center gap-2 text-sm font-medium">
                <Eye size={16} />
                <span>Read Only</span>
            </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-8 pb-24">
          
          {/* SECTION 1: Identity */}
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
            
            {/* Image Upload/View */}
            <div 
              onClick={() => !isReadOnly && fileInputRef.current?.click()}
              className={`w-32 h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden group ${!isReadOnly ? 'cursor-pointer' : ''} ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-white'} ${!isReadOnly && (isDark ? 'hover:border-pairon-mint' : 'hover:border-pairon-indigo')}`}
            >
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" disabled={isReadOnly} />
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  {!isReadOnly && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white" />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Camera className={isDark ? 'text-gray-500' : 'text-gray-400'} size={32} />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {isReadOnly ? 'No Foto' : 'Foto'}
                  </span>
                </>
              )}
            </div>

            {/* Basic Info Inputs */}
            <div className="space-y-4 flex-1">
              
              <SmartSelector 
                label={language === 'it' ? 'Casa produttrice' : 'Brand'}
                value={brand}
                onChange={setBrand}
                optionsCategory="brands"
                defaultOptions={DEFAULT_BRANDS}
                isReadOnly={isReadOnly}
                isDark={isDark}
                placeholder="es. Samsung, Apple..."
              />

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                   {language === 'it' ? 'Modello' : 'Model'}
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={isReadOnly}
                  placeholder="es. Galaxy S24 Ultra"
                  className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-2 focus:ring-pairon-mint/50'} transition-all ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                />
              </div>
            </div>
          </div>

          <hr className={`border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`} />

          {/* SECTION 2: Hardware */}
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2">
              <Cpu className="text-pairon-mint" size={20} />
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Hardware</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SmartSelector 
                label="SoC / Chipset"
                value={chip}
                onChange={setChip}
                optionsCategory="chips"
                defaultOptions={DEFAULT_CHIPS}
                isReadOnly={isReadOnly}
                isDark={isDark}
                placeholder="es. Snapdragon 8 Gen 3"
              />
              
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>IP Rating</label>
                <input
                  type="text"
                  value={ipRating}
                  onChange={(e) => setIpRating(e.target.value)}
                  disabled={isReadOnly}
                  placeholder={isReadOnly ? '-' : "es. IP68"}
                  className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                />
              </div>
            </div>

            {/* RAM Section */}
            <div className={`p-4 rounded-2xl border ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex justify-between items-center mb-3">
                <label className={`text-xs font-bold uppercase tracking-wider ${labelColor}`}>RAM Variants</label>
                {!isReadOnly && (
                  <button onClick={handleAddRam} className="text-pairon-mint hover:text-white transition-colors">
                    <Plus size={18} />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {rams.map((ram, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="w-24">
                      <input
                        type="text"
                        value={ram.amount}
                        onChange={(e) => updateRam(index, 'amount', e.target.value)}
                        disabled={isReadOnly}
                        placeholder="GB"
                        className={`w-full p-3 rounded-xl text-sm border outline-none ${inputBg}`}
                      />
                    </div>
                    <div className="flex-1">
                      <SmartSelector 
                        label=""
                        value={ram.type}
                        onChange={(val) => updateRam(index, 'type', val)}
                        optionsCategory="ramTypes"
                        defaultOptions={DEFAULT_RAM_TYPES}
                        isReadOnly={isReadOnly}
                        isDark={isDark}
                        placeholder="Tipo (es. LPDDR5X)"
                      />
                    </div>
                    {!isReadOnly && rams.length > 1 && (
                      <button onClick={() => handleRemoveRam(index)} className="p-3 mt-1 text-red-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Storage Section */}
            <div className={`p-4 rounded-2xl border ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex justify-between items-center mb-3">
                <label className={`text-xs font-bold uppercase tracking-wider ${labelColor}`}>Storage Variants</label>
                {!isReadOnly && (
                  <button onClick={handleAddStorage} className="text-pairon-mint hover:text-white transition-colors">
                    <Plus size={18} />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {storages.map((storage, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="w-24">
                      <input
                        type="text"
                        value={storage.amount}
                        onChange={(e) => updateStorage(index, 'amount', e.target.value)}
                        disabled={isReadOnly}
                        placeholder="GB/TB"
                        className={`w-full p-3 rounded-xl text-sm border outline-none ${inputBg}`}
                      />
                    </div>
                    <div className="flex-1">
                       <SmartSelector 
                        label=""
                        value={storage.type}
                        onChange={(val) => updateStorage(index, 'type', val)}
                        optionsCategory="storageTypes"
                        defaultOptions={DEFAULT_STORAGE_TYPES}
                        isReadOnly={isReadOnly}
                        isDark={isDark}
                        placeholder="Tipo (es. UFS 4.0)"
                      />
                    </div>
                    {!isReadOnly && storages.length > 1 && (
                      <button onClick={() => handleRemoveStorage(index)} className="p-3 mt-1 text-red-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <hr className={`border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`} />

          {/* SECTION 3: Features */}
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
             <div className="flex items-center gap-2">
              <Activity className="text-pairon-mint" size={20} />
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Funzionalità</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stereo Checkbox */}
              <div 
                onClick={() => !isReadOnly && setHasStereo(!hasStereo)}
                className={`p-4 rounded-xl border ${!isReadOnly ? 'cursor-pointer' : ''} transition-all flex items-center gap-3 ${hasStereo ? 'border-pairon-mint bg-pairon-mint/10' : (isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50')}`}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${hasStereo ? 'bg-pairon-mint border-pairon-mint' : 'border-gray-500'}`}>
                  {hasStereo && <Check size={14} className="text-pairon-obsidian" />}
                </div>
                <div className="flex items-center gap-2">
                   <Volume2 size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
                   <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Speaker Stereo</span>
                </div>
              </div>

              {/* Jack Checkbox */}
              <div 
                onClick={() => !isReadOnly && setHasJack(!hasJack)}
                className={`p-4 rounded-xl border ${!isReadOnly ? 'cursor-pointer' : ''} transition-all flex items-center gap-3 ${hasJack ? 'border-pairon-mint bg-pairon-mint/10' : (isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50')}`}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${hasJack ? 'bg-pairon-mint border-pairon-mint' : 'border-gray-500'}`}>
                  {hasJack && <Check size={14} className="text-pairon-obsidian" />}
                </div>
                <div className="flex items-center gap-2">
                   <div className={`w-4 h-4 rounded-full border-2 ${isDark ? 'border-gray-300' : 'border-gray-600'}`}></div>
                   <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Jack 3.5mm</span>
                </div>
              </div>
            </div>

            {/* Fingerprint Section */}
            <div className={`p-4 rounded-xl border transition-all ${hasFingerprint ? 'border-pairon-mint/50 bg-pairon-mint/5' : (isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50')}`}>
               <div 
                 onClick={() => !isReadOnly && setHasFingerprint(!hasFingerprint)}
                 className={`flex items-center gap-3 ${!isReadOnly ? 'cursor-pointer' : ''} mb-3`}
               >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${hasFingerprint ? 'bg-pairon-mint border-pairon-mint' : 'border-gray-500'}`}>
                    {hasFingerprint && <Check size={14} className="text-pairon-obsidian" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Fingerprint size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Sensore Impronte Digitali</span>
                  </div>
               </div>

               {hasFingerprint && (
                 <div className="pl-9 animate-fade-in">
                    <SmartSelector 
                      label="Posizione e Tipo"
                      value={fingerprintType}
                      onChange={setFingerprintType}
                      optionsCategory="fingerprintTypes"
                      defaultOptions={DEFAULT_FINGERPRINT_TYPES}
                      isReadOnly={isReadOnly}
                      isDark={isDark}
                      placeholder="Seleziona tipo sensore..."
                    />
                 </div>
               )}
            </div>

            {/* Haptics Section (Now SmartSelector) */}
            <div>
              <SmartSelector 
                label="Qualità Vibrazione"
                value={haptics}
                onChange={setHaptics}
                optionsCategory="haptics"
                defaultOptions={DEFAULT_HAPTICS}
                isReadOnly={isReadOnly}
                isDark={isDark}
                placeholder={language === 'it' ? 'es. Ottima, Motore X-Axis...' : 'e.g. Great, X-Axis Motor...'}
              />
            </div>

          </section>

        </div>
      </div>
    </div>
  );
};

export default AddSmartphonePage;