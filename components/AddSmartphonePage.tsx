
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Plus, Trash2, Save, Check, Cpu, HardDrive, Smartphone, Volume2, Fingerprint, Activity, Eye, AlertTriangle, X, Monitor, Zap, Sun, Aperture, Video, ScanFace, BatteryMedium, RefreshCcw, Wifi, AppWindow, Layers, Calendar, Euro, DollarSign, PoundSterling, JapaneseYen, IndianRupee, Banknote, ThumbsUp, ThumbsDown, RefreshCw, Maximize2 } from 'lucide-react';
import { Language } from '../types';
import { PhoneData, RamVariant, StorageVariant, Display, Camera as CameraType, VideoSettings, Battery, addSmartphone, updateSmartphone, uploadSmartphoneImage, auth, subscribeToUserSettings, addCustomOption, CustomOptions } from '../services/firebase';
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

const DEFAULT_HAPTICS_IT = [
  "Buona", "Aptica", "Scarsa", "Eccellente", "Motore X-Axis"
];

const DEFAULT_HAPTICS_EN = [
  "Good", "Haptic", "Poor", "Excellent", "X-Axis Motor"
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
  "Principale",
  "Grandangolare",
  "Teleobiettivo 3x",
  "Teleobiettivo 5x",
  "Macro",
  "Anteriore"
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
  isReadOnly = false 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>('EUR');
  
  // General
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDeleted, setImageDeleted] = useState(false); // Track if image was explicitly deleted
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

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
  const [storages, setStorages] = useState<StorageVariant[]>([{ amount: '', unit: 'GB', type: '' }]);

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

  // Pros & Cons
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Colors helper
  const inputBg = isReadOnly 
    ? (isDark ? 'bg-transparent border-b border-white/20 text-white' : 'bg-transparent border-b border-gray-300 text-gray-900')
    : (isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900');
  
  const labelColor = isDark ? 'text-gray-400' : 'text-gray-500';

  // Fetch Currency Settings
  useEffect(() => {
     if (auth.currentUser) {
        const unsubscribe = subscribeToUserSettings(auth.currentUser.uid, (settings) => {
           if (settings.currency) setCurrency(settings.currency);
        });
        return () => unsubscribe();
     }
  }, []);

  // Load initial data if editing or viewing
  useEffect(() => {
    if (initialData) {
      setBrand(initialData.brand);
      setModel(initialData.model);
      setPreviewUrl(initialData.imageUrl || null);
      setChip(initialData.chip);
      setIpRating(initialData.ipRating);
      if (initialData.ram && initialData.ram.length > 0) setRams(initialData.ram);
      
      // Storage Load with legacy support
      if (initialData.storage && initialData.storage.length > 0) {
        const parsedStorage = initialData.storage.map(s => {
           // Handle legacy data where unit might be in amount or missing
           if (!s.unit) {
             const match = s.amount.match(/^(\d+)\s*(GB|TB)?$/i);
             if (match) {
               return {
                 ...s,
                 amount: match[1],
                 unit: (match[2]?.toUpperCase() as 'GB' | 'TB') || 'GB'
               };
             }
             return { ...s, unit: 'GB' as 'GB' | 'TB' };
           }
           return s;
        });
        setStorages(parsedStorage);
      }
      
      // Battery Load
      if (initialData.battery) {
        if (typeof initialData.battery === 'object') {
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

      // Pros & Cons
      setPros(initialData.pros || []);
      setCons(initialData.cons || []);
    }
  }, [initialData]);

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
    setStorages([...storages, { amount: '', unit: 'GB', type: '' }]);
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
    // @ts-ignore
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

  // --- PROS & CONS HANDLERS ---
  const handleAddPro = () => {
    if (newPro.trim()) {
      setPros([...pros, newPro.trim()]);
      setNewPro('');
    }
  };

  const handleRemovePro = (index: number) => {
    if (!isReadOnly) {
      setPros(pros.filter((_, i) => i !== index));
    }
  };

  const handleAddCon = () => {
    if (newCon.trim()) {
      setCons([...cons, newCon.trim()]);
      setNewCon('');
    }
  };

  const handleRemoveCon = (index: number) => {
    if (!isReadOnly) {
      setCons(cons.filter((_, i) => i !== index));
    }
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
    
    // Logic to handle deletion or new upload
    if (imageDeleted) {
      uploadedImageUrl = '';
    }

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
      
      // Pros & Cons
      pros,
      cons,

      // If creating new, random color. If editing, keep existing.
      color: initialData?.color || generateRandomGradient(),
      imageUrl: uploadedImageUrl,
    };

    try {
      // Sync all text fields to Custom Options Dictionary in Firestore
      const uid = auth.currentUser.uid;
      const optionUpdates: Promise<void>[] = [];

      const safeAdd = (category: keyof CustomOptions, val: string) => {
          if (val && val.trim()) {
              optionUpdates.push(addCustomOption(uid, category, val.trim()));
          }
      };

      safeAdd('brands', brand);
      safeAdd('chips', chip);
      safeAdd('ipRatings', ipRating);
      safeAdd('haptics', haptics);
      safeAdd('osVersions', os);
      if (hasCustomUi) safeAdd('uiVersions', customUi);

      rams.forEach(r => safeAdd('ramTypes', r.type));
      storages.forEach(s => safeAdd('storageTypes', s.type));
      displays.forEach(d => safeAdd('displayTypes', d.type));
      cameras.forEach(c => safeAdd('cameraTypes', c.type));
      if (hasFaceId) safeAdd('faceIdTypes', faceIdType);
      if (hasFingerprint) safeAdd('fingerprintTypes', fingerprintType);

      // Run option updates in background (best effort)
      Promise.all(optionUpdates).catch(err => console.error("Failed to sync custom options", err));

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
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
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

  const CurrencyIcon = () => {
     switch(currency) {
       case 'USD': return <DollarSign size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />;
       case 'GBP': return <PoundSterling size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />;
       case 'JPY':
       case 'CNY': return <JapaneseYen size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />;
       case 'INR': return <IndianRupee size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />;
       case 'EUR': return <Euro size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />;
       default: return <Banknote size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />;
     }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isDark ? 'bg-pairon-obsidian' : 'bg-pairon-ghost'} overflow-hidden animate-fade-in`}>
      
      <ErrorPopup />

      {/* Fullscreen Image Modal */}
      {isImageFullscreen && previewUrl && (
        <div 
          className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsImageFullscreen(false)}
        >
           <button 
             onClick={() => setIsImageFullscreen(false)}
             className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
           >
             <X size={24} />
           </button>
           <img 
             src={previewUrl} 
             alt="Fullscreen" 
             className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
             onClick={(e) => e.stopPropagation()} 
           />
        </div>
      )}

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
                <span>{language === 'it' ? 'Sola Lettura' : 'Read Only'}</span>
            </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-8 pb-24">
          
          {/* SECTION 1: Identity */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            
            {/* Image Section - Larger and Action Buttons */}
            <div className="flex gap-6 items-start">
               <div 
                onClick={() => {
                  if (previewUrl) {
                    setIsImageFullscreen(true);
                  } else if (!isReadOnly) {
                    fileInputRef.current?.click();
                  }
                }}
                className={`w-64 h-96 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden group flex-shrink-0 shadow-lg ${(previewUrl || !isReadOnly) ? 'cursor-pointer' : ''} ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-white'} ${!isReadOnly && !previewUrl && (isDark ? 'hover:border-pairon-mint' : 'hover:border-pairon-indigo')}`}
              >
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" disabled={isReadOnly} />
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    {/* Fullscreen Overlay Hint */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                       <Maximize2 className="text-white drop-shadow-md" size={32} />
                    </div>
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

              {/* Action Buttons (Only if Not Read Only) */}
              {!isReadOnly && (
                <div className="flex flex-col gap-3 pt-2">
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="flex items-center gap-2 px-4 py-3 rounded-xl bg-pairon-mint text-pairon-obsidian shadow-md hover:brightness-110 transition-all font-medium"
                   >
                      <RefreshCw size={18} />
                      <span>{language === 'it' ? 'Cambia' : 'Change'}</span>
                   </button>
                   {previewUrl && (
                     <button 
                       onClick={handleRemoveImage}
                       className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all font-medium"
                     >
                        <Trash2 size={18} />
                        <span>{language === 'it' ? 'Elimina' : 'Delete'}</span>
                     </button>
                   )}
                </div>
              )}
            </div>

            {/* Basic Info Inputs */}
            <div className="space-y-4 flex-1 w-full">
              
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
              {displays.map((display, index) => {
                // Split resolution string into width/height for inputs
                // Expected format: "1440 x 3120" or "1440 x 3120 pixel"
                const [width = '', height = ''] = display.resolution.toLowerCase().replace('pixel', '').split('x').map(s => s.trim());

                return (
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
                          {language === 'it' ? 'Dimensioni (pollici)' : 'Size (inches)'}
                        </label>
                        <input
                          type="text"
                          value={display.size}
                          onChange={(e) => updateDisplay(index, 'size', e.target.value)}
                          disabled={isReadOnly}
                          placeholder={language === 'it' ? 'es. 6.7' : 'e.g. 6.7'}
                          className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                          {language === 'it' ? 'Risoluzione (pixel)' : 'Resolution (pixel)'}
                        </label>
                        <div className="flex items-center gap-2">
                           <input
                              type="text"
                              value={width}
                              onChange={(e) => updateDisplay(index, 'resolution', `${e.target.value} x ${height}`)}
                              disabled={isReadOnly}
                              placeholder={language === 'it' ? 'Orizzontale' : 'Horizontal'}
                              className={`flex-1 p-3 rounded-xl border outline-none text-center ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg}`}
                            />
                            <span className={`font-bold ${isDark ? 'text-white/50' : 'text-black/50'}`}>X</span>
                            <input
                              type="text"
                              value={height}
                              onChange={(e) => updateDisplay(index, 'resolution', `${width} x ${e.target.value}`)}
                              disabled={isReadOnly}
                              placeholder={language === 'it' ? 'Verticale' : 'Vertical'}
                              className={`flex-1 p-3 rounded-xl border outline-none text-center ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg}`}
                            />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                          {language === 'it' ? 'Refresh Rate (Hz)' : 'Refresh Rate (Hz)'}
                        </label>
                        <input
                          type="text"
                          value={display.refreshRate}
                          onChange={(e) => updateDisplay(index, 'refreshRate', e.target.value)}
                          disabled={isReadOnly}
                          placeholder="120Hz"
                          className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                          {language === 'it' ? 'Luminosità Picco' : 'Peak Brightness'}
                        </label>
                        <input
                          type="text"
                          value={display.brightness}
                          onChange={(e) => updateDisplay(index, 'brightness', e.target.value)}
                          disabled={isReadOnly}
                          placeholder="2600 nits"
                          className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                        />
                      </div>
                   </div>

                   {/* Features Toggles */}
                   <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => !isReadOnly && updateDisplay(index, 'hasHdr', !display.hasHdr)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${display.hasHdr ? 'bg-pairon-mint text-pairon-obsidian border-pairon-mint' : (isDark ? 'bg-transparent border-white/10 text-gray-400' : 'bg-transparent border-gray-300 text-gray-500')}`}
                      >
                        HDR10+
                      </button>
                      <button
                        type="button"
                        onClick={() => !isReadOnly && updateDisplay(index, 'hasDolbyVision', !display.hasDolbyVision)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${display.hasDolbyVision ? 'bg-pairon-mint text-pairon-obsidian border-pairon-mint' : (isDark ? 'bg-transparent border-white/10 text-gray-400' : 'bg-transparent border-gray-300 text-gray-500')}`}
                      >
                        Dolby Vision
                      </button>
                   </div>
                </div>
              )})}
            </div>
          </section>

          <hr className={`border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`} />

          {/* SECTION 3: Hardware */}
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2">
              <Cpu className="text-pairon-mint" size={20} />
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Hardware</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SmartSelector 
                label={language === 'it' ? 'Processore (SoC)' : 'Processor (SoC)'}
                value={chip}
                onChange={setChip}
                optionsCategory="chips"
                defaultOptions={DEFAULT_CHIPS}
                isReadOnly={isReadOnly}
                isDark={isDark}
                language={language}
              />
              
              <SmartSelector 
                label={language === 'it' ? 'Certificazione IP' : 'IP Rating'}
                value={ipRating}
                onChange={setIpRating}
                optionsCategory="ipRatings"
                defaultOptions={DEFAULT_IP_RATINGS}
                isReadOnly={isReadOnly}
                isDark={isDark}
                language={language}
              />
            </div>

            {/* RAM Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                 <label className={`block text-xs font-bold uppercase tracking-wider ${labelColor}`}>RAM</label>
                 {!isReadOnly && (
                   <button onClick={handleAddRam} className="text-xs text-pairon-mint font-bold hover:underline flex items-center gap-1">
                     <Plus size={12} /> {language === 'it' ? 'Variante' : 'Variant'}
                   </button>
                 )}
              </div>
              {rams.map((ram, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="relative flex-1">
                     <input
                        type="text"
                        value={ram.amount}
                        onChange={(e) => updateRam(index, 'amount', e.target.value)}
                        disabled={isReadOnly}
                        placeholder="es. 8, 12, 16"
                        className={`w-full p-3 rounded-xl border outline-none pl-4 ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                     />
                     <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>GB</span>
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
                        placeholder={language === 'it' ? 'Tipo (LPDDR5X)' : 'Type'}
                        language={language}
                     />
                  </div>

                  {!isReadOnly && rams.length > 1 && (
                    <button onClick={() => handleRemoveRam(index)} className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Storage Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                 <label className={`block text-xs font-bold uppercase tracking-wider ${labelColor}`}>Storage</label>
                 {!isReadOnly && (
                   <button onClick={handleAddStorage} className="text-xs text-pairon-mint font-bold hover:underline flex items-center gap-1">
                     <Plus size={12} /> {language === 'it' ? 'Variante' : 'Variant'}
                   </button>
                 )}
              </div>
              {storages.map((storage, index) => (
                <div key={index} className="flex gap-3 items-center">
                   <div className="flex-1 flex gap-2">
                      <input
                          type="text"
                          value={storage.amount}
                          onChange={(e) => updateStorage(index, 'amount', e.target.value)}
                          disabled={isReadOnly}
                          placeholder="es. 256"
                          className={`flex-1 p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                       />
                       <div className="w-24">
                         <UnitSelector 
                            value={storage.unit}
                            onChange={(val) => updateStorage(index, 'unit', val)}
                            isReadOnly={isReadOnly}
                            isDark={isDark}
                         />
                       </div>
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
                        placeholder={language === 'it' ? 'Tipo (UFS 4.0)' : 'Type'}
                        language={language}
                     />
                   </div>

                   {!isReadOnly && storages.length > 1 && (
                    <button onClick={() => handleRemoveStorage(index)} className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <hr className={`border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`} />

          {/* SECTION 4: Camera & Video */}
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Aperture className="text-pairon-mint" size={20} />
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Fotocamere</h3>
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

            <div className="space-y-4">
               {cameras.map((cam, index) => (
                 <div key={index} className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 items-start md:items-center relative ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                    {!isReadOnly && cameras.length > 1 && (
                      <button onClick={() => handleRemoveCamera(index)} className="absolute top-2 right-2 text-red-400 hover:bg-red-500/10 p-2 rounded-full">
                        <Trash2 size={16} />
                      </button>
                    )}

                    <div className="flex-1 w-full md:w-auto">
                       <SmartSelector 
                          label={language === 'it' ? 'Tipo Lente' : 'Lens Type'}
                          value={cam.type}
                          onChange={(val) => updateCamera(index, 'type', val)}
                          optionsCategory="cameraTypes"
                          defaultOptions={DEFAULT_CAMERA_TYPES}
                          isReadOnly={isReadOnly}
                          isDark={isDark}
                          language={language}
                       />
                    </div>
                    
                    <div className="w-full md:w-32">
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>MP</label>
                      <input
                          type="text"
                          value={cam.megapixels}
                          onChange={(e) => updateCamera(index, 'megapixels', e.target.value)}
                          disabled={isReadOnly}
                          placeholder="es. 50"
                          className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                       />
                    </div>

                    <div className="flex items-end pb-2">
                       <button
                        type="button"
                        onClick={() => !isReadOnly && updateCamera(index, 'hasOis', !cam.hasOis)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${cam.hasOis ? 'bg-pairon-mint text-pairon-obsidian border-pairon-mint' : (isDark ? 'bg-transparent border-white/10 text-gray-400' : 'bg-transparent border-gray-300 text-gray-500')}`}
                      >
                        OIS
                      </button>
                    </div>
                 </div>
               ))}
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
               <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${labelColor}`}>
                 <Video size={14} /> {language === 'it' ? 'Registrazione Video' : 'Video Recording'}
               </h4>
               <div className="grid grid-cols-2 gap-4 mb-4">
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
                      Max FPS
                    </label>
                    <input
                      type="text"
                      value={videoSettings.maxFrameRate}
                      onChange={(e) => updateVideo('maxFrameRate', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="es. 60fps"
                      className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                    />
                  </div>
               </div>
               <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => !isReadOnly && updateVideo('hasHdr', !videoSettings.hasHdr)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${videoSettings.hasHdr ? 'bg-pairon-mint text-pairon-obsidian border-pairon-mint' : (isDark ? 'bg-transparent border-white/10 text-gray-400' : 'bg-transparent border-gray-300 text-gray-500')}`}
                  >
                    HDR Video
                  </button>
                  <button
                    type="button"
                    onClick={() => !isReadOnly && updateVideo('hasDolbyVision', !videoSettings.hasDolbyVision)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${videoSettings.hasDolbyVision ? 'bg-pairon-mint text-pairon-obsidian border-pairon-mint' : (isDark ? 'bg-transparent border-white/10 text-gray-400' : 'bg-transparent border-gray-300 text-gray-500')}`}
                  >
                    Dolby Vision
                  </button>
               </div>
            </div>
          </section>

          <hr className={`border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`} />

          {/* SECTION 5: Battery */}
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2">
              <BatteryMedium className="text-pairon-mint" size={20} />
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Batteria & Ricarica</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                   {language === 'it' ? 'Capacità (mAh)' : 'Capacity (mAh)'}
                 </label>
                 <input
                    type="text"
                    value={batteryCapacity}
                    onChange={(e) => setBatteryCapacity(e.target.value)}
                    disabled={isReadOnly}
                    placeholder="es. 5000"
                    className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                 />
                 <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => !isReadOnly && setIsSiliconCarbon(!isSiliconCarbon)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${isSiliconCarbon ? 'bg-pairon-mint/20 border-pairon-mint text-pairon-mint' : (isDark ? 'border-white/10 text-gray-500' : 'border-gray-200 text-gray-500')}`}
                    >
                       Silicon-Carbon Tech
                    </button>
                 </div>
               </div>

               <div>
                 <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                   {language === 'it' ? 'Ricarica Cablata' : 'Wired Charging'}
                 </label>
                 <div className="relative">
                   <Zap size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
                   <input
                      type="text"
                      value={wiredCharging}
                      onChange={(e) => setWiredCharging(e.target.value)}
                      disabled={isReadOnly}
                      placeholder="es. 80W"
                      className={`w-full p-3 pl-10 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                   />
                 </div>
               </div>
            </div>

            <div className={`p-4 rounded-2xl border space-y-4 ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
               <div className="flex items-center justify-between">
                  <span className={`font-bold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Wireless Charging</span>
                  <button 
                    type="button"
                    onClick={() => !isReadOnly && setHasWireless(!hasWireless)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasWireless ? 'bg-pairon-mint' : 'bg-gray-600'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasWireless ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
               </div>
               {hasWireless && (
                 <div className="animate-fade-in">
                    <input
                      type="text"
                      value={wirelessCharging}
                      onChange={(e) => setWirelessCharging(e.target.value)}
                      disabled={isReadOnly}
                      placeholder={language === 'it' ? "Velocità (es. 50W)" : "Speed (e.g. 50W)"}
                      className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                   />
                 </div>
               )}

               <div className="border-t border-gray-500/20 pt-4 flex items-center justify-between">
                  <span className={`font-bold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Reverse Charging</span>
                  <button 
                    type="button"
                    onClick={() => !isReadOnly && setHasReverse(!hasReverse)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasReverse ? 'bg-pairon-mint' : 'bg-gray-600'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasReverse ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
               </div>
               {hasReverse && (
                 <div className="animate-fade-in">
                    <input
                      type="text"
                      value={reverseCharging}
                      onChange={(e) => setReverseCharging(e.target.value)}
                      disabled={isReadOnly}
                      placeholder={language === 'it' ? "Velocità (es. 10W)" : "Speed (e.g. 10W)"}
                      className={`w-full p-3 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                   />
                 </div>
               )}
            </div>
          </section>
          
          <hr className={`border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`} />

          {/* SECTION 6: Features & Biometrics */}
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Features & {language === 'it' ? 'Biometria' : 'Biometrics'}</h3>
            
            <div className="flex flex-wrap gap-3">
               <button
                  type="button"
                  onClick={() => !isReadOnly && setHasStereo(!hasStereo)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all border ${hasStereo ? getToggleBtnStyle(true) : getToggleBtnStyle(false)}`}
               >
                  <Volume2 size={18} /> Stereo Speakers
               </button>
               <button
                  type="button"
                  onClick={() => !isReadOnly && setHasJack(!hasJack)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all border ${hasJack ? getToggleBtnStyle(true) : getToggleBtnStyle(false)}`}
               >
                  <RefreshCcw size={18} className="rotate-90" /> 3.5mm Jack
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Fingerprint */}
               <div className={`p-4 rounded-2xl border space-y-3 ${hasFingerprint ? (isDark ? 'border-pairon-mint/30 bg-pairon-mint/5' : 'border-pairon-mint/30 bg-pairon-mint/5') : (isDark ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50')}`}>
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-2">
                        <Fingerprint size={20} className={hasFingerprint ? 'text-pairon-mint' : 'text-gray-400'} />
                        <span className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Fingerprint</span>
                     </div>
                     <button 
                        type="button"
                        onClick={() => !isReadOnly && setHasFingerprint(!hasFingerprint)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasFingerprint ? 'bg-pairon-mint' : 'bg-gray-600'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasFingerprint ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                  </div>
                  {hasFingerprint && (
                     <SmartSelector 
                        label=""
                        value={fingerprintType}
                        onChange={setFingerprintType}
                        optionsCategory="fingerprintTypes"
                        defaultOptions={DEFAULT_FINGERPRINT_TYPES}
                        isReadOnly={isReadOnly}
                        isDark={isDark}
                        placeholder={language === 'it' ? 'Tipo (es. Ultrasonico)' : 'Type'}
                        language={language}
                     />
                  )}
               </div>

               {/* Face ID */}
               <div className={`p-4 rounded-2xl border space-y-3 ${hasFaceId ? (isDark ? 'border-pairon-mint/30 bg-pairon-mint/5' : 'border-pairon-mint/30 bg-pairon-mint/5') : (isDark ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50')}`}>
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-2">
                        <ScanFace size={20} className={hasFaceId ? 'text-pairon-mint' : 'text-gray-400'} />
                        <span className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Face Unlock</span>
                     </div>
                     <button 
                        type="button"
                        onClick={() => !isReadOnly && setHasFaceId(!hasFaceId)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasFaceId ? 'bg-pairon-mint' : 'bg-gray-600'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasFaceId ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                  </div>
                  {hasFaceId && (
                     <SmartSelector 
                        label=""
                        value={faceIdType}
                        onChange={setFaceIdType}
                        optionsCategory="faceIdTypes"
                        defaultOptions={DEFAULT_FACEID_TYPES}
                        isReadOnly={isReadOnly}
                        isDark={isDark}
                        placeholder={language === 'it' ? 'Tipo (es. 3D)' : 'Type'}
                        language={language}
                     />
                  )}
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex items-center gap-2 mb-2">
                  <Activity size={18} className="text-pairon-mint" />
                  <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                     {language === 'it' ? 'Feedback Aptico (Vibrazione)' : 'Haptics'}
                  </span>
               </div>
               <SmartSelector 
                  label=""
                  value={haptics}
                  onChange={setHaptics}
                  optionsCategory="haptics"
                  defaultOptions={language === 'it' ? DEFAULT_HAPTICS_IT : DEFAULT_HAPTICS_EN}
                  isReadOnly={isReadOnly}
                  isDark={isDark}
                  language={language}
               />
            </div>
          </section>

          <hr className={`border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`} />

          {/* SECTION 7: Software */}
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
             <div className="flex items-center gap-2">
               <AppWindow className="text-pairon-mint" size={20} />
               <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Software</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SmartSelector 
                  label="OS Version"
                  value={os}
                  onChange={setOs}
                  optionsCategory="osVersions"
                  defaultOptions={DEFAULT_OS_VERSIONS}
                  isReadOnly={isReadOnly}
                  isDark={isDark}
                  placeholder="es. Android 14"
                  language={language}
                />

                <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                   <div className="flex justify-between items-center">
                      <span className={`font-bold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                         {language === 'it' ? 'Interfaccia Custom' : 'Custom UI'}
                      </span>
                      <button 
                        type="button"
                        onClick={() => !isReadOnly && setHasCustomUi(!hasCustomUi)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasCustomUi ? 'bg-pairon-mint' : 'bg-gray-600'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasCustomUi ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                   </div>
                   {hasCustomUi && (
                      <SmartSelector 
                        label=""
                        value={customUi}
                        onChange={setCustomUi}
                        optionsCategory="uiVersions"
                        defaultOptions={DEFAULT_UI_VERSIONS}
                        isReadOnly={isReadOnly}
                        isDark={isDark}
                        placeholder="es. One UI 6.1"
                        language={language}
                      />
                   )}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                    Major Updates
                  </label>
                  <div className="relative">
                    <Layers size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                        type="text"
                        value={majorUpdates}
                        onChange={(e) => setMajorUpdates(e.target.value)}
                        disabled={isReadOnly}
                        placeholder={language === 'it' ? "Anni (es. 4)" : "Years (e.g. 4)"}
                        className={`w-full p-3 pl-10 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                    Security Patches
                  </label>
                  <div className="relative">
                    <Layers size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                        type="text"
                        value={securityPatches}
                        onChange={(e) => setSecurityPatches(e.target.value)}
                        disabled={isReadOnly}
                        placeholder={language === 'it' ? "Anni (es. 5)" : "Years (e.g. 5)"}
                        className={`w-full p-3 pl-10 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                    />
                  </div>
                </div>
             </div>
          </section>

          <hr className={`border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`} />

          {/* SECTION 8: Availability */}
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.35s' }}>
             <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
               {language === 'it' ? 'Lancio & Prezzo' : 'Launch & Price'}
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                    {language === 'it' ? 'Data di Uscita' : 'Release Date'}
                  </label>
                  <div className="relative">
                    <Calendar size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                        type="date"
                        value={launchDate}
                        onChange={(e) => setLaunchDate(e.target.value)}
                        disabled={isReadOnly}
                        className={`w-full p-3 pl-10 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                    {language === 'it' ? 'Prezzo Listino' : 'Launch Price'}
                  </label>
                  <div className="relative">
                    <CurrencyIcon />
                    <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        disabled={isReadOnly}
                        placeholder="es. 999"
                        className={`w-full p-3 pl-10 rounded-xl border outline-none ${!isReadOnly && 'focus:ring-1 focus:ring-pairon-mint'} ${inputBg} ${isReadOnly ? 'border-transparent' : ''}`}
                    />
                  </div>
                </div>
             </div>
          </section>

          <hr className={`border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`} />

          {/* SECTION 9: Pros & Cons */}
          <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
             <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
               Pros & Cons (Opzionale)
             </h3>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pros */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-200'}`}>
                   <h4 className="font-bold text-green-500 mb-3 flex items-center gap-2">
                     <ThumbsUp size={18} /> PROS
                   </h4>
                   <ul className="space-y-2 mb-3">
                      {pros.map((p, idx) => (
                        <li key={idx} className="flex justify-between items-start text-sm">
                           <span className={`flex-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>• {p}</span>
                           {!isReadOnly && (
                             <button onClick={() => handleRemovePro(idx)} className="text-red-400 hover:text-red-500 ml-2">
                               <X size={14} />
                             </button>
                           )}
                        </li>
                      ))}
                   </ul>
                   {!isReadOnly && (
                     <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={newPro}
                          onChange={(e) => setNewPro(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddPro()}
                          placeholder={language === 'it' ? "Aggiungi pro..." : "Add pro..."}
                          className={`flex-1 text-sm bg-transparent border-b border-green-500/30 outline-none py-1 ${isDark ? 'text-white placeholder-gray-600' : 'text-black placeholder-gray-400'}`}
                        />
                        <button onClick={handleAddPro} className="text-green-500 hover:text-green-400">
                           <Plus size={18} />
                        </button>
                     </div>
                   )}
                </div>

                {/* Cons */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
                   <h4 className="font-bold text-red-500 mb-3 flex items-center gap-2">
                     <ThumbsDown size={18} /> CONS
                   </h4>
                   <ul className="space-y-2 mb-3">
                      {cons.map((c, idx) => (
                        <li key={idx} className="flex justify-between items-start text-sm">
                           <span className={`flex-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>• {c}</span>
                           {!isReadOnly && (
                             <button onClick={() => handleRemoveCon(idx)} className="text-red-400 hover:text-red-500 ml-2">
                               <X size={14} />
                             </button>
                           )}
                        </li>
                      ))}
                   </ul>
                   {!isReadOnly && (
                     <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={newCon}
                          onChange={(e) => setNewCon(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddCon()}
                          placeholder={language === 'it' ? "Aggiungi contro..." : "Add con..."}
                          className={`flex-1 text-sm bg-transparent border-b border-red-500/30 outline-none py-1 ${isDark ? 'text-white placeholder-gray-600' : 'text-black placeholder-gray-400'}`}
                        />
                        <button onClick={handleAddCon} className="text-red-500 hover:text-red-400">
                           <Plus size={18} />
                        </button>
                     </div>
                   )}
                </div>
             </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default AddSmartphonePage;
