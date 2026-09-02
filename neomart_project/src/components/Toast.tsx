import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#222222] text-white px-5 py-3 rounded-full text-xs sm:text-sm font-semibold shadow-2xl border border-white/10 animate-bounce pointer-events-none flex items-center gap-2">
      <span>{message}</span>
    </div>
  );
};
