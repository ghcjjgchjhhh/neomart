import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLoginSuccess: (identifier: string) => void;
  onLogout: () => void;
  showToast: (msg: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  isLoggedIn,
  onLoginSuccess,
  onLogout,
  showToast
}) => {
  if (!isOpen) return null;

  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo Badge */}
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#f68b1e] text-white font-black text-lg tracking-tight mb-2 shadow-sm">
          Neo<span className="text-gray-900">Mart</span>
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
              <button
                type="button"
                onClick={() => {
                  onLoginSuccess('facebook_user@neomart.ng');
                  showToast('Signed in with Facebook!');
                  onClose();
                }}
                className="w-10 h-10 rounded-full bg-[#1877f2] text-white flex items-center justify-center font-bold text-sm shadow-xs hover:scale-105 transition-transform cursor-pointer"
              >
                f
              </button>
              <button
                type="button"
                onClick={() => {
                  onLoginSuccess('google_user@neomart.ng');
                  showToast('Signed in with Google!');
                  onClose();
                }}
                className="w-10 h-10 rounded-full bg-white dark:bg-[#222222] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center font-black text-sm shadow-xs hover:scale-105 transition-transform cursor-pointer"
              >
                <span className="text-blue-500">G</span>
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
    </div>
  );
};
