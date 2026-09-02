import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  CreditCard,
  Truck,
  RotateCcw,
  Cookie,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { HelpSectionType, Order } from '../types';
import { sampleOrders } from '../data/ordersAndReviews';

interface HelpCenterModalProps {
  isOpen: boolean;
  section: HelpSectionType;
  onClose: () => void;
  onSelectSection: (section: HelpSectionType) => void;
  onStartShopping: () => void;
  showToast: (msg: string) => void;
}

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({
  isOpen,
  section,
  onClose,
  onSelectSection,
  onStartShopping,
  showToast
}) => {
  if (!isOpen) return null;

  // Track Order State
  const [trackOrderId, setTrackOrderId] = useState('');
  const [trackContact, setTrackContact] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackError, setTrackError] = useState('');

  // Cancel Order State
  const [cancelOrderId, setCancelOrderId] = useState('');
  const [cancelContact, setCancelContact] = useState('');
  const [cancelOrderObj, setCancelOrderObj] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState(false);

  // Return Order State
  const [returnOrderId, setReturnOrderId] = useState('');
  const [returnContact, setReturnContact] = useState('');
  const [returnOrderObj, setReturnOrderObj] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('Damaged product');
  const [returnError, setReturnError] = useState('');
  const [returnSubmitted, setReturnSubmitted] = useState(false);

  // Cookie State
  const [cookies, setCookies] = useState({
    essential: true,
    analytics: true,
    functional: true,
    marketing: false
  });

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: 'Hello! 👋 Welcome to NeoMart 24/7 Customer Care. How can we assist you today?'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  const sectionTitles: Record<HelpSectionType, string> = {
    'place-order': 'How to Place an Order',
    'payment-options': 'Payment & Checkout Options',
    'track-order': 'Track Your Order',
    'cancel-order': 'Cancel an Order',
    'returns-refunds': 'Returns & Refund Policy',
    'cookie-preferences': 'Cookie & Privacy Preferences',
    'live-chat': 'NeoMart Live Support'
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    setTrackedOrder(null);

    const found = sampleOrders.find(
      (o) =>
        o.id.toLowerCase() === trackOrderId.trim().toLowerCase() &&
        (o.phone.includes(trackContact.trim()) || o.email.toLowerCase().includes(trackContact.trim().toLowerCase()))
    );

    if (found) {
      setTrackedOrder(found);
    } else {
      setTrackError('Order not found. Please verify Order ID (e.g. NM-48291) and your registered phone number or email.');
    }
  };

  const handleCancelSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCancelError('');
    setCancelOrderObj(null);
    setCancelSuccess(false);

    const found = sampleOrders.find(
      (o) =>
        o.id.toLowerCase() === cancelOrderId.trim().toLowerCase() &&
        (o.phone.includes(cancelContact.trim()) || o.email.toLowerCase().includes(cancelContact.trim().toLowerCase()))
    );

    if (found) {
      if (['Shipped', 'Out for Delivery', 'Delivered'].includes(found.status)) {
        setCancelError('This order has already been dispatched/shipped and cannot be cancelled automatically. You can initiate a return upon receipt.');
      } else {
        setCancelOrderObj(found);
      }
    } else {
      setCancelError('Could not find order. Please verify details.');
    }
  };

  const handleConfirmCancel = () => {
    if (cancelOrderObj) {
      cancelOrderObj.status = 'Cancelled';
      setCancelSuccess(true);
      showToast(`Order #${cancelOrderObj.id} cancelled successfully.`);
    }
  };

  const handleReturnSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setReturnError('');
    setReturnOrderObj(null);
    setReturnSubmitted(false);

    const found = sampleOrders.find(
      (o) =>
        o.id.toLowerCase() === returnOrderId.trim().toLowerCase() &&
        (o.phone.includes(returnContact.trim()) || o.email.toLowerCase().includes(returnContact.trim().toLowerCase()))
    );

    if (found) {
      setReturnOrderObj(found);
    } else {
      setReturnError('Could not find order. Please verify details.');
    }
  };

  const handleSendChat = (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text) return;

    const userMsg: ChatMessage = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput('');

    // Generate smart reply
    setTimeout(() => {
      let reply = 'Thank you for reaching out to NeoMart Support. An agent will review your query shortly.';
      const lower = text.toLowerCase();
      if (lower.includes('order') && lower.includes('place')) {
        reply = 'To place an order, browse products, add them to your cart, click checkout, select bank/card/delivery, and confirm!';
      } else if (lower.includes('payment') || lower.includes('pay') || lower.includes('card')) {
        reply = 'We support GTBank Transfer, Visa/Mastercard, and Cash on Delivery across major Nigerian cities.';
      } else if (lower.includes('track')) {
        reply = 'You can track any active order using the Track Order tool with your Order ID (e.g. NM-48291).';
      } else if (lower.includes('cancel')) {
        reply = 'Orders that are processing or packed can be cancelled from the Cancel Order tab.';
      } else if (lower.includes('return') || lower.includes('refund')) {
        reply = 'NeoMart provides a 7-day hassle-free return window for damaged, incorrect, or defective items.';
      } else if (lower.includes('agent') || lower.includes('human')) {
        reply = 'Connecting you to Senior Support Officer Emeka... (Estimated wait time: < 1 minute). Hotline: 08135642842.';
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 600);
  };

  const allStatuses = [
    'Order Placed',
    'Order Confirmed',
    'Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#1a1a1a] z-10">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#f68b1e] tracking-wider">
              NeoMart Customer Help Center
            </span>
            <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-gray-100">
              {sectionTitles[section]}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs Quick Switch */}
        <div className="flex gap-1.5 p-3 overflow-x-auto bg-gray-50 dark:bg-[#222222] border-b border-gray-200 dark:border-gray-800 no-scrollbar text-xs">
          <button
            onClick={() => onSelectSection('place-order')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap cursor-pointer transition-all ${
              section === 'place-order'
                ? 'bg-[#f68b1e] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Place Order
          </button>
          <button
            onClick={() => onSelectSection('payment-options')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap cursor-pointer transition-all ${
              section === 'payment-options'
                ? 'bg-[#f68b1e] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Payment
          </button>
          <button
            onClick={() => onSelectSection('track-order')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap cursor-pointer transition-all ${
              section === 'track-order'
                ? 'bg-[#f68b1e] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Track Order
          </button>
          <button
            onClick={() => onSelectSection('cancel-order')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap cursor-pointer transition-all ${
              section === 'cancel-order'
                ? 'bg-[#f68b1e] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Cancel Order
          </button>
          <button
            onClick={() => onSelectSection('returns-refunds')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap cursor-pointer transition-all ${
              section === 'returns-refunds'
                ? 'bg-[#f68b1e] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Returns
          </button>
          <button
            onClick={() => onSelectSection('live-chat')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap cursor-pointer transition-all ${
              section === 'live-chat'
                ? 'bg-[#f68b1e] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Live Chat
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 text-xs">
          {/* 1. PLACE ORDER */}
          {section === 'place-order' && (
            <div className="space-y-4">
              <div className="bg-[#fff3e0]/40 dark:bg-[#2a1a00]/30 p-4 rounded-xl border border-[#f68b1e]/20 space-y-2">
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                  Easy Steps to Shop on NeoMart
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-gray-700 dark:text-gray-300">
                  <li>Browse our catalog using the categories or search bar.</li>
                  <li>Click on any product to view full specifications, photos, and customer reviews.</li>
                  <li>Click <strong>Add to Cart</strong> to include it in your shopping bag.</li>
                  <li>Open the cart drawer and click <strong>Proceed to Checkout</strong>.</li>
                  <li>Choose your preferred payment method (Bank Transfer, Card, or Payment on Delivery).</li>
                  <li>Provide your delivery address and confirm the order.</li>
                </ol>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onStartShopping();
                }}
                className="w-full bg-[#f68b1e] hover:bg-[#e07a10] text-white font-extrabold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer shadow-md text-center"
              >
                Start Shopping Now →
              </button>
            </div>
          )}

          {/* 2. PAYMENT OPTIONS */}
          {section === 'payment-options' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#222222] space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-gray-100">
                  <CreditCard className="w-4 h-4 text-[#f68b1e]" />
                  <span>Available Nigerian Payment Channels</span>
                </div>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>
                    <strong>1. Direct Bank Transfer (GTBank):</strong> Fast transfers directly to NeoMart's verified business account.
                  </li>
                  <li>
                    <strong>2. Debit / Credit Card:</strong> Powered with end-to-end 256-bit encryption for Visa, Mastercard, and Verve.
                  </li>
                  <li>
                    <strong>3. Payment on Delivery (POD):</strong> Inspect your parcel and pay upon arrival via cash or mobile POS in Lagos, Abuja, Port Harcourt, and other major states.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* 3. TRACK ORDER */}
          {section === 'track-order' && (
            <div className="space-y-4">
              <form onSubmit={handleTrackSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Order ID
                    </label>
                    <input
                      type="text"
                      required
                      value={trackOrderId}
                      onChange={(e) => setTrackOrderId(e.target.value)}
                      placeholder="e.g. NM-48291"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number or Email
                    </label>
                    <input
                      type="text"
                      required
                      value={trackContact}
                      onChange={(e) => setTrackContact(e.target.value)}
                      placeholder="e.g. 08012345678"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#f68b1e] hover:bg-[#e07a10] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
                >
                  Track Order
                </button>
              </form>

              {trackError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{trackError}</span>
                </div>
              )}

              {trackedOrder && (
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#222222] space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                        Order #{trackedOrder.id}
                      </span>
                      <div className="text-[11px] text-gray-400">Placed on {trackedOrder.date}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#fff3e0] text-[#f68b1e] font-bold text-xs">
                      {trackedOrder.status}
                    </span>
                  </div>

                  {/* Status Timeline */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Tracking Progress
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {allStatuses.slice(0, 4).map((st, i) => {
                        const isDone =
                          allStatuses.indexOf(trackedOrder.status) >=
                          allStatuses.indexOf(st);
                        return (
                          <div
                            key={i}
                            className={`p-2 rounded-lg border text-center font-bold text-[11px] ${
                              isDone
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                                : 'bg-gray-100 dark:bg-gray-800 border-gray-200 text-gray-400'
                            }`}
                          >
                            {st}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
                    <div>
                      <strong>Delivery Address:</strong> {trackedOrder.address}
                    </div>
                    <div>
                      <strong>Estimated Arrival:</strong> {trackedOrder.eta}
                    </div>
                    <div>
                      <strong>Items:</strong> {trackedOrder.items.map((i) => i.name).join(', ')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. CANCEL ORDER */}
          {section === 'cancel-order' && (
            <div className="space-y-4">
              <form onSubmit={handleCancelSearch} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Order ID
                    </label>
                    <input
                      type="text"
                      required
                      value={cancelOrderId}
                      onChange={(e) => setCancelOrderId(e.target.value)}
                      placeholder="e.g. NM-48291"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Registered Phone / Email
                    </label>
                    <input
                      type="text"
                      required
                      value={cancelContact}
                      onChange={(e) => setCancelContact(e.target.value)}
                      placeholder="e.g. 08012345678"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#f68b1e] hover:bg-[#e07a10] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Find Order
                </button>
              </form>

              {cancelError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs">
                  {cancelError}
                </div>
              )}

              {cancelSuccess && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>
                    Your order has been cancelled. Any pre-authorized charges will be refunded within 24 hours.
                  </span>
                </div>
              )}

              {cancelOrderObj && !cancelSuccess && (
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#222222] space-y-3">
                  <div className="font-bold text-gray-900 dark:text-gray-100">
                    Order #{cancelOrderObj.id} ({cancelOrderObj.status})
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Reason for Cancellation
                    </label>
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 focus:outline-none"
                    >
                      <option>Ordered by mistake</option>
                      <option>Found a better price</option>
                      <option>Changed delivery location</option>
                      <option>Delivery timeline too long</option>
                    </select>
                  </div>

                  <button
                    onClick={handleConfirmCancel}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 5. RETURNS & REFUNDS */}
          {section === 'returns-refunds' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#fff3e0]/40 dark:bg-[#2a1a00]/30 border border-[#f68b1e]/20 space-y-2">
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                  NeoMart 7-Day Free Return Policy
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Items can be returned within 7 calendar days after delivery if they are damaged, defective, or incorrect. Ensure original packaging and accessories remain intact.
                </p>
              </div>

              <form onSubmit={handleReturnSearch} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Order ID
                    </label>
                    <input
                      type="text"
                      required
                      value={returnOrderId}
                      onChange={(e) => setReturnOrderId(e.target.value)}
                      placeholder="e.g. NM-48291"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-800 dark:text-gray-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number or Email
                    </label>
                    <input
                      type="text"
                      required
                      value={returnContact}
                      onChange={(e) => setReturnContact(e.target.value)}
                      placeholder="e.g. 08012345678"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-800 dark:text-gray-200 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#f68b1e] hover:bg-[#e07a10] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Initiate Return Request
                </button>
              </form>

              {returnError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                  {returnError}
                </div>
              )}

              {returnSubmitted && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>
                    Your return request was logged. A customer care representative will contact you within 24 hours to schedule package pick-up.
                  </span>
                </div>
              )}

              {returnOrderObj && !returnSubmitted && (
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#222222] space-y-3">
                  <div className="font-bold text-gray-900 dark:text-gray-100">
                    Select Reason for Return
                  </div>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 focus:outline-none"
                  >
                    <option>Damaged or broken product</option>
                    <option>Wrong item sent</option>
                    <option>Missing accessories / parts</option>
                    <option>Item not as described</option>
                  </select>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Upload Photo Evidence (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#f68b1e] file:text-white hover:file:bg-[#e07a10] cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setReturnSubmitted(true);
                      showToast('Return request submitted.');
                    }}
                    className="w-full bg-[#f68b1e] hover:bg-[#e07a10] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Submit Return
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 6. COOKIE PREFERENCES */}
          {section === 'cookie-preferences' && (
            <div className="space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-gray-800">
                  <div>
                    <div className="font-bold text-gray-900 dark:text-gray-100">Essential Cookies</div>
                    <div className="text-[11px] text-gray-400">Required for cart and checkout security</div>
                  </div>
                  <span className="text-emerald-600 font-bold">Always On</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-gray-800">
                  <div>
                    <div className="font-bold text-gray-900 dark:text-gray-100">Analytics Cookies</div>
                    <div className="text-[11px] text-gray-400">Help us improve search and site performance</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={cookies.analytics}
                    onChange={(e) => setCookies({ ...cookies, analytics: e.target.checked })}
                    className="w-4 h-4 accent-[#f68b1e] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-gray-800">
                  <div>
                    <div className="font-bold text-gray-900 dark:text-gray-100">Functional Cookies</div>
                    <div className="text-[11px] text-gray-400">Remember your theme and recent searches</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={cookies.functional}
                    onChange={(e) => setCookies({ ...cookies, functional: e.target.checked })}
                    className="w-4 h-4 accent-[#f68b1e] cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  showToast('Cookie preferences saved.');
                  onClose();
                }}
                className="w-full bg-[#f68b1e] hover:bg-[#e07a10] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          )}

          {/* 7. LIVE CHAT */}
          {section === 'live-chat' && (
            <div className="space-y-3">
              {/* Chat window */}
              <div className="h-64 overflow-y-auto bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-gray-800 rounded-xl p-3 space-y-2.5">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-[#f68b1e] text-white rounded-br-none'
                          : 'bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none shadow-2xs'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Reply Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSendChat('How do I place an order?')}
                  className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] hover:text-[#f68b1e] text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap cursor-pointer transition-colors"
                >
                  Place an order
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChat('What payment options do you accept?')}
                  className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] hover:text-[#f68b1e] text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap cursor-pointer transition-colors"
                >
                  Payment options
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChat('How can I track my order?')}
                  className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] hover:text-[#f68b1e] text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap cursor-pointer transition-colors"
                >
                  Track my order
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChat('I want to speak with an agent')}
                  className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] hover:text-[#f68b1e] text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap cursor-pointer transition-colors"
                >
                  Speak to agent
                </button>
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e]"
                />
                <button
                  type="submit"
                  className="bg-[#f68b1e] hover:bg-[#e07a10] text-white px-4 py-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
