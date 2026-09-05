import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, getRedirectResult, onAuthStateChanged, RecaptchaVerifier, sendEmailVerification, sendPasswordResetEmail as firebaseSendPasswordResetEmail, signInAnonymously, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signInWithPhoneNumber as firebaseSignInWithPhoneNumber, signOut as firebaseSignOut, updateProfile, type ConfirmationResult, type User } from 'firebase/auth';
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

export async function signInWithGoogle(emailHint?: string) {
  if (!auth) throw new Error('Firebase authentication is not configured');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
    ...(emailHint ? { login_hint: emailHint } : {}),
  });
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

export async function registerWithEmailPassword(email: string, password: string) {
  if (!auth) throw new Error('Firebase authentication is not configured');
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function sendVerificationEmail(user: User) {
  await sendEmailVerification(user);
}

export async function updateFirebaseProfile(displayName: string, photoURL?: string) {
  if (!auth?.currentUser) throw new Error('You must be signed in to update your profile');
  await updateProfile(auth.currentUser, { displayName, photoURL: photoURL || null });
  return auth.currentUser;
}

export function createPhoneRecaptcha(containerId: string) {
  if (!auth) throw new Error('Firebase authentication is not configured');
  return new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
}

export async function sendPhoneVerificationCode(phoneNumber: string, verifier: RecaptchaVerifier): Promise<ConfirmationResult> {
  if (!auth) throw new Error('Firebase authentication is not configured');
  return firebaseSignInWithPhoneNumber(auth, phoneNumber, verifier);
}

export async function signOutUser() {
  if (auth) await firebaseSignOut(auth);
}

export function subscribeToAuthState(onUser: (user: User | null) => void) {
  return auth ? onAuthStateChanged(auth, onUser) : () => undefined;
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
