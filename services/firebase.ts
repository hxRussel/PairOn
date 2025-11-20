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
  serverTimestamp 
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

// --- Firestore Data Services ---

export interface PhoneData {
  id?: string;
  model: string;
  brand: string;
  color: string;
  battery: string;
  chip: string;
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

// Remove a smartphone
export const removeSmartphone = async (userId: string, phoneId: string) => {
  await deleteDoc(doc(db, `users/${userId}/smartphones`, phoneId));
};

export { auth, db };