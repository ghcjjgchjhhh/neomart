import React, { useEffect, useState } from 'react';
import { NeoMartIcon } from './NeoMartLogo.tsx';

interface SplashScreenProps {
  onFinish: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDurationMs = 2400,
}) => {
  const [activeDot, setActiveDot] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Animate the 4 loading dots sequentially
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % 4);
    }, 380);
    return () => clearInterval(dotInterval);
  }, []);

  // Fade out and finish
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      const closeTimer = setTimeout(() => {
        onFinish();
      }, 500);
      return () => clearTimeout(closeTimer);
    }, minDurationMs);

    return () => clearTimeout(timer);
  }, [minDurationMs, onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onFinish();
    }, 300);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-white text-gray-900 overflow-hidden cursor-pointer select-none transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#fbfbfb',
      }}
    >
      {/* Background Soft Orange Circle Blurs */}
      <div className="absolute -top-16 -left-16 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-[#f68b1e] opacity-90 blur-[1px] pointer-events-none" />
      <div className="absolute top-1/4 -right-16 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-[#ffeed9] pointer-events-none" />
      <div className="absolute -bottom-20 -left-12 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-[#f68b1e] opacity-90 pointer-events-none" />
      <div className="absolute -bottom-16 -right-12 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#f68b1e] opacity-90 pointer-events-none" />
      <div className="absolute bottom-28 right-8 w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-[#ffeed9] pointer-events-none" />
      <div className="absolute top-1/3 left-4 w-4 h-4 rounded-full bg-[#f68b1e] opacity-80 pointer-events-none" />
      <div className="absolute top-1/4 right-24 w-6 h-6 rounded-full border-4 border-[#f68b1e] opacity-80 pointer-events-none" />

      {/* Top Left: Over-Ear Headphones */}
      <div className="absolute top-2 left-2 sm:top-6 sm:left-6 w-24 h-24 sm:w-36 sm:h-36 pointer-events-none transform -rotate-12 animate-float-slow">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
          <circle cx="50" cy="50" r="42" fill="#fff" opacity="0.1" />
          <path
            d="M20 58 C 20 20, 80 20, 80 58"
            fill="none"
            stroke="#e2dacb"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M25 50 C 25 26, 75 26, 75 50"
            fill="none"
            stroke="#f5efe6"
            strokeWidth="4"
          />
          <ellipse cx="22" cy="62" rx="11" ry="16" fill="#e8ded0" stroke="#d5c7b3" strokeWidth="2" />
          <ellipse cx="78" cy="62" rx="11" ry="16" fill="#e8ded0" stroke="#d5c7b3" strokeWidth="2" />
          <ellipse cx="22" cy="62" rx="7" ry="11" fill="#dfd3c1" />
          <ellipse cx="78" cy="62" rx="7" ry="11" fill="#dfd3c1" />
        </svg>
      </div>

      {/* Top Right: NeoMart Cardboard Box */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-10 w-28 h-28 sm:w-36 sm:h-36 pointer-events-none transform rotate-12 animate-float-delayed">
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-2xl">
          <polygon points="60,15 105,38 60,60 15,38" fill="#e4b77d" />
          <polygon points="60,15 72,21 27,44 15,38" fill="#f68b1e" />
          <polygon points="15,38 60,60 60,105 15,82" fill="#c99b61" />
          <polygon points="60,60 105,38 105,82 60,105" fill="#ab7e48" />
          <text
            x="38"
            y="72"
            fill="#222"
            fontSize="10"
            fontWeight="bold"
            fontFamily="sans-serif"
            transform="rotate(-15, 38, 72)"
          >
            neomart
          </text>
          <rect x="76" y="60" width="12" height="15" rx="2" fill="#222" transform="rotate(15, 76, 60)" />
          <circle cx="82" cy="58" r="4" fill="none" stroke="#222" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Middle Left: Smartphone */}
      <div className="absolute top-1/3 -left-4 sm:left-4 w-18 h-32 sm:w-24 sm:h-44 pointer-events-none transform -rotate-12 animate-float-slow">
        <div className="w-full h-full bg-[#1c1d1f] rounded-3xl p-1.5 shadow-2xl border-2 border-[#383a3e] relative">
          <div className="w-full h-full bg-[#111214] rounded-[18px] flex flex-col items-center justify-between p-2">
            <div className="w-8 h-2.5 bg-black rounded-full" />
            <div className="w-full flex flex-col gap-1 items-center">
              <div className="w-8 h-8 rounded-full bg-[#f68b1e]/20 flex items-center justify-center">
                <div className="w-4 h-4 rounded bg-[#f68b1e]" />
              </div>
              <div className="w-10 h-1 bg-gray-700 rounded-full" />
            </div>
            <div className="w-6 h-1 bg-gray-700 rounded-full" />
          </div>
        </div>
      </div>

      {/* Middle Right: Pump Lotion Bottle */}
      <div className="absolute top-1/3 right-1 sm:right-6 w-16 h-32 sm:w-22 sm:h-44 pointer-events-none transform rotate-6 animate-float-delayed">
        <svg viewBox="0 0 60 120" className="w-full h-full drop-shadow-xl">
          <path d="M26 12 H34 V22 H26 Z" fill="#f68b1e" />
          <path d="M22 12 H38 C42 12 45 9 45 6 H22 Z" fill="#f68b1e" />
          <rect x="28" y="2" width="4" height="10" fill="#e07205" />
          <rect x="12" y="24" width="36" height="85" rx="10" fill="#fbfbfa" stroke="#e8e8e5" strokeWidth="1.5" />
          <rect x="16" y="44" width="28" height="42" rx="4" fill="#f0ede6" />
          <line x1="20" y1="52" x2="38" y2="52" stroke="#d5cebe" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="60" x2="34" y2="60" stroke="#d5cebe" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Lower Right: Blue Handbag */}
      <div className="absolute bottom-1/4 -right-3 sm:right-6 w-28 h-28 sm:w-36 sm:h-36 pointer-events-none transform -rotate-6 animate-float-slow">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          <path
            d="M36 40 V20 C36 14 42 10 50 10 C58 10 64 14 64 20 V40"
            fill="none"
            stroke="#1d3557"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M20 42 L16 88 C15.5 91 18 94 22 94 H78 C82 94 84.5 91 84 88 L80 42 C79.5 39 77 37 74 37 H26 C23 37 20.5 39 20 42 Z"
            fill="#1e3d7b"
          />
          <path
            d="M23 44 L20 86 C19.8 88 21 90 23 90 H32 L34 42 H25 C24 42 23.2 42.8 23 44 Z"
            fill="#2c529e"
          />
          <rect x="47" y="50" width="6" height="8" rx="1.5" fill="#f68b1e" />
        </svg>
      </div>

      {/* Bottom Left: Orange Shopping Cart */}
      <div className="absolute bottom-4 -left-2 sm:bottom-8 sm:left-6 w-32 h-32 sm:w-44 sm:h-44 pointer-events-none transform rotate-3 animate-float-slow">
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-2xl">
          <line x1="12" y1="28" x2="30" y2="40" stroke="#f68b1e" strokeWidth="5" strokeLinecap="round" />
          <polygon points="30,40 100,40 88,85 40,85" fill="#ff9d2e" opacity="0.3" stroke="#f68b1e" strokeWidth="3" />
          <line x1="44" y1="40" x2="52" y2="85" stroke="#f68b1e" strokeWidth="2" />
          <line x1="58" y1="40" x2="64" y2="85" stroke="#f68b1e" strokeWidth="2" />
          <line x1="72" y1="40" x2="76" y2="85" stroke="#f68b1e" strokeWidth="2" />
          <line x1="86" y1="40" x2="88" y2="85" stroke="#f68b1e" strokeWidth="2" />
          <line x1="33" y1="55" x2="96" y2="55" stroke="#f68b1e" strokeWidth="2" />
          <line x1="36" y1="70" x2="92" y2="70" stroke="#f68b1e" strokeWidth="2" />
          <rect x="44" y="32" width="22" height="18" rx="2" fill="#c99b61" transform="rotate(-6, 44, 32)" />
          <rect x="68" y="26" width="12" height="24" rx="3" fill="#ffffff" stroke="#e0e0e0" strokeWidth="1" />
          <rect x="71" y="20" width="6" height="6" fill="#3b82f6" />
          <polyline points="28,88 44,88 78,102 92,102" fill="none" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
          <circle cx="46" cy="108" r="6" fill="#334155" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="86" cy="108" r="6" fill="#334155" stroke="#cbd5e1" strokeWidth="2" />
        </svg>
      </div>

      {/* Bottom Right: White Running Sneaker */}
      <div className="absolute bottom-2 right-2 sm:bottom-6 sm:right-10 w-32 h-24 sm:w-44 sm:h-32 pointer-events-none transform -rotate-12 animate-float-delayed">
        <svg viewBox="0 0 120 80" className="w-full h-full drop-shadow-2xl">
          <path
            d="M10 65 Q 40 68, 75 64 Q 105 60, 114 48 Q 110 56, 102 62 Q 70 74, 15 72 Z"
            fill="#1e293b"
          />
          <path
            d="M14 62 Q 45 64, 75 60 Q 102 54, 110 44 C 104 38, 98 46, 75 52 Q 40 56, 18 54 Z"
            fill="#ffffff"
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />
          <path
            d="M20 54 C 28 36, 45 32, 60 28 C 72 24, 82 12, 90 14 C 95 16, 92 30, 98 34 C 104 38, 108 42, 108 44 C 100 50, 60 56, 20 54 Z"
            fill="#f8fafc"
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />
          <path
            d="M30 52 Q 60 48, 85 38 Q 70 32, 50 36 Q 35 40, 30 52 Z"
            fill="#e2dacb"
          />
          <line x1="68" y1="28" x2="76" y2="30" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="72" y1="22" x2="80" y2="24" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="76" y1="16" x2="84" y2="18" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Skip Button */}
      <div className="w-full max-w-md pt-8 px-6 flex justify-end z-20">
        <button
          onClick={handleSkip}
          className="text-xs font-semibold text-gray-400 hover:text-[#f68b1e] px-3 py-1 rounded-full bg-white/80 shadow-sm border border-gray-100 transition-colors"
        >
          Skip →
        </button>
      </div>

      {/* Centerpiece Hero Logo, Brand & Loader */}
      <div className="flex flex-col items-center justify-center text-center px-6 z-20 my-auto -mt-6">
        <div className="relative mb-6 transform hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 rounded-3xl bg-[#f68b1e] blur-2xl opacity-40 scale-110 animate-pulse" />
          <NeoMartIcon size={118} className="relative z-10 drop-shadow-2xl" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 mb-2 flex items-center justify-center">
          neo<span className="text-[#f68b1e]">mart</span>
        </h1>

        <p className="text-sm sm:text-base font-medium text-gray-700 tracking-wide mb-10">
          Everything you need, <span className="text-[#f68b1e] font-semibold">delivered.</span>
        </p>

        {/* 4 Animated Progress Dots */}
        <div className="flex items-center gap-2.5 mb-3">
          {[0, 1, 2, 3].map((index) => {
            const isCurrent = activeDot === index;
            return (
              <span
                key={index}
                className={`rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'w-3.5 h-3.5 bg-[#f68b1e] scale-125 shadow-md shadow-[#f68b1e]/50'
                    : 'w-2.5 h-2.5 bg-[#ffcb94] opacity-75'
                }`}
              />
            );
          })}
        </div>

        <span className="text-xs font-semibold text-gray-400 tracking-wider animate-pulse">
          Loading...
        </span>
      </div>

      <div className="pb-8 text-[11px] text-gray-400 font-medium z-20">
        Nigeria's #1 Online Shopping Destination
      </div>
    </div>
  );
};