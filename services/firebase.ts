import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  onSnapshot, 
  orderBy,
  serverTimestamp,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIies5qSzApDItwY2ywOKf0gfPa94Fmo0",
  authDomain: "pairon-e3420.firebaseapp.com",
  projectId: "pairon-e3420",
  storageBucket: "pairon-e3420.firebasestorage.app",
  messagingSenderId: "354756073950",
  appId: "1:354756073950:web:c9e032319a7debb941e54f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// Storage removed due to region limitations on free tier
// const storage = getStorage(app); 

const googleProvider = new GoogleAuthProvider();

// --- Authentication Services ---

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google", error);
    
    if (error.code === 'auth/unauthorized-domain') {
      const domain = window.location.hostname || window.location.host;
      
      if (!domain || (domain === 'localhost' && window.location.href.includes('webcontainer'))) {
         throw new Error(
          "Impossibile verificare il dominio in questo ambiente di anteprima (Sandbox).\n\n" +
          "SOLUZIONE:\n" +
          "Per testare il Login con Google, devi effettuare il deploy dell'applicazione."
        );
      }
      
      throw new Error(
        `Dominio non autorizzato: ${domain}\n\n` +
        "Vai su Firebase Console > Authentication > Settings > Authorized Domains e aggiungilo."
      );
    }
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string, name: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(userCredential.user, { displayName: name });
  return userCredential.user;
};

export const loginWithEmail = async (email: string, pass: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
};

export const resetUserPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const updateUserProfile = async (name: string, photoURL: string): Promise<void> => {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, {
      displayName: name,
      photoURL: photoURL
    });
  }
};

// --- Firestore Data Services ---

export interface RamVariant {
  amount: string;
  type: string;
}

export interface StorageVariant {
  amount: string;
  unit: 'GB' | 'TB'; 
  type: string;
}

export interface Display {
  type: string;
  size: string;
  resolution: string;
  refreshRate: string;
  brightness: string;
  hasHdr: boolean;
  hasDolbyVision: boolean;
}

export interface Camera {
  type: string; // e.g., "Main", "Ultra-wide", "Telephoto"
  megapixels: string;
  hasOis: boolean;
}

export interface VideoSettings {
  maxResolution: string; // e.g. "8K", "4K"
  maxFrameRate: string; // e.g. "60fps", "120fps"
  hasHdr: boolean;
  hasDolbyVision: boolean;
}

export interface Battery {
  capacity: string; // e.g. "5000 mAh"
  isSiliconCarbon: boolean;
  wiredCharging: string; // e.g. "80W"
  hasWireless: boolean;
  wirelessCharging?: string; // e.g. "50W"
  hasReverse: boolean;
  reverseCharging?: string; // e.g. "10W"
}

export interface PhoneData {
  id?: string;
  model: string;
  brand: string;
  color: string; // Gradient class string
  imageUrl?: string;
  
  // Hardware
  chip: string;
  ram: RamVariant[];
  storage: StorageVariant[];
  ipRating: string;
  
  // Battery
  battery: Battery;

  // Features
  hasStereo: boolean;
  hasJack: boolean;
  
  // Display
  displays: Display[];

  // Cameras & Video
  cameras: Camera[];
  video: VideoSettings;

  // Biometrics
  hasFingerprint: boolean;
  fingerprintType?: string; 
  hasFaceId: boolean;
  faceIdType?: string; // "2D" or "3D"
  
  // Haptics
  haptics: string; 

  // Software
  os: string;
  hasCustomUi: boolean;
  customUi?: string;
  majorUpdates: string;
  securityPatches: string;

  // Availability
  launchDate: string;
  price: string;

  // Pros & Cons
  pros?: string[];
  cons?: string[];
}

export interface UserSettings {
  isPremium: boolean;
  currency?: string;
}

