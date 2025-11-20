import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Plus, Trash2, Save, Check, Cpu, HardDrive, Smartphone, Volume2, Fingerprint, Activity, Eye, AlertTriangle, X, Monitor, Zap, Sun, Aperture, Video, ScanFace, BatteryMedium, RefreshCcw, Wifi, AppWindow, Layers, Calendar, Euro } from 'lucide-react';
import { Language } from '../types';
import { PhoneData, RamVariant, StorageVariant, Display, Camera as CameraType, VideoSettings, Battery, addSmartphone, updateSmartphone, uploadSmartphoneImage, auth } from '../services/firebase';
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

const DEFAULT_FACEID_TYPES = [
  "2D (Fotocamera)", 
  "3D (Sensori dedicati)"
];

const DEFAULT_DISPLAY_TYPES = [
  "LTPO AMOLED", "Dynamic AMOLED 2X", "OLED", "Super Retina XDR OLED", "LCD IPS", "P-OLED"
];

const DEFAULT_CAMERA_TYPES = [
  "Principale (Wide)", 
  "Grandangolare 120°", 
  "Teleobiettivo 3x", 
  "Teleobiettivo 5x (Periscopico)", 
  "Macro", 
  "Anteriore (Selfie)",
  "Sensore Profondità"
];

const DEFAULT_UI_VERSIONS = [
  "One UI 6.1", "One UI 6.0", "iOS 17", "iOS 18", "HyperOS", "OxygenOS 14", 
  "ColorOS 14", "OriginOS 4", "MagicOS 8.0", "Pixel UI", "Nothing OS 2.5"
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
  
  // Battery
  const [batteryCapacity, setBatteryCapacity] = useState('');
  const [isSiliconCarbon, setIsSiliconCarbon] = useState(false);
  const [wiredCharging, setWiredCharging] = useState('');
  const [hasWireless, setHasWireless] = useState(false);
  const [wirelessCharging, setWirelessCharging] = useState('');
  const [hasReverse, setHasReverse] = useState(false);
  const [reverseCharging, setReverseCharging] = useState('');

  // Dynamic RAM
  const [rams, setRams] = useState<RamVariant[]>([{ amount: '', type: '' }]);
  
  // Dynamic Storage
  const [storages, setStorages] = useState<StorageVariant[]>([{ amount: '', type: '' }]);

  // Dynamic Displays
  const [displays, setDisplays] = useState<Display[]>([{ 
    type: '', 
    size: '', 
    resolution: '', 
    refreshRate: '', 
    brightness: '', 
    hasHdr: false, 
    hasDolbyVision: false 
  }]);

  // Dynamic Cameras
  const [cameras, setCameras] = useState<CameraType[]>([{
    type: '',
    megapixels: '',
    hasOis: false
  }]);

  // Video Settings
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    maxResolution: '',
    maxFrameRate: '',
    hasHdr: false,
    hasDolbyVision: false
  });

  // Features
  const [hasStereo, setHasStereo] = useState(false);
  const [hasJack, setHasJack] = useState(false);
  
  // Biometrics
  const [hasFingerprint, setHasFingerprint] = useState(false); // Default to false
  const [fingerprintType, setFingerprintType] = useState(''); 

  const [hasFaceId, setHasFaceId] = useState(false);
  const [faceIdType, setFaceIdType] = useState('');
  
  // Haptics
  const [haptics, setHaptics] = useState('');

  // Software
  const [os, setOs] = useState('');
  const [hasCustomUi, setHasCustomUi] = useState(false);
  const [customUi, setCustomUi] = useState('');
  const [majorUpdates, setMajorUpdates] = useState('');
  const [securityPatches, setSecurityPatches] = useState('');

  // Availability
  const [launchDate, setLaunchDate] = useState('');
  const [price, setPrice] = useState('');

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
      
      // Battery Load
      if (initialData.battery) {
        if (typeof initialData.battery === 'object') {
          // CLEANUP: Remove "Unknown" if present
          const cap = initialData.battery.capacity === 'Unknown' ? '' : initialData.battery.capacity;
          setBatteryCapacity(cap);
          
          setIsSiliconCarbon(initialData.battery.isSiliconCarbon);
          setWiredCharging(initialData.battery.wiredCharging);
          setHasWireless(initialData.battery.hasWireless);
          setWirelessCharging(initialData.battery.wirelessCharging || '');
          setHasReverse(initialData.battery.hasReverse);
          setReverseCharging(initialData.battery.reverseCharging || '');
        } else if (typeof initialData.battery === 'string') {
          const cap = initialData.battery === 'Unknown' ? '' : initialData.battery;
          setBatteryCapacity(cap);
        }
      }

      // Displays initialization
      if (initialData.displays && initialData.displays.length > 0) {
        setDisplays(initialData.displays);
      }

      // Cameras initialization
      if (initialData.cameras && initialData.cameras.length > 0) {
        setCameras(initialData.cameras);
      }

      // Video initialization
      if (initialData.video) {
        setVideoSettings(initialData.video);
      }

      setHasStereo(initialData.hasStereo ?? false);
      setHasJack(initialData.hasJack ?? false);
      
      setHasFingerprint(initialData.hasFingerprint ?? false);
      setFingerprintType(initialData.fingerprintType || ''); 

      setHasFaceId(initialData.hasFaceId ?? false);
      setFaceIdType(initialData.faceIdType || '');

      setHaptics(initialData.haptics || '');

      // Software
      setOs(initialData.os || '');
      setHasCustomUi(initialData.hasCustomUi || false);
      setCustomUi(initialData.customUi || '');
      setMajorUpdates(initialData.majorUpdates || '');
      setSecurityPatches(initialData.securityPatches || '');

      // Availability
      setLaunchDate(initialData.launchDate || '');
      setPrice(initialData.price || '');
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

  // --- DISPLAY HANDLERS ---
  const handleAddDisplay = () => {
    if (isReadOnly) return;
    setDisplays([...displays, { 
      type: '', 
      size: '', 
      resolution: '', 
      refreshRate: '', 
      brightness: '', 
      hasHdr: false, 
      hasDolbyVision: false 
    }]);
  };

  const handleRemoveDisplay = (index: number) => {
    if (isReadOnly) return;
    if (displays.length > 1) {
      setDisplays(displays.filter((_, i) => i !== index));
    }
  };

  const updateDisplay = (index: number, field: keyof Display, value: any) => {
    if (isReadOnly) return;
    const newDisplays = [...displays];
    // @ts-ignore
    newDisplays[index][field] = value;
    setDisplays(newDisplays);
  };

  // --- CAMERA HANDLERS ---
  const handleAddCamera = () => {
    if (isReadOnly) return;
    setCameras([...cameras, { type: '', megapixels: '', hasOis: false }]);
  };

  const handleRemoveCamera = (index: number) => {
    if (isReadOnly) return;
    if (cameras.length > 1) {
      setCameras(cameras.filter((_, i) => i !== index));
    }
  };

  const updateCamera = (index: number, field: keyof CameraType, value: any) => {
    if (isReadOnly) return;
    const newCameras = [...cameras];
    // @ts-ignore
    newCameras[index][field] = value;
    setCameras(newCameras);
  };

  const updateVideo = (field: keyof VideoSettings, value: any) => {
    if (isReadOnly) return;
    setVideoSettings({ ...videoSettings, [field]: value });
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

    const batteryData: Battery = {
      capacity: batteryCapacity,
      isSiliconCarbon,
      wiredCharging,
      hasWireless,
      wirelessCharging: hasWireless ? wirelessCharging : '',
      hasReverse,
      reverseCharging: hasReverse ? reverseCharging : ''
    };

    const phoneData: Omit<PhoneData, 'id'> = {
      brand,
      model,
      chip,
      ipRating,
      ram: rams,
      storage: storages,
      displays: displays,
      cameras: cameras,
      video: videoSettings,
      battery: batteryData,
      hasStereo,
      hasJack,
      hasFingerprint,
      fingerprintType: hasFingerprint ? fingerprintType : '',
      hasFaceId,
      faceIdType: hasFaceId ? faceIdType : '',
      haptics: haptics || (language === 'it' ? 'Non specificato' : 'Not specified'),
      
      // New Fields
      os,
      hasCustomUi,
      customUi: hasCustomUi ? customUi : '',
      majorUpdates,
      securityPatches,
      launchDate,
      price,

      // If creating new, random color. If editing, keep existing.
      color: initialData?.color || generateRandomGradient(),
      imageUrl: uploadedImageUrl,
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

  // Helper function for button styling
  const getToggleBtnStyle = (isActive: boolean) => {
    if (isActive) {
      return 'bg-pairon-mint text-pairon-obsidian border-pairon-mint shadow-sm';
    }
    return isDark 
      ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10' 
      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50';
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
                    {isReadOnly ? (language === 'it' ? 'No Foto' : 'No Photo') : (language === 'it' ? 'Foto' : 'Photo')}
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
                placeholder={language === 'it' ? 'es. Samsung, Apple...' : 'e.g. Samsung, Apple...'}
                language={language}
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
          
          {/* SECTION 2: Display */}
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Monitor className="text-pairon-mint" size={20} />
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Display</h3>
              </div>
              {!isReadOnly && (
                <button 
                  onClick={handleAddDisplay} 
                  className="text-xs font-bold text-pairon-mint hover:bg-pairon-mint/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> {language === 'it' ? 'Aggiungi' : 'Add'}
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {displays.map((display, index) => (
                <div key={index} className={`p-5 rounded-2xl border relative ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                   {!isReadOnly && displays.length > 1 && (
                      <button 
                        onClick={() => handleRemoveDisplay(index)} 
                        className="absolute top-4 right-4 text-red-400 hover:text-red-500 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                   )}

                   {displays.length > 1 && (
                     <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${labelColor}`}>
                        Display {index + 1} {index === 1 ? (language === 'it' ? '(Esterno/Secondario)' : '(Cover/Secondary)') : ''}
                     </h4>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <SmartSelector 
                        label={language === 'it' ? 'Tipo Pannello' : 'Panel Type'}
                        value={display.type}
                        onChange={(val) => updateDisplay(index, 'type', val)}
                        optionsCategory="displayTypes"
                        defaultOptions={DEFAULT_DISPLAY_TYPES}
                        isReadOnly={isReadOnly}
                        isDark={isDark}
                        placeholder={language === 'it' ? 'es. LTPO AMOLED' : 'e.g. LTPO AMOLED'}
                        language={language}
                      />
                      
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                          {language === 'it' ? 'Dimensioni' : 'Size'}
                        </label>
                        <input
                          type="text"
                          value={display.size}
                          onChange={(e) => updateDisplay(index, 'size', e.target.value)}
                          disabled={isReadOnly}
                          placeholder={language === 'it' ? 'es. 6.7 pollici' : 'e.g. 6.7 inches'}
                          className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                          {language === 'it' ? 'Risoluzione' : 'Resolution'}
                        </label>
                        <input
                          type="text"
                          value={display.resolution}
                          onChange={(e) => updateDisplay(index, 'resolution', e.target.value)}
                          disabled={isReadOnly}
                          placeholder={language === 'it' ? 'es. 1440 x 3120 pixel' : 'e.g. 1440 x 3120 pixels'}
                          className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                        />
                      </div>

                      <div>
                         <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                          Refresh Rate
                        </label>
                        <div className="relative">
                          <Zap size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                          <input
                            type="text"
                            value={display.refreshRate}
                            onChange={(e) => updateDisplay(index, 'refreshRate', e.target.value)}
                            disabled={isReadOnly}
                            placeholder="es. 120Hz"
                            className={`w-full p-3 pl-9 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                          />
                        </div>
                      </div>

                      <div>
                         <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                          {language === 'it' ? 'Luminosità Picco' : 'Peak Brightness'}
                        </label>
                        <div className="relative">
                          <Sun size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                          <input
                            type="text"
                            value={display.brightness}
                            onChange={(e) => updateDisplay(index, 'brightness', e.target.value)}
                            disabled={isReadOnly}
                            placeholder="es. 2600 nits"
                            className={`w-full p-3 pl-9 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                          />
                        </div>
                      </div>
                   </div>

                   <div className="flex gap-4">
                      <div 
                        onClick={() => !isReadOnly && updateDisplay(index, 'hasHdr', !display.hasHdr)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${!isReadOnly ? 'cursor-pointer' : ''} transition-all ${getToggleBtnStyle(display.hasHdr)}`}
                      >
                        <span className="text-xs font-bold uppercase tracking-wider">HDR</span>
                        {display.hasHdr && <Check size={16} strokeWidth={3} />}
                      </div>

                      <div 
                        onClick={() => !isReadOnly && updateDisplay(index, 'hasDolbyVision', !display.hasDolbyVision)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${!isReadOnly ? 'cursor-pointer' : ''} transition-all ${getToggleBtnStyle(display.hasDolbyVision)}`}
                      >
                        <span className="text-xs font-bold uppercase tracking-wider">Dolby Vision</span>
                        {display.hasDolbyVision && <Check size={16} strokeWidth={3} />}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </section>

          <hr className={`border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`} />

          {/* SECTION 3: Cameras & Video */}
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Aperture className="text-pairon-mint" size={20} />
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {language === 'it' ? 'Fotocamera' : 'Camera'}
                </h3>
              </div>
              {!isReadOnly && (
                <button 
                  onClick={handleAddCamera} 
                  className="text-xs font-bold text-pairon-mint hover:bg-pairon-mint/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> {language === 'it' ? 'Aggiungi' : 'Add'}
                </button>
              )}
            </div>

            {/* Camera List */}
            <div className="space-y-4">
              {cameras.map((cam, index) => (
                <div key={index} className={`p-5 rounded-2xl border relative ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                  {!isReadOnly && cameras.length > 1 && (
                      <button 
                        onClick={() => handleRemoveCamera(index)} 
                        className="absolute top-4 right-4 text-red-400 hover:text-red-500 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                   )}
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                     <div className="flex-1">
                        <SmartSelector 
                          label={language === 'it' ? `Fotocamera ${index + 1}` : `Camera ${index + 1}`}
                          value={cam.type}
                          onChange={(val) => updateCamera(index, 'type', val)}
                          optionsCategory="cameraTypes"
                          defaultOptions={DEFAULT_CAMERA_TYPES}
                          isReadOnly={isReadOnly}
                          isDark={isDark}
                          placeholder={language === 'it' ? 'es. Principale (Wide)' : 'e.g. Main (Wide)'}
                          language={language}
                        />
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                            Megapixel
                          </label>
                          <input
                            type="text"
                            value={cam.megapixels}
                            onChange={(e) => updateCamera(index, 'megapixels', e.target.value)}
                            disabled={isReadOnly}
                            placeholder="es. 200MP"
                            className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                          />
                       </div>
                       
                       <div>
                          <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                            Stabilizzazione
                          </label>
                          <div 
                            onClick={() => !isReadOnly && updateCamera(index, 'hasOis', !cam.hasOis)}
                            className={`h-[46px] flex items-center justify-center gap-2 px-3 rounded-xl border ${!isReadOnly ? 'cursor-pointer' : ''} transition-all ${getToggleBtnStyle(cam.hasOis)}`}
                          >
                            <span className="text-xs font-bold uppercase tracking-wider">OIS</span>
                            {cam.hasOis && <Check size={16} strokeWidth={3} />}
                          </div>
                       </div>
                     </div>
                   </div>
                </div>
              ))}
            </div>

            {/* Video Config Subsection */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
               <div className="flex items-center gap-2 mb-4">
                  <Video className={isDark ? 'text-white' : 'text-gray-900'} size={18} />
                  <h4 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'it' ? 'Funzionalità Video' : 'Video Capabilities'}
                  </h4>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                      {language === 'it' ? 'Risoluzione Max' : 'Max Resolution'}
                    </label>
                    <input
                      type="text"
                      value={videoSettings.maxResolution}
                      onChange={(e) => updateVideo('maxResolution', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="es. 8K"
                      className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                      {language === 'it' ? 'Frame Rate Max' : 'Max Frame Rate'}
                    </label>
                    <input
                      type="text"
                      value={videoSettings.maxFrameRate}
                      onChange={(e) => updateVideo('maxFrameRate', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="es. 120fps"
                      className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                    />
                  </div>
               </div>

               <div className="flex gap-4">
                  <div 
                    onClick={() => !isReadOnly && updateVideo('hasHdr', !videoSettings.hasHdr)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${!isReadOnly ? 'cursor-pointer' : ''} transition-all ${getToggleBtnStyle(videoSettings.hasHdr)}`}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider">{language === 'it' ? 'Video HDR' : 'HDR Video'}</span>
                    {videoSettings.hasHdr && <Check size={16} strokeWidth={3} />}
                  </div>

                  <div 
                    onClick={() => !isReadOnly && updateVideo('hasDolbyVision', !videoSettings.hasDolbyVision)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${!isReadOnly ? 'cursor-pointer' : ''} transition-all ${getToggleBtnStyle(videoSettings.hasDolbyVision)}`}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider">Dolby Vision</span>
                    {videoSettings.hasDolbyVision && <Check size={16} strokeWidth={3} />}
                  </div>
               </div>
            </div>

          </section>

          <hr className={`border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`} />

          {/* SECTION 4: Hardware */}
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-2">
              <Cpu className="text-pairon-mint" size={20} />
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Hardware</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SmartSelector 
                label={language === 'it' ? 'SoC / Processore' : 'SoC / Chipset'}
                value={chip}
                onChange={setChip}
                optionsCategory="chips"
                defaultOptions={DEFAULT_CHIPS}
                isReadOnly={isReadOnly}
                isDark={isDark}
                placeholder="es. Snapdragon 8 Gen 3"
                language={language}
              />
              
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                  {language === 'it' ? 'Certificazione IP' : 'IP Rating'}
                </label>
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
                <label className={`text-xs font-bold uppercase tracking-wider ${labelColor}`}>
                  {language === 'it' ? 'Varianti RAM' : 'RAM Variants'}
                </label>
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
                        placeholder={language === 'it' ? 'Tipo (es. LPDDR5X)' : 'Type (e.g. LPDDR5X)'}
                        language={language}
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
                <label className={`text-xs font-bold uppercase tracking-wider ${labelColor}`}>
                  {language === 'it' ? 'Varianti Memoria' : 'Storage Variants'}
                </label>
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
                        placeholder={language === 'it' ? 'Tipo (es. UFS 4.0)' : 'Type (e.g. UFS 4.0)'}
                        language={language}
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

          {/* SECTION 5: Battery */}
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.18s' }}>
            <div className="flex items-center gap-2">
              <BatteryMedium className="text-pairon-mint" size={20} />
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                 {language === 'it' ? 'Batteria' : 'Battery'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Capacity + Tech */}
              <div className="flex gap-3 items-end">
                 <div className="w-1/3">
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                      {language === 'it' ? 'Capacità' : 'Capacity'}
                    </label>
                    <input
                      type="text"
                      value={batteryCapacity}
                      onChange={(e) => setBatteryCapacity(e.target.value)}
                      disabled={isReadOnly}
                      placeholder="es. 5000 mAh"
                      className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                    />
                 </div>
                 <div 
                   onClick={() => !isReadOnly && setIsSiliconCarbon(!isSiliconCarbon)}
                   className={`flex-1 h-[46px] px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${!isReadOnly ? 'cursor-pointer' : ''} ${getToggleBtnStyle(isSiliconCarbon)}`}
                 >
                    <span className="text-xs font-bold uppercase">{language === 'it' ? 'Silicio/Carbonio' : 'Silicon/Carbon'}</span>
                    {isSiliconCarbon && <Check size={16} strokeWidth={3} />}
                 </div>
              </div>

              {/* Wired Charging */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                   {language === 'it' ? 'Ricarica Cablata' : 'Wired Charging'}
                </label>
                <div className="relative">
                   <Zap size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                   <input
                    type="text"
                    value={wiredCharging}
                    onChange={(e) => setWiredCharging(e.target.value)}
                    disabled={isReadOnly}
                    placeholder="es. 80W"
                    className={`w-full p-3 pl-9 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                  />
                </div>
              </div>
            </div>

            {/* Wireless Charging Section */}
            <div className={`p-4 rounded-xl border transition-all ${hasWireless ? 'border-pairon-mint/50 bg-pairon-mint/5' : (isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50')}`}>
               <div 
                 onClick={() => !isReadOnly && setHasWireless(!hasWireless)}
                 className={`flex items-center gap-3 ${!isReadOnly ? 'cursor-pointer' : ''} mb-3`}
               >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${hasWireless ? 'bg-pairon-mint border-pairon-mint' : 'border-gray-500'}`}>
                    {hasWireless && <Check size={14} className="text-pairon-obsidian" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {language === 'it' ? 'Ricarica Wireless' : 'Wireless Charging'}
                    </span>
                  </div>
               </div>

               {hasWireless && (
                 <div className="pl-9 animate-fade-in">
                    <input
                      type="text"
                      value={wirelessCharging}
                      onChange={(e) => setWirelessCharging(e.target.value)}
                      disabled={isReadOnly}
                      placeholder={language === 'it' ? 'Velocità (es. 50W)' : 'Speed (e.g. 50W)'}
                      className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg}`}
                    />
                 </div>
               )}
            </div>

            {/* Reverse Charging Section */}
            <div className={`p-4 rounded-xl border transition-all ${hasReverse ? 'border-pairon-mint/50 bg-pairon-mint/5' : (isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50')}`}>
               <div 
                 onClick={() => !isReadOnly && setHasReverse(!hasReverse)}
                 className={`flex items-center gap-3 ${!isReadOnly ? 'cursor-pointer' : ''} mb-3`}
               >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${hasReverse ? 'bg-pairon-mint border-pairon-mint' : 'border-gray-500'}`}>
                    {hasReverse && <Check size={14} className="text-pairon-obsidian" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCcw size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {language === 'it' ? 'Ricarica Inversa' : 'Reverse Charging'}
                    </span>
                  </div>
               </div>

               {hasReverse && (
                 <div className="pl-9 animate-fade-in">
                    <input
                      type="text"
                      value={reverseCharging}
                      onChange={(e) => setReverseCharging(e.target.value)}
                      disabled={isReadOnly}
                      placeholder={language === 'it' ? 'Velocità (es. 10W)' : 'Speed (e.g. 10W)'}
                      className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg}`}
                    />
                 </div>
               )}
            </div>

          </section>

          <hr className={`border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`} />

          {/* SECTION 6: Features */}
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
             <div className="flex items-center gap-2">
              <Activity className="text-pairon-mint" size={20} />
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'it' ? 'Funzionalità' : 'Features'}
              </h3>
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
                   <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {language === 'it' ? 'Speaker Stereo' : 'Stereo Speakers'}
                   </span>
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
                   <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {language === 'it' ? 'Jack 3.5mm' : '3.5mm Jack'}
                   </span>
                </div>
              </div>
            </div>

            {/* Fingerprint Section - FIXED */}
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
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {language === 'it' ? 'Sensore Impronte Digitali' : 'Fingerprint Sensor'}
                    </span>
                  </div>
               </div>

               {hasFingerprint && (
                 <div className="pl-9 animate-fade-in">
                    <SmartSelector 
                      label={language === 'it' ? 'Posizione e Tipo' : 'Position & Type'}
                      value={fingerprintType}
                      onChange={setFingerprintType}
                      optionsCategory="fingerprintTypes"
                      defaultOptions={DEFAULT_FINGERPRINT_TYPES}
                      isReadOnly={isReadOnly}
                      isDark={isDark}
                      placeholder={language === 'it' ? 'es. Sotto il display...' : 'e.g. Under display...'}
                      language={language}
                    />
                 </div>
               )}
            </div>

            {/* Face ID Section */}
            <div className={`p-4 rounded-xl border transition-all ${hasFaceId ? 'border-pairon-mint/50 bg-pairon-mint/5' : (isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50')}`}>
               <div 
                 onClick={() => !isReadOnly && setHasFaceId(!hasFaceId)}
                 className={`flex items-center gap-3 ${!isReadOnly ? 'cursor-pointer' : ''} mb-3`}
               >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${hasFaceId ? 'bg-pairon-mint border-pairon-mint' : 'border-gray-500'}`}>
                    {hasFaceId && <Check size={14} className="text-pairon-obsidian" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <ScanFace size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {language === 'it' ? 'Sblocco Facciale (Face ID)' : 'Face Unlock'}
                    </span>
                  </div>
               </div>

               {hasFaceId && (
                 <div className="pl-9 animate-fade-in">
                    <SmartSelector 
                      label={language === 'it' ? 'Tipo' : 'Type'}
                      value={faceIdType}
                      onChange={setFaceIdType}
                      optionsCategory="faceIdTypes"
                      defaultOptions={DEFAULT_FACEID_TYPES}
                      isReadOnly={isReadOnly}
                      isDark={isDark}
                      placeholder={language === 'it' ? 'Seleziona 2D o 3D...' : 'Select 2D or 3D...'}
                      language={language}
                    />
                 </div>
               )}
            </div>

            {/* Haptics Section (Now SmartSelector) */}
            <div>
              <SmartSelector 
                label={language === 'it' ? 'Qualità Vibrazione' : 'Haptics Quality'}
                value={haptics}
                onChange={setHaptics}
                optionsCategory="haptics"
                defaultOptions={DEFAULT_HAPTICS}
                isReadOnly={isReadOnly}
                isDark={isDark}
                placeholder={language === 'it' ? 'es. Ottima, Motore X-Axis...' : 'e.g. Great, X-Axis Motor...'}
                language={language}
              />
            </div>

          </section>

          <hr className={`border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`} />

          {/* SECTION 7: Software */}
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.22s' }}>
             <div className="flex items-center gap-2">
              <AppWindow className="text-pairon-mint" size={20} />
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Software</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                    {language === 'it' ? 'Versione OS' : 'OS Version'}
                  </label>
                  <input
                    type="text"
                    value={os}
                    onChange={(e) => setOs(e.target.value)}
                    disabled={isReadOnly}
                    placeholder={language === 'it' ? 'es. Android 14' : 'e.g. Android 14'}
                    className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                  />
               </div>

               {/* UI Customization Checkbox */}
               <div className={`p-4 rounded-xl border transition-all ${hasCustomUi ? 'border-pairon-mint/50 bg-pairon-mint/5' : (isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50')}`}>
                 <div 
                   onClick={() => !isReadOnly && setHasCustomUi(!hasCustomUi)}
                   className={`flex items-center gap-3 ${!isReadOnly ? 'cursor-pointer' : ''} mb-3`}
                 >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${hasCustomUi ? 'bg-pairon-mint border-pairon-mint' : 'border-gray-500'}`}>
                      {hasCustomUi && <Check size={14} className="text-pairon-obsidian" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        {language === 'it' ? 'Personalizzazione UI' : 'UI Customization'}
                      </span>
                    </div>
                 </div>
                 
                 {hasCustomUi && (
                   <div className="pl-9 animate-fade-in">
                      <SmartSelector 
                        label={language === 'it' ? 'Interfaccia' : 'Interface'}
                        value={customUi}
                        onChange={setCustomUi}
                        optionsCategory="uiVersions"
                        defaultOptions={DEFAULT_UI_VERSIONS}
                        isReadOnly={isReadOnly}
                        isDark={isDark}
                        placeholder={language === 'it' ? 'es. One UI 6.1...' : 'e.g. One UI 6.1...'}
                        language={language}
                      />
                   </div>
                 )}
               </div>
            </div>

            {/* Update Policy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                    {language === 'it' ? 'Major Update Promessi' : 'Major Updates Promised'}
                  </label>
                  <input
                    type="text"
                    value={majorUpdates}
                    onChange={(e) => setMajorUpdates(e.target.value)}
                    disabled={isReadOnly}
                    placeholder={language === 'it' ? 'es. 7 Anni' : 'e.g. 7 Years'}
                    className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                    {language === 'it' ? 'Patch Sicurezza Promesse' : 'Security Patches Promised'}
                  </label>
                  <input
                    type="text"
                    value={securityPatches}
                    onChange={(e) => setSecurityPatches(e.target.value)}
                    disabled={isReadOnly}
                    placeholder={language === 'it' ? 'es. 7 Anni' : 'e.g. 7 Years'}
                    className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                  />
                </div>
            </div>
          </section>

          <hr className={`border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`} />

          {/* SECTION 8: Availability & Price */}
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.25s' }}>
             <div className="flex items-center gap-2">
               <Calendar className="text-pairon-mint" size={20} />
               <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                 {language === 'it' ? 'Disponibilità e Prezzo' : 'Availability & Price'}
               </h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                    {language === 'it' ? 'Data di Lancio' : 'Launch Date'}
                  </label>
                  <input
                    type="date"
                    value={launchDate}
                    onChange={(e) => setLaunchDate(e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                    style={{ colorScheme: isDark ? 'dark' : 'light' }}
                  />
                </div>

                <div>
                   <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                    {language === 'it' ? 'Prezzo' : 'Price'}
                  </label>
                  <div className="relative">
                    <Euro size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={isReadOnly}
                      placeholder="es. 999"
                      className={`w-full p-3 pl-9 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                    />
                  </div>
                </div>
             </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default AddSmartphonePage;