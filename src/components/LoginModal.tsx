import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Eye, EyeOff, Headphones, LockKeyhole, LogOut, Mail, Package, ShieldCheck, Tag, Truck, X } from 'lucide-react';
import { registerWithEmailPassword, sendPasswordResetEmail, signInWithEmailPassword, signInWithGoogle } from '../config/firebase';
import { NeoMartLogo } from './NeoMartLogo';
import { LegalModal } from './LegalModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLoginSuccess: (identifier: string, displayName?: string, photoUrl?: string) => void | Promise<void>;
  onLogout: () => void;
  showToast: (msg: string) => void;
  isAccessBlocked?: boolean;
  accountName?: string;
  accountEmail?: string;
  accountPhotoUrl?: string;
  theme?: 'light' | 'dark';
}

const GoogleIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  isLoggedIn,
  onLoginSuccess,
  onLogout,
  showToast: parentShowToast,
  isAccessBlocked = false,
  accountName = '',
  accountEmail = '',
  accountPhotoUrl = '',
  theme = 'light',
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showResetScreen, setShowResetScreen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');
  const [showRegisterScreen, setShowRegisterScreen] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmation, setRegisterConfirmation] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [legalDocument, setLegalDocument] = useState<'terms' | 'privacy' | null>(null);

  const showToast = (message: string) => {
    if (message === 'Password reset is coming soon') {
      setResetEmail(identifier);
      setResetError('');
      setResetSent(false);
      setShowResetScreen(true);
      return;
    }
    parentShowToast(message);
  };

  useEffect(() => {
    if (!isOpen) {
      setLegalDocument(null);
      setShowResetScreen(false);
      setResetSent(false);
      setResetError('');
      setShowRegisterScreen(false);
      setRegisterError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const panelClass = isDark ? 'bg-[#1a1a1a] text-[#f3f3f3]' : 'bg-white text-[#211e1d]';
  const mutedClass = isDark ? 'text-[#bdbdbd]' : 'text-[#77716e]';
  const borderClass = isDark ? 'border-[#363636]' : 'border-[#e5e1df]';

  const handleGoogleSignIn = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event?.currentTarget.textContent?.includes('Sign up now')) {
      setRegisterEmail(identifier);
      setRegisterError('');
      setShowRegisterScreen(true);
      return;
    }
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      if (!user) return;
      const name = user.displayName || user.email?.split('@')[0] || 'Google User';
      await onLoginSuccess(user.email || user.uid, user.displayName || user.email?.split('@')[0], user.photoURL || undefined);
      showToast(`Signed in with Google as ${user.email || name}`);
      onClose();
    } catch {
      showToast('Google sign-in failed. Enable Google in Firebase, then try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (event: React.FormEvent) => {
    event.preventDefault();
    const email = registerEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setRegisterError('Enter a valid email address.');
      return;
    }
    if (registerPassword.length < 6) {
      setRegisterError('Your NeoMart password must be at least 6 characters.');
      return;
    }
    if (registerPassword !== registerConfirmation) {
      setRegisterError('The passwords do not match.');
      return;
    }
    setLoading(true);
    setRegisterError('');
    try {
      const user = await registerWithEmailPassword(email, registerPassword);
      await onLoginSuccess(user.email || user.uid, user.displayName || email.split('@')[0], user.photoURL || undefined);
      showToast('NeoMart account created successfully');
      onClose();
    } catch (error: unknown) {
      const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
      if (code === 'auth/email-already-in-use') setRegisterError('An account already exists for this email. Sign in or use Forgot Password.');
      else if (code === 'auth/operation-not-allowed') setRegisterError('Email and password accounts are not enabled yet. Please contact support.');
      else if (code === 'auth/network-request-failed') setRegisterError('Unable to connect right now. Check your internet connection and try again.');
      else setRegisterError('We could not create your account right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = identifier.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (!value || !isEmail) {
      showToast('Please enter a valid email address');
      return;
    }

    if (!password) {
      showToast('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const user = await signInWithEmailPassword(value, password);
      await onLoginSuccess(user.email || user.uid, user.displayName || value.split('@')[0], user.photoURL || undefined);
      showToast('Login successful! Welcome back');
      onClose();
    } catch (error: unknown) {
      const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        showToast('Incorrect email or password');
      } else if (code === 'auth/operation-not-allowed') {
        showToast('Email and password sign-in is not enabled yet. Please use Google sign-in or contact support.');
      } else if (code === 'auth/too-many-requests') {
        showToast('Too many attempts. Please wait a moment and try again.');
      } else if (code === 'auth/network-request-failed') {
        showToast('Unable to connect right now. Check your internet connection and try again.');
      } else {
        showToast('We could not sign you in right now. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = resetEmail.trim();

    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setResetError('Enter a valid email address to continue.');
      return;
    }

    setResetLoading(true);
    setResetError('');
    try {
      await sendPasswordResetEmail(value);
      setResetSent(true);
    } catch (error: unknown) {
      const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
      if (code === 'auth/invalid-email' || code === 'auth/missing-email') {
        setResetError('Enter a valid email address to continue.');
      } else if (code === 'auth/network-request-failed') {
        setResetError('We could not connect right now. Check your internet connection and try again.');
      } else {
        setResetError('We could not send the reset link right now. Please check the email and try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  if (isAccessBlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
        <div className={`w-full max-w-110 rounded-[30px] p-6 text-center shadow-2xl ${panelClass}`}>
          <ShieldCheck className="mx-auto h-10 w-10 text-red-500" />
          <h3 className="mt-4 text-lg font-extrabold text-red-600">Login disabled</h3>
          <p className={`mt-2 text-xs ${mutedClass}`}>Your account access has been disabled by NeoMart support.</p>
          <a href="tel:08135648242" className="mt-5 block rounded-xl bg-[#f4510b] px-4 py-3 text-xs font-bold text-white">Contact customer care: 08135648242</a>
        </div>
      </div>
    );
  }

  if (isLoggedIn) {
    const displayName = accountName || accountEmail.split('@')[0] || 'NeoMart customer';
    const initials = displayName.charAt(0).toUpperCase();

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
        <div className={`relative w-full max-w-105 rounded-3xl p-5 shadow-2xl sm:p-7 ${panelClass}`}>
          <button type="button" onClick={onClose} className={`mb-5 inline-flex items-center gap-2 text-sm font-bold transition hover:text-[#f4510b] cursor-pointer ${mutedClass}`}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className={`flex items-start gap-4 border-b pb-6 ${borderClass}`}>
            {accountPhotoUrl ? (
              <img src={accountPhotoUrl} alt="" className="h-20 w-20 shrink-0 rounded-2xl border-2 border-[#f6c58f] object-cover shadow-md" />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-[#f6c58f] bg-[#9b7c70] text-4xl font-medium text-white shadow-md">
                {initials}
              </div>
            )}
            <div className="min-w-0 pt-1">
              <h2 className={`truncate text-2xl font-black ${isDark ? 'text-white' : 'text-[#211e1d]'}`}>{displayName}</h2>
              <p className={`mt-2 flex min-w-0 items-center gap-2 text-sm ${mutedClass}`}>
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{accountEmail || 'Email not available'}</span>
              </p>
              <p className={`mt-3 text-sm leading-5 ${mutedClass}`}>NeoMart customer account</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className={`rounded-2xl p-3 ${isDark ? 'bg-[#2a211a]' : 'bg-[#fff7ef]'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#a56c3c]">Account</p>
              <p className={`mt-1 text-sm font-bold ${isDark ? 'text-white' : 'text-[#3d3733]'}`}>Active</p>
            </div>
            <div className={`rounded-2xl p-3 ${isDark ? 'bg-[#242424]' : 'bg-[#f7f7f5]'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8581]">Shopping</p>
              <p className={`mt-1 text-sm font-bold ${isDark ? 'text-white' : 'text-[#3d3733]'}`}>Orders & cart</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-emerald-700">
              <Check className="h-4 w-4" />
              Signed in securely
            </div>
            <button onClick={() => { onLogout(); showToast('Signed out of account'); onClose(); }} className="inline-flex items-center gap-2 rounded-xl border border-[#b44820]/40 px-4 py-2.5 text-sm font-bold text-[#d8693c] transition hover:bg-[#fff4ed]/10 cursor-pointer">
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showRegisterScreen) {
    return (
      <div className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center overflow-y-auto bg-[#070808] px-5 py-8 text-white sm:px-8">
        <div className="relative w-full max-w-[470px] rounded-[22px] border border-[#292929] bg-[#181919] px-5 py-8 shadow-2xl sm:px-10 sm:py-10">
          <button type="button" onClick={() => { setShowRegisterScreen(false); setRegisterError(''); }} aria-label="Back to sign in" className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#292a2a] text-[#c1c1c1] transition hover:bg-[#373838] hover:text-white"><ArrowLeft className="h-4 w-4" /></button>
          <div className="flex justify-center"><div className="flex h-14 w-14 items-center justify-center rounded-[13px] bg-[#ff6a00] shadow-[0_8px_22px_rgba(255,106,0,0.22)]"><NeoMartLogo size="lg" showText={false} /></div></div>
          <h1 className="mt-6 text-center text-[24px] font-extrabold tracking-[-0.5px]">Create your NeoMart account</h1>
          <p className="mx-auto mt-2 max-w-[340px] text-center text-[13px] leading-5 text-[#999b9b]">Create a separate NeoMart password to keep your account and orders secure.</p>
          <form onSubmit={handleRegistration} className="mt-7 space-y-3.5">
            <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#dedede]">Email address</span><span className="flex h-12 items-center gap-3 rounded-[9px] border border-[#4a4b4b] bg-[#1b1c1c] px-3 text-[#898b8b] focus-within:border-[#ff6a00]"><Mail className="h-[17px] w-[17px] shrink-0" /><input type="email" value={registerEmail} onChange={(event) => { setRegisterEmail(event.target.value); setRegisterError(''); }} placeholder="you@example.com" autoComplete="email" className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-[#888a8a]" /></span></label>
            <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#dedede]">NeoMart password</span><span className="flex h-12 items-center gap-3 rounded-[9px] border border-[#4a4b4b] bg-[#1b1c1c] px-3 text-[#898b8b] focus-within:border-[#ff6a00]"><LockKeyhole className="h-[17px] w-[17px] shrink-0" /><input type="password" value={registerPassword} onChange={(event) => { setRegisterPassword(event.target.value); setRegisterError(''); }} placeholder="At least 6 characters" autoComplete="new-password" className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-[#888a8a]" /></span></label>
            <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#dedede]">Confirm password</span><span className="flex h-12 items-center gap-3 rounded-[9px] border border-[#4a4b4b] bg-[#1b1c1c] px-3 text-[#898b8b] focus-within:border-[#ff6a00]"><LockKeyhole className="h-[17px] w-[17px] shrink-0" /><input type="password" value={registerConfirmation} onChange={(event) => { setRegisterConfirmation(event.target.value); setRegisterError(''); }} placeholder="Repeat your password" autoComplete="new-password" className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-[#888a8a]" /></span></label>
            {registerError && <p role="alert" className="text-[11px] leading-4 text-[#ff9a72]">{registerError}</p>}
            <button type="submit" disabled={loading} className="h-14 w-full rounded-[10px] bg-[#ff6a00] text-[14px] font-extrabold text-white shadow-[0_8px_18px_rgba(255,106,0,0.18)] transition hover:bg-[#e95f00] disabled:cursor-not-allowed disabled:opacity-70">{loading ? 'Creating Account...' : 'Create Account'}</button>
          </form>
          <button type="button" onClick={() => { setShowRegisterScreen(false); setRegisterError(''); }} className="mt-5 block w-full text-center text-[12px] font-bold text-[#ff6a00] hover:underline">Back to Sign In</button>
        </div>
      </div>
    );
  }

  if (showResetScreen) {
    return (
      <div className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center overflow-y-auto bg-[#070808] px-5 py-8 text-white sm:px-8">
        <div className="relative w-full max-w-[470px] rounded-[22px] border border-[#292929] bg-[#181919] px-5 py-8 shadow-2xl sm:px-10 sm:py-10">
          <button type="button" onClick={() => { setShowResetScreen(false); setResetSent(false); setResetError(''); }} aria-label="Back to sign in" className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#292a2a] text-[#c1c1c1] transition hover:bg-[#373838] hover:text-white"><ArrowLeft className="h-4 w-4" /></button>
          <div className="flex justify-center"><div className="flex h-14 w-14 items-center justify-center rounded-[13px] bg-[#ff6a00] shadow-[0_8px_22px_rgba(255,106,0,0.22)]"><NeoMartLogo size="lg" showText={false} /></div></div>
          {resetSent ? (
            <div className="text-center">
              <div className="mx-auto mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#ff6a00]/15 text-[#ff6a00]"><Check className="h-6 w-6" /></div>
              <h1 className="mt-5 text-[24px] font-extrabold tracking-[-0.5px]">Password reset link sent!</h1>
              <p className="mx-auto mt-2 max-w-[330px] text-[13px] leading-5 text-[#999b9b]">Check your email for instructions to create a new password.</p>
              <button type="button" onClick={() => { setShowResetScreen(false); setResetSent(false); setResetError(''); }} className="mt-7 h-14 w-full rounded-[10px] bg-[#ff6a00] text-[14px] font-extrabold text-white shadow-[0_8px_18px_rgba(255,106,0,0.18)] transition hover:bg-[#e95f00]">Back to Sign In</button>
            </div>
          ) : (
            <>
              <h1 className="mt-6 text-center text-[24px] font-extrabold tracking-[-0.5px]">Reset your password</h1>
              <p className="mx-auto mt-2 max-w-[340px] text-center text-[13px] leading-5 text-[#999b9b]">Enter the email address associated with your NeoMart account and we&apos;ll send you a password reset link.</p>
              <form onSubmit={handlePasswordReset} className="mt-7">
                <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#dedede]">Email address</span><span className="flex h-12 items-center gap-3 rounded-[9px] border border-[#4a4b4b] bg-[#1b1c1c] px-3 text-[#898b8b] focus-within:border-[#ff6a00]"><Mail className="h-[17px] w-[17px] shrink-0" /><input type="email" value={resetEmail} onChange={(event) => { setResetEmail(event.target.value); setResetError(''); }} placeholder="you@example.com" autoComplete="email" className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-[#888a8a]" /></span></label>
                {resetError && <p role="alert" className="mt-2 text-[11px] leading-4 text-[#ff9a72]">{resetError}</p>}
                <button type="submit" disabled={resetLoading} className="mt-5 h-14 w-full rounded-[10px] bg-[#ff6a00] text-[14px] font-extrabold text-white shadow-[0_8px_18px_rgba(255,106,0,0.18)] transition hover:bg-[#e95f00] disabled:cursor-not-allowed disabled:opacity-70">{resetLoading ? 'Sending Reset Link...' : 'Send Reset Link'}</button>
              </form>
              <button type="button" onClick={() => { setShowResetScreen(false); setResetError(''); }} className="mt-5 block w-full text-center text-[12px] font-bold text-[#ff6a00] hover:underline">Back to Sign In</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#070808] text-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] items-stretch p-0 sm:p-2 lg:p-3">
        <section className="relative hidden min-h-[calc(100dvh-24px)] flex-1 overflow-hidden rounded-[22px] border border-[#292929] bg-[#101111] px-12 py-14 lg:block xl:px-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_43%,rgba(255,106,0,0.22),transparent_31%),radial-gradient(circle_at_45%_100%,rgba(255,106,0,0.05),transparent_35%)]" />
          <div className="relative z-10 max-w-[360px]"><p className="text-[38px] font-black leading-[1.02] tracking-[-1.5px] text-[#f2f2f2]">Shop smarter.<br /><span className="text-[#ff6a00]">Live better.</span></p><p className="mt-5 text-[15px] leading-6 text-[#999b9b]">Discover the best products, unbeatable prices, and exclusive deals - all in one place.</p><div className="mt-8 space-y-4">{[[Tag, 'Best Prices', 'Find amazing deals every day.'], [ShieldCheck, 'Secure Payments', 'Your payments are safe with us.'], [Truck, 'Fast Delivery', 'Quick and reliable delivery to your door.']].map(([Icon, title, detail]) => <div key={title as string} className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#303131] bg-[#1b1c1c] text-[#ff790f]"><Icon className="h-5 w-5" /></span><span><strong className="block text-[13px] text-[#f1f1f1]">{title as string}</strong><small className="text-[11px] text-[#8d8f8f]">{detail as string}</small></span></div>)}</div></div>
          <div className="absolute right-[11%] top-[27%] h-[260px] w-[250px]"><div className="absolute bottom-2 left-0 h-20 w-56 rounded-[50%] border-t border-[#55504a] bg-[linear-gradient(180deg,#35302b,#171616)] shadow-[0_18px_35px_rgba(0,0,0,0.45)]" /><div className="absolute bottom-14 left-12 h-36 w-32 -skew-x-2 rounded-b-[18px] border border-[#3f4140] bg-[linear-gradient(110deg,#242727,#0b0c0c)] shadow-[15px_22px_26px_rgba(0,0,0,0.38)]"><span className="absolute left-1/2 top-16 -translate-x-1/2 text-[54px] font-black text-[#ff6a00]">n</span></div><div className="absolute bottom-[174px] left-[68px] h-16 w-14 rounded-t-[28px] border-[5px] border-b-0 border-[#171918]" /><div className="absolute right-[-8px] top-[-12px] h-12 w-14 rotate-[-12deg] rounded-md bg-[linear-gradient(135deg,#b8793c,#70451f)] shadow-lg" /><div className="absolute bottom-24 right-[-30px] h-14 w-16 rotate-[18deg] rounded-md bg-[linear-gradient(135deg,#8d5c31,#503116)] opacity-80 shadow-lg" /></div>
          <div className="absolute bottom-14 left-12 right-12 grid grid-cols-4 divide-x divide-[#393939] rounded-2xl border border-[#2b2c2c] bg-[#1a1b1b]/90 py-5 text-center">{[[Package, '10M+', 'Happy Customers'], [Package, '1M+', 'Products'], [ShieldCheck, '100%', 'Secure'], [Headphones, '24/7', 'Customer Support']].map(([Icon, stat, label]) => <div key={label as string} className="flex items-center justify-center gap-2"><Icon className="hidden h-5 w-5 text-[#ff790f] xl:block" /><span><strong className="block text-[15px] text-[#ff790f]">{stat as string}</strong><small className="text-[9px] text-[#8e9090]">{label as string}</small></span></div>)}</div>
        </section>
        <section className="relative flex min-h-dvh w-full items-center justify-center bg-[#181919] px-5 py-8 sm:px-10 lg:min-h-[calc(100dvh-24px)] lg:w-[42%] lg:min-w-[540px] lg:rounded-[22px] lg:border lg:border-[#292929] lg:px-11"><button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#292a2a] text-[#c1c1c1] transition hover:bg-[#373838] hover:text-white"><X className="h-5 w-5" /></button><div className="w-full max-w-[420px]"><div className="flex justify-center"><div className="flex h-14 w-14 items-center justify-center rounded-[13px] bg-[#ff6a00] shadow-[0_8px_22px_rgba(255,106,0,0.22)]"><NeoMartLogo size="lg" showText={false} /></div></div><h1 className="mt-4 text-center text-[24px] font-extrabold tracking-[-0.5px]">Welcome to NeoMart</h1><p className="mx-auto mt-1.5 max-w-[300px] text-center text-[13px] leading-5 text-[#999b9b]">Sign in to access your saved carts, orders, and rewards.</p><button type="button" onClick={handleGoogleSignIn} disabled={loading} className="mt-5 flex h-14 w-full items-center justify-center gap-3 rounded-[10px] border border-[#4a4b4b] bg-transparent text-[14px] font-bold transition hover:bg-[#242525] disabled:opacity-60"><GoogleIcon /><span>{loading ? 'Connecting...' : 'Continue with Google'}</span></button><div className="my-5 flex items-center gap-3 text-[10px] font-medium text-[#8d8f8f]"><span className="h-px flex-1 bg-[#414242]" /><span>OR WITH EMAIL</span><span className="h-px flex-1 bg-[#414242]" /></div><form onSubmit={handleEmailSignIn} className="space-y-3.5"><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#dedede]">Email address</span><span className="flex h-12 items-center gap-3 rounded-[9px] border border-[#4a4b4b] bg-[#1b1c1c] px-3 text-[#898b8b] focus-within:border-[#ff6a00]"><Mail className="h-[17px] w-[17px] shrink-0" /><input type="email" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="you@example.com" className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-[#888a8a]" /></span></label><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#dedede]">Password</span><span className="flex h-12 items-center gap-3 rounded-[9px] border border-[#4a4b4b] bg-[#1b1c1c] px-3 text-[#898b8b] focus-within:border-[#ff6a00]"><LockKeyhole className="h-[17px] w-[17px] shrink-0" /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-[#888a8a]" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)} className="shrink-0 text-[#898b8b] hover:text-white">{showPassword ? <EyeOff className="h-[17px] w-[17px]" /> : <Eye className="h-[17px] w-[17px]" />}</button></span></label><div className="flex items-center justify-between pt-0.5 text-[11px]"><label className="flex items-center gap-2 text-[#a6a8a8]"><input type="checkbox" checked={keepSignedIn} onChange={(event) => setKeepSignedIn(event.target.checked)} className="h-4 w-4 accent-[#ff6a00]" />Keep me signed in</label><button type="button" onClick={() => showToast('Password reset is coming soon')} className="font-bold text-[#ff6a00] hover:underline">Forgot Password?</button></div><button type="submit" disabled={loading} className="mt-1 h-14 w-full rounded-[10px] bg-[#ff6a00] text-[14px] font-extrabold text-white shadow-[0_8px_18px_rgba(255,106,0,0.18)] transition hover:bg-[#e95f00] disabled:opacity-70">{loading ? 'Signing In...' : 'Sign In'}</button></form><p className="mt-3 text-center text-[12px] text-[#999b9b]">Don't have an account? <button type="button" onClick={handleGoogleSignIn} className="font-bold text-[#ff6a00] hover:underline">Sign up now</button></p><div className="mt-3 border-t border-[#303131] pt-3 text-center text-[10px] leading-4 text-[#858787]">By continuing, you agree to our <button type="button" onClick={() => setLegalDocument('terms')} className="text-[#ff6a00] underline">Terms of Service</button> and <button type="button" onClick={() => setLegalDocument('privacy')} className="text-[#ff6a00] underline">Privacy Policy</button>.</div></div></section>
      </div>
      {legalDocument && (
        <LegalModal
          document={legalDocument}
          isDark={isDark}
          onBack={() => setLegalDocument(null)}
          onClose={onClose}
        />
      )}
    </div>
  );
};
