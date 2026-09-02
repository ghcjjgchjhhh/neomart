import React from 'react';

interface NeoMartLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  textColor?: 'light' | 'dark' | 'orange';
}

export const NeoMartIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 32,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="neomart_bag_grad" x1="20" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff9d2e" />
          <stop offset="50%" stopColor="#f68b1e" />
          <stop offset="100%" stopColor="#e07205" />
        </linearGradient>
        <filter id="neomart_shadow" x="0" y="0" width="100" height="110" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#e07205" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Bag Handle */}
      <path
        d="M36 34V25C36 17.268 42.268 11 50 11C57.732 11 64 17.268 64 25V34"
        stroke="#e07205"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M36 34V25C36 17.268 42.268 11 50 11C57.732 11 64 17.268 64 25V34"
        stroke="#ffb356"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Main Bag Body */}
      <path
        d="M22 35L29 86C29.5 90 33 93 37 93H63C67 93 70.5 90 71 86L78 35C78.5 31 75.5 28 71.5 28H28.5C24.5 28 21.5 31 22 35Z"
        fill="url(#neomart_bag_grad)"
        filter="url(#neomart_shadow)"
      />

      {/* Gloss Highlight */}
      <path
        d="M26 36L30 84C30.2 86 32 87 34 87H40L35 34H28C26.8 34 25.8 34.8 26 36Z"
        fill="white"
        fillOpacity="0.18"
      />

      {/* Lowercase 'n' Cutout */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M38 51C38 48.7909 39.7909 47 42 47H46.5C52.299 47 57 51.701 57 57.5V74C57 75.6569 55.6569 77 54 77C52.3431 77 51 75.6569 51 74V58C51 55.2386 48.7614 53 46 53H44V74C44 75.6569 42.6569 77 41 77C39.3431 77 38 75.6569 38 74V51Z"
        fill="white"
      />
    </svg>
  );
};

export const NeoMartLogo: React.FC<NeoMartLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'dark',
}) => {
  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 44,
    xl: 60,
    '2xl': 88,
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
    '2xl': 'text-5xl md:text-6xl',
  };

  const currentSize = iconSizes[size];

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <NeoMartIcon size={currentSize} />
      {showText && (
        <span
          className={`font-black tracking-tight ${textSizes[size]} leading-none ${
            textColor === 'light'
              ? 'text-white'
              : textColor === 'orange'
              ? 'text-[#f68b1e]'
              : 'text-gray-900 dark:text-white'
          }`}
        >
          neo
          <span
            className={
              textColor === 'light'
                ? 'text-gray-900 dark:text-[#f68b1e]'
                : 'text-[#f68b1e]'
            }
          >
            mart
          </span>
        </span>
      )}
    </div>
  );
};