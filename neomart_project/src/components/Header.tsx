import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  PhoneCall,
  Moon,
  Sun,
  Search,
  User,
  HelpCircle,
  ShoppingCart,
  X,
  ShoppingBag,
  CreditCard,
  Truck,
  RotateCcw,
  Cookie,
  MessageSquare,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { Product, HelpSectionType } from '../types';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenLogin: () => void;
  isLoggedIn: boolean;
  onOpenHelpSection: (section: HelpSectionType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  products: Product[];
  onSelectProduct: (productId: number) => void;
  onOpenTrackOrder: () => void;
  onSelectCategory: (category: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  cartCount,
  onOpenCart,
  onOpenLogin,
  isLoggedIn,
  onOpenHelpSection,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  products,
  onSelectProduct,
  onOpenTrackOrder,
  onSelectCategory
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [badgeBouncing, setBadgeBouncing] = useState(false);
  const helpMenuRef = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  // Trigger bounce when cartCount increases
  useEffect(() => {
    if (cartCount > 0) {
      setBadgeBouncing(true);
      const t = setTimeout(() => setBadgeBouncing(false), 500);
      return () => clearTimeout(t);
    }
  }, [cartCount]);

  // Click outside listeners
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (helpMenuRef.current && !helpMenuRef.current.contains(e.target as Node)) {
        setIsHelpOpen(false);
      }
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <header className="w-full z-40 sticky top-0 shadow-sm">
      {/* Top Utility Bar */}
      <div className="bg-[#222222] text-[#cccccc] text-[11px] py-1.5 px-4 border-b border-[#333333] hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-gray-300">
              <MapPin className="w-3.5 h-3.5 text-[#f68b1e]" />
              Deliver to: <strong className="text-white font-semibold">Lagos, Nigeria</strong>
            </span>
            <span className="text-gray-600">|</span>
            <button
              onClick={() => onOpenHelpSection('place-order')}
              className="hover:text-[#f68b1e] transition-colors cursor-pointer"
            >
              Sell on NeoMart
            </button>
            <button
              onClick={() => onSelectCategory('all')}
              className="hover:text-[#f68b1e] transition-colors cursor-pointer"
            >
              NeoMart Express
            </button>
            <button
              onClick={onOpenTrackOrder}
              className="hover:text-[#f68b1e] transition-colors cursor-pointer"
            >
              Track Order
            </button>
            <div className="flex items-center gap-1.5 bg-[#f68b1e] text-white px-2.5 py-0.5 rounded-full font-bold text-[11px] animate-pulse-line">
              <PhoneCall className="w-3 h-3" />
              <span>Hotline: 08135642842</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <button
              id="themeToggleBtn"
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 text-xs py-0.5 px-2.5 rounded-full border border-gray-600 hover:border-[#f68b1e] hover:text-[#f68b1e] transition-all cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#f68b1e]" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={() => onOpenHelpSection('place-order')}
              className="hover:text-[#f68b1e] transition-colors cursor-pointer"
            >
              Become a Vendor
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={() => onOpenHelpSection('live-chat')}
              className="hover:text-[#f68b1e] transition-colors cursor-pointer"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {/* Main Orange Header */}
      <div className="bg-[#f68b1e] text-white px-4 py-2.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 md:gap-6">
          {/* Logo */}
          <button
            onClick={() => onSelectCategory('all')}
            className="flex items-baseline font-extrabold text-2xl md:text-3xl tracking-tight text-white cursor-pointer hover:opacity-95 transition-opacity shrink-0"
          >
            Neo<span className="text-gray-900">Mart</span>
          </button>

          {/* Search Box */}
          <div ref={searchWrapRef} className="relative flex-1 max-w-2xl">
            <form onSubmit={handleFormSubmit} className="flex rounded-full overflow-hidden shadow-md bg-white">
              <input
                id="searchInput"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search products, brands and categories..."
                className="w-full px-4 py-2.5 text-sm text-gray-800 focus:outline-none bg-white"
                autoComplete="off"
              />
              <button
                type="submit"
                className="bg-[#222222] hover:bg-[#111111] text-white px-5 py-2.5 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Live Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-50 text-gray-900 dark:text-gray-100">
                <div className="p-2 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Suggestions
                </div>
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectProduct(item.id);
                      setShowSuggestions(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] border-b border-gray-100 dark:border-gray-800 last:border-0 text-xs transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.emoji}</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 capitalize px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Account */}
            <button
              onClick={onOpenLogin}
              className="flex flex-col items-center justify-center p-1.5 sm:px-3 sm:py-1 rounded-lg hover:bg-white/20 transition-colors text-white text-xs cursor-pointer"
            >
              <User className="w-5 h-5" />
              <span className="text-[11px] font-medium hidden sm:inline">
                {isLoggedIn ? 'Hi, Account' : 'Account'}
              </span>
            </button>

            {/* Help Dropdown Wrap */}
            <div ref={helpMenuRef} className="relative">
              <button
                id="helpButton"
                onClick={() => setIsHelpOpen(!isHelpOpen)}
                className="flex flex-col items-center justify-center p-1.5 sm:px-3 sm:py-1 rounded-lg hover:bg-white/20 transition-colors text-white text-xs cursor-pointer"
                aria-expanded={isHelpOpen}
              >
                <HelpCircle className="w-5 h-5" />
                <span className="text-[11px] font-medium hidden sm:inline">Help</span>
              </button>

              {isHelpOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl p-2 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-gray-800 px-2 font-bold text-xs">
                    <span>Help Center</span>
                    <button
                      onClick={() => setIsHelpOpen(false)}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 text-xs">
                    <button
                      onClick={() => {
                        onOpenHelpSection('place-order');
                        setIsHelpOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] font-medium text-left transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#f68b1e]" />
                      <span>Place an order</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenHelpSection('payment-options');
                        setIsHelpOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] font-medium text-left transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-[#f68b1e]" />
                      <span>Payment options</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenHelpSection('track-order');
                        setIsHelpOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] font-medium text-left transition-colors cursor-pointer"
                    >
                      <Truck className="w-4 h-4 text-[#f68b1e]" />
                      <span>Track an order</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenHelpSection('cancel-order');
                        setIsHelpOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] font-medium text-left transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4 text-red-500" />
                      <span>Cancel an order</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenHelpSection('returns-refunds');
                        setIsHelpOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] font-medium text-left transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-[#f68b1e]" />
                      <span>Returns & Refunds</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenHelpSection('cookie-preferences');
                        setIsHelpOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] font-medium text-left transition-colors cursor-pointer"
                    >
                      <Cookie className="w-4 h-4 text-[#f68b1e]" />
                      <span>Cookie Preferences</span>
                    </button>

                    <div className="pt-1.5 mt-1 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-1.5">
                      <button
                        onClick={() => {
                          onOpenHelpSection('live-chat');
                          setIsHelpOpen(false);
                        }}
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#fff3e0] dark:bg-[#2a1a00] text-[#f68b1e] font-bold text-xs hover:bg-[#ffe5c7] dark:hover:bg-[#3d2400] transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Live Chat Support</span>
                      </button>
                      <a
                        href="https://wa.me/2348135642842?text=Hello%20NeoMart%20Support,%20I%20need%20help%20with%20my%20order."
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold text-xs hover:bg-emerald-100 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp Support</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex flex-col items-center justify-center p-1.5 sm:px-3 sm:py-1 rounded-lg hover:bg-white/20 transition-colors text-white text-xs cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                <span
                  id="cartBadge"
                  className={`absolute -top-1.5 -right-2 bg-gray-900 text-white font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white/40 ${
                    badgeBouncing ? 'cart-badge-bounce' : ''
                  }`}
                >
                  {cartCount}
                </span>
              </div>
              <span className="text-[11px] font-medium hidden sm:inline">Cart</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
