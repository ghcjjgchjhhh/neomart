import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  Package,
  Navigation,
  ChevronRight,
  RefreshCw,
  Search,
  ExternalLink,
  Store,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Order } from '../types';
import { sampleOrders } from '../data/ordersAndReviews';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string | null;
  ordersList?: Order[];
  showToast: (msg: string) => void;
}

// Route waypoint coordinates for the animated vector map
const ROUTE_WAYPOINTS = [
  { x: 50, y: 190, name: 'NeoMart Ikeja Fulfillment Hub', time: '09:40 AM' },
  { x: 120, y: 175, name: 'Maryland Interchange', time: '09:52 AM' },
  { x: 190, y: 155, name: 'Anthony Transit Way', time: '10:05 AM' },
  { x: 260, y: 130, name: '3rd Mainland Bridge Expressway', time: '10:14 AM' },
  { x: 330, y: 100, name: 'Adeniji Adele Link', time: '10:22 AM' },
  { x: 395, y: 75, name: 'Falomo / Lekki Toll Plaza', time: '10:30 AM' },
  { x: 450, y: 55, name: 'Destination Address', time: '10:38 AM' }
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orderId,
  ordersList = sampleOrders,
  showToast
}) => {
  if (!isOpen) return null;

  // Find active order or default to the most recent/specified one
  const [selectedOrder, setSelectedOrder] = useState<Order>(() => {
    if (orderId) {
      const found = ordersList.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
      if (found) return found;
    }
    return ordersList[0] || sampleOrders[0];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [showItemsList, setShowItemsList] = useState(false);

  // Live courier simulation progress (0 to 100%)
  const [courierProgress, setCourierProgress] = useState(65);
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);

  // Derived progress statistics (no cascading state mutations)
  const remainingRatio = Math.max(0, (100 - courierProgress) / 100);
  const distanceKm = Number((remainingRatio * 6.5).toFixed(1));
  const etaMinutes = Math.max(2, Math.round(remainingRatio * 22));
  const speed = courierProgress >= 100 ? 0 : 38;

  // Update selected order when prop changes
  useEffect(() => {
    if (orderId) {
      const found = ordersList.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
      if (found) {
        setSelectedOrder(found);
        // Adjust initial progress based on order status
        if (found.status === 'Delivered') setCourierProgress(100);
        else if (found.status === 'Out for Delivery') setCourierProgress(72);
        else if (found.status === 'Shipped') setCourierProgress(40);
        else if (found.status === 'Packed') setCourierProgress(25);
        else setCourierProgress(10);
      }
    }
  }, [orderId, ordersList]);

  // Smooth live GPS movement simulation
  useEffect(() => {
    if (!isLiveSimulating) return;

    const interval = setInterval(() => {
      setCourierProgress((prev) => {
        if (prev >= 98) {
          return 98; // Stay near delivery destination
        }
        return prev + 0.5;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isLiveSimulating]);

  // Calculate current point along the 7-waypoint spline
  const getCoordinatesFromProgress = (progress: number) => {
    const totalSegments = ROUTE_WAYPOINTS.length - 1;
    const clamped = Math.min(100, Math.max(0, progress));
    const globalT = (clamped / 100) * totalSegments;
    const segmentIndex = Math.min(Math.floor(globalT), totalSegments - 1);
    const segmentT = globalT - segmentIndex;

    const p0 = ROUTE_WAYPOINTS[segmentIndex];
    const p1 = ROUTE_WAYPOINTS[segmentIndex + 1];

    const currentX = p0.x + (p1.x - p0.x) * segmentT;
    const currentY = p0.y + (p1.y - p0.y) * segmentT;

    // Calculate angle in degrees
    const angleRad = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    const angleDeg = (angleRad * 180) / Math.PI;

    return { x: currentX, y: currentY, angle: angleDeg };
  };

  const riderPos = getCoordinatesFromProgress(courierProgress);

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const found = ordersList.find(
      (o) =>
        o.id.toLowerCase() === query ||
        o.phone.includes(query) ||
        o.email.toLowerCase().includes(query)
    );

    if (found) {
      setSelectedOrder(found);
      setSearchQuery('');
      if (found.status === 'Delivered') setCourierProgress(100);
      else if (found.status === 'Out for Delivery') setCourierProgress(75);
      else if (found.status === 'Shipped') setCourierProgress(45);
      else if (found.status === 'Packed') setCourierProgress(25);
      else setCourierProgress(10);
      showToast(`Tracking details loaded for Order #${found.id}`);
    } else {
      setSearchError('Order not found. Try searching with an order ID like NM-10492, NM-90341, or NM-48291');
    }
  };

  const formatPrice = (amount: number) => {
    return '₦' + amount.toLocaleString('en-NG');
  };

  const handleStepForward = () => {
    setCourierProgress((prev) => Math.min(100, prev + 25));
  };

  const handleResetProgress = () => {
    setCourierProgress(15);
  };

  // Status Stepper Definitions
  const steps = [
    {
      id: 'placed',
      title: 'Order Confirmed',
      desc: 'Payment received & verified',
      time: '09:15 AM',
      done: courierProgress >= 10,
      active: courierProgress < 25
    },
    {
      id: 'packed',
      title: 'Packed at Warehouse',
      desc: 'Quality checked & packaged',
      time: '09:40 AM',
      done: courierProgress >= 25,
      active: courierProgress >= 25 && courierProgress < 50
    },
    {
      id: 'transit',
      title: 'In Transit',
      desc: 'En route via Expressway Hub',
      time: '10:05 AM',
      done: courierProgress >= 50,
      active: courierProgress >= 50 && courierProgress < 85
    },
    {
      id: 'out',
      title: 'Out for Delivery',
      desc: 'Rider is in your neighborhood',
      time: '10:28 AM',
      done: courierProgress >= 85,
      active: courierProgress >= 85 && courierProgress < 100
    },
    {
      id: 'delivered',
      title: 'Delivered',
      desc: 'Delivered safely to doorstep',
      time: courierProgress >= 100 ? 'Just now' : 'Est. ~10:45 AM',
      done: courierProgress >= 100,
      active: courierProgress >= 100
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gray-900 text-white border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f68b1e] text-white flex items-center justify-center font-bold shadow-md shadow-[#f68b1e]/30">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base leading-tight text-white">
                  Live Dispatch Tracking
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE GPS
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Real-time express delivery status in Nigeria
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Order Bar & Quick Switcher */}
        <div className="bg-gray-50 dark:bg-[#1f1f1f] px-5 py-2.5 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <form onSubmit={handleSearchOrder} className="flex-1 min-w-50 flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Order ID (e.g. NM-90341) or phone number..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121212] text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#f68b1e] hover:bg-[#e07a10] text-white px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer text-xs"
            >
              Track
            </button>
          </form>

          {/* Recent Orders Switcher Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap hidden sm:inline">
              Recent:
            </span>
            {ordersList.slice(0, 3).map((ord) => (
              <button
                key={ord.id}
                onClick={() => {
                  setSelectedOrder(ord);
                  if (ord.status === 'Delivered') setCourierProgress(100);
                  else if (ord.status === 'Out for Delivery') setCourierProgress(75);
                  else if (ord.status === 'Shipped') setCourierProgress(45);
                  else setCourierProgress(25);
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedOrder.id === ord.id
                    ? 'bg-[#f68b1e] text-white shadow-xs'
                    : 'bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#f68b1e]'
                }`}
              >
                #{ord.id}
              </button>
            ))}
          </div>
        </div>

        {searchError && (
          <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-5 py-2 text-xs flex items-center gap-2 border-b border-red-200 dark:border-red-900">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-gray-800">
          {/* 1. Animated Vector Map & GPS Status Card */}
          <div className="p-4 sm:p-5 bg-linear-to-b from-gray-900 via-[#131722] to-gray-900 text-white relative">
            {/* Map Top Status Pill Overlay */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider text-gray-300 uppercase">
                  Order #{selectedOrder.id}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-xs font-semibold text-[#f68b1e]">
                  {courierProgress >= 100
                    ? 'Delivered'
                    : courierProgress >= 85
                    ? 'Arriving at Destination'
                    : 'In Transit with Express Courier'}
                </span>
              </div>

              {/* Speed & ETA Pill */}
              <div className="flex items-center gap-2 text-[11px]">
                <div className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 font-mono">
                  ⚡ {courierProgress >= 100 ? '0 km/h' : `${speed} km/h`}
                </div>
                <div className="bg-[#f68b1e] text-white px-3 py-1 rounded-lg font-bold shadow-md shadow-[#f68b1e]/30">
                  ⏱️ {courierProgress >= 100 ? 'Delivered' : `ETA: ~${etaMinutes} mins (${distanceKm} km)`}
                </div>
              </div>
            </div>

            {/* Stylized Interactive Vector Map */}
            <div className="w-full h-52 sm:h-64 rounded-2xl bg-[#0f141c] border border-gray-800/80 relative overflow-hidden shadow-inner">
              {/* Grid Background */}
              <svg className="absolute inset-0 w-full h-full opacity-15" width="100%" height="100%">
                <defs>
                  <pattern id="grid_track" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#60a5fa" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid_track)" />
              </svg>

              {/* Stylized Water Bodies / Lagos Lagoon */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 240">
                <path
                  d="M 0 100 Q 150 140 280 180 T 500 240 L 500 240 L 0 240 Z"
                  fill="#0c2340"
                  opacity="0.6"
                />
                <text x="340" y="215" fill="#3b82f6" opacity="0.3" fontSize="10" fontWeight="bold">
                  LAGOS LAGOON / WATERWAY
                </text>

                {/* Road Network Lines */}
                <path
                  d="M 20 50 L 480 30"
                  stroke="#1e293b"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 50 190 Q 200 160 300 120 T 450 55"
                  stroke="#334155"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 50 190 Q 200 160 300 120 T 450 55"
                  stroke="#1e293b"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Active Highlighted Traveled Path */}
                <path
                  d="M 50 190 Q 200 160 300 120 T 450 55"
                  stroke="#f68b1e"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="8 4"
                  className="animate-pulse"
                />

                {/* Waypoint Markers */}
                {/* 1. Origin Hub */}
                <circle cx="50" cy="190" r="7" fill="#f68b1e" stroke="#ffffff" strokeWidth="2.5" />
                <text x="40" y="215" fill="#e2e8f0" fontSize="9" fontWeight="bold">
                  Ikeja Hub
                </text>

                {/* 2. Midway Landmark */}
                <circle cx="260" cy="130" r="4" fill="#64748b" stroke="#ffffff" strokeWidth="1.5" />
                <text x="240" y="120" fill="#94a3b8" fontSize="8">
                  3rd Mainland
                </text>

                {/* 3. Destination Pin */}
                <circle cx="450" cy="55" r="8" fill="#10b981" stroke="#ffffff" strokeWidth="3" />
                <text x="410" y="40" fill="#34d399" fontSize="9" fontWeight="bold">
                  📍 Destination
                </text>

                {/* Live Animated Rider Icon */}
                <g
                  transform={`translate(${riderPos.x}, ${riderPos.y})`}
                  className="transition-transform duration-300"
                >
                  {/* Pulse Radar Wave */}
                  <circle cx="0" cy="0" r="16" fill="#f68b1e" opacity="0.3" className="animate-ping" />
                  <circle cx="0" cy="0" r="10" fill="#f68b1e" stroke="#ffffff" strokeWidth="2" />

                  {/* Rider Motorcycle Icon */}
                  <g transform={`rotate(${riderPos.angle}) scale(0.65)`}>
                    <path
                      d="M -10 -4 L 10 -4 L 5 4 L -5 4 Z"
                      fill="#ffffff"
                    />
                    <circle cx="-6" cy="5" r="4" fill="#111827" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="6" cy="5" r="4" fill="#111827" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="0" cy="-6" r="3" fill="#f68b1e" />
                  </g>
                </g>
              </svg>

              {/* Map Floating Badges */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-gray-300 border border-white/10 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Courier: <strong>LAG-482-KT</strong></span>
              </div>

              {/* Simulation Controls Overlay */}
              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setIsLiveSimulating(!isLiveSimulating)}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                  title="Pause/Play GPS simulation"
                >
                  {isLiveSimulating ? '⏸️ Pause' : '▶️ Resume'}
                </button>
                <button
                  type="button"
                  onClick={handleStepForward}
                  className="px-2 py-1 bg-[#f68b1e] hover:bg-[#e07a10] text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                  title="Fast forward delivery"
                >
                  ⏩ Advance
                </button>
                <button
                  type="button"
                  onClick={handleResetProgress}
                  className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Reset trip"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Rider Information & Contact Strip */}
            <div className="mt-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-linear-to-tr from-[#f68b1e] to-amber-400 p-0.5 shadow-md shrink-0">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm">
                    CE
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">Chukwudi Eze</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full font-bold">
                      ★ 4.9 (1,480 trips)
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    NeoMart Express Priority Courier • Bike: Honda Ace 125
                  </div>
                </div>
              </div>

              {/* Action Buttons & OTP Verification Code */}
              <div className="flex items-center gap-2">
                <div className="text-right mr-1 hidden sm:block">
                  <div className="text-[10px] text-gray-400">Delivery Security OTP</div>
                  <div className="font-mono font-black text-sm text-[#f68b1e] tracking-widest">
                    4892
                  </div>
                </div>

                <a
                  href="tel:08135642842"
                  className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Rider</span>
                </a>

                <a
                  href="https://wa.me/2348135642842?text=Hello%20Chukwudi,%20I%20am%20tracking%20my%20NeoMart%20order"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* 2. Interactive Delivery Progress Stepper */}
          <div className="p-5 bg-white dark:bg-[#161616]">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4">
              Tracking Timeline
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800">
              {steps.map((step, idx) => (
                <div key={step.id} className="relative flex items-start gap-3.5 group">
                  {/* Step Dot Icon */}
                  <div
                    className={`absolute -left-6 top-0.5 w-5.5 h-5.5 rounded-full flex items-center justify-center transition-all shadow-xs ${
                      step.done
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/60'
                        : step.active
                        ? 'bg-[#f68b1e] text-white ring-4 ring-orange-100 dark:ring-orange-950/60 animate-bounce'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}
                  >
                    {step.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-bold ${
                          step.done || step.active
                            ? 'text-gray-900 dark:text-gray-100'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {step.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Destination & Delivery Address Details */}
          <div className="p-5 bg-gray-50 dark:bg-[#1a1a1a] text-xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 dark:text-gray-100 text-xs">
                  Delivery Destination
                </div>
                <div className="text-gray-600 dark:text-gray-300 mt-0.5">
                  {selectedOrder.address}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Recipient Contact: <strong>{selectedOrder.phone}</strong> • {selectedOrder.email}
                </div>
              </div>
            </div>

            {/* Accordion: View Items in this Order */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setShowItemsList(!showItemsList)}
                className="w-full flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-[#f68b1e] transition-colors cursor-pointer py-1"
              >
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#f68b1e]" />
                  <span>View Package Items ({selectedOrder.items.length})</span>
                </span>
                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                  {showItemsList ? 'Hide details ▲' : 'Show details ▼'}
                </span>
              </button>

              {showItemsList && (
                <div className="mt-3 space-y-2 animate-in fade-in duration-150">
                  {selectedOrder.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-contain rounded-lg bg-gray-50 p-1 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-base">
                            📦
                          </div>
                        )}
                        <div className="truncate">
                          <div className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            Qty: {item.qty} × {formatPrice(item.price)}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-gray-900 dark:text-gray-100 ml-3">
                        {formatPrice(item.price * item.qty)}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between items-center px-1 pt-1 text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      Total Order Paid:
                    </span>
                    <span className="font-black text-[#f68b1e] text-sm">
                      {formatPrice(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="p-4 bg-gray-50 dark:bg-[#1f1f1f] border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Protected by NeoMart Buyer Protection</span>
          </div>

          <button
            onClick={onClose}
            className="bg-[#f68b1e] hover:bg-[#e07a10] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
