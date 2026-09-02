import React, { useState } from 'react';
import { X, Check, UserPlus, ArrowLeft } from 'lucide-react';
import { NeoMartLogo } from './NeoMartLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLoginSuccess: (identifier: string) => void;
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

const SAVED_ACCOUNTS_KEY = 'neomart_google_accounts';

const INITIAL_GOOGLE_ACCOUNTS: GoogleAccount[] = [
  {
    name: 'Ifeanyi Anoma',
    email: 'ifeanyianoma198@gmail.com',
    avatarBg: 'bg-[#f68b1e]',
    avatarLetter: 'I',
    avatarColor: 'text-white',
  },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  isLoggedIn,
  onLoginSuccess,
  onLogout,
  showToast,
}) => {
  if (!isOpen) return null;

  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [showAddGoogleAccount, setShowAddGoogleAccount] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
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
  const [signingInAccount, setSigningInAccount] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
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
      onLoginSuccess(val);
      showToast('Login successful! Welcome back 😊');
      onClose();
    }, 800);
  };

  const handleSelectGoogleAccount = (acc: GoogleAccount) => {
    setSigningInAccount(acc.email);
    setTimeout(() => {
      setSigningInAccount(null);
      setShowGoogleChooser(false);
      onLoginSuccess(acc.email);
      showToast(`Signed in as ${acc.name} (${acc.email})`);
      onClose();
    }, 700);
  };

  const handleAddCustomGoogleAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) {
      showToast('Please enter your Google email');
      return;
    }
    const email = customGoogleEmail.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmail) {
      showToast('Please enter a valid email (e.g. yourname@gmail.com)');
      return;
    }

    const name = customGoogleName.trim() || email.split('@')[0];
    const newAcc: GoogleAccount = {
      name,
      email,
      avatarBg: 'bg-purple-600',
      avatarLetter: name.charAt(0).toUpperCase(),
      avatarColor: 'text-white',
    };

    const updated = [newAcc, ...accountsList.filter(a => a.email !== newAcc.email)];
    setAccountsList(updated);
    try {
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    handleSelectGoogleAccount(newAcc);
  };

  const handleCloseAll = () => {
    setShowGoogleChooser(false);
    setShowAddGoogleAccount(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn">
      {/* 1. Google Account Chooser View */}
      {showGoogleChooser ? (
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-left">
          {/* Top Bar with Google Branding */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              {/* Multicolored Google SVG */}
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
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Sign in with Google
              </span>
            </div>

            <button
              onClick={() => {
                setShowGoogleChooser(false);
                setShowAddGoogleAccount(false);
              }}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!showAddGoogleAccount ? (
            <div className="py-3">
              {/* Header Title */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Choose an account
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  to continue to <strong className="text-[#f68b1e]">NeoMart</strong>
                </p>
              </div>

              {/* Account List */}
              <div className="space-y-1 divide-y divide-gray-100 dark:divide-gray-800 border-y border-gray-100 dark:border-gray-800 -mx-6 px-6 max-h-64 overflow-y-auto">
                {accountsList.map((acc) => {
                  const isSigning = signingInAccount === acc.email;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      disabled={signingInAccount !== null}
                      onClick={() => handleSelectGoogleAccount(acc)}
                      className="w-full flex items-center justify-between py-3 px-2 rounded-xl hover:bg-orange-50/70 dark:hover:bg-gray-800 transition-colors text-left cursor-pointer group disabled:opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div
                          className={`w-10 h-10 rounded-full ${acc.avatarBg} ${acc.avatarColor} font-bold text-base flex items-center justify-center shrink-0 shadow-xs`}
                        >
                          {acc.avatarLetter}
                        </div>

                        {/* Name & Email */}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-[#f68b1e] transition-colors">
                            {acc.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {acc.email}
                          </div>
                        </div>
                      </div>

                      {isSigning && (
                        <div className="w-4 h-4 rounded-full border-2 border-[#f68b1e] border-t-transparent animate-spin ml-2 shrink-0" />
                      )}
                    </button>
                  );
                })}

                {/* Add another account button */}
                <button
                  type="button"
                  onClick={() => setShowAddGoogleAccount(true)}
                  className="w-full flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Use another account
                    </div>
                    <div className="text-xs text-gray-400">
                      Add a new Google email on this device
                    </div>
                  </div>
                </button>
              </div>

              {/* Privacy Disclaimer */}
              <div className="mt-4 text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
                To continue, Google will share your name, email address, language preference, and profile picture with <strong>NeoMart</strong>.
              </div>
            </div>
          ) : (
            /* Add Another Account Sub-Form */
            <div className="py-3">
              <button
                type="button"
                onClick={() => setShowAddGoogleAccount(false)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-3 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to accounts</span>
              </button>

              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                Add Google Account
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Enter your Google account details to sign in.
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
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#222222] text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#4285F4]"
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
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#222222] text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#4285F4]"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddGoogleAccount(false)}
                    className="flex-1 py-2.5 px-3 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-3 bg-[#4285F4] hover:bg-[#3367d6] text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                    Sign In with Account
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        /* 2. Main Login / Signup Modal */
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center relative">
          <button
            onClick={handleCloseAll}
            className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo Badge */}
          <div className="flex items-center justify-center mb-2">
            <NeoMartLogo size="md" textColor="dark" />
          </div>

          {isLoggedIn ? (
            <div className="space-y-4 py-2">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-gray-100">
                Your Account
              </h3>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>You are currently logged in</span>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  showToast('Logged out of account');
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-gray-100">
                  Welcome to NeoMart
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Type your email or phone to log in or create an account.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3 text-xs text-left">
                <div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Email or Mobile Number*"
                    className="w-full px-3.5 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#222222] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e] text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#f68b1e] hover:bg-[#e07a10] disabled:opacity-75 text-white font-extrabold py-3 px-4 rounded-lg text-sm transition-all cursor-pointer shadow-md"
                >
                  {loading ? 'Continuing...' : 'Continue'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 text-gray-400 text-xs my-2">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
                <span>Or log in with</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
              </div>

              {/* Social Logins */}
              <div className="flex justify-center gap-3">
                {/* Facebook */}
                <button
                  type="button"
                  onClick={() => {
                    onLoginSuccess('facebook_user@neomart.ng');
                    showToast('Signed in with Facebook!');
                    onClose();
                  }}
                  className="w-11 h-11 rounded-full bg-[#1877f2] text-white flex items-center justify-center font-bold text-base shadow-xs hover:scale-105 transition-transform cursor-pointer"
                  title="Log in with Facebook"
                >
                  f
                </button>

                {/* Google with Multi-Account Selector */}
                <button
                  type="button"
                  onClick={() => setShowGoogleChooser(true)}
                  className="w-11 h-11 rounded-full bg-white dark:bg-[#222222] border border-gray-300 dark:border-gray-700 flex items-center justify-center shadow-xs hover:scale-105 hover:border-gray-400 transition-all cursor-pointer"
                  title="Choose a Google Account"
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

              <p className="text-[11px] text-gray-400 leading-relaxed pt-2">
                By continuing you agree to NeoMart's{' '}
                <a href="#" className="text-[#f68b1e] hover:underline font-medium">
                  Terms &amp; Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#f68b1e] hover:underline font-medium">
                  Privacy Policy
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
