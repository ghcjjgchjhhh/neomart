import React, { useState } from 'react';
import { X, Check, UserPlus, ArrowLeft, ShieldCheck } from 'lucide-react';
import { NeoMartLogo } from './NeoMartLogo';
import { signInWithGoogle } from '../config/firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLoginSuccess: (identifier: string, displayName?: string, photoUrl?: string) => void | Promise<void>;
  onLogout: () => void;
  showToast: (msg: string) => void;
  isAccessBlocked?: boolean;
}

interface GoogleAccount {
  name: string;
  email: string;
  avatarBg: string;
  avatarLetter: string;
  avatarColor: string;
}

const SAVED_ACCOUNTS_KEY = 'neomart_google_accounts_list';

const INITIAL_GOOGLE_ACCOUNTS: GoogleAccount[] = [];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  isLoggedIn,
  onLoginSuccess,
  onLogout,
  showToast,
  isAccessBlocked = false,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'google' | 'phone_email'>('google');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddGoogleAccount, setShowAddGoogleAccount] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [signingInAccount, setSigningInAccount] = useState<string | null>(null);

  const [accountsList, setAccountsList] = useState<GoogleAccount[]>(() => {
    try {
      const saved = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_GOOGLE_ACCOUNTS;
  });

  const handleSelectGoogleAccount = (acc: GoogleAccount) => {
    setSigningInAccount(acc.email);
    setTimeout(() => {
      setSigningInAccount(null);
      onLoginSuccess(acc.email, acc.name);
      showToast(`Signed in as ${acc.name} (${acc.email})`);
      onClose();
    }, 400);
  };

  const handleAddCustomGoogleAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const email = customGoogleEmail.trim();
    if (!email) {
      showToast('Please enter your Google email');
      return;
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmail) {
      showToast('Please enter a valid email (e.g. yourname@gmail.com)');
      return;
    }

    const name = customGoogleName.trim() || email.split('@')[0];
    const newAcc: GoogleAccount = {
      name,
      email,
      avatarBg: 'bg-emerald-600',
      avatarLetter: name.charAt(0).toUpperCase(),
      avatarColor: 'text-white',
    };

    const updated = [newAcc, ...accountsList.filter((a) => a.email !== newAcc.email)];
    setAccountsList(updated);
    try {
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setCustomGoogleEmail('');
    setCustomGoogleName('');
    setShowAddGoogleAccount(false);
    handleSelectGoogleAccount(newAcc);
  };

  const handleGoogleIconClick = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      if (!user) return;
      const userName = user.displayName || user.email?.split('@')[0] || 'Google User';
      await onLoginSuccess(user.email || user.uid, user.displayName || user.email?.split('@')[0], user.photoURL || undefined);
      showToast(`Signed in with Google as ${user.email || userName}`);
      onClose();
    } catch {
      showToast('Google sign-in failed. Enable Google in Firebase, then try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const val = identifier.trim();
    if (!val) {
      showToast('Please enter your email or mobile number');
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    const cleanedPhone = val.replace(/\D/g, '');
    const isPhone = cleanedPhone.length >= 10 && cleanedPhone.length <= 15;

    if (!isEmail && !isPhone) {
      showToast('Please enter a valid Nigerian phone number or email address');
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      await onLoginSuccess(val, val.includes('@') ? val.split('@')[0] : undefined);
      showToast('Login successful! Welcome back 😊');
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-left transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Logo and Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <NeoMartLogo size="sm" textColor="dark" />
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google Sign In</span>
          </div>
        </div>

        {isAccessBlocked ? (
          <div className="space-y-4 py-5 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-red-500" />
            <div>
              <h3 className="font-extrabold text-lg text-red-600 dark:text-red-400">Login disabled</h3>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Your account access has been disabled by NeoMart support.</p>
            </div>
            <a href="tel:08135648242" className="block rounded-xl bg-[#f68b1e] px-4 py-3 text-xs font-bold text-white">Contact customer care: 08135648242</a>
          </div>
        ) : isLoggedIn ? (
          <div className="space-y-4 py-4 text-center">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-gray-100">
              Your Account
            </h3>
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>You are signed in</span>
            </div>
            <button
              onClick={() => {
                onLogout();
                showToast('Signed out of account');
                onClose();
              }}
              className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="pt-6">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-to-br from-[#f68b1e] to-[#ff8a3d] shadow-[0_12px_30px_rgba(246,139,30,0.28)]">
              <NeoMartLogo size="sm" textColor="light" />
            </div>

            <h1 className="text-center text-4xl sm:text-5xl font-black tracking-[-0.06em] text-[#1f1f1f] dark:text-white">
              Welcome to NeoMart
            </h1>
            <p className="mt-4 text-center text-lg text-gray-500 dark:text-gray-400">
              Sign in to access your saved carts, orders, and rewards.
            </p>

            <div className="mt-8 space-y-4">
              <button
                type="button"
                onClick={handleGoogleIconClick}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#e6e6e6] bg-white px-4 py-4 text-left shadow-sm transition-all hover:border-[#d9d9d9] hover:shadow-md cursor-pointer"
                disabled={loading}
              >
                <svg className="h-7 w-7" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span className="text-2xl font-bold tracking-[-0.04em] text-[#1f1f1f]">
                  {loading ? 'Connecting...' : 'Continue with Google'}
                </span>
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-gray-300" />
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">or with email</span>
                <div className="h-px flex-1 bg-gray-300" />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-lg font-extrabold uppercase tracking-[-0.04em] text-[#1f1f1f] dark:text-white">
                  Email address
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-[#d9d9d9] bg-white px-4 py-3 shadow-sm">
                  <svg className="h-5 w-5 text-[#666]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor"/>
                    <path d="M3 7l9 6 9-6" stroke="currentColor" strokeLinecap="round"/>
                  </svg>
                  <input
                    type="email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border-0 bg-transparent text-lg text-[#1f1f1f] placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-lg font-extrabold uppercase tracking-[-0.04em] text-[#1f1f1f] dark:text-white">
                  Password
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-[#d9d9d9] bg-white px-4 py-3 shadow-sm">
                  <svg className="h-5 w-5 text-[#666]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor"/>
                    <path d="M8 10V7.5A4 4 0 0116 7.5V10" stroke="currentColor" strokeLinecap="round"/>
                  </svg>
                  <input
                    type="password"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border-0 bg-transparent text-lg text-[#1f1f1f] placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handlePhoneEmailLogin}
                className="mt-2 w-full rounded-2xl bg-gradient-to-r from-[#f68b1e] to-[#f57c20] px-5 py-4 text-3xl font-black tracking-[-0.06em] text-white shadow-[0_12px_25px_rgba(246,139,30,0.32)] transition-transform hover:-translate-y-0.5 disabled:opacity-70 cursor-pointer"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>

            <p className="mt-8 text-center text-xl text-[#1f1f1f] dark:text-white">
              Don’t have an account? <button type="button" onClick={() => setActiveTab('google')} className="font-extrabold text-[#f68b1e] underline decoration-[#f68b1e]/40 underline-offset-4 cursor-pointer">Sign up now</button>
            </p>

            <button
              type="button"
              onClick={() => setActiveTab('google')}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-[#e4e4e4] bg-white/30 px-4 py-3 text-center text-lg font-bold text-[#1f1f1f] shadow-sm transition hover:bg-white cursor-pointer"
            >
              <span className="text-2xl">⚡</span>
              <span>Tester Shortcut: Enter Demo Admin Mode</span>
            </button>
          </div>
        )}
                        type="button"
                        onClick={() => setShowAddGoogleAccount(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 text-gray-500" />
                        <span>Use another Google account</span>
                      </button>

                      {/* Prominent Google Icon Button */}
                      <button
                        type="button"
                        onClick={handleGoogleIconClick}
                        className="w-11 h-10 rounded-xl bg-white dark:bg-[#222222] border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#282828] hover:border-gray-400 hover:scale-105 transition-all cursor-pointer shrink-0 shadow-xs"
                        title="Sign in with Google"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Form to Add Account */
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowAddGoogleAccount(false)}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-3 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to accounts list</span>
                    </button>

                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
                      Add any Google Account
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Enter the name and Gmail address to connect.
                    </p>

                    <form onSubmit={handleAddCustomGoogleAccount} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">
                          Full Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={customGoogleName}
                          onChange={(e) => setCustomGoogleName(e.target.value)}
                          placeholder="e.g. Ifeanyi Anoma"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#222222] text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#4285F4]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">
                          Google Email Address*
                        </label>
                        <input
                          type="email"
                          required
                          value={customGoogleEmail}
                          onChange={(e) => setCustomGoogleEmail(e.target.value)}
                          placeholder="name@gmail.com"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#222222] text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#4285F4]"
                        />
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddGoogleAccount(false)}
                          className="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2 px-3 bg-[#4285F4] hover:bg-[#3367d6] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                        >
                          Sign In
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PHONE OR EMAIL */}
            {activeTab === 'phone_email' && (
              <form onSubmit={handlePhoneEmailLogin} className="space-y-3 text-xs text-left">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    Enter Email or Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 08123456789 or name@mail.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#222222] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e] text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#f68b1e] hover:bg-[#e07a10] disabled:opacity-75 text-white font-extrabold py-2.5 px-4 rounded-lg text-xs transition-all cursor-pointer shadow-md"
                >
                  {loading ? 'Signing In...' : 'Continue with Phone / Email'}
                </button>
              </form>
            )}

            {/* Footer Disclaimer */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted 256-bit SSL</span>
              </span>
              <span>NeoMart Security</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
