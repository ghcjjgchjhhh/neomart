import React from 'react';
import { PhoneCall, Headphones, Clock } from 'lucide-react';

export const CustomerBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-linear-to-r from-[#1a1a2e]/90 to-[#0f3460]/90 text-white p-4 sm:p-5 mb-4 shadow-sm border border-white/10 backdrop-blur-md banner-shimmer">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left info */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-[#f68b1e]/20 flex items-center justify-center text-[#f68b1e] shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-white">
              Need Help? Call Our Customer Support Line
            </h4>
            <p className="text-xs text-gray-300">
              Our friendly agents are ready to assist with orders, returns, complaints, and more.
            </p>
          </div>
        </div>

        {/* Center Hotline Pill */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-[#f68b1e] hover:bg-[#e07a10] px-4 py-2 rounded-xl text-center shadow-md transition-all">
            <div className="flex items-center justify-center gap-1.5 font-extrabold text-base sm:text-lg tracking-wider">
              <PhoneCall className="w-4 h-4" />
              <span>08135642842</span>
            </div>
            <small className="block text-[10px] font-normal text-white/90">
              Toll-Free Customer Line
            </small>
          </div>

          {/* Opening Hours */}
          <div className="text-[11px] text-gray-300 space-y-0.5">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#f68b1e]" />
              <span>Mon – Sat: 8AM – 8PM</span>
            </div>
            <div>Sun: 10AM – 6PM</div>
            <div className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping"></span>
              <span>Currently Open</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
