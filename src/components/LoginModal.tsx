import React, { useState } from 'react';
import { ArrowLeft, Check, LockKeyhole, LogOut, Mail, ShieldCheck, X } from 'lucide-react';
import { signInWithGoogle } from '../config/firebase';
import { NeoMartLogo } from './NeoMartLogo';

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
  showToast,
  isAccessBlocked = false,
  accountName = '',
  accountEmail = '',
  accountPhotoUrl = '',
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
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

  const handleEmailSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = identifier.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const phone = value.replace(/\D/g, '');
    const isPhone = phone.length >= 10 && phone.length <= 15;

    if (!value || (!isEmail && !isPhone)) {
      showToast('Please enter a valid email address or mobile number');
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await onLoginSuccess(value, value.includes('@') ? value.split('@')[0] : undefined);
    setLoading(false);
    showToast('Login successful! Welcome back');
    onClose();
  };

  if (isAccessBlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
        <div className="w-full max-w-110 rounded-[30px] bg-white p-6 text-center shadow-2xl">
          <ShieldCheck className="mx-auto h-10 w-10 text-red-500" />
          <h3 className="mt-4 text-lg font-extrabold text-red-600">Login disabled</h3>
          <p className="mt-2 text-xs text-gray-500">Your account access has been disabled by NeoMart support.</p>
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
        <div className="relative w-full max-w-105 rounded-3xl bg-white p-5 text-[#211e1d] shadow-2xl sm:p-7">
          <button type="button" onClick={onClose} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#706b68] transition hover:text-[#f4510b] cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex items-start gap-4 border-b border-[#ece8e5] pb-6">
            {accountPhotoUrl ? (
              <img src={accountPhotoUrl} alt="" className="h-20 w-20 shrink-0 rounded-2xl border-2 border-[#f6c58f] object-cover shadow-md" />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-[#f6c58f] bg-[#9b7c70] text-4xl font-medium text-white shadow-md">
                {initials}
              </div>
            )}
            <div className="min-w-0 pt-1">
              <h2 className="truncate text-2xl font-black text-[#211e1d]">{displayName}</h2>
              <p className="mt-2 flex min-w-0 items-center gap-2 text-sm text-[#77716e]">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{accountEmail || 'Email not available'}</span>
              </p>
              <p className="mt-3 text-sm leading-5 text-[#77716e]">NeoMart customer account</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#fff7ef] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#a56c3c]">Account</p>
              <p className="mt-1 text-sm font-bold text-[#3d3733]">Active</p>
            </div>
            <div className="rounded-2xl bg-[#f7f7f5] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8581]">Shopping</p>
              <p className="mt-1 text-sm font-bold text-[#3d3733]">Orders & cart</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-emerald-700">
              <Check className="h-4 w-4" />
              Signed in securely
            </div>
            <button onClick={() => { onLogout(); showToast('Signed out of account'); onClose(); }} className="inline-flex items-center gap-2 rounded-xl border border-[#e5d8d2] px-4 py-2.5 text-sm font-bold text-[#b44820] transition hover:bg-[#fff4ed] cursor-pointer">
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/65 p-4 sm:p-5">
      <div className="relative my-auto w-full max-w-95 rounded-3xl bg-white px-5 py-6 text-[#211e1d] shadow-2xl sm:px-7 sm:py-7">
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f3] text-[#5d5a58] transition hover:bg-[#ececea] cursor-pointer sm:right-4 sm:top-4">
          <X className="h-5 w-5" strokeWidth={2.2} />
        </button>

        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-[#ff9d00] to-[#f4510b] shadow-[0_8px_15px_rgba(244,81,11,0.2)]">
            <NeoMartLogo size="lg" showText={false} />
          </div>
        </div>

        <h1 className="mt-5 text-center text-[1.55rem] font-black leading-tight tracking-tight sm:text-[1.9rem]">Welcome to NeoMart</h1>
        <p className="mx-auto mt-2 max-w-80 text-center text-[0.9rem] leading-5 text-[#77716e] sm:text-[1rem]">Sign in to access your saved carts, orders, and rewards.</p>

        <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#d8d5d3] bg-white text-[1rem] font-semibold shadow-[0_3px_6px_rgba(0,0,0,0.08)] transition hover:bg-[#fffaf7] disabled:opacity-60 cursor-pointer sm:text-[1.15rem]">
          <GoogleIcon />
          <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
        </button>

        <div className="my-6 flex items-center gap-2 text-[0.75rem] font-medium text-[#aaa6a4] sm:gap-3 sm:text-[0.85rem]">
          <span className="h-px flex-1 bg-[#ddd9d7]" />
          <span>OR WITH EMAIL</span>
          <span className="h-px flex-1 bg-[#ddd9d7]" />
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[0.78rem] font-extrabold uppercase tracking-wide text-[#494542]">Email address</span>
            <span className="flex h-12 items-center gap-3 rounded-xl border-2 border-[#d9d6d4] px-3.5 text-[#9b9693] focus-within:border-[#f4510b]">
              <Mail className="h-5 w-5 shrink-0" strokeWidth={1.8} />
              <input type="text" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="you@example.com" className="w-full bg-transparent text-[0.9rem] text-[#302d2b] outline-none placeholder:text-[#aaa6a4] sm:text-[1rem]" />
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[0.78rem] font-extrabold uppercase tracking-wide text-[#494542]">Password</span>
            <span className="flex h-12 items-center gap-3 rounded-xl border-2 border-[#d9d6d4] px-3.5 text-[#9b9693] focus-within:border-[#f4510b]">
              <LockKeyhole className="h-5 w-5 shrink-0" strokeWidth={1.8} />
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="w-full bg-transparent text-[0.9rem] text-[#302d2b] outline-none placeholder:text-[#aaa6a4] sm:text-[1rem]" />
            </span>
          </label>

          <button type="submit" disabled={loading} className="h-14 w-full rounded-xl bg-[#f4510b] text-[1.2rem] font-extrabold text-white shadow-[0_7px_12px_rgba(244,81,11,0.25)] transition hover:bg-[#df4608] disabled:opacity-70 cursor-pointer">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-[0.88rem] text-[#77716e] sm:text-[1rem]">Don't have an account? <button type="button" onClick={handleGoogleSignIn} className="font-extrabold text-[#d95b1c] underline underline-offset-4 cursor-pointer">Sign up now</button></p>

        <div className="mt-6 border-t border-[#e5e1df] pt-5 text-center">
          <button type="button" onClick={handleGoogleSignIn} className="text-[0.78rem] font-medium text-[#9a572c] underline underline-offset-4 cursor-pointer sm:text-[0.9rem]">⚡ Tester Shortcut: Enter Demo Admin Mode</button>
        </div>
      </div>
    </div>
  );
};
