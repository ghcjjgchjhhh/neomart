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
  onSelectCategory,
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [badgeBouncing, setBadgeBouncing] = useState(false);
  const helpMenuRef = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cartCount > 0) {
      setBadgeBouncing(true);
      const t = setTimeout(() => setBadgeBouncing(false), 500);
      return () => clearTimeout(t);
    }
  }, [cartCount]);

  useEffect(() => {
    const handlePointerDownOutside = (event: MouseEvent | TouchEvent | PointerEvent) => {
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
        setIsHelpOpen(false);
      }
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDownOutside);
    return () => document.removeEventListener('pointerdown', handlePointerDownOutside);
  }, []);

  const suggestions = searchQuery.trim()
    ? products
        .filter(
          (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <header className="w-full z-40 sticky top-0 shadow-sm">
      <div className="bg-[#222222] text-[#cccccc] text-[11px] py-1.5 px-4 border-b border-[#333333] hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-gray-300">
              <MapPin className="w-3.5 h-3.5 text-[#f68b1e]" />
              Deliver to: <strong className="text-white font-semibold">Lagos, Nigeria</strong>
            </span>
            <span className="text-gray-600">|</span>
            <button
              type="button"
              onClick={() => onOpenHelpSection('place-order')}
              className="hover:text-[#f68b1e] transition-colors cursor-pointer"
            >
              Sell on NeoMart
            </button>
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className="hover:text-[#f68b1e] transition-colors cursor-pointer"
            >
              NeoMart Express
            </button>
            <button
              type="button"
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
              type="button"
              onClick={() => onOpenHelpSection('track-order')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Order Status
            </button>
            <button
              type="button"
              onClick={() => onOpenHelpSection('returns-refunds')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Return Center
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 bg-[#333333] hover:bg-[#444444] text-gray-200 px-2.5 py-0.5 rounded transition-colors cursor-pointer"
              title="Toggle Dark / Light Theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3 h-3 text-[#f68b1e]" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3 h-3 text-indigo-400" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#f68b1e] text-white px-3 sm:px-4 py-2.5 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-6">
          <div className="flex items-center justify-between w-full md:w-auto">
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className="flex items-baseline font-extrabold text-2xl md:text-3xl tracking-tight text-white cursor-pointer hover:opacity-95 transition-opacity shrink-0"
            >
              Neo<span className="text-gray-900">Mart</span>
            </button>

            <div className="flex md:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenLogin}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsHelpOpen((prev) => !prev)}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
                aria-label="Help"
              >
                <HelpCircle className="w-5 h-5" />
              </button>

              <button
                type="button"
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

          <div ref={searchWrapRef} className="relative w-full md:flex-1 md:max-w-2xl">
            <form onSubmit={handleFormSubmit} className="flex rounded-full overflow-hidden shadow-sm md:shadow-md bg-white">
              <input
                id="searchInput"
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  onSearchChange(event.target.value);
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

            {showSuggestions && suggestions.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-50 text-gray-900 dark:text-gray-100 max-h-80 overflow-y-auto"
                onPointerDown={(event) => event.stopPropagation()}
              >
                <div className="p-2 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Suggestions
                </div>
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onPointerDown={(event) => {
                      event.preventDefault();
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

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenLogin}
              className="flex flex-col items-center justify-center px-3 py-1 rounded-lg hover:bg-white/20 transition-colors text-white text-xs cursor-pointer"
            >
              <User className="w-5 h-5" />
              <span className="text-[11px] font-medium">
                {isLoggedIn ? 'Hi, Account' : 'Account'}
              </span>
            </button>

            <div className="relative" ref={helpMenuRef}>
              <button
                id="helpButton"
                type="button"
                onClick={() => setIsHelpOpen((prev) => !prev)}
                className="flex flex-col items-center justify-center px-3 py-1 rounded-lg hover:bg-white/20 transition-colors text-white text-xs cursor-pointer"
                aria-expanded={isHelpOpen}
              >
                <HelpCircle className="w-5 h-5" />
                <span className="text-[11px] font-medium">Help</span>
              </button>

              {isHelpOpen && (
                <div
                  id="helpDropdown"
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-200 rounded-xl shadow-2xl py-2 z-50 border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className="font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Help &amp; Customer Care
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsHelpOpen(false);
                        onOpenHelpSection('place-order');
                      }}
                      className="text-[11px] text-[#f68b1e] hover:underline font-semibold"
                    >
                      Full Center →
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsHelpOpen(false);
                        onOpenHelpSection('place-order');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-orange-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-[#f68b1e]">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold">How to Place an Order</div>
                        <div className="text-[11px] text-gray-500">Step-by-step checkout guide</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsHelpOpen(false);
                        onOpenHelpSection('track-order');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-orange-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold">Track Your Package</div>
                        <div className="text-[11px] text-gray-500">Real-time delivery progress</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsHelpOpen(false);
                        onOpenHelpSection('returns-refunds');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-orange-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                        <RotateCcw className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold">Returns &amp; Refunds</div>
                        <div className="text-[11px] text-gray-500">7-day hassle-free returns</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsHelpOpen(false);
                        onOpenHelpSection('payment-options');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-orange-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold">Payment Methods</div>
                        <div className="text-[11px] text-gray-500">Card, Transfer &amp; Pay on Delivery</div>
                      </div>
                    </button>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsHelpOpen(false);
                        onOpenHelpSection('live-chat');
                      }}
                      className="w-full py-2 bg-[#f68b1e] hover:bg-[#e07b14] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Live Chat Support
                    </button>
                    <div className="flex items-center justify-center gap-1 text-[11px] text-gray-500 mt-2">
                      <PhoneCall className="w-3 h-3 text-emerald-600" />
                      <span>Call: 08135642842 (8am - 8pm)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex flex-col items-center justify-center px-3 py-1 rounded-lg hover:bg-white/20 transition-colors text-white text-xs cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                <span
                  id="cartBadge"
                  className={`absolute -top-1.5 -right-2.5 bg-gray-900 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#f68b1e] ${
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
    </header>
  );
};
