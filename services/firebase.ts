import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google", error);
    
    if (error.code === 'auth/unauthorized-domain') {
      const domain = window.location.hostname || window.location.host;
      
      // Se siamo in un ambiente sandbox (come AI Studio preview) dove hostname spesso è vuoto o 'localhost' ma mascherato
      if (!domain || domain === 'localhost' && window.location.href.includes('webcontainer')) {
         throw new Error(
          "Impossibile verificare il dominio in questo ambiente di anteprima (Sandbox).\n\n" +
          "SOLUZIONE:\n" +
          "Per testare il Login con Google, devi effettuare il deploy dell'applicazione (es. su Vercel) e autorizzare il dominio pubblico ottenuto."
        );
      }
      
      // Se non viene rilevato nulla di specifico (stringa vuota)
      if (!domain) {
        throw new Error(
          "Impossibile rilevare il dominio corrente.\n\n" +
          "SOLUZIONE:\n" +
          "Effettua il deploy dell'applicazione (es. su Vercel) per ottenere un dominio valido da autorizzare."
        );
      }

      // Errore standard con il dominio rilevato
      throw new Error(
        `Dominio non autorizzato: ${domain}\n\n` +
        "ISTRUZIONI:\n" +
        "1. Copia il dominio qui sopra.\n" +
        "2. Vai su Firebase Console > Authentication > Settings > Authorized Domains.\n" +
        "3. Clicca 'Add Domain' e incollalo."
      );
    }
    
    throw error;
  }
};

export { auth, db };