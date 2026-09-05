import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, getRedirectResult, sendPasswordResetEmail as firebaseSendPasswordResetEmail, signInAnonymously, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase authentication is not configured');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch {
      await signInWithRedirect(auth, provider);
      return null;
    }
  }

  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function sendPasswordResetEmail(email: string) {
  if (!auth) throw new Error('Firebase authentication is not configured');
  await firebaseSendPasswordResetEmail(auth, email);
}

export async function signInWithEmailPassword(email: string, password: string) {
  if (!auth) throw new Error('Firebase authentication is not configured');
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function getGoogleRedirectUser() {
  if (!auth) return null;
  const result = await getRedirectResult(auth);
  if (result?.user) return result.user;
  return auth.currentUser || null;
}

export async function ensureFirebaseAuth() {
  if (!auth) return false;
  if (!auth.currentUser) await signInAnonymously(auth);
  return true;
}
