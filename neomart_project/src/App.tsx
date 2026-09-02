import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { Sidebar } from './components/Sidebar';
import { HeroSlider } from './components/HeroSlider';
import { CustomerBanner } from './components/CustomerBanner';
import { FlashSales } from './components/FlashSales';
import { BrandsStrip } from './components/BrandsStrip';
import { ProductCard } from './components/ProductCard';
import { ProductDetail } from './components/ProductDetail';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './components/CheckoutModal';
import { PaymentSuccessModal } from './components/PaymentSuccessModal';
import { LoginModal } from './components/LoginModal';
import { HelpCenterModal } from './components/HelpCenterModal';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

import { allProducts, flashProductIds } from './data/products';
import { initialReviews } from './data/ordersAndReviews';
import { importProductsToFirestore } from './config/firestoreService';
import {
  Product,
  CartItem,
  Review,
  CategoryId,
  HelpSectionType,
  PaymentMethodType,
  DeliveryDetails
} from './types';

import {
  Smartphone,
  Laptop,
  Tv,
  Shirt,
  Flame,
  Gamepad2,
  HeartPulse,
  Home,
  Baby,
  Clock,
  Headphones,
  Footprints,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('neomart_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('neomart_logged_in') === 'true';
  });
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('neomart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('neomart_reviews');
      return saved ? JSON.parse(saved) : initialReviews;
    } catch {
      return initialReviews;
    }
  });

  // UI Views & Modals state
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortOption, setSortOption] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);
  const [lastPaymentMethod, setLastPaymentMethod] = useState<PaymentMethodType>('bank');

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeHelpSection, setActiveHelpSection] = useState<HelpSectionType>('place-order');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('neomart_theme', theme);
  }, [theme]);

  // Initialize Firebase and import products
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Check if Firebase is configured
        if (!import.meta.env.VITE_FIREBASE_API_KEY) {
          console.warn('Firebase not configured. Add your Firebase config to .env');
          return;
        }
        
        // Import products on first load
        const result = await importProductsToFirestore();
        if (result.success) {
          console.log('✅ Firebase initialized with products');
        }
      } catch (error) {
        console.error('Firebase initialization error:', error);
      }
    };

    initializeFirebase();
  }, []);

  // Sync cart
  useEffect(() => {
    localStorage.setItem('neomart_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync reviews
  useEffect(() => {
    localStorage.setItem('neomart_reviews', JSON.stringify(reviews));
  }, [reviews]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Cart Operations
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`${product.name.slice(0, 28)}... added to cart 🛒`);
  };

  const handleChangeQty = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveCartItem = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    showToast('Item removed from cart');
  };

  // Reviews operations
  const handleAddReview = (newReview: Omit<Review, 'id' | 'date' | 'helpful'>) => {
    const reviewObj: Review = {
      ...newReview,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      helpful: 0
    };
    setReviews((prev) => [reviewObj, ...prev]);
    showToast('Review submitted successfully! Thank you ⭐');
  };

  const handleVoteHelpful = (reviewId: number) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r))
    );
  };

  // Category & Product Navigation
  const handleSelectCategory = (cat: CategoryId | string) => {
    setSelectedCategory(cat as CategoryId);
    setSelectedProductId(null);
    if (cat === 'all') {
      setIsSearching(false);
      setSearchQuery('');
    } else {
      setIsSearching(true);
      setSearchQuery(cat);
    }
  };

  const handleSelectProduct = (productId: number) => {
    setSelectedProductId(productId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCatalog = () => {
    setSelectedProductId(null);
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    setSelectedProductId(null);
  };

  const handleOpenHelpSection = (section: HelpSectionType) => {
    setActiveHelpSection(section);
    setIsHelpOpen(true);
  };

  // Checkout flow
  const handleStartCheckout = () => {
    if (!isLoggedIn) {
      setIsCartOpen(false);
      setIsLoginOpen(true);
      showToast('Please sign in or enter your contact info to checkout');
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCompleteOrder = (
    method: PaymentMethodType,
    _deliveryDetails?: DeliveryDetails
  ) => {
    setLastPaymentMethod(method);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsPaymentSuccessOpen(true);
    showToast(method === 'delivery' ? 'Order Placed Successfully! 📦' : 'Payment Received! 💳');
  };

  // Data Filtering
  const getFilteredProducts = () => {
    let list = [...allProducts];

    if (isSearching && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    } else if (selectedCategory !== 'all') {
      list = list.filter(
        (p) => p.category === selectedCategory || p.tags.includes(selectedCategory)
      );
    }

    if (sortOption === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  };

  const filteredList = getFilteredProducts();
  const selectedProduct = allProducts.find((p) => p.id === selectedProductId);
  const flashProducts = flashProductIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const categoryCards = [
    { id: 'phone', label: 'Phones', icon: <Smartphone className="w-6 h-6 text-[#f68b1e]" /> },
    { id: 'laptop', label: 'Laptops', icon: <Laptop className="w-6 h-6 text-[#f68b1e]" /> },
    { id: 'tv', label: 'TVs', icon: <Tv className="w-6 h-6 text-[#f68b1e]" /> },
    { id: 'appliance', label: 'Appliances', icon: <Flame className="w-6 h-6 text-[#f68b1e]" /> },
    { id: 'fashion', label: 'Fashion', icon: <Shirt className="w-6 h-6 text-[#f68b1e]" /> },
    { id: 'gaming', label: 'Gaming', icon: <Gamepad2 className="w-6 h-6 text-[#f68b1e]" /> },
    { id: 'watch', label: 'Watches', icon: <Clock className="w-6 h-6 text-[#f68b1e]" /> },
    { id: 'headphone', label: 'Audio', icon: <Headphones className="w-6 h-6 text-[#f68b1e]" /> },
    { id: 'shoe', label: 'Shoes', icon: <Footprints className="w-6 h-6 text-[#f68b1e]" /> },
    { id: 'home', label: 'Home', icon: <Home className="w-6 h-6 text-[#f68b1e]" /> },
    { id: 'health', label: 'Health', icon: <HeartPulse className="w-6 h-6 text-[#f68b1e]" /> },
    { id: 'baby', label: 'Baby', icon: <Baby className="w-6 h-6 text-[#f68b1e]" /> }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5] dark:bg-[#0f0f0f] text-gray-900 dark:text-gray-100 transition-colors">
      {/* 1. Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        isLoggedIn={isLoggedIn}
        onOpenHelpSection={handleOpenHelpSection}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        products={allProducts}
        onSelectProduct={handleSelectProduct}
        onOpenTrackOrder={() => handleOpenHelpSection('track-order')}
        onSelectCategory={handleSelectCategory}
      />

      {/* 2. Top Category Pills Bar */}
      <CategoryNav
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* 3. Main Container Grid */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 flex-1 w-full">
        <div className="flex gap-4">
          {/* Left Category Sidebar */}
          <Sidebar
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />

          {/* Right Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* If Single Product Detail is active */}
            {selectedProduct ? (
              <ProductDetail
                product={selectedProduct}
                onBack={handleBackToCatalog}
                onAddToCart={handleAddToCart}
                reviews={reviews}
                onAddReview={handleAddReview}
                onVoteHelpful={handleVoteHelpful}
              />
            ) : isSearching ? (
              /* Search / Category Filter Results View */
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 sm:p-5 mb-6 shadow-xs border border-gray-200 dark:border-gray-800 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-gray-200 dark:border-gray-800 gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                      Showing results for: <span className="text-[#f68b1e]">"{searchQuery}"</span>
                    </h2>
                    <p className="text-xs text-gray-500">
                      {filteredList.length} products found
                    </p>
                  </div>

                  {/* Sort by dropdown */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 flex items-center gap-1 font-semibold">
                      <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
                    </span>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#242424] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e]"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Top Customer Rated</option>
                    </select>
                  </div>
                </div>

                {filteredList.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-xs">
                    <SlidersHorizontal className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p>No products match your search criteria. Try a different query.</p>
                    <button
                      onClick={() => handleSelectCategory('all')}
                      className="mt-3 text-xs font-bold text-[#f68b1e] hover:underline"
                    >
                      Browse All Categories
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {filteredList.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onSelectProduct={handleSelectProduct}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Standard Home Marketplace Feed */
              <>
                {/* Hero Slider with side ads */}
                <HeroSlider onSelectCategory={handleSelectCategory} />

                {/* Customer Care Hotline Callout */}
                <CustomerBanner />

                {/* Shop by Category Quick Grid */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 mb-4 shadow-xs border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#f68b1e]">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                      Shop by Category
                    </h2>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {categoryCards.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.id)}
                        className="bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-gray-800 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 hover:border-[#f68b1e] hover:shadow-xs transition-all cursor-pointer group"
                      >
                        <div className="group-hover:scale-110 transition-transform">
                          {cat.icon}
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#f68b1e]">
                          {cat.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Flash Sales with Live Timer */}
                <FlashSales
                  products={flashProducts}
                  onAddToCart={handleAddToCart}
                  onSelectProduct={handleSelectProduct}
                  onSeeAll={() => handleSelectCategory('all')}
                />

                {/* Top Brands Strip */}
                <BrandsStrip onSearchBrand={handleSearchSubmit} />

                {/* Category Section: Phones & Tablets */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 mb-4 shadow-xs border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-[#f68b1e]">
                    <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100">
                      📱 Phones &amp; Tablets
                    </h2>
                    <button
                      onClick={() => handleSelectCategory('phone')}
                      className="text-xs font-bold text-[#f68b1e] hover:underline cursor-pointer"
                    >
                      See All →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {allProducts
                      .filter((p) => p.category === 'phone')
                      .slice(0, 8)
                      .map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          onAddToCart={handleAddToCart}
                          onSelectProduct={handleSelectProduct}
                        />
                      ))}
                  </div>
                </div>

                {/* Category Section: Laptops & Computers */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 mb-4 shadow-xs border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-[#f68b1e]">
                    <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100">
                      💻 Laptops &amp; Computers
                    </h2>
                    <button
                      onClick={() => handleSelectCategory('laptop')}
                      className="text-xs font-bold text-[#f68b1e] hover:underline cursor-pointer"
                    >
                      See All →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {allProducts
                      .filter((p) => p.category === 'laptop')
                      .slice(0, 8)
                      .map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          onAddToCart={handleAddToCart}
                          onSelectProduct={handleSelectProduct}
                        />
                      ))}
                  </div>
                </div>

                {/* Category Section: Fashion & Shoes */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 mb-4 shadow-xs border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-[#f68b1e]">
                    <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100">
                      👟 Fashion &amp; Footwear
                    </h2>
                    <button
                      onClick={() => handleSelectCategory('fashion')}
                      className="text-xs font-bold text-[#f68b1e] hover:underline cursor-pointer"
                    >
                      See All →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {allProducts
                      .filter((p) => p.category === 'fashion')
                      .slice(0, 8)
                      .map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          onAddToCart={handleAddToCart}
                          onSelectProduct={handleSelectProduct}
                        />
                      ))}
                  </div>
                </div>

                {/* Category Section: Home Appliances */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 mb-4 shadow-xs border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-[#f68b1e]">
                    <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100">
                      🏠 Home &amp; Kitchen Appliances
                    </h2>
                    <button
                      onClick={() => handleSelectCategory('appliance')}
                      className="text-xs font-bold text-[#f68b1e] hover:underline cursor-pointer"
                    >
                      See All →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {allProducts
                      .filter((p) => p.category === 'appliance')
                      .slice(0, 8)
                      .map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          onAddToCart={handleAddToCart}
                          onSelectProduct={handleSelectProduct}
                        />
                      ))}
                  </div>
                </div>

                {/* Category Section: Gaming Gear */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 mb-4 shadow-xs border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-[#f68b1e]">
                    <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100">
                      🎮 Gaming Consoles &amp; Accessories
                    </h2>
                    <button
                      onClick={() => handleSelectCategory('gaming')}
                      className="text-xs font-bold text-[#f68b1e] hover:underline cursor-pointer"
                    >
                      See All →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {allProducts
                      .filter((p) => p.category === 'gaming')
                      .slice(0, 8)
                      .map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          onAddToCart={handleAddToCart}
                          onSelectProduct={handleSelectProduct}
                        />
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <Footer onOpenHelpSection={handleOpenHelpSection} />

      {/* 5. Cart Slide-over Drawer */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onChangeQty={handleChangeQty}
        onRemoveItem={handleRemoveCartItem}
        onOpenCheckout={handleStartCheckout}
      />

      {/* 6. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onCompleteOrder={handleCompleteOrder}
        showToast={showToast}
      />

      {/* 7. Payment Success Modal */}
      <PaymentSuccessModal
        isOpen={isPaymentSuccessOpen}
        onClose={() => setIsPaymentSuccessOpen(false)}
        method={lastPaymentMethod}
      />

      {/* 8. Login / Account Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        isLoggedIn={isLoggedIn}
        onLoginSuccess={(id) => {
          setIsLoggedIn(true);
          localStorage.setItem('neomart_logged_in', 'true');
        }}
        onLogout={() => {
          setIsLoggedIn(false);
          localStorage.removeItem('neomart_logged_in');
        }}
        showToast={showToast}
      />

      {/* 9. Help Center Modal */}
      <HelpCenterModal
        isOpen={isHelpOpen}
        section={activeHelpSection}
        onClose={() => setIsHelpOpen(false)}
        onSelectSection={setActiveHelpSection}
        onStartShopping={() => {
          setIsSearching(false);
          setSelectedCategory('all');
          setSelectedProductId(null);
        }}
        showToast={showToast}
      />

      {/* 10. Global Toast Alert */}
      <Toast message={toastMessage} />
    </div>
  );
}
