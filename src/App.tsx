import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { ConfirmOrdersModal } from './components/ConfirmOrdersModal';
import { AdminOrderAlert } from './components/AdminOrderAlert';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { AdminSalesReportModal } from './components/AdminSalesReportModal';
import { AdminCustomersModal, type AccountState } from './components/AdminCustomersModal';
import { OrderTrackingModal } from './components/TrackingModal';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { SplashScreen } from './components/SplashScreen';
import { AdminInventoryRoom } from './components/AdminInventoryRoom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const ADMIN_EMAIL = 'ifeanyianoma2@gmail.com';
const SUPPORT_PHONE = '08135648242';
type AdminSection = 'overview' | 'orders' | 'confirmations' | 'inventory' | 'reports' | 'customers' | 'notifications' | 'support' | 'storefront' | 'settings' | 'activity';

import { allProducts as initialProducts, flashProductIds } from './data/products';
import { initialReviews, sampleOrders } from './data/ordersAndReviews';
import { confirmOrderPayment, getCustomerProfile, getOrders, saveOrder, saveCustomerProfile, subscribeToOrders, updateOrderStatus, updateOrderDelivery, saveStockLevel, subscribeToStock, subscribeToCustomerAccountState, updateCustomerAccountState, getCustomerAccountState } from './config/ordersService';
import { auth, getGoogleRedirectUser } from './config/firebase';
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
  ArrowUpDown,
  Package,
  Warehouse,
  BarChart3,
  Users,
  MessageCircle,
  Send,
  TrendingUp,
  AlertTriangle,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Store,
  CreditCard,
  Truck,
  Tag,
  Star,
  Bell,
  BarChart2,
  ShieldCheck,
  Settings,
  ChevronRight,
  ExternalLink,
  LogOut,
  X,
  Menu,
  Search,
  ChevronDown,
  CheckCircle2,
  User,
  Shield,
  Box,
  ClipboardList,
  Calendar,
  Check,
  CheckCheck,
  Phone,
  Mail,
  MapPin,
  MoreHorizontal,
  Search as SearchIcon,
} from 'lucide-react';

const ProductThumb: React.FC<{ type: string; className?: string }> = ({ type, className = 'w-10 h-10' }) => {
  const normalized = type.toLowerCase();
  if (normalized.includes('iphone') || normalized.includes('phone')) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg border border-gray-700/60 bg-gray-900 shrink-0`}>
        <Smartphone className="h-5 w-5 text-cyan-400" />
      </div>
    );
  }
  if (normalized.includes('macbook') || normalized.includes('laptop')) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg border border-gray-700/60 bg-slate-900 shrink-0`}>
        <Laptop className="h-5 w-5 text-indigo-400" />
      </div>
    );
  }
  if (normalized.includes('tv')) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg border border-gray-700/60 bg-sky-950 shrink-0`}>
        <Tv className="h-5 w-5 text-cyan-300" />
      </div>
    );
  }
  if (normalized.includes('airpods') || normalized.includes('audio')) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg border border-gray-700/60 bg-gray-800 shrink-0`}>
        <Headphones className="h-5 w-5 text-emerald-400" />
      </div>
    );
  }
  return (
    <div className={`${className} flex items-center justify-center rounded-lg border border-amber-800/40 bg-amber-950/40 shrink-0`}>
      <Package className="h-5 w-5 text-amber-400" />
    </div>
  );
};

const AdminStatCard: React.FC<{ label: string; value: string | number; detail?: string; tone?: 'orange' | 'green' | 'blue' | 'red' }> = ({ label, value, detail, tone = 'orange' }) => {
  const toneStyles = {
    orange: 'border-orange-500/30 bg-orange-500/10 text-orange-200',
    green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    blue: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
    red: 'border-red-500/30 bg-red-500/10 text-red-200',
  };

  return (
    <div className={`rounded-2xl border p-5 ${toneStyles[tone]}`}>
      <p className="text-[11px] uppercase tracking-[0.2em] opacity-80">{label}</p>
      <p className="mt-4 text-3xl font-black text-white">{value}</p>
      {detail && <p className="mt-2 text-xs text-gray-400">{detail}</p>}
    </div>
  );
};

const AdminSectionHeader: React.FC<{ eyebrow: string; title: string; description?: string; action?: React.ReactNode }> = ({ eyebrow, title, description, action }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f97316]">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-black text-white">{title}</h1>
      {description && <p className="mt-2 text-sm text-gray-400">{description}</p>}
    </div>
    {action}
  </div>
);

