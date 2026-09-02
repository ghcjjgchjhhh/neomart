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
import { AdminOrdersModal } from './components/AdminOrdersModal';
import { OrderTrackingModal } from './components/TrackingModal';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { SplashScreen } from './components/SplashScreen';

const ADMIN_EMAIL = 'ifeanyianoma2@gmail.com';

import { allProducts, flashProductIds } from './data/products';
import { initialReviews, sampleOrders } from './data/ordersAndReviews';
import { confirmOrderPayment, saveOrder, subscribeToOrders } from './config/ordersService';
import {
  Product,
  CartItem,
  Review,
  Order,
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
  const [currentUserEmail, setCurrentUserEmail] = useState(() =>
    localStorage.getItem('neomart_user_email') || ''
  );
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

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('neomart_orders');
      const storedOrders: Order[] = saved
        ? (JSON.parse(saved) as Order[]).filter(
            (order) => !sampleOrders.some((sampleOrder) => sampleOrder.id === order.id)
          )
        : [];
      return storedOrders.map((order) =>
        !order.paymentConfirmed &&
        order.paymentMethod !== 'Payment on Delivery' &&
        (order.status === 'Out for Delivery' || order.status === 'Order Confirmed')
          ? { ...order, status: 'Processing', paymentConfirmed: false }
          : order
      );
    } catch {
      return [];
    }
  });
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string | null>(null);

  // UI Views & Modals state
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortOption, setSortOption] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);
  const [lastPaymentMethod, setLastPaymentMethod] = useState<PaymentMethodType>('delivery');

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeHelpSection, setActiveHelpSection] = useState<HelpSectionType>('place-order');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('neomart_theme', theme);
  }, [theme]);

  // Sync cart
  useEffect(() => {
    localStorage.setItem('neomart_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync reviews
  useEffect(() => {
    localStorage.setItem('neomart_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Sync orders
  useEffect(() => {
    localStorage.setItem('neomart_orders', JSON.stringify(orders));
  }, [orders]);

  // Keep customer and admin order lists synchronized across devices when Firebase is configured.
  useEffect(() => {
    let isActive = true;
    let unsubscribe: (() => void) | null = null;

    subscribeToOrders((remoteOrders) => {
      const realOrders = remoteOrders.filter(
        (order) =>
          order.orderSource === 'customer' &&
          !sampleOrders.some((sampleOrder) => sampleOrder.id === order.id)
      );
      if (isActive) setOrders(realOrders);
    }).then((cleanup) => {
      if (isActive) unsubscribe = cleanup;
      else cleanup?.();
    }).catch((error) => {
      console.error('Could not connect to shared orders:', error);
    });

    return () => {
      isActive = false;
      unsubscribe?.();
    };
  }, []);

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

  const handleConfirmOrderPayment = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: 'Order Confirmed', paymentConfirmed: true }
          : order
      )
    );
    void confirmOrderPayment(orderId).catch(() => {
      showToast('Could not sync confirmation. Check Firebase connection.');
    });
    showToast('Order confirmed successfully');
  };

  // Checkout flow
  const handleStartCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOpenLiveTracking = (orderId?: string) => {
    setTrackingOrderId(orderId || null);
    setIsOrderTrackingOpen(true);
  };

  const handleCompleteOrder = (
    method: PaymentMethodType,
    _deliveryDetails?: DeliveryDetails
  ) => {
    setLastPaymentMethod(method);

    // Create real Order item
    const newOrderId = 'NM-' + Math.floor(10000 + Math.random() * 90000);
    const orderItems = cart.map((c) => ({
      name: c.name,
      qty: c.qty,
      price: c.price,
      image: c.img || ''
    }));
    const calculatedTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

    const fullAddress = _deliveryDetails?.address
      ? `${_deliveryDetails.address}, ${_deliveryDetails.city}, ${_deliveryDetails.state}`
      : 'Plot 8, Sangotedo, Lekki-Epe Expressway, Lagos';

    const newOrder: Order = {
      id: newOrderId,
      orderSource: 'customer',
      phone: _deliveryDetails?.phone || '08135642842',
      email: currentUserEmail || ADMIN_EMAIL,
      date: new Date().toISOString().split('T')[0],
      eta: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      status: method === 'delivery' ? 'Order Placed' : 'Processing',
      paymentConfirmed: false,
      paymentMethod:
        method === 'delivery'
          ? 'Payment on Delivery'
          : method === 'card'
          ? 'Card Payment'
          : 'Bank Transfer (GTBank)',
      address: fullAddress,
      total: calculatedTotal > 0 ? calculatedTotal : 150000,
      items:
        orderItems.length > 0
          ? orderItems
          : [
              {
                name: 'NeoMart Express Priority Package',
                qty: 1,
                price: 150000,
                image: 'https://ng.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/57/5777743/1.jpg?5669'
              }
            ]
    };

    const updated = [newOrder, ...orders];
    setOrders(updated);
    void saveOrder(newOrder).catch(() => {
      showToast('Order saved locally. Firebase sync is unavailable.');
    });
    setLastPlacedOrderId(newOrderId);

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
        onOpenTrackOrder={() => handleOpenLiveTracking()}
        onSelectCategory={handleSelectCategory}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdmin={isLoggedIn && currentUserEmail.toLowerCase() === ADMIN_EMAIL}
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
      <Footer
        onOpenHelpSection={(sec) => {
          if (sec === 'track-order') {
            handleOpenLiveTracking();
          } else {
            handleOpenHelpSection(sec);
          }
        }}
      />

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
        orderId={lastPlacedOrderId || undefined}
        onOpenTrackLiveOrder={handleOpenLiveTracking}
      />

      {/* 8. Login / Account Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        isLoggedIn={isLoggedIn}
        onLoginSuccess={(id) => {
          setIsLoggedIn(true);
          setCurrentUserEmail(id);
          localStorage.setItem('neomart_logged_in', 'true');
          localStorage.setItem('neomart_user_email', id);
        }}
        onLogout={() => {
          setIsLoggedIn(false);
          setCurrentUserEmail('');
          setIsAdminOpen(false);
          localStorage.removeItem('neomart_logged_in');
          localStorage.removeItem('neomart_user_email');
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
        onOpenLiveTracking={handleOpenLiveTracking}
      />

      {/* 10. Live Order Tracking Modal with GPS Animated Courier Map */}
      <OrderTrackingModal
        isOpen={isOrderTrackingOpen}
        onClose={() => setIsOrderTrackingOpen(false)}
        orderId={trackingOrderId}
        ordersList={orders}
        showToast={showToast}
      />

      {/* 11. Admin Orders and Payment Manager */}
      <AdminOrdersModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        orders={orders}
        onConfirmOrderPayment={handleConfirmOrderPayment}
        onUpdateOrderStatus={(orderId, status) => {
          setOrders((prev) =>
            prev.map((order) =>
              order.id === orderId
                ? { ...order, status: status === 'Paid' ? 'Order Confirmed' : status }
                : order
            )
          );
        }}
      />

      {/* 12. Global Toast Alert */}
      <Toast message={toastMessage} />

      {/* 13. Initial Loading / Splash Screen */}
      {showSplash && (
        <SplashScreen
          onFinish={() => setShowSplash(false)}
          minDurationMs={2200}
        />
      )}
    </div>
  );
}