export interface CustomOptions {
  brands: string[];
  chips: string[];
  ramTypes: string[];
  storageTypes: string[];
  haptics: string[];
  fingerprintTypes: string[];
  faceIdTypes: string[];
  displayTypes: string[];
  cameraTypes: string[];
  uiVersions: string[]; 
  ipRatings: string[];
  osVersions: string[];
}

// Subscribe to the current user's smartphone collection
export const subscribeToSmartphones = (userId: string, callback: (phones: PhoneData[]) => void) => {
  const q = query(
    collection(db, `users/${userId}/smartphones`),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const phones = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PhoneData));
    callback(phones);
  });
};

// Add a smartphone to the user's collection
export const addSmartphone = async (userId: string, phone: Omit<PhoneData, 'id'>) => {
  await addDoc(collection(db, `users/${userId}/smartphones`), {
    ...phone,
    createdAt: serverTimestamp()
  });
};

// Update an existing smartphone
export const updateSmartphone = async (userId: string, phoneId: string, phone: Partial<PhoneData>) => {
  const docRef = doc(db, `users/${userId}/smartphones`, phoneId);
  await updateDoc(docRef, {
    ...phone,
    updatedAt: serverTimestamp()
  });
};

// Remove a smartphone
export const removeSmartphone = async (userId: string, phoneId: string) => {
  await deleteDoc(doc(db, `users/${userId}/smartphones`, phoneId));
};

// --- Subscription / User Settings ---

export const subscribeToUserSettings = (userId: string, callback: (settings: UserSettings) => void) => {
  const docRef = doc(db, `users/${userId}/settings/preferences`);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as UserSettings);
    } else {
      // Default settings if document doesn't exist
      callback({ isPremium: false, currency: 'EUR' });
    }
  });
};

export const setUserPremiumStatus = async (userId: string, isPremium: boolean) => {
  await setDoc(doc(db, `users/${userId}/settings/preferences`), {
    isPremium
  }, { merge: true });
};

export const setUserCurrency = async (userId: string, currency: string) => {
  await setDoc(doc(db, `users/${userId}/settings/preferences`), {
    currency
  }, { merge: true });
};

// --- Custom Options Management ---

export const subscribeToCustomOptions = (userId: string, callback: (options: CustomOptions) => void) => {
  const docRef = doc(db, `users/${userId}/settings/customOptions`);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as CustomOptions);
    } else {
      callback({ 
        brands: [], 
        chips: [], 
        ramTypes: [], 
        storageTypes: [], 
        haptics: [],
        fingerprintTypes: [],
        faceIdTypes: [],
        displayTypes: [],
        cameraTypes: [],
        uiVersions: [],
        ipRatings: [],
        osVersions: []
      });
    }
  });
};

export const addCustomOption = async (userId: string, category: keyof CustomOptions, value: string) => {
  const docRef = doc(db, `users/${userId}/settings/customOptions`);
  await setDoc(docRef, {
    [category]: arrayUnion(value)
  }, { merge: true });
};

export const removeCustomOption = async (userId: string, category: keyof CustomOptions, value: string) => {
  const docRef = doc(db, `users/${userId}/settings/customOptions`);
  await setDoc(docRef, {
    [category]: arrayRemove(value)
  }, { merge: true });
};

// --- Image Handling Services (Base64 Strategy) ---

// Helper: Compress image and convert to Base64
// This avoids using Firebase Storage which requires a paid plan or specific region
const compressAndConvertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Max dimensions for compression
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to Base64 JPEG with 0.7 quality
        // This ensures the string fits within Firestore document limits (1MB)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(new Error("Failed to load image for compression"));
    };
    reader.onerror = (err) => reject(new Error("Failed to read file"));
  });
};

export const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
  // Previously used Storage, now uses direct Base64 compression
  return await compressAndConvertToBase64(file);
};

export const uploadSmartphoneImage = async (userId: string, file: File): Promise<string> => {
  // Previously used Storage, now uses direct Base64 compression
  return await compressAndConvertToBase64(file);
};

export { auth, db };