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
  ExternalLink,
  Building2
} from 'lucide-react';
import { Product, HelpSectionType } from '../types';
import { NeoMartIcon } from './NeoMartLogo';

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
  onOpenAdmin: () => void;
  isAdmin: boolean;
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
  onSelectCategory,
  onOpenAdmin,
  isAdmin
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

  // Click outside listeners with touch and pointer event support
  useEffect(() => {
    const handlePointerDownOutside = (e: MouseEvent | TouchEvent | PointerEvent) => {
      if (helpMenuRef.current && !helpMenuRef.current.contains(e.target as Node)) {
        setIsHelpOpen(false);
      }
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDownOutside);
    return () => document.removeEventListener('pointerdown', handlePointerDownOutside);
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
            {isAdmin && (
              <>
                <span className="text-gray-600">|</span>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-[#f68b1e] transition-colors cursor-pointer"
                >
                  Admin
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Orange Header */}
      <div className="bg-[#f68b1e] text-white px-3 sm:px-4 py-2.5 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-6">
          {/* Top Bar for Mobile / Left Section for Desktop */}
          <div className="flex items-center justify-between w-full md:w-auto">
            {/* Logo */}
            <button
              onClick={() => onSelectCategory('all')}
              className="flex items-center gap-1.5 font-extrabold text-2xl md:text-3xl tracking-tight text-white cursor-pointer hover:opacity-95 transition-opacity shrink-0"
            >
              <NeoMartIcon size={30} className="drop-shadow-sm" />
              <span>
                neo<span className="text-gray-900">mart</span>
              </span>
            </button>

            {/* Mobile Actions (Track, Account, Help, Cart) */}
            <div className="flex md:hidden items-center gap-1.5 relative">
              {/* Live GPS Track Button */}
              <button
                onClick={onOpenTrackOrder}
                className="p-2 rounded-lg bg-orange-600/40 hover:bg-orange-600/60 border border-white/20 transition-colors text-white cursor-pointer"
                aria-label="Track Order Live GPS"
                title="Track Order Live GPS"
              >
                <Truck className="w-4 h-4 animate-pulse" />
              </button>

              {/* Account */}
              <button
                onClick={onOpenLogin}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Help (Opens Help Center on Mobile) */}
              <div className="relative">
                <button
                  onClick={() => setIsHelpOpen(!isHelpOpen)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
                  aria-label="Help Center"
                  title="Help & Customer Care"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>

                {/* Mobile Help Menu Dropdown Popover */}
                {isHelpOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-gray-800 px-2 font-bold text-xs">
                      <span className="flex items-center gap-1.5 text-gray-900 dark:text-white font-extrabold">
                        <HelpCircle className="w-4 h-4 text-[#f68b1e]" />
                        NeoMart Customer Care
                      </span>
                      <button
                        onClick={() => setIsHelpOpen(false)}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
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
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] font-semibold text-left transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4 text-[#f68b1e]" />
                        <span>Place an order</span>
                      </button>
                      <button
                        onClick={() => {
                          onOpenHelpSection('payment-options');
                          setIsHelpOpen(false);
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] font-semibold text-left transition-colors cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4 text-[#f68b1e]" />
                        <span>Payment options</span>
                      </button>
                      <button
                        onClick={() => {
                          onOpenTrackOrder();
                          setIsHelpOpen(false);
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] font-semibold text-left transition-colors cursor-pointer"
                      >
                        <Truck className="w-4 h-4 text-[#f68b1e]" />
                        <span>Live GPS Order Tracking</span>
                      </button>
                      <button
                        onClick={() => {
                          onOpenHelpSection('cancel-order');
                          setIsHelpOpen(false);
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] font-semibold text-left transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4 text-red-500" />
                        <span>Cancel an order</span>
                      </button>
                      <button
                        onClick={() => {
                          onOpenHelpSection('returns-refunds');
                          setIsHelpOpen(false);
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] font-semibold text-left transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 text-[#f68b1e]" />
                        <span>Returns & Refunds</span>
                      </button>

                      <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-1.5">
                        <button
                          onClick={() => {
                            onOpenHelpSection('live-chat');
                            setIsHelpOpen(false);
                          }}
                          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#fff3e0] dark:bg-[#2a1a00] text-[#f68b1e] font-bold text-xs hover:bg-[#ffe5c7] dark:hover:bg-[#3d2400] transition-colors cursor-pointer shadow-xs"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Open Live Chat Support</span>
                        </button>
                        <a
                          href="https://wa.me/2348135642842?text=Hello%20NeoMart%20Support,%20I%20need%20help%20with%20my%20order."
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold text-xs hover:bg-emerald-100 transition-colors cursor-pointer"
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

              {/* Cart */}
              <button
                onClick={onOpenCart}
                className="relative p-2 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
                aria-label="Cart"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  <span
                    className={`absolute -top-1.5 -right-2 bg-gray-900 text-white font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white/40 ${
                      badgeBouncing ? 'cart-badge-bounce' : ''
                    }`}
                  >
                    {cartCount}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Search Box - Full Width on Mobile, Expanded on Desktop */}
          <div ref={searchWrapRef} className="relative w-full md:flex-1 md:max-w-2xl">
            <form onSubmit={handleFormSubmit} className="flex rounded-full overflow-hidden shadow-sm md:shadow-md bg-white">
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
                className="w-full px-4 py-2.5 text-sm text-gray-800 focus:outline-none bg-white placeholder:text-gray-400"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange('');
                    setShowSuggestions(false);
                  }}
                  className="px-2 text-gray-400 hover:text-gray-600 bg-white flex items-center justify-center cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="bg-[#222222] hover:bg-[#111111] text-white px-4.5 sm:px-5 py-2.5 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Live Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-50 text-gray-900 dark:text-gray-100 max-h-80 overflow-y-auto"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="p-2 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Suggestions
                </div>
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      onSelectProduct(item.id);
                      setShowSuggestions(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] border-b border-gray-100 dark:border-gray-800 last:border-0 text-xs transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 capitalize px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 shrink-0 ml-2">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Header Action Buttons */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {/* Google Sign In Button */}
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-gray-800 hover:bg-gray-100 transition-all text-xs font-bold cursor-pointer shadow-sm"
              title="Sign in with Google"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="text-[11px] font-semibold">Google</span>
            </button>

            {/* Live GPS Track Button */}
            <button
              onClick={onOpenTrackOrder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-600/30 hover:bg-orange-600/50 border border-white/30 text-white transition-all text-xs font-bold cursor-pointer"
              title="Track Order Live GPS"
            >
              <Truck className="w-4 h-4 text-white animate-pulse" />
              <span className="text-[11px] font-semibold">Live GPS</span>
            </button>

            {/* Account */}
            <button
              onClick={onOpenLogin}
              className="flex flex-col items-center justify-center px-3 py-1 rounded-lg hover:bg-white/20 transition-colors text-white text-xs cursor-pointer"
            >
              <User className="w-5 h-5" />
              <span className="text-[11px] font-medium">
                {isLoggedIn ? 'Hi, Account' : 'Account'}
              </span>
            </button>

            {/* Help Dropdown Wrap */}
            <div ref={helpMenuRef} className="relative">
              <button
                id="helpButton"
                onClick={() => setIsHelpOpen(!isHelpOpen)}
                className="flex flex-col items-center justify-center px-3 py-1 rounded-lg hover:bg-white/20 transition-colors text-white text-xs cursor-pointer"
                aria-expanded={isHelpOpen}
              >
                <HelpCircle className="w-5 h-5" />
                <span className="text-[11px] font-medium">Help</span>
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
              className="relative flex flex-col items-center justify-center px-3 py-1 rounded-lg hover:bg-white/20 transition-colors text-white text-xs cursor-pointer"
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
              <span className="text-[11px] font-medium">Cart</span>
            </button>
          </div>
        </div>
      </div>
      {isAdmin && (
        <button
          onClick={onOpenAdmin}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#222222] px-4 py-3 text-xs font-bold text-white shadow-xl transition-transform hover:scale-105 cursor-pointer"
          aria-label="Open admin panel"
          title="Open admin panel"
        >
          <Building2 className="w-4 h-4 text-[#f68b1e]" />
          <span>Admin</span>
        </button>
      )}
    </header>
  );
};
