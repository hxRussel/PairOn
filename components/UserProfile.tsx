
import React, { useState, useEffect, useRef } from 'react';
import { auth, updateUserProfile, setUserPremiumStatus, subscribeToUserSettings, UserSettings, uploadProfileImage, saveUserProfileImage, subscribeToUserProfileImage } from '../services/firebase';
import { Loader } from './Loader';
import { X, User, Camera, Crown, Check, X as XIcon, Shield, Code, AlertTriangle, Lock, Trash2, Cloud } from 'lucide-react';
import { Language } from '../types';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  isDark: boolean;
  language: Language;
  isGuest?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose, onLogout, isDark, language, isGuest = false }) => {
  const user = auth.currentUser;
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  // newPhotoURL holds the "preview" (could be base64 from file upload or existing URL)
  const [newPhotoURL, setNewPhotoURL] = useState(user?.photoURL || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>({ isPremium: false });
  
  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      setNewName(user.displayName || '');
      setUploadError(null);
      
      // Listen to settings
      const unsubscribeSettings = subscribeToUserSettings(user.uid, (settings) => {
        setUserSettings(settings);
      });

      // Listen to Profile Image from Firestore (overrides Auth photoURL)
      const unsubscribeProfile = subscribeToUserProfileImage(user.uid, (base64) => {
         if (base64) {
            setNewPhotoURL(base64);
         } else {
            setNewPhotoURL(user.photoURL || '');
         }
      });

      return () => {
        unsubscribeSettings();
        unsubscribeProfile();
      };
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const t = {
    it: {
      title: "Profilo Utente",
      nicknamePlaceholder: "Nickname",
      save: "Salva Modifiche",
      cancel: "Annulla",
      editProfile: "Modifica Profilo",
      guestMode: "Modalità Ospite - Sola Lettura",
      guestAccess: "Accesso Guest",
      accountStatus: "Stato Account",
      devSwitch: "Dev Switch:",
      free: "Free",
      current: "Attuale",
      premium: "Premium",
      active: "Attivo",
      becomePremium: "Diventa Premium",
      logout: "Logout",
      features: {
        maxPhones: "Max 10 Smartphone salvati",
        maxCompare: "Confronta max 6 dispositivi",
        cloudSave: "Salvataggio Cloud",
        noAds: "Nessuna pubblicità",
        aiFeatures: "Assistente AI",
        infPhones: "Smartphone infiniti",
        maxComparePremium: "Confronta fino a 12 dispositivi",
        aiAssistant: "Assistente AI"
      },
      uploadError: "Impossibile caricare l'immagine.",
      uploadGenericError: "Errore caricamento.",
      guestNoPhoto: "Immagine bloccata per Ospiti",
      guestRestrictedMsg: "Gli utenti ospiti non possono modificare l'immagine del profilo e non possono aggiungere foto agli smartphone."
    },
    en: {
      title: "User Profile",
      nicknamePlaceholder: "Nickname",
      save: "Save Changes",
      cancel: "Cancel",
      editProfile: "Edit Profile",
      guestMode: "Guest Mode - Read Only",
      guestAccess: "Guest Access",
      accountStatus: "Account Status",
      devSwitch: "Dev Switch:",
      free: "Free",
      current: "Current",
      premium: "Premium",
      active: "Active",
      becomePremium: "Go Premium",
      logout: "Logout",
      features: {
        maxPhones: "Max 10 saved Smartphones",
        maxCompare: "Compare max 6 devices",
        cloudSave: "Cloud Data Save",
        noAds: "No ads",
        aiFeatures: "AI Assistant",
        infPhones: "Unlimited Smartphones",
        maxComparePremium: "Compare up to 12 devices",
        aiAssistant: "AI Assistant"
      },
      uploadError: "Unable to upload image.",
      uploadGenericError: "Upload error.",
      guestNoPhoto: "Image locked for Guests",
      guestRestrictedMsg: "Guest users cannot change profile picture and cannot add photos to smartphones."
    }
  };

  const text = t[language];

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Update Name in Auth
      await updateUserProfile(newName);
      
      // 2. Update Image in Firestore
      if (!isGuest) {
          // If it's a new base64 upload OR if it's explicitly empty (user deleted it), save it.
          if (newPhotoURL === '' || newPhotoURL.startsWith('data:image')) {
             await saveUserProfileImage(user.uid, newPhotoURL);
          }
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert(language === 'it' ? "Errore durante l'aggiornamento del profilo." : "Error updating profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoClick = () => {
    if (isGuest) {
      setUploadError(text.guestRestrictedMsg);
      return;
    }
    if (!isEditing) return;
    setUploadError(null);
    // Trigger file input click
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    if (!isEditing || isGuest) return;
    setNewPhotoURL('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || isGuest) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Now returns a Base64 string
      const base64 = await uploadProfileImage(user.uid, file);
      setNewPhotoURL(base64);
    } catch (error: any) {
      console.error("Upload failed:", error);
      setUploadError(text.uploadGenericError);
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const togglePremium = async () => {
    if (!user) return;
    // Toggle logic for dev purposes
    await setUserPremiumStatus(user.uid, !userSettings.isPremium);
  };

  const PlanFeature = ({ text, included }: { text: string, included: boolean }) => (
    <div className={`flex items-center gap-2 text-sm ${included ? (isDark ? 'text-white' : 'text-gray-800') : 'text-gray-400 line-through'}`}>
      {included ? <Check size={16} className="text-pairon-mint" /> : <XIcon size={16} className="text-red-400" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col ${isDark ? 'bg-pairon-obsidian border border-white/10' : 'bg-white border border-gray-200'}`}>
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-white/5">
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-pairon-obsidian'}`}>{text.title}</h2>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Profile Info Section */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="relative group">
                <div 
                  className={`w-24 h-24 rounded-full overflow-hidden border-4 ${isDark ? 'border-pairon-surface' : 'border-gray-100'} shadow-lg ${isEditing ? 'cursor-pointer' : ''} relative`}
                  onClick={handlePhotoClick}
                >
                   {isUploading ? (
                      <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                        <Loader className="animate-spin w-8 h-8 text-pairon-mint" />
                      </div>
                   ) : newPhotoURL ? (
                     <img src={newPhotoURL} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                       <User size={40} />
                     </div>
                   )}

                   {/* Guest Lock Overlay */}
                   {isGuest && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Lock size={24} className="text-white/70" />
                      </div>
                   )}
                </div>
                
                {/* Hover Effect for Camera */}
                {!isGuest && isEditing && !isUploading && (
                  <div 
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={handlePhotoClick}
                  >
                    <Camera className="text-white" size={24} />
                  </div>
                )}
                
                {/* Trash Icon for Deletion */}
                {isEditing && !isGuest && newPhotoURL && (
                   <button
                     onClick={handleRemovePhoto}
                     className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors z-20"
                     title="Rimuovi foto"
                   >
                     <Trash2 size={14} />
                   </button>
                )}
              </div>
              
              {/* Error Message Display */}
              {uploadError && (
                <div className="text-red-500 text-xs text-center max-w-[200px] flex flex-col items-center justify-center gap-1 animate-fade-in bg-red-500/10 px-2 py-2 rounded-md">
                  <div className="flex items-center gap-1">
                    <AlertTriangle size={12} />
                    <span className="font-bold">Error</span>
                  </div>
                  <span>{uploadError}</span>
                </div>
              )}
              
              {/* Guest Warning Label */}
              {isGuest && isEditing && !uploadError && (
                 <span className="text-xs text-yellow-500 font-medium mt-1">{text.guestNoPhoto}</span>
              )}
            </div>

            <div className="flex-1 w-full text-center md:text-left">
              {isEditing ? (
                <div className="space-y-3">
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={text.nicknamePlaceholder}
                    className={`w-full p-2 rounded-lg border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                  
                  <div className="flex gap-2 justify-center md:justify-start mt-2">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isLoading || isUploading}
                      className="px-4 py-2 bg-pairon-mint text-pairon-obsidian font-bold rounded-lg text-sm hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : text.save}
                    </button>
                    <button 
                      onClick={() => { 
                        setIsEditing(false); 
                        setNewName(user?.displayName || ''); 
                        // Reset preview
                        setUploadError(null);
                        // Re-fetch or reset photo state (subscription will handle it if not saved, but explicit reset here is good UI)
                        // Just closing edit mode is enough as useEffect will re-sync if needed, but let's just hide input.
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      {text.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.displayName || 'User'}</h3>
                    {userSettings.isPremium && <Crown size={20} className="text-yellow-400 fill-yellow-400" />}
                  </div>
                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email || text.guestAccess}</p>
                  
                  <button 
                    onClick={() => setIsEditing(true)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    {text.editProfile}
                  </button>

                  {isGuest && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-500 text-xs font-medium">
                      <AlertTriangle size={10} />
                      {text.guestMode}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <hr className={`border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`} />

          {/* Subscription Status */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <Shield size={18} className="text-pairon-indigo" />
                {text.accountStatus}
              </h4>
              
              {/* Dev Toggle */}
              <div className="flex items-center gap-2">
                <Code size={14} className="text-gray-500" />
                <span className="text-[10px] text-gray-500 uppercase font-bold">{text.devSwitch}</span>
                <button 
                  onClick={togglePremium}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${userSettings.isPremium ? 'bg-pairon-mint' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userSettings.isPremium ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Free Tier Card */}
              <div className={`p-5 rounded-xl border-2 ${!userSettings.isPremium ? 'border-pairon-indigo bg-pairon-indigo/10' : (isDark ? 'border-white/5 bg-white/5 opacity-50' : 'border-gray-100 bg-gray-50 opacity-60')}`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{text.free}</span>
                  {!userSettings.isPremium && <span className="text-xs bg-pairon-indigo text-white px-2 py-1 rounded-md">{text.current}</span>}
                </div>
                <div className="space-y-2">
                  <PlanFeature text={text.features.maxPhones} included={true} />
                  <PlanFeature text={text.features.maxCompare} included={true} />
                  <PlanFeature text={text.features.cloudSave} included={true} />
                  <PlanFeature text={text.features.noAds} included={true} />
                  <PlanFeature text={text.features.aiFeatures} included={false} />
                </div>
              </div>

              {/* Premium Tier Card */}
              <div className={`p-5 rounded-xl border-2 relative overflow-hidden ${userSettings.isPremium ? 'border-pairon-mint bg-pairon-mint/10' : (isDark ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50')}`}>
                {userSettings.isPremium && (
                  <div className="absolute -right-12 top-4 bg-pairon-mint text-pairon-obsidian text-[10px] font-bold px-12 py-1 rotate-45 shadow-sm z-10">
                    PREMIUM
                  </div>
                )}
                <div className="flex items-center justify-start mb-3 gap-2">
                  <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{text.premium}</span>
                  {userSettings.isPremium && <span className="text-xs bg-pairon-mint text-pairon-obsidian px-2 py-1 rounded-md font-bold">{text.active}</span>}
                </div>
                <div className="space-y-2">
                  <PlanFeature text={text.features.infPhones} included={true} />
                  <PlanFeature text={text.features.maxComparePremium} included={true} />
                  <PlanFeature text={text.features.cloudSave} included={true} />
                  <PlanFeature text={text.features.noAds} included={true} />
                  <PlanFeature text={text.features.aiAssistant} included={true} />
                </div>
                
                {!userSettings.isPremium && (
                  <button className="w-full mt-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors">
                    {text.becomePremium}
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={`p-6 border-t mt-auto ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
          <button 
            onClick={onLogout}
            className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold transition-all flex items-center justify-center gap-2"
          >
            {text.logout}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;
