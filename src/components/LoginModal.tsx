import React, { useState } from 'react';
import { X, Check, UserPlus, ArrowLeft, ShieldCheck } from 'lucide-react';
import { NeoMartLogo } from './NeoMartLogo';
import { signInWithGoogle } from '../config/firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLoginSuccess: (identifier: string, displayName?: string) => void;
  onLogout: () => void;
  showToast: (msg: string) => void;
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
      const userName = user.displayName || user.email?.split('@')[0] || 'Google User';
      onLoginSuccess(user.email || user.uid, user.displayName || user.email?.split('@')[0]);
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
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(val, val.includes('@') ? val.split('@')[0] : undefined);
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

        {isLoggedIn ? (
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
          <div>
            {/* Top Switcher Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 mt-3 mb-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddGoogleAccount(false);
                  setActiveTab('google');
                }}
                className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'google'
                    ? 'border-[#f68b1e] text-[#f68b1e]'
                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
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
                <span>Google Accounts</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('phone_email')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'phone_email'
                    ? 'border-[#f68b1e] text-[#f68b1e]'
                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                Phone or Email
              </button>
            </div>

            {/* TAB 1: GOOGLE ACCOUNTS */}
            {activeTab === 'google' && (
              <div>
                {!showAddGoogleAccount ? (
                  <div>
                    <div className="mb-3">
                      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                        Choose your Google account
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Tap an account below to sign in immediately:
                      </p>
                    </div>

                    {/* Account List */}
                    <div className="space-y-1.5 max-h-60 overflow-y-auto mb-3 pr-1">
                      {accountsList.map((acc) => {
                        const isSigning = signingInAccount === acc.email;
                        return (
                          <button
                            key={acc.email}
                            type="button"
                            disabled={signingInAccount !== null}
                            onClick={() => handleSelectGoogleAccount(acc)}
                            className="w-full flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-[#222222] hover:bg-orange-50 dark:hover:bg-[#2d2214] border border-gray-200 dark:border-gray-700 hover:border-[#f68b1e]/50 transition-all text-left cursor-pointer group disabled:opacity-60"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-full ${acc.avatarBg} ${acc.avatarColor} font-bold text-base flex items-center justify-center shrink-0 shadow-xs`}
                              >
                                {acc.avatarLetter}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-[#f68b1e] transition-colors">
                                  {acc.name}
                                </div>
                                <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                  {acc.email}
                                </div>
                              </div>
                            </div>

                            {isSigning ? (
                              <div className="w-4 h-4 rounded-full border-2 border-[#f68b1e] border-t-transparent animate-spin ml-2 shrink-0" />
                            ) : (
                              <span className="text-[11px] font-bold text-[#f68b1e] bg-[#fff3e0] dark:bg-[#3d2700] px-2.5 py-1 rounded-lg border border-[#f68b1e]/20 shrink-0 ml-2">
                                Sign In
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Buttons Row: Use Another Google Account + Google Icon Button */}
                    <div className="flex items-center gap-2">
                      <button
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
