import React from 'react';
import { PhoneCall } from 'lucide-react';
import { HelpSectionType } from '../types';

interface FooterProps {
  onOpenHelpSection: (section: HelpSectionType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenHelpSection }) => {
  return (
    <footer className="w-full bg-[#1c1c1c] text-[#bbbbbb] pt-10 pb-8 mt-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-gray-800 text-xs">
          {/* Col 1 */}
          <div className="space-y-3">
            <h4 className="text-[#f68b1e] font-bold uppercase tracking-wider text-xs">
              NeoMart
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-[#f68b1e] transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#f68b1e] transition-colors">
                  NeoMart Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#f68b1e] transition-colors">
                  NeoMart Express
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#f68b1e] transition-colors">
                  Official Stores
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#f68b1e] transition-colors">
                  Terms &amp; Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#f68b1e] transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-[#f68b1e] font-bold uppercase tracking-wider text-xs">
              Buying on NeoMart
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button
                  onClick={() => onOpenHelpSection('place-order')}
                  className="hover:text-[#f68b1e] transition-colors cursor-pointer text-left"
                >
                  Buyer Protection
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenHelpSection('place-order')}
                  className="hover:text-[#f68b1e] transition-colors cursor-pointer text-left"
                >
                  How to Buy
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-[#f68b1e] transition-colors">
                  Pickup Stations
                </a>
              </li>
              <li>
                <button
                  onClick={() => onOpenHelpSection('returns-refunds')}
                  className="hover:text-[#f68b1e] transition-colors cursor-pointer text-left"
                >
                  Returns &amp; Refunds
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenHelpSection('live-chat')}
                  className="hover:text-[#f68b1e] transition-colors cursor-pointer text-left"
                >
                  Report a Product
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenHelpSection('live-chat')}
                  className="hover:text-[#f68b1e] transition-colors cursor-pointer text-left"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-[#f68b1e] font-bold uppercase tracking-wider text-xs">
              Selling on NeoMart
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-[#f68b1e] transition-colors">
                  How to Sell
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#f68b1e] transition-colors">
                  Seller Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#f68b1e] transition-colors">
                  Vendor Hub
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#f68b1e] transition-colors">
                  Global Selling
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#f68b1e] transition-colors">
                  Advertise with Us
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="text-[#f68b1e] font-bold uppercase tracking-wider text-xs">
              Customer Support
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button
                  onClick={() => onOpenHelpSection('place-order')}
                  className="hover:text-[#f68b1e] transition-colors cursor-pointer text-left"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenHelpSection('live-chat')}
                  className="hover:text-[#f68b1e] transition-colors cursor-pointer text-left"
                >
                  Live Chat Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenHelpSection('payment-options')}
                  className="hover:text-[#f68b1e] transition-colors cursor-pointer text-left"
                >
                  Payment Methods
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenHelpSection('track-order')}
                  className="hover:text-[#f68b1e] transition-colors cursor-pointer text-left"
                >
                  Track an Order
                </button>
              </li>
            </ul>

            {/* Hotline Callout Box */}
            <div className="bg-[#2a2a2a] p-3.5 rounded-xl border border-gray-700 mt-2 space-y-1">
              <div className="text-[10px] text-gray-400 flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-[#f68b1e]" />
                <span>Customer Hotline</span>
              </div>
              <strong className="text-base font-extrabold text-[#f68b1e] block">
                08135642842
              </strong>
              <small className="text-[10px] text-gray-400 block">
                Mon–Sat 8AM–8PM · Sun 10AM–6PM
              </small>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 text-center text-gray-500 text-[11px] space-y-1">
          <div className="font-extrabold text-lg text-[#f68b1e]">
            Neo<span className="text-white">Mart</span>
          </div>
          <p>© 2026 NeoMart Nigeria. All Rights Reserved. | Shop Smart, Live Better.</p>
        </div>
      </div>
    </footer>
  );
};
