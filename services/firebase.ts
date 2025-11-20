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
  getDoc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

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
const storage = getStorage(app);

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
  battery?: string; 

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
}

export interface UserSettings {
  isPremium: boolean;
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
      callback({ isPremium: false });
    }
  });
};

export const setUserPremiumStatus = async (userId: string, isPremium: boolean) => {
  await setDoc(doc(db, `users/${userId}/settings/preferences`), {
    isPremium
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
        cameraTypes: []
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

// --- Storage Services ---

export const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
  // Create a reference to 'users/USER_ID/profile_TIMESTAMP'
  const fileName = `profile_${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `users/${userId}/${fileName}`);
  
  // Upload file with metadata
  const metadata = {
    contentType: file.type,
  };
  
  const snapshot = await uploadBytes(storageRef, file, metadata);
  
  // Get download URL
  return await getDownloadURL(snapshot.ref);
};

export const uploadSmartphoneImage = async (userId: string, file: File): Promise<string> => {
  const fileName = `phone_${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `users/${userId}/devices/${fileName}`);
  
  const metadata = { contentType: file.type };
  const snapshot = await uploadBytes(storageRef, file, metadata);
  return await getDownloadURL(snapshot.ref);
};

export { auth, db, storage };