const AdminRoom: React.FC<{ children: React.ReactNode; onBack?: () => void }> = ({ children, onBack }) => (
  <section className="admin-room min-w-0 space-y-6 animate-fadeIn">
    {onBack && <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900/50 px-3 py-2 text-xs font-bold text-gray-300 transition hover:border-orange-500/60 hover:text-orange-300">← Back to Overview</button>}
    {children}
  </section>
);

export default function App() {
  const trackingPathMatch = window.location.pathname.match(/^\/track\/([^/]+)$/i);
  const trackingPathOrderId = trackingPathMatch ? decodeURIComponent(trackingPathMatch[1]) : null;
  const isAdminPath = /^\/admin\/?$/i.test(window.location.pathname);

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('neomart_products');
      if (!saved) return initialProducts;
      const savedProducts = JSON.parse(saved) as Product[];
      const savedIds = new Set(savedProducts.map((product) => product.id));
      return [...savedProducts, ...initialProducts.filter((product) => !savedIds.has(product.id))];
    } catch {
      return initialProducts;
    }
  });
  const allProducts = products;

  useEffect(() => {
    localStorage.setItem('neomart_products', JSON.stringify(products));
  }, [products]);

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
  const [sessionStartedAt, setSessionStartedAt] = useState(() =>
    Number(localStorage.getItem('neomart_session_started_at')) || Date.now()
  );
  const [accountName, setAccountName] = useState(() =>
    localStorage.getItem('neomart_account_name') || ''
  );
  const [accountPhotoUrl, setAccountPhotoUrl] = useState(() =>
    localStorage.getItem('neomart_account_photo_url') || ''
  );
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCustomerAccessBlocked, setIsCustomerAccessBlocked] = useState(false);

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
      localStorage.removeItem('neomart_reviews');
      const saved = localStorage.getItem('neomart_customer_reviews');
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
        order.phone === SUPPORT_PHONE ? { ...order, phone: '' } : order
      ).map((order) =>
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
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(Boolean(trackingPathOrderId));
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(trackingPathOrderId);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string | null>(null);
  const lastPlacedOrderIdRef = useRef<string | null>(null);
  const remoteStatusesRef = useRef<Record<string, string>>({});
  const hasReceivedOrdersRef = useRef(false);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());

  // UI Views & Modals state
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortOption, setSortOption] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);
  const [lastPaymentMethod, setLastPaymentMethod] = useState<PaymentMethodType>('delivery');
  const [savedDeliveryDetails, setSavedDeliveryDetails] = useState<DeliveryDetails | null>(null);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'store' | 'admin'>(isAdminPath ? 'admin' : 'store');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isConfirmOrdersOpen, setIsConfirmOrdersOpen] = useState(false);
      const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
      const [isSalesReportOpen, setIsSalesReportOpen] = useState(false);
      const [isCustomerManagementOpen, setIsCustomerManagementOpen] = useState(false);
      const [customerOrderIds, setCustomerOrderIds] = useState<string[]>(() => {
        try {
          const saved = localStorage.getItem('neomart_customer_order_ids');
          return saved ? JSON.parse(saved) : [];
        } catch {
          return [];
        }
      });
    const [stockLevels, setStockLevels] = useState<Record<number, number>>(() => {
      try {
        const saved = localStorage.getItem('neomart_stock_levels');
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    });
    const [stockHistory, setStockHistory] = useState<Array<{ productId: number; quantity: number; updatedAt: string }>>(() => {
      try {
        return JSON.parse(localStorage.getItem('neomart_stock_history') || '[]');
      } catch {
        return [];
      }
    });
    const [adminActivityLog, setAdminActivityLog] = useState<Array<{ id: string; action: string; detail: string; createdAt: string }>>(() => {
      try {
        return JSON.parse(localStorage.getItem('neomart_admin_activity_log') || '[]');
      } catch {
        return [];
      }
    });
  const [activeHelpSection, setActiveHelpSection] = useState<HelpSectionType>('place-order');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [adminOrderAlert, setAdminOrderAlert] = useState<Order | null>(null);
  const [adminChatInput, setAdminChatInput] = useState('');
  const [adminChatMessages, setAdminChatMessages] = useState([
    { from: 'support', text: 'Good morning. I am watching today\'s orders with you.' },
    { from: 'support', text: 'Ask me to surface pending payments or stock risks.' },
  ]);
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminSection, setAdminSection] = useState<AdminSection>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dateRange] = useState('May 12, 2025 - May 19, 2025');
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [salesTimeframe, setSalesTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const activeOverlay = isLoginOpen
    ? 'login'
    : isCheckoutOpen
    ? 'checkout'
    : isCartOpen
    ? 'cart'
    : isPaymentSuccessOpen
    ? 'payment-success'
    : isHelpOpen
    ? 'help'
    : isOrderHistoryOpen
    ? 'order-history'
    : isOrderTrackingOpen
    ? 'tracking'
    : isAdminOpen
    ? 'admin-orders'
    : isConfirmOrdersOpen
    ? 'confirm-orders'
    : isSalesReportOpen
    ? 'sales-report'
    : isCustomerManagementOpen
    ? 'customers'
    : null;
  const overlayHistoryRef = useRef<string | null>(null);
  const closingOverlayHistoryRef = useRef(false);
  const handlingPopOverlayRef = useRef(false);
  const openingCheckoutRef = useRef(false);
  const catalogScrollPositionRef = useRef(0);
  const edgeSwipeStartRef = useRef<{ x: number; y: number; target: EventTarget | null } | null>(null);
  const edgeSwipeOffsetRef = useRef(0);
  const [edgeSwipeOffset, setEdgeSwipeOffset] = useState(0);
  const [platform] = useState<'ios' | 'android' | 'desktop'>(() => {
    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
    if (/Android/i.test(userAgent)) return 'android';
    return 'desktop';
  });
  const [notifications, setNotifications] = useState([
    { id: 'n-1', title: 'New order #NM12548', description: 'Daniel Okafor placed an order for ₦125,000.', time: '5 mins ago', read: false },
    { id: 'n-2', title: 'Low stock warning', description: 'LG 1.5HP Split AC has only 8 units left in stock.', time: '18 mins ago', read: false },
    { id: 'n-3', title: 'Payment confirmed', description: 'OPay settlement for #NM12547 (₦85,500) confirmed.', time: '42 mins ago', read: false },
    { id: 'n-4', title: 'Out for Delivery', description: 'Order #NM12544 has been dispatched to rider Michael.', time: '1 hour ago', read: false }
  ]);

  useEffect(() => {
    void getGoogleRedirectUser().then((user) => {
      if (!user) return;
      const email = user.email || user.uid;
      const name = user.displayName || email.split('@')[0];
      return getCustomerAccountState(email).then((state) => {
        if (state.revokedAt || state.disabled || state.deletedAt) {
          setIsCustomerAccessBlocked(true);
          setIsLoginOpen(true);
          showToast('This account is blocked by NeoMart support.');
          return;
        }
        setIsCustomerAccessBlocked(false);
      setIsLoggedIn(true);
      setCurrentUserEmail(email);
      setAccountName(name);
      setAccountPhotoUrl(user.photoURL || '');
      const startedAt = Date.now();
      setSessionStartedAt(startedAt);
      localStorage.setItem('neomart_logged_in', 'true');
      localStorage.setItem('neomart_user_email', email);
      localStorage.setItem('neomart_account_name', name);
      if (user.photoURL) localStorage.setItem('neomart_account_photo_url', user.photoURL);
      localStorage.setItem('neomart_session_started_at', String(startedAt));
      if (email.toLowerCase() === ADMIN_EMAIL) {
        setAdminSection('overview');
        setCurrentView('admin');
        window.history.replaceState({}, '', '/admin');
      }
      showToast(`Signed in with Google as ${email}`);
      });
    }).catch(() => {
      showToast('Google sign-in failed. Check Firebase Google sign-in settings.');
    });
  }, []);

  useEffect(() => {
    const email = currentUserEmail.trim().toLowerCase();
    if (!email || email === ADMIN_EMAIL) return;
    let unsubscribe: (() => void) | null = null;
    subscribeToCustomerAccountState(email, (state) => {
      if (!state.revokedAt && !state.disabled && !state.deletedAt) {
        setIsCustomerAccessBlocked(false);
        return;
      }
      setIsCustomerAccessBlocked(true);
      setIsLoggedIn(false);
      setCurrentUserEmail('');
      setAccountName('');
      setAccountPhotoUrl('');
      localStorage.removeItem('neomart_logged_in');
      localStorage.removeItem('neomart_user_email');
      localStorage.removeItem('neomart_account_name');
      showToast('Your NeoMart session was signed out by support.');
    }).then((cleanup) => {
      unsubscribe = cleanup;
    }).catch(() => {});
    return () => unsubscribe?.();
  }, [currentUserEmail, sessionStartedAt]);

  useEffect(() => {
    if (!currentUserEmail.includes('@')) {
      setSavedDeliveryDetails(null);
      return;
    }
    let isActive = true;
    void getCustomerProfile().then((profile) => {
      if (!isActive) return;
      const saved = profile?.savedDeliveryDetails as Partial<DeliveryDetails> | undefined;
      if (saved?.state && saved.city && saved.address && saved.phone) {
        setSavedDeliveryDetails({
          state: saved.state,
          city: saved.city,
          address: saved.address,
          phone: saved.phone,
          notes: saved.notes || '',
        });
      }
    }).catch(() => {});
    return () => {
      isActive = false;
    };
  }, [currentUserEmail, sessionStartedAt]);

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'auto';
    if (!window.history.state?.neomartView) {
      window.history.replaceState(
        { ...(window.history.state || {}), neomartView: window.location.pathname.toLowerCase() === '/admin' ? 'admin' : 'store' },
        '',
        window.location.href
      );
    }
    const closeOverlay = (overlay: string | null) => {
      if (overlay === 'login') setIsLoginOpen(false);
      if (overlay === 'cart') setIsCartOpen(false);
      if (overlay === 'checkout') setIsCheckoutOpen(false);
      if (overlay === 'payment-success') setIsPaymentSuccessOpen(false);
      if (overlay === 'help') setIsHelpOpen(false);
      if (overlay === 'order-history') setIsOrderHistoryOpen(false);
      if (overlay === 'tracking') setIsOrderTrackingOpen(false);
      if (overlay === 'admin-orders') setIsAdminOpen(false);
      if (overlay === 'confirm-orders') setIsConfirmOrdersOpen(false);
      if (overlay === 'stock') setIsStockOpen(false);
      if (overlay === 'sales-report') setIsSalesReportOpen(false);
      if (overlay === 'customers') setIsCustomerManagementOpen(false);
    };
    const handlePopState = (event: PopStateEvent) => {
      if (overlayHistoryRef.current) {
        const closingOverlay = overlayHistoryRef.current;
        overlayHistoryRef.current = null;
        handlingPopOverlayRef.current = true;
        closeOverlay(closingOverlay);
        if (closingOverlay === 'checkout') setIsCartOpen(true);
        if (closingOverlayHistoryRef.current) {
          closingOverlayHistoryRef.current = false;
          handlingPopOverlayRef.current = false;
          return;
        }
      }
      if (event.state?.neomartOverlay) overlayHistoryRef.current = event.state.neomartOverlay;

      const state = event.state as { neomartView?: string; adminSection?: AdminSection; productId?: number; category?: CategoryId | string; searchQuery?: string } | null;
      if (state?.neomartView === 'product' && typeof state.productId === 'number') {
        setCurrentView('store');
        setSelectedProductId(state.productId);
        requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
        return;
      }
      if (state?.neomartView === 'catalog') {
        const category = state.category || 'all';
        setCurrentView('store');
        setSelectedProductId(null);
        setSelectedCategory(category as CategoryId);
        setSearchQuery(state.searchQuery || '');
        setIsSearching(category !== 'all' || Boolean(state.searchQuery));
        return;
      }
      if (state?.neomartView === 'admin' || window.location.pathname.toLowerCase() === '/admin') {
        setCurrentView('admin');
        if (state?.adminSection) setAdminSection(state.adminSection);
        return;
      }
      if (window.location.pathname.toLowerCase().startsWith('/track/')) {
        const orderId = decodeURIComponent(window.location.pathname.slice('/track/'.length));
        setCurrentView('store');
        setTrackingOrderId(orderId || null);
        setIsOrderTrackingOpen(Boolean(orderId));
        return;
      }
      setCurrentView('store');
      setIsAdminOpen(false);
      setSelectedProductId(null);
      setSelectedCategory('all');
      setSearchQuery('');
      setIsSearching(false);
      requestAnimationFrame(() => window.scrollTo({ top: catalogScrollPositionRef.current, behavior: 'auto' }));
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    if (activeOverlay && handlingPopOverlayRef.current) {
      overlayHistoryRef.current = activeOverlay;
      handlingPopOverlayRef.current = false;
    } else if (activeOverlay && !overlayHistoryRef.current) {
      overlayHistoryRef.current = activeOverlay;
      window.history.pushState({ ...(window.history.state || {}), neomartOverlay: activeOverlay }, '', window.location.href);
    } else if (activeOverlay && overlayHistoryRef.current !== activeOverlay) {
      if (activeOverlay === 'checkout' && overlayHistoryRef.current === 'cart' && openingCheckoutRef.current) {
        openingCheckoutRef.current = false;
        overlayHistoryRef.current = activeOverlay;
        window.history.pushState({ ...(window.history.state || {}), neomartOverlay: activeOverlay }, '', window.location.href);
        return;
      }
      if (activeOverlay === 'cart' && overlayHistoryRef.current === 'checkout') {
        overlayHistoryRef.current = null;
        closingOverlayHistoryRef.current = true;
        window.history.back();
        return;
      }
      overlayHistoryRef.current = activeOverlay;
      window.history.pushState({ ...(window.history.state || {}), neomartOverlay: activeOverlay }, '', window.location.href);
    } else if (!activeOverlay && overlayHistoryRef.current) {
      overlayHistoryRef.current = null;
      if (window.history.state?.neomartOverlay) {
        closingOverlayHistoryRef.current = true;
        window.history.back();
      }
    }
  }, [activeOverlay]);

  const canNavigateBack = Boolean(activeOverlay || selectedProductId !== null || isSearching || selectedCategory !== 'all' || currentView === 'admin' || isOrderTrackingOpen);
  const handleEdgeTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (platform === 'desktop' || !canNavigateBack || event.touches.length !== 1) return;
    const touch = event.touches[0];
    const target = event.target as HTMLElement;
    if (touch.clientX > 28 || target.closest('input, textarea, select, button, a, [data-horizontal-swipe]')) return;
    edgeSwipeStartRef.current = { x: touch.clientX, y: touch.clientY, target: event.target };
  };
  const handleEdgeTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = edgeSwipeStartRef.current;
    if (!start || event.touches.length !== 1) return;
    const touch = event.touches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = Math.abs(touch.clientY - start.y);
    if (deltaX < 0 || deltaY > deltaX) {
      edgeSwipeStartRef.current = null;
      edgeSwipeOffsetRef.current = 0;
      setEdgeSwipeOffset(0);
      return;
    }
    const offset = Math.min(deltaX, window.innerWidth * 0.42);
    edgeSwipeOffsetRef.current = offset;
    setEdgeSwipeOffset(offset);
  };
  const handleEdgeTouchEnd = () => {
    if (!edgeSwipeStartRef.current) return;
    const shouldGoBack = edgeSwipeOffsetRef.current > Math.min(90, window.innerWidth * 0.25);
    edgeSwipeStartRef.current = null;
    edgeSwipeOffsetRef.current = 0;
    setEdgeSwipeOffset(0);
    if (!shouldGoBack) return;
    if (currentView === 'admin' && adminSection !== 'overview') {
      if (window.history.state?.neomartView === 'admin' && window.history.state?.adminSection === adminSection) {
        window.history.back();
      } else {
        setAdminSection('overview');
        window.history.replaceState({ ...(window.history.state || {}), neomartView: 'admin', adminSection: 'overview' }, '', '/admin');
      }
      return;
    }
    window.history.back();
  };
  const gestureSurfaceProps = {
    onTouchStart: handleEdgeTouchStart,
    onTouchMove: handleEdgeTouchMove,
    onTouchEnd: handleEdgeTouchEnd,
    'data-platform': platform,
  };

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
    localStorage.setItem('neomart_customer_reviews', JSON.stringify(reviews));
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
      const newOrders = realOrders.filter((order) => !knownOrderIdsRef.current.has(order.id));
      const isAdmin = localStorage.getItem('neomart_user_email')?.toLowerCase() === ADMIN_EMAIL;
      if (hasReceivedOrdersRef.current && isAdmin) {
        const newOrder = newOrders.find((order) => order.id !== lastPlacedOrderIdRef.current);
        if (newOrder) {
          setAdminOrderAlert(newOrder);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New NeoMart order', {
              body: `Order #${newOrder.id} for ₦${newOrder.total.toLocaleString()} is waiting for review.`,
              icon: '/favicon.ico',
            });
          }
        }
      }
      knownOrderIdsRef.current = new Set(realOrders.map((order) => order.id));
      if (hasReceivedOrdersRef.current && lastPlacedOrderIdRef.current) {
        const order = realOrders.find((item) => item.id === lastPlacedOrderIdRef.current);
        const previousStatus = remoteStatusesRef.current[lastPlacedOrderIdRef.current];
        if (order && previousStatus && order.status !== previousStatus) {
          showToast(
            order.paymentConfirmed === true
              ? 'Your order has been confirmed by NeoMart.'
              : `Your order is now ${order.status}.`
          );
        }
      }
      remoteStatusesRef.current = Object.fromEntries(
        realOrders.map((order) => [order.id, order.status])
      );
      hasReceivedOrdersRef.current = true;
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

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    subscribeToStock((remoteStock) => {
      setStockLevels(remoteStock);
      localStorage.setItem('neomart_stock_levels', JSON.stringify(remoteStock));
      window.dispatchEvent(new Event('neomart-stock-updated'));
    }).then((cleanup) => {
      unsubscribe = cleanup;
    }).catch(() => {});
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    if (!isLoggedIn || currentUserEmail.toLowerCase() !== ADMIN_EMAIL) return;

    const refreshOrders = () => {
      void getOrders().then((remoteOrders) => {
        const realOrders = remoteOrders.filter(
          (order) =>
            order.orderSource === 'customer' &&
            !sampleOrders.some((sampleOrder) => sampleOrder.id === order.id)
        );
        setOrders(realOrders);
      }).catch(() => {});
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refreshOrders();
    };

    const refreshTimer = window.setInterval(refreshOrders, 3000);
    window.addEventListener('focus', refreshOrders);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener('focus', refreshOrders);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [currentUserEmail, isLoggedIn]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const enableAdminNotifications = async () => {
    if (!('Notification' in window)) {
      showToast('This browser does not support phone alerts.');
      return;
    }
    const permission = await Notification.requestPermission();
    showToast(
      permission === 'granted'
        ? 'Phone alerts enabled for new orders.'
        : 'Phone alerts were not enabled.'
    );
  };

  // Cart Operations
  const getStockLevel = (productId: number) => {
    return stockLevels[productId] ?? 10;
  };

  const handleUpdateStock = (productId: number, quantity: number) => {
    const productName = products.find((product) => product.id === productId)?.name || `Product #${productId}`;
    setAdminActivityLog((previous) => {
      const updated = [{ id: crypto.randomUUID(), action: 'Stock updated', detail: `${productName} changed to ${quantity} units`, createdAt: new Date().toISOString() }, ...previous].slice(0, 100);
      localStorage.setItem('neomart_admin_activity_log', JSON.stringify(updated));
      return updated;
    });
    const historyEntry = { productId, quantity, updatedAt: new Date().toISOString() };
    setStockHistory((previous) => {
      const updated = [historyEntry, ...previous].slice(0, 100);
      localStorage.setItem('neomart_stock_history', JSON.stringify(updated));
      return updated;
    });
    setStockLevels((previous) => {
      const updated = { ...previous, [productId]: quantity };
      localStorage.setItem('neomart_stock_levels', JSON.stringify(updated));
      window.dispatchEvent(new Event('neomart-stock-updated'));
      return updated;
    });
    void saveStockLevel(productId, quantity).catch(() => {
      showToast('Could not sync stock. Check Firebase connection.');
    });
  };

  const handleAddToCart = (product: Product) => {
    let added = true;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (getStockLevel(product.id) <= (existing?.qty || 0)) {
        showToast(`${product.name.slice(0, 28)}... is unavailable`);
        added = false;
        return prev;
      }
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    if (added) showToast(`${product.name.slice(0, 28)}... added to cart 🛒`);
    return added;
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
    if (currentView === 'store' && (window.history.state?.neomartView !== 'catalog' || window.history.state?.category !== cat)) {
      window.history.pushState({ ...(window.history.state || {}), neomartView: 'catalog', category: cat, searchQuery: cat === 'all' ? '' : cat }, '', window.location.href);
    }
  };

  const handleSelectProduct = (productId: number) => {
    catalogScrollPositionRef.current = window.scrollY;
    setSelectedProductId(productId);
    window.history.pushState({ ...(window.history.state || {}), neomartView: 'product', productId }, '', window.location.href);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCatalog = () => {
    if (window.history.state?.neomartView === 'product') {
      window.history.back();
      return;
    }
    setSelectedProductId(null);
    window.scrollTo({ top: catalogScrollPositionRef.current, behavior: 'auto' });
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    setSelectedProductId(null);
    if (currentView === 'store') {
      window.history.pushState({ ...(window.history.state || {}), neomartView: 'catalog', category: 'all', searchQuery: query }, '', window.location.href);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setSelectedProductId(null);
    setIsSearching(Boolean(query.trim()));
  };

  const handleOpenHelpSection = (section: HelpSectionType) => {
    setActiveHelpSection(section);
    setIsHelpOpen(true);
  };

  const navigateAdminSection = (section: AdminSection) => {
    setAdminSection(section);
    if (currentView === 'admin' && window.history.state?.adminSection !== section) {
      window.history.pushState({ ...(window.history.state || {}), neomartView: 'admin', adminSection: section }, '', '/admin');
    }
  };

  const openAdminPortal = () => {
    navigateAdminSection('overview');
    setIsAdminOpen(false);
    setIsConfirmOrdersOpen(false);
    setIsSalesReportOpen(false);
    setIsCustomerManagementOpen(false);
    setCurrentView('admin');
    if (window.location.pathname.toLowerCase() !== '/admin') {
      window.history.pushState({ neomartView: 'admin', adminSection: 'overview' }, '', '/admin');
    }
  };

  const openStorefront = () => {
    setCurrentView('store');
    setIsAdminOpen(false);
    if (window.location.pathname !== '/') {
      window.history.pushState({ neomartView: 'store' }, '', '/');
    }
  };

  const handleConfirmOrderPayment = async (orderId: string) => {
    setAdminActivityLog((previous) => {
      const updated = [{ id: crypto.randomUUID(), action: 'Payment confirmed', detail: `Order #${orderId} was confirmed`, createdAt: new Date().toISOString() }, ...previous].slice(0, 100);
      localStorage.setItem('neomart_admin_activity_log', JSON.stringify(updated));
      return updated;
    });
    const previousOrders = orders;
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: 'Order Confirmed', paymentConfirmed: true }
          : order
      )
    );
    try {
      const saved = await confirmOrderPayment(orderId);
      if (!saved) throw new Error('Firebase authentication is unavailable');
      showToast('Order confirmed successfully');
    } catch (error) {
      setOrders(previousOrders);
      const message = error instanceof Error ? error.message : 'Firebase could not save the confirmation';
      showToast(`Confirmation failed: ${message}`);
    }
  };

  // Checkout flow
  const handleStartCheckout = () => {
    openingCheckoutRef.current = true;
    setIsCheckoutOpen(true);
  };

  const handleOpenLiveTracking = (orderId?: string) => {
    const nextOrderId = orderId || null;
    setTrackingOrderId(nextOrderId);
    setIsOrderTrackingOpen(true);
    if (nextOrderId) {
      const trackingPath = `/track/${encodeURIComponent(nextOrderId)}`;
      if (window.location.pathname !== trackingPath) {
        window.history.pushState({ neomartView: 'tracking', orderId: nextOrderId }, '', trackingPath);
      }
    }
  };

  const customerOrdersForAccount = orders.filter(
    (order) =>
      order.orderSource === 'customer' &&
      (order.email === currentUserEmail || customerOrderIds.includes(order.id))
  );

  const handleCompleteOrder = (
    method: PaymentMethodType,
    _deliveryDetails?: DeliveryDetails,
    discountAmount = 0
  ) => {
    setLastPaymentMethod(method);

    const unavailableItem = cart.find((item) => item.qty > getStockLevel(item.id));
    if (unavailableItem) {
      showToast(`${unavailableItem.name.slice(0, 28)}... is unavailable or has insufficient stock`);
      return;
    }

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
      phone: _deliveryDetails?.phone?.trim() || '',
      email: currentUserEmail.includes('@') ? currentUserEmail : '',
      customerName: accountName || undefined,
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
      total: Math.max(0, (calculatedTotal > 0 ? calculatedTotal : 150000) - discountAmount),
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

    lastPlacedOrderIdRef.current = newOrderId;
    setCustomerOrderIds((previous) => {
      const updatedIds = [newOrderId, ...previous.filter((id) => id !== newOrderId)];
      localStorage.setItem('neomart_customer_order_ids', JSON.stringify(updatedIds));
      return updatedIds;
    });
    const updated = [newOrder, ...orders];
    setOrders(updated);
    void saveOrder(newOrder).catch(() => {
      showToast('Order saved locally. Firebase sync is unavailable.');
    });
    if (_deliveryDetails && newOrder.email) {
      const previous = savedDeliveryDetails;
      const deliveryChanged = JSON.stringify(previous || null) !== JSON.stringify(_deliveryDetails);
      if (deliveryChanged) {
        setSavedDeliveryDetails(_deliveryDetails);
        void saveCustomerProfile({
          email: newOrder.email,
          phone: newOrder.phone,
          savedDeliveryDetails: _deliveryDetails,
          savedAddresses: [newOrder.address],
          lastOrderId: newOrder.id,
        }).catch(() => {});
      }
    }
    void fetch('/api/notify-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: newOrder.id, total: newOrder.total }),
    }).catch(() => {});

    try {
      const saved = localStorage.getItem('neomart_stock_levels');
      const levels = { ...stockLevels };
      orderItems.forEach((item) => {
        const product = allProducts.find((candidate) => candidate.name === item.name);
        if (product) levels[product.id] = Math.max(0, getStockLevel(product.id) - item.qty);
        if (product) {
          levels[product.id] = Math.max(0, getStockLevel(product.id) - item.qty);
          void saveStockLevel(product.id, levels[product.id]).catch(() => {});
        }
      });
      setStockLevels(levels);
      localStorage.setItem('neomart_stock_levels', JSON.stringify(levels));
    } catch {
      // Keep checkout successful if stock persistence is unavailable.
    }
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
      const q = searchQuery.toLowerCase().trim().replace(/\s+/g, ' ');
      list = list.filter((p) => {
        const searchableText = [p.name, p.category, ...p.tags]
          .join(' ')
          .toLowerCase()
          .replace(/\s+/g, ' ');
        return searchableText.includes(q);
      });
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
      const getLiveRating = (product: Product) => {
        const productReviews = reviews.filter((review) => review.productId === product.id);
        return productReviews.length
          ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length
          : 0;
      };
      list.sort((a, b) => getLiveRating(b) - getLiveRating(a));
    }

    return list;
  };

  const filteredList = getFilteredProducts();
  const selectedProduct = allProducts.find((p) => p.id === selectedProductId);
  const flashProducts = flashProductIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const allCustomerOrders = orders.filter((order) => order.orderSource === 'customer');
  const customerOrders = allCustomerOrders;
  const confirmedCustomerOrders = allCustomerOrders.filter((order) => order.paymentConfirmed === true);
  const pendingCustomerOrders = allCustomerOrders.filter((order) => order.paymentConfirmed !== true);
  const processingCustomerOrders = allCustomerOrders.filter((order) => order.status === 'Processing');
  const deliveredCustomerOrders = allCustomerOrders.filter((order) => order.status === 'Delivered');
  const confirmedRevenue = confirmedCustomerOrders.reduce((total, order) => total + order.total, 0);
  const pieTotal = Math.max(allCustomerOrders.length, 1);
  const pieConfirmed = Math.round((confirmedCustomerOrders.length / pieTotal) * 100);
  const pieProcessing = Math.round((processingCustomerOrders.length / pieTotal) * 100);
  const pieDelivered = Math.max(0, 100 - pieConfirmed - pieProcessing);
  const filteredOrders = [...customerOrders].slice(0, 5);

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

  if (currentView === 'admin') {
    const adminSidebarItems = [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'orders', label: 'Orders', icon: Package, badge: pendingCustomerOrders.length },
      { id: 'confirmations', label: 'Payment Review', icon: CheckCheck, badge: pendingCustomerOrders.length },
      { id: 'inventory', label: 'Inventory', icon: Warehouse },
      { id: 'reports', label: 'Sales Reports', icon: BarChart3 },
      { id: 'customers', label: 'Customers', icon: Users },
      { id: 'notifications', label: 'Notifications', icon: Bell, badge: notifications.filter((notification) => !notification.read).length },
      { id: 'support', label: 'Support Chat', icon: MessageCircle },
      { id: 'storefront', label: 'Storefront', icon: Store },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'activity', label: 'Activity Log', icon: ClipboardList, badge: adminActivityLog.length },
    ] as const;
    const renderAdminNav = () => (
      <nav className="space-y-1.5 text-sm font-semibold">
        {adminSidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = adminSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                navigateAdminSection(item.id);
                setMobileMenuOpen(false);
              }}
              aria-current={isActive ? 'page' : undefined}
              className={`group flex min-h-11 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/80 ${
                isActive
                  ? 'border-orange-400/60 bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white shadow-lg shadow-orange-500/30'
                  : 'border-transparent text-gray-300 hover:border-gray-700 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
    );

    const exportOrdersCsv = () => {
      const rows = customerOrders.map((order) => [order.id, order.customerName || 'Guest customer', order.phone || order.email, order.total, order.date, order.status, order.driverName || 'Unassigned']);
      const csv = [['Order ID', 'Customer', 'Contact', 'Amount', 'Date', 'Status', 'Delivery'], ...rows]
        .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const downloadUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `neomart-sales-${new Date().toISOString().slice(0, 10)}.csv`;
      downloadLink.click();
      URL.revokeObjectURL(downloadUrl);
    };

    const renderAdminContent = () => {
      if (adminSection === 'orders') {
        return (
          <AdminRoom onBack={() => navigateAdminSection('overview')}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f97316]">Orders</p>
                <h1 className="mt-2 text-3xl font-black text-white">Order Management</h1>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: 'Pending', value: pendingCustomerOrders.length },
                { label: 'Confirmed', value: confirmedCustomerOrders.length },
                { label: 'Delivered', value: deliveredCustomerOrders.length },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/60 to-gray-950/40 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">{stat.label}</p>
                  <p className="mt-4 text-3xl font-black text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/40">
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full text-left text-xs">
                  <thead className="border-b border-gray-800 bg-gray-900/70 text-gray-500"><tr><th className="px-5 py-4 font-semibold">Order</th><th className="px-5 py-4 font-semibold">Customer</th><th className="px-5 py-4 font-semibold">Amount</th><th className="px-5 py-4 font-semibold">Date</th><th className="px-5 py-4 font-semibold">Status</th><th className="px-5 py-4 font-semibold">Delivery</th><th className="px-5 py-4 font-semibold">Actions</th></tr></thead>
                  <tbody className="divide-y divide-gray-800/70">
                    {customerOrders.map((order) => (
                      <tr key={order.id} className="text-gray-300 hover:bg-white/[0.03]">
                        <td className="px-5 py-4"><span className="font-bold text-white">#{order.id}</span><p className="mt-1 text-[11px] text-gray-500">{order.items.length} item{order.items.length === 1 ? '' : 's'}</p></td>
                        <td className="px-5 py-4"><p className="font-semibold text-white">{order.customerName || 'Guest customer'}</p><p className="mt-1 text-[11px] text-gray-500">{order.phone || order.email || 'No contact saved'}</p></td>
                        <td className="px-5 py-4 font-bold text-emerald-300">₦{order.total.toLocaleString()}</td>
                        <td className="px-5 py-4 whitespace-nowrap">{order.date}</td>
                        <td className="px-5 py-4"><select value={order.status === 'Order Confirmed' ? 'Processing' : order.status} onChange={(event) => { const status = event.target.value as Order['status']; setOrders((items) => items.map((item) => item.id === order.id ? { ...item, status } : item)); void updateOrderStatus(order.id, status).catch(() => showToast('Could not sync status. Check Firebase connection.')); }} className="rounded-lg border border-gray-700 bg-gray-900 px-2 py-2 text-[11px] text-gray-200 outline-none focus:border-orange-500"><option value="Processing">Processing</option><option value="Packed">Packed</option><option value="Shipped">Shipped</option><option value="Out for Delivery">Out for Delivery</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option></select></td>
                        <td className="px-5 py-4"><p className="font-semibold text-gray-200">{order.driverName || 'Unassigned'}</p><p className="mt-1 text-[11px] text-gray-500">{order.trackingNumber || 'No tracking number'}</p></td>
                        <td className="px-5 py-4"><button type="button" onClick={() => handleOpenLiveTracking(order.id)} className="rounded-lg border border-cyan-500/40 px-2.5 py-2 font-bold text-cyan-300 hover:bg-cyan-500/10">Track order</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AdminRoom>
        );
      }

      if (adminSection === 'inventory') {
        return (
          <AdminRoom onBack={() => navigateAdminSection('overview')}>
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f97316]">Inventory</p><h1 className="mt-2 text-3xl font-black text-white">Product Stock</h1><p className="mt-2 text-sm text-gray-400">Manage products and quantities directly in this workspace.</p></div>
            <div className="grid gap-4 md:grid-cols-3">
              <AdminStatCard label="Low stock" value={products.filter((p) => (stockLevels[p.id] ?? 0) < 10).length} tone="red" />
              <AdminStatCard label="Healthy stock" value={products.filter((p) => (stockLevels[p.id] ?? 0) >= 10).length} tone="green" />
              <AdminStatCard label="Total SKUs" value={products.length} tone="blue" />
            </div>
            <AdminInventoryRoom products={products} stockLevels={stockLevels} stockHistory={stockHistory} onUpdateStock={handleUpdateStock} onSaveProduct={(product) => { setProducts((previous) => previous.some((item) => item.id === product.id) ? previous.map((item) => item.id === product.id ? product : item) : [product, ...previous]); showToast('Product saved'); }} onDeleteProduct={(productId) => { setProducts((previous) => previous.filter((product) => product.id !== productId)); showToast('Product deleted'); }} />
          </AdminRoom>
        );
      }

      if (adminSection === 'confirmations') {
        return (
          <AdminRoom onBack={() => navigateAdminSection('overview')}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f97316]">Finance</p>
                <h1 className="mt-2 text-3xl font-black text-white">Payment Review</h1>
                <p className="mt-2 text-sm text-gray-400">Check customer payments before orders move forward.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5"><p className="text-xs uppercase tracking-[0.2em] text-orange-200">Awaiting review</p><p className="mt-4 text-3xl font-black text-white">{pendingCustomerOrders.length}</p></div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5"><p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Confirmed value</p><p className="mt-4 text-3xl font-black text-white">₦{confirmedRevenue.toLocaleString()}</p></div>
              <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-5"><p className="text-xs uppercase tracking-[0.2em] text-sky-200">Completed checks</p><p className="mt-4 text-3xl font-black text-white">{confirmedCustomerOrders.length}</p></div>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/70 to-gray-950/50 p-6">
              <div className="mb-4 flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-emerald-400" /><h2 className="text-lg font-bold text-white">Review workflow</h2></div>
              <p className="text-sm leading-6 text-gray-400">Pending orders stay visible here until payment is confirmed. Use the review queue to approve payments and keep fulfillment accurate.</p>
            </div>
            <div className="space-y-3">{pendingCustomerOrders.slice(0, 8).map((order) => <div key={order.id} className="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-white">Order #{order.id}</p><p className="mt-1 text-xs text-gray-400">{order.customerName || 'Guest'} · {order.phone || order.email || 'No contact'} · {order.paymentMethod}</p><p className="mt-1 text-xs text-orange-300">Payment pending · ₦{order.total.toLocaleString()}</p></div><div className="flex gap-2"><button type="button" onClick={() => handleConfirmOrderPayment(order.id)} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500">Confirm payment</button><button type="button" onClick={() => { setOrders((items) => items.map((item) => item.id === order.id ? { ...item, status: 'Cancelled' } : item)); void updateOrderStatus(order.id, 'Cancelled'); showToast('Payment rejected and order cancelled'); }} className="rounded-xl border border-red-500/40 px-4 py-2.5 text-xs font-bold text-red-300 hover:bg-red-500/10">Reject</button></div></div>)}</div>
          </AdminRoom>
        );
      }

      if (adminSection === 'reports') {
        return (
          <AdminRoom onBack={() => navigateAdminSection('overview')}>
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f97316]">Analytics</p><h1 className="mt-2 text-3xl font-black text-white">Sales Reports</h1><p className="mt-2 text-sm text-gray-400">Revenue and order performance at a glance.</p></div><button type="button" onClick={exportOrdersCsv} className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-2.5 text-sm font-bold text-blue-200 hover:border-blue-300">Export CSV</button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5"><TrendingUp className="h-5 w-5 text-emerald-300" /><p className="mt-4 text-xs uppercase tracking-[0.2em] text-emerald-200">Revenue</p><p className="mt-2 text-2xl font-black text-white">₦{confirmedRevenue.toLocaleString()}</p></div>
              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5"><BarChart3 className="h-5 w-5 text-blue-300" /><p className="mt-4 text-xs uppercase tracking-[0.2em] text-blue-200">Orders</p><p className="mt-2 text-2xl font-black text-white">{customerOrders.length}</p></div>
              <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5"><Star className="h-5 w-5 text-violet-300" /><p className="mt-4 text-xs uppercase tracking-[0.2em] text-violet-200">Average order</p><p className="mt-2 text-2xl font-black text-white">₦{customerOrders.length ? Math.round(confirmedRevenue / customerOrders.length).toLocaleString() : '0'}</p></div>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/70 to-gray-950/50 p-6"><h2 className="text-lg font-bold text-white">Order mix</h2><div className="mt-5 space-y-4">{[['Confirmed', pieConfirmed, 'bg-orange-400'], ['Processing', pieProcessing, 'bg-blue-400'], ['Delivered', pieDelivered, 'bg-emerald-400']].map(([label, value, color]) => <div key={String(label)}><div className="mb-2 flex justify-between text-xs"><span className="text-gray-300">{label}</span><span className="font-bold text-white">{value}%</span></div><div className="h-2 rounded-full bg-gray-800"><div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} /></div></div>)}</div></div>
          </AdminRoom>
        );
      }

      if (adminSection === 'notifications') {
        return (
          <AdminRoom onBack={() => navigateAdminSection('overview')}>
            <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f97316]">Inbox</p><h1 className="mt-2 text-3xl font-black text-white">Notifications</h1><p className="mt-2 text-sm text-gray-400">Recent activity that needs your attention.</p></div><button type="button" onClick={() => setNotifications((items) => items.map((item) => ({ ...item, read: true })))} className="rounded-xl border border-gray-700 px-4 py-2.5 text-sm font-bold text-gray-300 hover:border-gray-500 hover:text-white">Mark all read</button></div>
            <div className="space-y-3">{notifications.map((notification) => <button key={notification.id} type="button" onClick={() => setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, read: true } : item))} className={`flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition ${notification.read ? 'border-gray-800 bg-gray-900/40' : 'border-orange-500/30 bg-orange-500/10 hover:border-orange-400/60'}`}><div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.read ? 'bg-gray-600' : 'bg-orange-400'}`} /><div className="min-w-0"><p className="font-bold text-white">{notification.title}</p><p className="mt-1 text-sm text-gray-400">{notification.description}</p><p className="mt-3 text-[11px] text-gray-500">{notification.time}</p></div></button>)}</div>
          </AdminRoom>
        );
      }

      if (adminSection === 'support') {
        return (
          <AdminRoom onBack={() => navigateAdminSection('overview')}>
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f97316]">Operations</p><h1 className="mt-2 text-3xl font-black text-white">Support chat</h1><p className="mt-2 text-sm text-gray-400">Keep customer and order support in one place.</p></div>
            <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/70 to-gray-950/50 p-6"><div className="mb-5 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15"><MessageCircle className="h-5 w-5 text-emerald-300" /></div><div><p className="font-bold text-white">NeoMart support assistant</p><p className="text-xs text-emerald-300">Online and monitoring orders</p></div></div><div className="max-h-72 space-y-3 overflow-y-auto">{adminChatMessages.map((message, index) => <div key={`${message.text}-${index}`} className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${message.from === 'admin' ? 'ml-auto bg-orange-500/15 text-orange-100' : 'bg-gray-800 text-gray-300'}`}>{message.text}</div>)}</div><form className="mt-5 flex gap-2" onSubmit={(event) => { event.preventDefault(); const message = adminChatInput.trim(); if (!message) return; setAdminChatMessages((items) => [...items, { from: 'admin', text: message }]); setAdminChatInput(''); }}><input value={adminChatInput} onChange={(event) => setAdminChatInput(event.target.value)} placeholder="Write a support note..." className="min-w-0 flex-1 rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-orange-500" /><button type="submit" aria-label="Send support message" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-500 text-white hover:bg-orange-400"><Send className="h-4 w-4" /></button></form></div>
          </AdminRoom>
        );
      }

      if (adminSection === 'storefront') {
        return (
          <AdminRoom onBack={() => navigateAdminSection('overview')}>
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f97316]">Public store</p><h1 className="mt-2 text-3xl font-black text-white">Storefront</h1><p className="mt-2 text-sm text-gray-400">Preview the customer experience and keep selling in reach.</p></div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/15 to-gray-900/60 p-6"><Store className="h-6 w-6 text-orange-300" /><h2 className="mt-5 text-xl font-black text-white">Customer storefront</h2><p className="mt-2 text-sm leading-6 text-gray-400">Open the live shopping experience to inspect products, categories, checkout, and delivery tracking.</p><button type="button" onClick={openStorefront} className="mt-5 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-400">Open storefront</button></div>
              <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/70 to-gray-950/50 p-6"><ShoppingBag className="h-6 w-6 text-cyan-300" /><h2 className="mt-5 text-xl font-black text-white">Catalog snapshot</h2><p className="mt-2 text-sm leading-6 text-gray-400">Your storefront currently has products ready for customers across {new Set(products.map((product) => product.category)).size} categories.</p><div className="mt-5 flex items-center gap-3"><span className="text-3xl font-black text-white">{products.length}</span><span className="text-xs uppercase tracking-[0.18em] text-gray-500">products live</span></div></div>
            </div>
          </AdminRoom>
        );
      }

      if (adminSection === 'settings') {
        return (
          <AdminRoom onBack={() => navigateAdminSection('overview')}>
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f97316]">Workspace</p><h1 className="mt-2 text-3xl font-black text-white">Settings</h1><p className="mt-2 text-sm text-gray-400">Adjust the admin workspace and connected services.</p></div>
            <div className="divide-y divide-gray-800 overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/70 to-gray-950/50">
              <div className="flex items-center justify-between gap-5 p-5"><div><p className="font-bold text-white">Appearance</p><p className="mt-1 text-sm text-gray-400">Choose the storefront theme used in this browser.</p></div><button type="button" onClick={toggleTheme} className="rounded-xl border border-gray-700 px-4 py-2.5 text-sm font-bold text-gray-200 hover:border-orange-500/60">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</button></div>
              <div className="flex items-center justify-between gap-5 p-5"><div><p className="font-bold text-white">Firebase connection</p><p className="mt-1 text-sm text-gray-400">Orders, stock, and customer updates sync in real time.</p></div><span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400" />Connected</span></div>
              <div className="flex items-center justify-between gap-5 p-5"><div><p className="font-bold text-white">Admin session</p><p className="mt-1 text-sm text-gray-400">Signed in as {currentUserEmail || 'administrator'}.</p></div><button type="button" onClick={openStorefront} className="rounded-xl border border-gray-700 px-4 py-2.5 text-sm font-bold text-gray-200 hover:border-gray-500">Exit admin</button></div>
            </div>
          </AdminRoom>
        );
      }

      if (adminSection === 'activity') {
        return (
          <AdminRoom onBack={() => navigateAdminSection('overview')}>
            <AdminSectionHeader eyebrow="Security" title="Admin Activity Log" description="A local record of important admin actions in this browser." />
            <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/70 to-gray-950/50 p-5">
              <div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-white">Recent actions</h2><button type="button" onClick={() => { setAdminActivityLog([]); localStorage.removeItem('neomart_admin_activity_log'); }} className="rounded-xl border border-red-500/40 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/10">Clear log</button></div>
              {adminActivityLog.length === 0 ? <p className="py-10 text-center text-sm text-gray-500">No admin activity recorded yet.</p> : <div className="space-y-2">{adminActivityLog.map((entry) => <div key={entry.id} className="flex flex-col gap-2 rounded-xl border border-gray-800 bg-gray-900/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-white">{entry.action}</p><p className="mt-1 text-xs text-gray-400">{entry.detail}</p></div><time className="shrink-0 text-[11px] text-gray-500">{new Date(entry.createdAt).toLocaleString()}</time></div>)}</div>}
            </div>
          </AdminRoom>
        );
      }

      if (adminSection === 'customers') {
        return (
          <AdminRoom onBack={() => navigateAdminSection('overview')}>
            <AdminCustomersModal embedded isOpen orders={customerOrders} onClose={() => undefined} onToast={showToast} onUpdateCustomerState={(email, state: AccountState) => updateCustomerAccountState(email, state)} />
          </AdminRoom>
        );
      }

      return (
        <>
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-[#f97316]/80 mb-2">Welcome back</p>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">Dashboard Overview</h1>
              <p className="text-sm text-gray-400">Real-time store analytics and operations center</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button 
                type="button" 
                onClick={openStorefront} 
                className="group inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800/50 to-gray-900/50 px-4 py-2.5 text-sm font-bold text-gray-300 transition-all duration-200 hover:border-gray-600 hover:text-white hover:shadow-lg hover:shadow-gray-500/10 backdrop-blur-sm"
              >
                ← Back to Store
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {[
              { title: 'Confirmed Revenue', value: `NGN ${confirmedRevenue.toLocaleString()}`, change: '+12.8%', icon: TrendingUp, gradient: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-500/20' },
              { title: 'Total Orders', value: `${customerOrders.length}`, change: `${deliveredCustomerOrders.length} delivered`, icon: Package, gradient: 'from-blue-600 to-cyan-600', shadow: 'shadow-blue-500/20' },
              { title: 'Pending Review', value: `${pendingCustomerOrders.length}`, change: 'Needs attention', icon: AlertTriangle, gradient: 'from-red-600 to-orange-600', shadow: 'shadow-red-500/20' },
              { title: 'Active Customers', value: `${new Set(customerOrders.map((order) => order.phone)).size}`, change: 'Unique shoppers', icon: Users, gradient: 'from-purple-600 to-pink-600', shadow: 'shadow-purple-500/20' }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div 
                  key={idx}
                  className={`group rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/60 to-gray-950/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-gray-700 hover:shadow-xl hover:${card.shadow} cursor-pointer hover:scale-105`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">{card.title}</p>
                      <h3 className="text-2xl sm:text-3xl font-black text-white">{card.value}</h3>
                    </div>
                    <div className={`rounded-xl bg-gradient-to-br ${card.gradient} p-3 shadow-lg ${card.shadow} text-white group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400">↑ {card.change}</span>
                    <span className="text-xs text-gray-500">vs last 7 days</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 mb-8">
            <div className="rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/60 to-gray-950/40 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Order Health Status</h2>
                  <p className="text-xs text-gray-400 mt-1">Payment & fulfillment distribution</p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-10">
                <div className="relative grid h-36 w-36 shrink-0 place-items-center rounded-full shadow-2xl shadow-orange-500/20 sm:h-40 sm:w-40" style={{ background: `conic-gradient(#f97316 0 ${pieConfirmed}%, #3b82f6 ${pieConfirmed}% ${pieConfirmed + pieProcessing}%, #10b981 ${pieConfirmed + pieProcessing}% 100%)` }}>
                  <div className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-b from-gray-800 to-gray-900 text-center border border-gray-700 shadow-inner">
                    <strong className="text-3xl text-white">{customerOrders.length}</strong>
                    <span className="text-xs font-semibold text-gray-400">total</span>
                  </div>
                </div>
                <div className="w-full max-w-xs space-y-4">
                  {[
                    { label: 'Confirmed', percentage: pieConfirmed, color: 'from-[#f97316] to-orange-500' },
                    { label: 'Processing', percentage: pieProcessing, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Delivered', percentage: pieDelivered, color: 'from-emerald-500 to-teal-500' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 whitespace-nowrap">
                      <div className={`h-3 w-8 rounded-full bg-gradient-to-r ${item.color} shadow-lg`} />
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-300">{item.label}</span>
                        <span className="text-sm font-black text-white">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/60 to-gray-950/40 p-6 backdrop-blur-sm flex flex-col">
              <h2 className="text-lg font-bold text-white mb-1">System Status</h2>
              <p className="text-xs text-gray-400 mb-6">Platform health & analytics</p>
              <div className="space-y-3 flex-1">
                {[
                  { status: 'API Server', health: 'Online', color: 'emerald' },
                  { status: 'Database', health: 'Synced', color: 'blue' },
                  { status: 'Payment Gateway', health: 'Active', color: 'green' },
                  { status: 'Delivery Network', health: 'Operational', color: 'purple' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-gradient-to-r from-gray-800/40 to-gray-900/40 p-3 border border-gray-700/50">
                    <span className="text-xs font-semibold text-gray-300">{item.status}</span>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full bg-${item.color}-500 animate-pulse shadow-lg shadow-${item.color}-500/50`} />
                      <span className={`text-xs font-bold text-${item.color}-400`}>{item.health}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-6">
            <div className="rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/60 to-gray-950/40 p-6 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-white">Recent Orders</h2>
                  <p className="text-xs text-gray-400 mt-1">Latest transactions</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-700/50 text-gray-400">
                      <th className="pb-3 font-semibold">Order ID</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {customerOrders.slice(0, 6).map((order) => (
                      <tr 
                        key={order.id} 
                        onClick={() => navigateAdminSection('orders')} 
                        className="transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-800/30 hover:to-gray-900/30 cursor-pointer group"
                      >
                        <td className="py-3 font-bold text-white group-hover:text-[#f97316]">#{order.id}</td>
                        <td className="py-3 text-gray-300 group-hover:text-white">{order.customerName}</td>
                        <td className="py-3 font-bold text-emerald-400">₦{order.total.toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold ${
                            order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                            order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                            order.status === 'confirmed' ? 'bg-cyan-500/20 text-cyan-400' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                            {String(order.status).charAt(0).toUpperCase() + String(order.status).slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/60 to-gray-950/40 p-6 backdrop-blur-sm">
              <h2 className="mb-5 text-lg font-bold text-white">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Add Product', detail: 'Add new product', icon: Package, action: () => navigateAdminSection('inventory'), tone: 'orange' },
                  { label: 'View Orders', detail: 'Manage orders', icon: ClipboardList, action: () => navigateAdminSection('orders'), tone: 'blue' },
                  { label: 'Payment Review', detail: 'Review payments', icon: CreditCard, action: () => setIsConfirmOrdersOpen(true), tone: 'green' },
                  { label: 'Add Customer', detail: 'Manage customers', icon: User, action: () => setIsCustomerManagementOpen(true), tone: 'violet' },
                  { label: 'Sales Reports', detail: 'View reports', icon: BarChart3, action: () => setIsSalesReportOpen(true), tone: 'amber' },
                  { label: 'Storefront', detail: 'Open store', icon: Store, action: openStorefront, tone: 'pink' },
                ].map((action) => {
                  const Icon = action.icon;
                  const tones = { orange: 'bg-orange-500/20 text-orange-300', blue: 'bg-blue-500/20 text-blue-300', green: 'bg-emerald-500/20 text-emerald-300', violet: 'bg-violet-500/20 text-violet-300', amber: 'bg-amber-500/20 text-amber-300', pink: 'bg-pink-500/20 text-pink-300' };
                  return <button key={action.label} type="button" onClick={action.action} className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/50 p-3 text-left transition hover:border-gray-600 hover:bg-gray-800/70"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tones[action.tone]}`}><Icon className="h-4 w-4" /></span><span className="min-w-0"><span className="block truncate text-xs font-bold text-white">{action.label}</span><span className="mt-1 block truncate text-[10px] text-gray-500">{action.detail}</span></span></button>;
                })}
              </div>
            </div>
          </div>

          {pendingCustomerOrders.length > 0 && (
            <div className="mt-8 rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/60 to-gray-950/40 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    Pending Review
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">Orders awaiting payment confirmation</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pendingCustomerOrders.slice(0, 3).map((order) => (
                  <button
                    key={order.id}
                    onClick={() => navigateAdminSection('orders')}
                    className="group text-left rounded-xl border border-red-600/30 bg-gradient-to-br from-red-950/40 to-red-900/20 p-4 transition-all duration-200 hover:border-red-500/60 hover:shadow-lg hover:shadow-red-500/20 hover:scale-105 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-gradient-to-br from-red-600 to-red-500 p-2 text-white mt-0.5">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm">Order #{order.id}</p>
                        <p className="text-xs text-gray-400 mt-1 truncate">{order.customerName}</p>
                        <p className="text-xs text-red-300 font-semibold mt-2">Review Payment</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      );
    };

    return (
      <div {...gestureSurfaceProps} style={{ transform: edgeSwipeOffset ? `translateX(${edgeSwipeOffset}px)` : undefined, transition: edgeSwipeOffset ? 'none' : 'transform 180ms ease-out' }} className="admin-dashboard min-h-screen bg-gradient-to-br from-[#0a0d11] via-[#0f1217] to-[#0d1012] text-gray-100 transition-colors">
        <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[260px_1fr]">
          <aside className="hidden border-r border-gradient bg-gradient-to-b from-[#131821] to-[#0d1015] p-6 text-white lg:flex lg:flex-col dark:border-gray-800/50 shadow-xl">
            <div className="flex items-center gap-3 border-b border-gradient pb-6 mb-2">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] font-black shadow-lg shadow-orange-500/40">N</div>
              <div className="flex-1">
                <div className="font-bold text-lg tracking-tight">neoMart</div>
                <div className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">admin hub</div>
              </div>
            </div>

            <div className="mt-8 flex-1 overflow-y-auto pr-1">{renderAdminNav()}</div>

            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 to-emerald-900/20 p-4 backdrop-blur-sm shadow-lg shadow-emerald-500/10">
              <div className="mb-3 flex items-center gap-2.5 text-xs font-bold text-emerald-300">
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300 animate-pulse shadow-lg shadow-emerald-400/50" />
                <span>All systems online</span>
              </div>
              <p className="text-[11px] leading-5 text-gray-400">Real-time sync enabled for orders, payments & inventory.</p>
            </div>
          </aside>

          <main className="min-w-0 px-4 py-6 sm:px-8 lg:px-10 lg:py-8">
            <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">neoMart admin</p><p className="mt-1 text-sm font-bold text-white">{adminSidebarItems.find((item) => item.id === adminSection)?.label}</p></div>
              <button type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Open admin navigation" className="grid h-11 w-11 place-items-center rounded-xl border border-gray-700 bg-gray-900 text-gray-200"><Menu className="h-5 w-5" /></button>
            </div>
            {renderAdminContent()}
          </main>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" aria-label="Close admin navigation" onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/70" />
            <aside className="relative flex h-full w-[min(86vw,300px)] flex-col border-r border-gray-800 bg-[#0d1015] p-6 text-white shadow-2xl">
              <div className="mb-8 flex items-center justify-between"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 font-black">N</div><div><p className="font-bold">neoMart</p><p className="text-[9px] uppercase tracking-widest text-gray-500">admin hub</p></div></div><button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close admin navigation" className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button></div>
              <div className="flex-1 overflow-y-auto">{renderAdminNav()}</div>
              <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">All systems online</div>
            </aside>
          </div>
        )}

        <AdminOrderAlert
          order={adminOrderAlert}
          onOpenOrders={() => {
            setAdminOrderAlert(null);
            setIsAdminOpen(false);
            navigateAdminSection('orders');
          }}
          onDismiss={() => setAdminOrderAlert(null)}
        />

        <AdminOrdersModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          onEnableNotifications={enableAdminNotifications}
          orders={orders.filter((order) => order.orderSource === 'customer')}
          onConfirmOrderPayment={handleConfirmOrderPayment}
          onOpenStockManagement={() => navigateAdminSection('inventory')}
          onOpenSalesReport={() => navigateAdminSection('reports')}
          onOpenCustomerManagement={() => navigateAdminSection('customers')}
          onOpenLiveGps={(orderId) => {
            setIsAdminOpen(false);
            handleOpenLiveTracking(orderId);
          }}
          onUpdateOrderStatus={(orderId, status) => {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === orderId
                  ? { ...order, status }
                  : order
              )
            );
            void updateOrderStatus(orderId, status).catch(() => {
              showToast('Could not sync status. Check Firebase connection.');
            });
          }}
          onUpdateOrderDelivery={(orderId, delivery) => {
            setOrders((prev) => prev.map((order) => order.id === orderId ? { ...order, ...delivery } : order));
            void updateOrderDelivery(orderId, delivery).catch(() => {
              showToast('Could not sync delivery details. Check Firebase connection.');
            });
            showToast('Delivery assignment saved');
          }}
        />
        <ConfirmOrdersModal
          isOpen={isConfirmOrdersOpen}
          onClose={() => setIsConfirmOrdersOpen(false)}
          orders={orders.filter(
            (order) => order.orderSource === 'customer' && order.paymentConfirmed !== true
          )}
          onConfirmOrder={handleConfirmOrderPayment}
        />
        <AdminSalesReportModal
          isOpen={isSalesReportOpen}
          onClose={() => setIsSalesReportOpen(false)}
          orders={orders.filter((order) => order.orderSource === 'customer')}
        />

        <AdminCustomersModal
          isOpen={isCustomerManagementOpen}
          onClose={() => setIsCustomerManagementOpen(false)}
          orders={orders.filter((order) => order.orderSource === 'customer')}
          onToast={showToast}
          onUpdateCustomerState={(email, state: AccountState) => updateCustomerAccountState(email, state)}
        />

        <Toast message={toastMessage} />
      </div>
    );
  }

  return (
    <div {...gestureSurfaceProps} style={{ transform: edgeSwipeOffset ? `translateX(${edgeSwipeOffset}px)` : undefined, transition: edgeSwipeOffset ? 'none' : 'transform 180ms ease-out' }} className="min-h-screen flex flex-col bg-[#f5f5f5] dark:bg-[#0f0f0f] text-gray-900 dark:text-gray-100 transition-colors">
      <AdminOrderAlert
        order={adminOrderAlert}
        onOpenOrders={() => {
          setAdminOrderAlert(null);
          setAdminSection('orders');
          setCurrentView('admin');
          if (window.location.pathname.toLowerCase() !== '/admin') {
            window.history.pushState({ neomartView: 'admin', adminSection: 'orders' }, '', '/admin');
          }
        }}
        onDismiss={() => setAdminOrderAlert(null)}
      />
      {/* 1. Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        isLoggedIn={isLoggedIn}
        accountName={accountName}
        accountPhotoUrl={accountPhotoUrl}
        onOpenHelpSection={handleOpenHelpSection}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        products={allProducts}
        onSelectProduct={handleSelectProduct}
        onOpenTrackOrder={() => handleOpenLiveTracking()}
        onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
        onSelectCategory={handleSelectCategory}
        onOpenAdmin={openAdminPortal}
        onOpenConfirmOrders={() => setIsConfirmOrdersOpen(true)}
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
                stock={getStockLevel(selectedProduct.id)}
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
                        reviews={reviews}
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
                          reviews={reviews}
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
                          reviews={reviews}
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
                          reviews={reviews}
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
                          reviews={reviews}
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
                          reviews={reviews}
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
        initialDelivery={savedDeliveryDetails}
        onCompleteOrder={handleCompleteOrder}
        showToast={showToast}
      />

      {/* 7. Payment Success Modal */}
      <PaymentSuccessModal
        isOpen={isPaymentSuccessOpen}
        onClose={() => setIsPaymentSuccessOpen(false)}
        method={lastPaymentMethod}
        orderId={lastPlacedOrderId || undefined}
        isOrderConfirmed={Boolean(
          lastPlacedOrderId && orders.find((order) => order.id === lastPlacedOrderId)?.paymentConfirmed
        )}
        onOpenTrackLiveOrder={handleOpenLiveTracking}
      />

      {/* 8. Login / Account Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        isLoggedIn={isLoggedIn}
          isAccessBlocked={isCustomerAccessBlocked}
        onLoginSuccess={async (id, name, photoUrl) => {
          const state = await getCustomerAccountState(id);
          if (state.revokedAt || state.disabled || state.deletedAt) {
            setIsCustomerAccessBlocked(true);
            showToast('This account is blocked by NeoMart support.');
            return;
          }
          const startedAt = Date.now();
          setIsLoggedIn(true);
          setCurrentUserEmail(id);
          setAccountName(name || id.split('@')[0]);
          setAccountPhotoUrl(photoUrl || '');
          setSessionStartedAt(startedAt);
          localStorage.setItem('neomart_logged_in', 'true');
          localStorage.setItem('neomart_user_email', id);
          localStorage.setItem('neomart_account_name', name || id.split('@')[0]);
          if (photoUrl) localStorage.setItem('neomart_account_photo_url', photoUrl);
          localStorage.setItem('neomart_session_started_at', String(startedAt));
          if (id.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            setAdminSection('overview');
            setCurrentView('admin');
            if (window.location.pathname.toLowerCase() !== '/admin') {
              window.history.pushState({ neomartView: 'admin' }, '', '/admin');
            }
          }
          void saveCustomerProfile({
            email: id.includes('@') ? id : undefined,
            displayName: name || id.split('@')[0],
            phone: auth?.currentUser?.phoneNumber || undefined,
          }).catch(() => {});
        }}
        onLogout={() => {
          setIsLoggedIn(false);
          setCurrentUserEmail('');
          setAccountName('');
          setAccountPhotoUrl('');
          setIsAdminOpen(false);
          localStorage.removeItem('neomart_logged_in');
          localStorage.removeItem('neomart_user_email');
          localStorage.removeItem('neomart_account_name');
          localStorage.removeItem('neomart_account_photo_url');
          localStorage.removeItem('neomart_session_started_at');
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

      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        orders={customerOrdersForAccount}
        onTrackOrder={(orderId) => {
          setIsOrderHistoryOpen(false);
          handleOpenLiveTracking(orderId);
        }}
      />

      {/* 11. Admin Orders and Payment Manager */}
      <AdminOrdersModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onEnableNotifications={enableAdminNotifications}
        orders={orders.filter((order) => order.orderSource === 'customer')}
        onConfirmOrderPayment={handleConfirmOrderPayment}
        onOpenStockManagement={() => {
          navigateAdminSection('inventory');
          setCurrentView('admin');
          setIsAdminOpen(false);
          if (window.location.pathname.toLowerCase() !== '/admin') {
            window.history.pushState({ neomartView: 'admin', adminSection: 'inventory' }, '', '/admin');
          }
        }}
        onOpenSalesReport={() => {
          setIsAdminOpen(false);
          setIsSalesReportOpen(true);
        }}
        onOpenCustomerManagement={() => {
          setIsAdminOpen(false);
          setIsCustomerManagementOpen(true);
        }}
        onOpenLiveGps={(orderId) => {
          setIsAdminOpen(false);
          handleOpenLiveTracking(orderId);
        }}
        onUpdateOrderStatus={(orderId, status) => {
          setOrders((prev) =>
            prev.map((order) =>
              order.id === orderId
                ? { ...order, status }
                : order
            )
          );
          void updateOrderStatus(orderId, status).catch(() => {
            showToast('Could not sync status. Check Firebase connection.');
          });
        }}
        onUpdateOrderDelivery={(orderId, delivery) => {
          setOrders((prev) => prev.map((order) => order.id === orderId ? { ...order, ...delivery } : order));
          void updateOrderDelivery(orderId, delivery).catch(() => {
            showToast('Could not sync delivery details. Check Firebase connection.');
          });
          showToast('Delivery assignment saved');
        }}
      />
      <ConfirmOrdersModal
        isOpen={isConfirmOrdersOpen}
        onClose={() => setIsConfirmOrdersOpen(false)}
        orders={orders.filter(
          (order) => order.orderSource === 'customer' && order.paymentConfirmed !== true
        )}
        onConfirmOrder={handleConfirmOrderPayment}
      />
      <AdminSalesReportModal
        isOpen={isSalesReportOpen}
        onClose={() => setIsSalesReportOpen(false)}
        orders={orders.filter((order) => order.orderSource === 'customer')}
      />

      <AdminCustomersModal
        isOpen={isCustomerManagementOpen}
        onClose={() => setIsCustomerManagementOpen(false)}
        orders={orders.filter((order) => order.orderSource === 'customer')}
        onToast={showToast}
        onUpdateCustomerState={(email, state: AccountState) => updateCustomerAccountState(email, state)}
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
