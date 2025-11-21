
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Plus, Trash2, Save, Check, Cpu, HardDrive, Smartphone, Volume2, Fingerprint, Activity, Eye, AlertTriangle, X, Monitor, Zap, Sun, Aperture, Video, ScanFace, BatteryMedium, RefreshCcw, Wifi, AppWindow, Layers, Calendar, Euro, DollarSign, PoundSterling, JapaneseYen, IndianRupee, Banknote, ThumbsUp, ThumbsDown, RefreshCw, Maximize2, Lock, ShieldCheck, SmartphoneNfc,  CalendarDays, Palette, MousePointerClick } from 'lucide-react';
import { Language } from '../types';
import { PhoneData, RamVariant, StorageVariant, Display, Camera as CameraType, VideoSettings, Battery, addSmartphone, updateSmartphone, uploadSmartphoneImage, auth, subscribeToUserSettings } from '../services/firebase';
import { Loader } from './Loader';
import SmartSelector from './SmartSelector';

interface AddSmartphonePageProps {
  onClose: () => void;
  language: Language;
  isDark: boolean;
  initialData?: PhoneData | null;
  isReadOnly?: boolean;
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
  "Eccellente (X-Axis)", "Buona", "Media", "Scarsa", "Aptica", "Excellent (X-Axis)", "Good", "Average", "Poor", "Haptic"
];

const DEFAULT_FINGERPRINT_TYPES = [
  "Sotto display (Ultrasonico)", 
  "Sotto display (Ottico)", 
  "Laterale (Tasto accensione)", 
  "Posteriore",
  "Under display (Ultrasonic)",
  "Under display (Optical)",
  "Side-mounted"
];

const DEFAULT_FACEID_TYPES = [
  "2D (Fotocamera/Camera)", 
  "3D (Sensori/Sensors)"
];

const DEFAULT_DISPLAY_TYPES = [
  "LTPO AMOLED", "Dynamic AMOLED 2X", "OLED", "Super Retina XDR OLED", "LCD IPS", "P-OLED"
];

const DEFAULT_CAMERA_TYPES = [
  "Principale (Main)",
  "Grandangolare (Ultra-wide)",
  "Teleobiettivo 3x (Tele 3x)",
  "Teleobiettivo 5x (Tele 5x)",
  "Periscopio (Periscope)",
  "Macro",
  "Anteriore (Selfie)"
];

const DEFAULT_UI_VERSIONS = [
  "One UI 6.1", "One UI 6.0", "iOS 17", "iOS 18", "HyperOS", "OxygenOS 14", 
  "ColorOS 14", "OriginOS 4", "MagicOS 8.0", "Pixel UI", "Nothing OS 2.5"
];

const DEFAULT_OS_VERSIONS = [
  "Android 15", "Android 14", "iOS 18", "iOS 17", "HarmonyOS 4", "Android 16", "iOS 19"
];

const DEFAULT_IP_RATINGS = [
  "IP68", "IP67", "IP54", "IP53", "IPX4"
];

// --- INTERNAL COMPONENT: Unit Selector (Modal) ---
const UnitSelector: React.FC<{
  value: string;
  onChange: (val: string) => void;
  isReadOnly: boolean;
  isDark: boolean;
}> = ({ value, onChange, isReadOnly, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = ['GB', 'TB'];

  const inputBg = isReadOnly 
    ? (isDark ? 'bg-transparent border-b border-white/20 text-white' : 'bg-transparent border-b border-gray-300 text-gray-900')
    : (isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900');

  return (
    <>
      <div
        onClick={() => !isReadOnly && setIsOpen(true)}
        className={`w-full p-3 rounded-xl border text-center min-h-[46px] flex items-center justify-center ${inputBg} ${!isReadOnly ? 'cursor-pointer hover:border-pairon-mint/50 transition-colors' : ''}`}
      >
        <span className="font-medium text-sm">{value}</span>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className={`w-full max-w-xs rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-pairon-surface border border-white/10' : 'bg-white border border-gray-200'}`}>
              <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Unità</h3>
                <button onClick={() => setIsOpen(false)} className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                   <X size={20} />
                </button>
              </div>
              <div className="p-2 flex flex-col gap-1">
                {options.map(opt => (
                   <button
                     key={opt}
                     onClick={() => { onChange(opt); setIsOpen(false); }}
                     className={`w-full p-3 rounded-xl text-center font-bold transition-colors flex justify-between items-center px-6 ${value === opt ? 'bg-pairon-mint text-pairon-obsidian' : (isDark ? 'text-white hover:bg-white/5' : 'text-gray-900 hover:bg-gray-50')}`}
                   >
                     <span>{opt}</span>
                     {value === opt && <Check size={16} />}
                   </button>
                ))}
              </div>
           </div>
        </div>
      )}
    </>
  );
};

