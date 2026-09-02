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
  RefreshCw,
  Search,
  AlertCircle,
  Radio,
  Wifi,
  Crosshair,
  Share2,
  Layers
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

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  city?: string;
  state?: string;
}

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
  const [activeMapView, setActiveMapView] = useState<'osm_live' | 'vector'>('osm_live');

  // Real GPS State
  const [permissionStatus, setPermissionStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'error'>('idle');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastPingTime, setLastPingTime] = useState<Date>(new Date());
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    'Connected to NeoMart Live GPS Gateway',
    'Awaiting device location synchronization...',
  ]);

  // Live courier simulation progress (0 to 100%)
  const [courierProgress, setCourierProgress] = useState(65);
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);

  // Derived progress statistics
  const remainingRatio = Math.max(0, (100 - courierProgress) / 100);
  const distanceKm = Number((remainingRatio * 5.8).toFixed(1));
  const etaMinutes = Math.max(2, Math.round(remainingRatio * 18));
  const speed = courierProgress >= 100 ? 0 : 34;

  const watchIdRef = useRef<number | null>(null);

  const addLog = (msg: string) => {
    const timeStr = new Date().toLocaleTimeString();
    setTelemetryLogs((prev) => [`[${timeStr}] ${msg}`, ...prev.slice(0, 5)]);
  };

  // Reverse geocoding for real street address
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.suburb || addr.neighbourhood || addr.quarter || 'Street';
        const city = addr.city || addr.town || addr.county || addr.state_district || 'Lagos';
        const state = addr.state || 'Lagos State';

        setUserLocation((prev) =>
          prev
            ? {
                ...prev,
                address: data.display_name || `${road}, ${city}`,
                city,
                state,
              }
            : null
        );

        addLog(`📍 Doorstep resolved: ${road}, ${city}`);
      }
    } catch {
      addLog(`📍 Locked GPS fix: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`);
    }
  };

  const requestLocationPermission = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setPermissionStatus('error');
      setErrorMessage('Geolocation is not supported by your browser.');
      addLog('⚠️ Geolocation API unavailable on device');
      return;
    }

    setPermissionStatus('requesting');
    setErrorMessage(null);
    addLog('📡 Requesting device location permission...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy;

        const loc: UserLocation = {
          latitude: lat,
          longitude: lng,
          accuracy: acc,
        };
        setUserLocation(loc);
        setPermissionStatus('granted');
        setLastPingTime(new Date());
        addLog(`✅ GPS lock verified: Accuracy ±${Math.round(acc)}m`);
        showToast('📍 Live device GPS connected successfully!');

        // Query internet address
        reverseGeocode(lat, lng);

        // Continuous watch position
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
        watchIdRef.current = navigator.geolocation.watchPosition(
          (watchPos) => {
            const wLat = watchPos.coords.latitude;
            const wLng = watchPos.coords.longitude;
            const wAcc = watchPos.coords.accuracy;
            setUserLocation((prev) =>
              prev
                ? { ...prev, latitude: wLat, longitude: wLng, accuracy: wAcc }
                : { latitude: wLat, longitude: wLng, accuracy: wAcc }
            );
            setLastPingTime(new Date());
          },
          () => {},
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
        );
      },
      (err) => {
        setPermissionStatus('denied');
        let msg = 'Location permission was denied. Please allow location access in your browser.';
        if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'GPS signal unavailable. Please ensure location services are enabled on your device.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Retrying GPS lock...';
        }
        setErrorMessage(msg);
        addLog(`❌ GPS status: ${err.message}`);

        // Default to Lagos coords if denied
        setUserLocation({
          latitude: 6.5244,
          longitude: 3.3792,
          accuracy: 30,
          city: 'Ikeja',
          state: 'Lagos',
          address: 'Ikeja City Mall, Alausa, Lagos, Nigeria',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  };

  // Trigger permission check on open
  useEffect(() => {
    if (isOpen) {
      requestLocationPermission();
    }
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isOpen]);

  // Update selected order when prop changes
  useEffect(() => {
    if (orderId) {
      const found = ordersList.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
      if (found) {
        setSelectedOrder(found);
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
    }, 700);

    return () => clearInterval(interval);
  }, [isLiveSimulating]);

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
      setSearchError('Order not found. Try searching with an order ID like NM-10492 or NM-90341');
    }
  };

  const handleShareTracking = () => {
    if (navigator.share) {
      navigator.share({
        title: `NeoMart Order #${selectedOrder.id} Live Tracking`,
        text: `Live courier tracking for NeoMart order #${selectedOrder.id}. ETA: ~${etaMinutes} mins (${distanceKm} km away).`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText?.(window.location.href);
      showToast('Live tracking link copied to clipboard!');
    }
  };

  const formatPrice = (amount: number) => {
    return '₦' + amount.toLocaleString('en-NG');
  };

  const mapCenterLat = userLocation?.latitude || 6.5244;
  const mapCenterLng = userLocation?.longitude || 3.3792;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapCenterLng - 0.02}%2C${mapCenterLat - 0.02}%2C${mapCenterLng + 0.02}%2C${mapCenterLat + 0.02}&layer=mapnik&marker=${mapCenterLat}%2C${mapCenterLng}`;

  // Status Stepper Definitions
  const steps = [
    {
      id: 'placed',
      title: selectedOrder.paymentConfirmed === true ? 'Order Received' : 'Processing',
      desc: selectedOrder.paymentConfirmed === true
        ? 'Payment verified by NeoMart admin'
        : 'Awaiting payment verification',
      time: '09:15 AM',
      done: courierProgress >= 10,
      active: courierProgress < 25
    },
    {
      id: 'packed',
      title: 'Packed at Warehouse',
      desc: 'Quality checked & sealed',
      time: '09:40 AM',
      done: courierProgress >= 25,
      active: courierProgress >= 25 && courierProgress < 50
    },
    {
      id: 'transit',
      title: 'In Transit',
      desc: 'Express dispatch via delivery route',
      time: '10:05 AM',
      done: courierProgress >= 50,
      active: courierProgress >= 50 && courierProgress < 85
    },
    {
      id: 'out',
      title: 'Out for Delivery',
      desc: 'Courier Musa is approaching your street',
      time: '10:28 AM',
      done: courierProgress >= 85,
      active: courierProgress >= 85 && courierProgress < 100
    },
    {
      id: 'delivered',
      title: 'Delivered',
      desc: 'Delivered securely to your doorstep',
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
                  Live Dispatch GPS Tracking
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ONLINE GPS
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Direct phone GPS integration with live delivery routing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareTracking}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
              title="Share Tracking Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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

        {/* Location Status Alerts */}
        {permissionStatus === 'denied' && (
          <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-5 py-2.5 text-xs flex items-center justify-between border-b border-amber-200 dark:border-amber-900/60">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{errorMessage || 'Location access blocked. Allow phone GPS for doorstep live tracking.'}</span>
            </div>
            <button
              onClick={requestLocationPermission}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer shrink-0 ml-2"
            >
              Grant GPS Permission
            </button>
          </div>
        )}

        {permissionStatus === 'requesting' && (
          <div className="bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-5 py-2 text-xs flex items-center gap-2 border-b border-blue-200 dark:border-blue-900 animate-pulse">
            <Crosshair className="w-4 h-4 animate-spin text-blue-600" />
            <span>Connecting to your phone's GPS... please tap <strong>Allow</strong> on your screen.</span>
          </div>
        )}

        {searchError && (
          <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-5 py-2 text-xs flex items-center gap-2 border-b border-red-200 dark:border-red-900">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Main Scrollable Area */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-gray-800">
          
          {/* 1. Live GPS Map Canvas */}
          <div className="p-4 sm:p-5 bg-linear-to-b from-gray-900 via-[#131722] to-gray-900 text-white relative">
            {/* Top Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider text-gray-300 uppercase">
                  Order #{selectedOrder.id}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-xs font-semibold text-[#f68b1e]">
                  {selectedOrder.paymentConfirmed === true
                    ? 'Order Received / Confirmed'
                    : 'Processing'}
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

            {/* Interactive Real OpenStreetMap GPS Map */}
            <div className="w-full h-56 sm:h-64 rounded-2xl bg-[#0f141c] border border-gray-800 relative overflow-hidden shadow-inner">
              <iframe
                title="NeoMart Live Delivery GPS Map"
                src={osmEmbedUrl}
                className="w-full h-full border-0 pointer-events-auto filter dark:invert-[0.88] dark:hue-rotate-180"
                loading="lazy"
              />

              {/* Top Map HUD Overlays */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="bg-white/95 dark:bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-md flex items-center gap-2 pointer-events-auto">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                  <div className="text-[11px] font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Your Location</span>
                    {userLocation && (
                      <span className="text-[9px] text-gray-500 font-normal">
                        (±{Math.round(userLocation.accuracy)}m)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={requestLocationPermission}
                  className="bg-white/95 dark:bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-md text-gray-700 dark:text-gray-300 hover:text-[#f68b1e] transition-all pointer-events-auto cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                  title="Resync phone GPS"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${permissionStatus === 'requesting' ? 'animate-spin text-[#f68b1e]' : ''}`} />
                  <span>Sync GPS</span>
                </button>
              </div>

              {/* Map Floating Dispatch Pill */}
              <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] text-gray-300 border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Rider: <strong>Musa Garba</strong> • LAG-482-KT</span>
              </div>
            </div>

            {/* Courier Profile & Contact Strip */}
            <div className="mt-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-linear-to-tr from-[#f68b1e] to-amber-400 p-0.5 shadow-md shrink-0">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm">
                    MG
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">Musa Garba</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full font-bold">
                      ★ 4.9 (1,820 trips)
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    NeoExpress Priority Courier • Bike: Yamaha 125cc
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
                  href={`https://wa.me/2348135642842?text=${encodeURIComponent(`Hello Musa, I am tracking my NeoMart order #${selectedOrder.id}. My live location is active.`)}`}
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

          {/* 2. Real-Time Telemetry & Resolved Location Grid */}
          <div className="p-4 sm:p-5 bg-gray-50 dark:bg-[#1a1a1a] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Real Doorstep Coordinates */}
            <div className="p-3 bg-white dark:bg-[#202020] rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1">
                <span className="font-bold flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <Navigation className="w-3.5 h-3.5 text-blue-500" />
                  Phone GPS Coordinates
                </span>
                <span className="text-[10px] text-emerald-600 font-mono font-bold">
                  {permissionStatus === 'granted' ? 'SYNCED' : 'STANDBY'}
                </span>
              </div>
              <div className="font-mono text-xs font-bold text-gray-900 dark:text-gray-100">
                {userLocation ? (
                  `${userLocation.latitude.toFixed(5)}° N, ${userLocation.longitude.toFixed(5)}° E`
                ) : (
                  'Waiting for GPS lock...'
                )}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
                {userLocation?.address || `${userLocation?.city || 'Lagos'}, ${userLocation?.state || 'Nigeria'}`}
              </div>
            </div>

            {/* Destination Address in Order */}
            <div className="p-3 bg-white dark:bg-[#202020] rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1">
                <span className="font-bold flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <MapPin className="w-3.5 h-3.5 text-[#f68b1e]" />
                  Order Destination
                </span>
                <span className="text-[10px] text-gray-400">DELIVERY ADDRESS</span>
              </div>
              <div className="font-semibold text-xs text-gray-900 dark:text-gray-100 truncate">
                {selectedOrder.address}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                Recipient: <strong>{selectedOrder.phone}</strong> • {selectedOrder.email}
              </div>
            </div>
          </div>

          {/* 3. Live Telemetry Console */}
          <div className="p-4 sm:p-5 bg-black text-emerald-400 font-mono text-[11px]">
            <div className="flex items-center justify-between text-gray-400 text-[10px] pb-1.5 mb-2 border-b border-gray-800">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Wifi className="w-3 h-3 text-emerald-500 animate-pulse" />
                <span>INTERNET TELEMETRY STREAM</span>
              </span>
              <span className="text-gray-500">GATEWAY: LAG-NG-01 • SSL ENCRYPTED</span>
            </div>
            <div className="space-y-1">
              {telemetryLogs.map((log, idx) => (
                <div key={idx} className="leading-tight opacity-90 truncate">
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Delivery Progress Stepper */}
          <div className="p-5 bg-white dark:bg-[#161616]">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4">
              Tracking Timeline
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800">
              {steps.map((step) => (
                <div key={step.id} className="relative flex items-start gap-3.5 group">
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

            {/* Accordion: View Items in this Order */}
            <div className="mt-6 pt-3 border-t border-gray-200 dark:border-gray-800">
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
                      className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-[#202020] border border-gray-200 dark:border-gray-800 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-contain rounded-lg bg-white p-1 shrink-0"
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
            <span>Protected by NeoMart Buyer Protection & OTP Verification</span>
          </div>

          <button
            onClick={onClose}
            className="bg-[#f68b1e] hover:bg-[#e07a10] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Done Tracking
          </button>
        </div>
      </div>
    </div>
  );
};