const AddSmartphonePage: React.FC<AddSmartphonePageProps> = ({ 
  onClose, 
  language, 
  isDark,
  initialData,
  isReadOnly = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>('EUR');
  
  // --- STATE ---
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDeleted, setImageDeleted] = useState(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

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

  // Arrays
  const [rams, setRams] = useState<RamVariant[]>([{ amount: '', type: '' }]);
  const [storages, setStorages] = useState<StorageVariant[]>([{ amount: '', unit: 'GB', type: '' }]);
  const [displays, setDisplays] = useState<Display[]>([{ 
    type: '', size: '', resolution: '', refreshRate: '', brightness: '', hasHdr: false, hasDolbyVision: false 
  }]);
  const [cameras, setCameras] = useState<CameraType[]>([{ type: '', megapixels: '', hasOis: false }]);
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({ maxResolution: '', maxFrameRate: '', hasHdr: false, hasDolbyVision: false });

  // Biometrics & Haptics
  const [hasStereo, setHasStereo] = useState(false);
  const [hasJack, setHasJack] = useState(false);
  const [hasFingerprint, setHasFingerprint] = useState(false);
  const [fingerprintType, setFingerprintType] = useState(''); 
  const [hasFaceId, setHasFaceId] = useState(false);
  const [faceIdType, setFaceIdType] = useState('');
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

  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STYLES ---
  const inputBg = isReadOnly 
    ? (isDark ? 'bg-transparent border-b border-white/20 text-white' : 'bg-transparent border-b border-gray-300 text-gray-900')
    : (isDark ? 'bg-white/5 border-white/10 text-white focus:border-pairon-mint' : 'bg-white border-gray-200 text-gray-900 focus:border-pairon-indigo');
  
  const labelColor = isDark ? 'text-gray-400' : 'text-gray-500';

  // --- EFFECTS ---
  useEffect(() => {
     if (auth.currentUser) {
        const unsubscribe = subscribeToUserSettings(auth.currentUser.uid, (settings) => {
           if (settings.currency) setCurrency(settings.currency);
        });
        return () => unsubscribe();
     }
  }, []);

  useEffect(() => {
    if (initialData) {
      setBrand(initialData.brand);
      setModel(initialData.model);
      setPreviewUrl(initialData.imageUrl || null);
      setChip(initialData.chip);
      setIpRating(initialData.ipRating);
      
      if (initialData.ram && initialData.ram.length > 0) setRams(initialData.ram);
      if (initialData.storage && initialData.storage.length > 0) setStorages(initialData.storage);
      
      if (initialData.battery) {
        if (typeof initialData.battery === 'object') {
          setBatteryCapacity(initialData.battery.capacity || '');
          setIsSiliconCarbon(initialData.battery.isSiliconCarbon || false);
          setWiredCharging(initialData.battery.wiredCharging || '');
          setHasWireless(initialData.battery.hasWireless || false);
          setWirelessCharging(initialData.battery.wirelessCharging || '');
          setHasReverse(initialData.battery.hasReverse || false);
          setReverseCharging(initialData.battery.reverseCharging || '');
        } else {
          setBatteryCapacity(initialData.battery || '');
        }
      }

      if (initialData.displays && initialData.displays.length > 0) setDisplays(initialData.displays);
      if (initialData.cameras && initialData.cameras.length > 0) setCameras(initialData.cameras);
      if (initialData.video) setVideoSettings(initialData.video);

      setHasStereo(initialData.hasStereo ?? false);
      setHasJack(initialData.hasJack ?? false);
      
      // Biometrics
      setHasFingerprint(initialData.hasFingerprint ?? false);
      setFingerprintType(initialData.fingerprintType || ''); 
      setHasFaceId(initialData.hasFaceId ?? false);
      setFaceIdType(initialData.faceIdType || '');
      setHaptics(initialData.haptics || '');

      // OS
      setOs(initialData.os || '');
      setHasCustomUi(initialData.hasCustomUi || false);
      setCustomUi(initialData.customUi || '');
      setMajorUpdates(initialData.majorUpdates || '');
      setSecurityPatches(initialData.securityPatches || '');

      setLaunchDate(initialData.launchDate || '');
      setPrice(initialData.price || '');
      setPros(initialData.pros || []);
      setCons(initialData.cons || []);
    }
  }, [initialData]);

  // --- HANDLERS ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImageDeleted(false);
    }
  };

  const handleRemoveImage = () => {
    if (isReadOnly) return;
    setImageFile(null);
    setPreviewUrl(null);
    setImageDeleted(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddRam = () => !isReadOnly && setRams([...rams, { amount: '', type: '' }]);
  const handleRemoveRam = (index: number) => !isReadOnly && rams.length > 1 && setRams(rams.filter((_, i) => i !== index));
  const updateRam = (index: number, field: keyof RamVariant, value: string) => {
    if (isReadOnly) return;
    const newRams = [...rams];
    newRams[index][field] = value;
    setRams(newRams);
  };

  const handleAddStorage = () => !isReadOnly && setStorages([...storages, { amount: '', unit: 'GB', type: '' }]);
  const handleRemoveStorage = (index: number) => !isReadOnly && storages.length > 1 && setStorages(storages.filter((_, i) => i !== index));
  const updateStorage = (index: number, field: keyof StorageVariant, value: string) => {
    if (isReadOnly) return;
    const newStorages = [...storages];
    // @ts-ignore
    newStorages[index][field] = value;
    setStorages(newStorages);
  };

  const handleAddDisplay = () => !isReadOnly && setDisplays([...displays, { type: '', size: '', resolution: '', refreshRate: '', brightness: '', hasHdr: false, hasDolbyVision: false }]);
  const handleRemoveDisplay = (index: number) => !isReadOnly && displays.length > 1 && setDisplays(displays.filter((_, i) => i !== index));
  const updateDisplay = (index: number, field: keyof Display, value: any) => {
    if (isReadOnly) return;
    const newDisplays = [...displays];
    // @ts-ignore
    newDisplays[index][field] = value;
    setDisplays(newDisplays);
  };

  const handleAddCamera = () => !isReadOnly && setCameras([...cameras, { type: '', megapixels: '', hasOis: false }]);
  const handleRemoveCamera = (index: number) => !isReadOnly && cameras.length > 1 && setCameras(cameras.filter((_, i) => i !== index));
  const updateCamera = (index: number, field: keyof CameraType, value: any) => {
    if (isReadOnly) return;
    const newCameras = [...cameras];
    // @ts-ignore
    newCameras[index][field] = value;
    setCameras(newCameras);
  };

  const updateVideo = (field: keyof VideoSettings, value: any) => !isReadOnly && setVideoSettings({ ...videoSettings, [field]: value });
  const generateRandomGradient = () => 'from-blue-600 to-indigo-900';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isReadOnly) return;
    if (!brand.trim() || !model.trim()) {
      setError(language === 'it' ? "Inserisci Casa Produttrice e Modello." : "Enter Brand and Model.");
      return;
    }
    if (!auth.currentUser) return;

    setIsLoading(true);
    let uploadedImageUrl = initialData?.imageUrl || '';
    if (imageDeleted) uploadedImageUrl = '';
    if (imageFile) {
      try {
        uploadedImageUrl = await uploadSmartphoneImage(auth.currentUser.uid, imageFile);
      } catch (error) { console.error("Image upload failed", error); }
    }

    const phoneData: Omit<PhoneData, 'id'> = {
      brand, model, chip, ipRating, ram: rams, storage: storages, displays, cameras, video: videoSettings,
      battery: { 
        capacity: batteryCapacity, 
        isSiliconCarbon, 
        wiredCharging, 
        hasWireless, 
        wirelessCharging: hasWireless ? wirelessCharging : '', 
        hasReverse, 
        reverseCharging: hasReverse ? reverseCharging : '' 
      },
      hasStereo, hasJack, 
      hasFingerprint, fingerprintType: hasFingerprint ? fingerprintType : '', 
      hasFaceId, faceIdType: hasFaceId ? faceIdType : '', 
      haptics,
      os, hasCustomUi, customUi: hasCustomUi ? customUi : '', 
      majorUpdates, securityPatches, 
      launchDate, price, pros, cons,
      color: initialData?.color || generateRandomGradient(), 
      imageUrl: uploadedImageUrl,
    };

    try {
      if (initialData && initialData.id) await updateSmartphone(auth.currentUser.uid, initialData.id, phoneData);
      else await addSmartphone(auth.currentUser.uid, phoneData);
      onClose();
    } catch (error) { setError(language === 'it' ? "Errore nel salvataggio." : "Error saving data."); } 
    finally { setIsLoading(false); }
  };

  const getTitle = () => isReadOnly ? (language === 'it' ? 'Dettagli' : 'Details') : initialData ? (language === 'it' ? 'Modifica' : 'Edit') : (language === 'it' ? 'Aggiungi' : 'Add');
  const CurrencyIcon = () => <Banknote size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isDark ? 'bg-pairon-obsidian' : 'bg-pairon-ghost'} overflow-hidden animate-fade-in`}>
      {/* Error Popup */}
      {error && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl border relative overflow-hidden ${isDark ? 'bg-pairon-surface border-red-500/30' : 'bg-white border-red-100'}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
            <div className="flex flex-col items-center text-center gap-4">
                <AlertTriangle size={24} className="text-red-500 animate-pulse" />
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
                <button onClick={() => setError(null)} className={`w-full py-3 rounded-xl font-bold ${isDark ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Fullscreen */}
      {isImageFullscreen && previewUrl && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setIsImageFullscreen(false)}>
           <button onClick={() => setIsImageFullscreen(false)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white"><X size={24} /></button>
           <img src={previewUrl} alt="Full" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/10 bg-pairon-surface/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md z-10`}>
        <div className="flex items-center gap-4">
          <button onClick={onClose} className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
            <ArrowLeft size={24} className={isDark ? 'text-white' : 'text-gray-800'} />
          </button>
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{getTitle()}</h1>
        </div>
        {!isReadOnly && (
          <button onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 bg-pairon-mint text-pairon-obsidian font-bold rounded-xl shadow-lg flex items-center gap-2">
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Save size={18} />}
            <span className="hidden sm:inline">{language === 'it' ? 'Salva' : 'Save'}</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-8 pb-24">
          
          {/* Identity Section */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex gap-6 items-start">
              <div onClick={() => previewUrl ? setIsImageFullscreen(true) : !isReadOnly && fileInputRef.current?.click()} className={`w-32 h-48 md:w-64 md:h-96 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 relative overflow-hidden flex-shrink-0 ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-white'}`}>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" disabled={isReadOnly} />
                {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <Camera className={isDark ? 'text-gray-500' : 'text-gray-400'} size={32} />}
              </div>
              {!isReadOnly && (
                <div className="flex flex-col gap-3 pt-2">
                  <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-xl bg-pairon-mint text-pairon-obsidian"><RefreshCw size={18} /></button>
                  {previewUrl && <button onClick={handleRemoveImage} className="p-3 rounded-xl bg-red-500/10 text-red-500"><Trash2 size={18} /></button>}
                </div>
              )}
            </div>
            <div className="space-y-4 flex-1 w-full min-w-0">
              <SmartSelector label={language === 'it' ? 'Casa produttrice' : 'Brand'} value={brand} onChange={setBrand} optionsCategory="brands" defaultOptions={DEFAULT_BRANDS} isReadOnly={isReadOnly} isDark={isDark} language={language} />
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>{language === 'it' ? 'Modello' : 'Model'}</label>
                <input type="text" value={model} onChange={(e) => setModel(e.target.value)} disabled={isReadOnly} className={`w-full p-3 rounded-xl border outline-none ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`} placeholder={language === 'it' ? "es. Galaxy S24" : "e.g. Galaxy S24"} />
              </div>
            </div>
          </div>

          {/* Display Section */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2"><Monitor className="text-blue-400" size={20} /><h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Display</h3></div>
              {!isReadOnly && <button onClick={handleAddDisplay} className="text-xs font-bold text-pairon-mint flex items-center gap-1"><Plus size={14} /> {language === 'it' ? 'Aggiungi' : 'Add'}</button>}
            </div>
            {displays.map((display, index) => {
                const [width = '', height = ''] = display.resolution.toLowerCase().replace('pixel', '').split('x').map(s => s.trim());
                return (
                <div key={index} className={`p-5 rounded-2xl border relative ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                   {!isReadOnly && displays.length > 1 && <button onClick={() => handleRemoveDisplay(index)} className="absolute top-4 right-4 text-red-400"><Trash2 size={16} /></button>}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <SmartSelector label={language === 'it' ? 'Tecnologia' : 'Technology'} value={display.type} onChange={(val) => updateDisplay(index, 'type', val)} optionsCategory="displayTypes" defaultOptions={DEFAULT_DISPLAY_TYPES} isReadOnly={isReadOnly} isDark={isDark} language={language} />
                      
                      <div>
                         <label className={`block text-xs font-bold uppercase ${labelColor} flex items-center gap-1`}><Maximize2 size={12} /> {language === 'it' ? 'Dimensioni (pollici)' : 'Size (inches)'}</label>
                         <input type="text" value={display.size} onChange={(e) => updateDisplay(index, 'size', e.target.value)} disabled={isReadOnly} className={`w-full p-3 rounded-xl border outline-none ${inputBg}`} placeholder='6.7"' />
                      </div>
                      
                      <div className="col-span-1 md:col-span-2">
                        <label className={`block text-xs font-bold uppercase ${labelColor} flex items-center gap-1`}><Monitor size={12} /> {language === 'it' ? 'Risoluzione (Pixel)' : 'Resolution (Pixel)'}</label>
                        <div className="flex gap-2 items-center">
                           <input type="text" value={width} onChange={(e) => updateDisplay(index, 'resolution', `${e.target.value} x ${height}`)} disabled={isReadOnly} className={`flex-1 min-w-0 p-3 rounded-xl border outline-none text-center ${inputBg}`} placeholder="1290" />
                            <span className="opacity-50 font-bold">X</span>
                           <input type="text" value={height} onChange={(e) => updateDisplay(index, 'resolution', `${width} x ${e.target.value}`)} disabled={isReadOnly} className={`flex-1 min-w-0 p-3 rounded-xl border outline-none text-center ${inputBg}`} placeholder="2796" />
                        </div>
                      </div>
                      
                      <div>
                         <label className={`block text-xs font-bold uppercase ${labelColor} flex items-center gap-1`}><RefreshCw size={12} /> Refresh Rate (Hz)</label>
                         <input type="text" value={display.refreshRate} onChange={(e) => updateDisplay(index, 'refreshRate', e.target.value)} disabled={isReadOnly} className={`w-full p-3 rounded-xl border outline-none ${inputBg}`} placeholder="120 Hz" />
                      </div>
                      
                      <div>
                         <label className={`block text-xs font-bold uppercase ${labelColor} flex items-center gap-1`}><Sun size={12} className="text-yellow-500" /> {language === 'it' ? 'Luminosità (Nits)' : 'Brightness (Nits)'}</label>
                         <input type="text" value={display.brightness} onChange={(e) => updateDisplay(index, 'brightness', e.target.value)} disabled={isReadOnly} className={`w-full p-3 rounded-xl border outline-none ${inputBg}`} placeholder="2000 nits" />
                      </div>
                   </div>
                </div>
              )})}
          </section>

          {/* Hardware Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2"><Cpu className="text-pairon-mint" size={20} /><h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Hardware</h3></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SmartSelector label="SoC / Processor" value={chip} onChange={setChip} optionsCategory="chips" defaultOptions={DEFAULT_CHIPS} isReadOnly={isReadOnly} isDark={isDark} language={language} />
              <SmartSelector label="IP Rating (Water/Dust)" value={ipRating} onChange={setIpRating} optionsCategory="ipRatings" defaultOptions={DEFAULT_IP_RATINGS} isReadOnly={isReadOnly} isDark={isDark} language={language} />
            </div>

            {/* Biometrics & Haptics */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
               <div className="space-y-4">
                  {/* Fingerprint */}
                  <div className="flex flex-col gap-2">
                     <div className="flex items-center justify-between">
                        <label className={`flex items-center gap-2 font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                           <Fingerprint size={18} className="text-purple-400" /> 
                           {language === 'it' ? 'Impronta Digitale' : 'Fingerprint'}
                        </label>
                        {!isReadOnly && <input type="checkbox" checked={hasFingerprint} onChange={(e) => setHasFingerprint(e.target.checked)} className="w-5 h-5 accent-pairon-mint rounded cursor-pointer" />}
                     </div>
                     {hasFingerprint && (
                        <div className="pl-6 animate-fade-in">
                           <SmartSelector label={language === 'it' ? 'Tipo Sensore' : 'Sensor Type'} value={fingerprintType} onChange={setFingerprintType} optionsCategory="fingerprintTypes" defaultOptions={DEFAULT_FINGERPRINT_TYPES} isReadOnly={isReadOnly} isDark={isDark} language={language} />
                        </div>
                     )}
                  </div>

                  {/* Face ID */}
                  <div className="flex flex-col gap-2">
                     <div className="flex items-center justify-between">
                        <label className={`flex items-center gap-2 font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                           <ScanFace size={18} className="text-blue-400" /> 
                           {language === 'it' ? 'Sblocco Facciale' : 'Face Unlock'}
                        </label>
                        {!isReadOnly && <input type="checkbox" checked={hasFaceId} onChange={(e) => setHasFaceId(e.target.checked)} className="w-5 h-5 accent-pairon-mint rounded cursor-pointer" />}
                     </div>
                     {hasFaceId && (
                        <div className="pl-6 animate-fade-in">
                           <SmartSelector label={language === 'it' ? 'Tecnologia' : 'Technology'} value={faceIdType} onChange={setFaceIdType} optionsCategory="faceIdTypes" defaultOptions={DEFAULT_FACEID_TYPES} isReadOnly={isReadOnly} isDark={isDark} language={language} />
                        </div>
                     )}
                  </div>

                  {/* Haptics */}
                  <div className="pt-2 border-t border-white/10">
                     <div className="flex items-center gap-2 mb-3">
                        <Activity size={18} className="text-green-400" />
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{language === 'it' ? 'Vibrazione' : 'Haptics'}</span>
                     </div>
                     <SmartSelector label={language === 'it' ? 'Qualità / Motore' : 'Quality / Motor'} value={haptics} onChange={setHaptics} optionsCategory="haptics" defaultOptions={DEFAULT_HAPTICS} isReadOnly={isReadOnly} isDark={isDark} language={language} />
                  </div>
               </div>
            </div>

            {/* RAM */}
            <div className="space-y-3">
              <div className="flex justify-between items-end"><label className={`block text-xs font-bold uppercase ${labelColor}`}>RAM</label>{!isReadOnly && <button onClick={handleAddRam} className="text-xs text-pairon-mint font-bold"><Plus size={12} /></button>}</div>
              {rams.map((ram, index) => (
                <div key={index} className={`flex flex-col md:flex-row gap-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} p-3`}>
                  <div className="relative flex-1"><input type="text" value={ram.amount} onChange={(e) => updateRam(index, 'amount', e.target.value)} disabled={isReadOnly} className={`w-full p-3 rounded-xl border outline-none pl-4 ${inputBg}`} placeholder="12" /><span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold ${labelColor}`}>GB</span></div>
                  <div className="flex-1"><SmartSelector label={language === 'it' ? 'Tipo' : 'Type'} value={ram.type} onChange={(val) => updateRam(index, 'type', val)} optionsCategory="ramTypes" defaultOptions={DEFAULT_RAM_TYPES} isReadOnly={isReadOnly} isDark={isDark} language={language} /></div>
                  {!isReadOnly && rams.length > 1 && <button onClick={() => handleRemoveRam(index)} className="p-3 text-red-400 self-end md:self-center"><Trash2 size={18} /></button>}
                </div>
              ))}
            </div>

            {/* Storage */}
            <div className="space-y-3">
              <div className="flex justify-between items-end"><label className={`block text-xs font-bold uppercase ${labelColor} flex items-center gap-1`}><HardDrive size={12} /> Storage</label>{!isReadOnly && <button onClick={handleAddStorage} className="text-xs text-pairon-mint font-bold"><Plus size={12} /></button>}</div>
              {storages.map((storage, index) => (
                <div key={index} className={`flex flex-col md:flex-row gap-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} p-3`}>
                   <div className="flex-1 flex gap-2 min-w-0">
                      <input type="text" value={storage.amount} onChange={(e) => updateStorage(index, 'amount', e.target.value)} disabled={isReadOnly} className={`flex-1 min-w-0 p-3 rounded-xl border outline-none ${inputBg}`} placeholder="256" />
                      <div className="w-20 flex-shrink-0"><UnitSelector value={storage.unit} onChange={(val) => updateStorage(index, 'unit', val)} isReadOnly={isReadOnly} isDark={isDark} /></div>
                   </div>
                   <div className="flex-1"><SmartSelector label={language === 'it' ? 'Tipo' : 'Type'} value={storage.type} onChange={(val) => updateStorage(index, 'type', val)} optionsCategory="storageTypes" defaultOptions={DEFAULT_STORAGE_TYPES} isReadOnly={isReadOnly} isDark={isDark} language={language} /></div>
                   {!isReadOnly && storages.length > 1 && <button onClick={() => handleRemoveStorage(index)} className="p-3 text-red-400 self-end md:self-center"><Trash2 size={18} /></button>}
                </div>
              ))}
            </div>
          </section>

          {/* Cameras Section */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2"><Aperture className="text-red-400" size={20} /><h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Cameras</h3></div>
              {!isReadOnly && <button onClick={handleAddCamera} className="text-xs font-bold text-pairon-mint flex items-center gap-1"><Plus size={14} /> {language === 'it' ? 'Aggiungi' : 'Add'}</button>}
            </div>
            <div className="space-y-4">
               {cameras.map((cam, index) => (
                 <div key={index} className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 items-stretch md:items-center relative ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                    {!isReadOnly && cameras.length > 1 && <button onClick={() => handleRemoveCamera(index)} className="absolute top-2 right-2 text-red-400"><Trash2 size={16} /></button>}
                    <div className="flex-1"><SmartSelector label={language === 'it' ? 'Obiettivo' : 'Lens'} value={cam.type} onChange={(val) => updateCamera(index, 'type', val)} optionsCategory="cameraTypes" defaultOptions={DEFAULT_CAMERA_TYPES} isReadOnly={isReadOnly} isDark={isDark} language={language} /></div>
                    <div className="w-full md:w-24"><label className={`block text-xs font-bold uppercase ${labelColor}`}>MP</label><input type="text" value={cam.megapixels} onChange={(e) => updateCamera(index, 'megapixels', e.target.value)} disabled={isReadOnly} className={`w-full p-3 rounded-xl border outline-none ${inputBg}`} placeholder="50" /></div>
                    <div className="flex items-end"><button type="button" onClick={() => !isReadOnly && updateCamera(index, 'hasOis', !cam.hasOis)} className={`w-full md:w-auto px-4 py-2.5 rounded-xl text-sm font-bold border ${cam.hasOis ? 'bg-pairon-mint text-pairon-obsidian' : (isDark ? 'border-white/10 text-gray-400' : 'border-gray-300 text-gray-500')}`}>OIS</button></div>
                 </div>
               ))}
            </div>
            
            {/* Video */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
               <h4 className={`text-xs font-bold uppercase mb-4 flex items-center gap-2 ${labelColor}`}><Video size={14} /> Video</h4>
               <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                     <label className={`block text-xs font-bold uppercase ${labelColor}`}>{language === 'it' ? 'Risoluzione Max' : 'Max Resolution'}</label>
                     <input type="text" value={videoSettings.maxResolution} onChange={(e) => updateVideo('maxResolution', e.target.value)} disabled={isReadOnly} className={`w-full p-3 rounded-xl border outline-none ${inputBg}`} placeholder="8K" />
                  </div>
                  <div>
                     <label className={`block text-xs font-bold uppercase ${labelColor}`}>{language === 'it' ? 'FPS Max' : 'Max FPS'}</label>
                     <input type="text" value={videoSettings.maxFrameRate} onChange={(e) => updateVideo('maxFrameRate', e.target.value)} disabled={isReadOnly} className={`w-full p-3 rounded-xl border outline-none ${inputBg}`} placeholder="60 fps" />
                  </div>
               </div>
               <div className="flex gap-3">
                  <button type="button" onClick={() => !isReadOnly && updateVideo('hasHdr', !videoSettings.hasHdr)} className={`px-4 py-2 rounded-lg text-sm font-bold border ${videoSettings.hasHdr ? 'bg-pairon-mint text-pairon-obsidian' : (isDark ? 'border-white/10 text-gray-400' : 'border-gray-300 text-gray-500')}`}>HDR</button>
                  <button type="button" onClick={() => !isReadOnly && updateVideo('hasDolbyVision', !videoSettings.hasDolbyVision)} className={`px-4 py-2 rounded-lg text-sm font-bold border ${videoSettings.hasDolbyVision ? 'bg-pairon-mint text-pairon-obsidian' : (isDark ? 'border-white/10 text-gray-400' : 'border-gray-300 text-gray-500')}`}>Dolby</button>
               </div>
            </div>
          </section>

          {/* Battery Section */}
          <section className="space-y-6">
             <div className="flex items-center gap-2"><BatteryMedium className="text-green-500" size={20} /><h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{language === 'it' ? 'Batteria' : 'Battery'}</h3></div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className={`block text-xs font-bold uppercase ${labelColor}`}>{language === 'it' ? 'Capacità (mAh)' : 'Capacity (mAh)'}</label>
                   <input type="text" value={batteryCapacity} onChange={(e) => setBatteryCapacity(e.target.value)} disabled={isReadOnly} className={`w-full p-3 rounded-xl border outline-none ${inputBg}`} placeholder="5000" />
                   
                   {/* Silicon Carbon Toggle */}
                   <div className="flex items-center gap-2 mt-2">
                      <input type="checkbox" checked={isSiliconCarbon} onChange={(e) => setIsSiliconCarbon(e.target.checked)} disabled={isReadOnly} className="w-4 h-4 accent-pairon-mint" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{language === 'it' ? 'Tecnologia Silicio-Carbonio' : 'Silicon-Carbon Technology'}</span>
                   </div>
                </div>
                
                <div>
                   <label className={`block text-xs font-bold uppercase ${labelColor} flex items-center gap-1`}><Zap size={12} className="text-yellow-400" /> {language === 'it' ? 'Ricarica Cablata (W)' : 'Wired Charging (W)'}</label>
                   <input type="text" value={wiredCharging} onChange={(e) => setWiredCharging(e.target.value)} disabled={isReadOnly} className={`w-full p-3 rounded-xl border outline-none ${inputBg}`} placeholder="80W" />
                </div>
             </div>

             {/* Wireless & Reverse */}
             <div className={`p-4 rounded-2xl border ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                {/* Wireless */}
                <div className="flex flex-col gap-3 mb-4 pb-4 border-b border-white/10">
                   <div className="flex items-center justify-between">
                      <span className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                         <SmartphoneNfc size={18} className="text-blue-400" />
                         {language === 'it' ? 'Ricarica Wireless' : 'Wireless Charging'}
                      </span>
                      {!isReadOnly && <input type="checkbox" checked={hasWireless} onChange={(e) => setHasWireless(e.target.checked)} className="w-5 h-5 accent-pairon-mint rounded cursor-pointer" />}
                   </div>
                   {hasWireless && (
                      <div className="pl-7 animate-fade-in">
                         <label className={`block text-xs font-bold uppercase ${labelColor} mb-1`}>{language === 'it' ? 'Velocità (W)' : 'Speed (W)'}</label>
                         <input type="text" value={wirelessCharging} onChange={(e) => setWirelessCharging(e.target.value)} disabled={isReadOnly} className={`w-full p-2 rounded-lg border outline-none ${inputBg}`} placeholder="50W" />
                      </div>
                   )}
                </div>

                {/* Reverse */}
                <div className="flex flex-col gap-3">
                   <div className="flex items-center justify-between">
                      <span className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                         <RefreshCcw size={18} className="text-orange-400" />
                         {language === 'it' ? 'Ricarica Inversa' : 'Reverse Charging'}
                      </span>
                      {!isReadOnly && <input type="checkbox" checked={hasReverse} onChange={(e) => setHasReverse(e.target.checked)} className="w-5 h-5 accent-pairon-mint rounded cursor-pointer" />}
                   </div>
                   {hasReverse && (
                      <div className="pl-7 animate-fade-in">
                         <label className={`block text-xs font-bold uppercase ${labelColor} mb-1`}>{language === 'it' ? 'Velocità (W)' : 'Speed (W)'}</label>
                         <input type="text" value={reverseCharging} onChange={(e) => setReverseCharging(e.target.value)} disabled={isReadOnly} className={`w-full p-2 rounded-lg border outline-none ${inputBg}`} placeholder="10W" />
                      </div>
                   )}
                </div>
             </div>
          </section>
          
          {/* Software Section */}
          <section className="space-y-6">
             <div className="flex items-center gap-2"><AppWindow className="text-indigo-400" size={20} /><h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Software & OS</h3></div>
             
             <SmartSelector label="OS Version" value={os} onChange={setOs} optionsCategory="osVersions" defaultOptions={DEFAULT_OS_VERSIONS} isReadOnly={isReadOnly} isDark={isDark} language={language} />
             
             {/* Custom UI */}
             <div className={`p-4 rounded-2xl border ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-3">
                   <label className={`flex items-center gap-2 font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      <Palette size={18} className="text-pink-400" /> 
                      {language === 'it' ? 'Interfaccia Personalizzata' : 'Custom UI'}
                   </label>
                   {!isReadOnly && <input type="checkbox" checked={hasCustomUi} onChange={(e) => setHasCustomUi(e.target.checked)} className="w-5 h-5 accent-pairon-mint rounded cursor-pointer" />}
                </div>
                {hasCustomUi && (
                   <div className="animate-fade-in">
                      <SmartSelector label={language === 'it' ? 'Nome UI' : 'UI Name'} value={customUi} onChange={setCustomUi} optionsCategory="uiVersions" defaultOptions={DEFAULT_UI_VERSIONS} isReadOnly={isReadOnly} isDark={isDark} language={language} />
                   </div>
                )}
             </div>

             {/* Support */}
             <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className={`block text-xs font-bold uppercase ${labelColor} flex items-center gap-1`}><Calendar size={12} /> {language === 'it' ? 'Major Updates (Anni)' : 'Major Updates (Years)'}</label>
                   <input type="number" value={majorUpdates} onChange={(e) => setMajorUpdates(e.target.value)} disabled={isReadOnly} className={`w-full p-3 rounded-xl border outline-none ${inputBg}`} placeholder="4" />
                </div>
                <div>
                   <label className={`block text-xs font-bold uppercase ${labelColor} flex items-center gap-1`}><ShieldCheck size={12} /> {language === 'it' ? 'Patch Sicurezza (Anni)' : 'Security Patches (Years)'}</label>
                   <input type="number" value={securityPatches} onChange={(e) => setSecurityPatches(e.target.value)} disabled={isReadOnly} className={`w-full p-3 rounded-xl border outline-none ${inputBg}`} placeholder="5" />
                </div>
             </div>
          </section>

          {/* Availability & Price */}
          <section className="space-y-6">
             <div className="flex items-center gap-2"><CalendarDays className="text-yellow-500" size={20} /><h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{language === 'it' ? 'Disponibilità & Prezzo' : 'Availability & Price'}</h3></div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className={`block text-xs font-bold uppercase ${labelColor} mb-1`}>{language === 'it' ? 'Data di Lancio' : 'Launch Date'}</label>
                   <div className={`relative flex items-center w-full rounded-xl border ${inputBg}`}>
                      <Calendar size={18} className={`ml-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input 
                        type="date" 
                        value={launchDate} 
                        onChange={(e) => setLaunchDate(e.target.value)} 
                        disabled={isReadOnly} 
                        className="w-full bg-transparent p-3 outline-none" 
                      />
                   </div>
                </div>

                <div>
                   <label className={`block text-xs font-bold uppercase ${labelColor} mb-1`}>{language === 'it' ? 'Prezzo' : 'Price'}</label>
                   <div className="relative">
                      <CurrencyIcon />
                      <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} disabled={isReadOnly} className={`w-full p-3 pl-10 rounded-xl border outline-none ${inputBg}`} placeholder="999" />
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
