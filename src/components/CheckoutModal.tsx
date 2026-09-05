import React, { useEffect, useState } from 'react';
import {
  X,
  CreditCard,
  Truck,
  ChevronDown,
  Search,
  ShieldCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { CartItem, PaymentMethodType, DeliveryDetails, SavedAddress } from '../types';
import { nigerianStates, stateCities } from '../data/locations';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  initialDelivery?: DeliveryDetails | null;
  savedAddresses?: SavedAddress[];
  onCompleteOrder: (method: PaymentMethodType, deliveryDetails?: DeliveryDetails, discountAmount?: number) => void;
  showToast: (msg: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  initialDelivery,
  savedAddresses = [],
  onCompleteOrder,
  showToast
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('delivery');
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('new');

  // Delivery state
  const [delivery, setDelivery] = useState<DeliveryDetails>({
    fullName: '',
    state: '',
    city: '',
    address: '',
    phone: '',
    country: 'Nigeria',
    notes: ''
  });

  useEffect(() => {
    if (!isOpen) return;
    const preferred = savedAddresses.find((address) => address.isDefault) || savedAddresses[0];
    if (preferred) {
      setDelivery(preferred);
      setSelectedAddressId(preferred.id);
    } else if (initialDelivery) {
      setDelivery(initialDelivery);
      setSelectedAddressId('legacy');
    }
  }, [initialDelivery, isOpen, savedAddresses]);

  // State / City Picker UI state
  const [stateSearch, setStateSearch] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const formatPrice = (amount: number) => {
    return '₦' + amount.toLocaleString('en-NG');
  };

  const filteredStates = nigerianStates.filter((s) =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const availableCities = delivery.state ? stateCities[delivery.state] || [delivery.state] : [];
  const filteredCities = availableCities.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast('Your cart is empty');
      return;
    }

    if (!delivery.state) {
      showToast('Please select your delivery state');
      return;
    }
    if (!delivery.fullName?.trim()) {
      showToast('Please enter the recipient full name');
      return;
    }
    if (!delivery.city) {
      showToast('Please select your City / LGA');
      return;
    }
    if (!delivery.address.trim()) {
      showToast('Please enter your delivery street address');
      return;
    }
    if (!delivery.phone.trim() || delivery.phone.replace(/\D/g, '').length < 10) {
      showToast('Please provide a valid Nigerian contact phone number');
      return;
    }
    if (couponCode.trim() && !couponApplied) {
      showToast('Apply a valid coupon before confirming the order');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onCompleteOrder(paymentMethod, paymentMethod === 'delivery' ? delivery : undefined, discount);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#1a1a1a] z-10">
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-gray-100">
              Checkout &amp; Delivery
            </h3>
            <p className="text-xs text-gray-400">Complete your order with secure delivery in Nigeria</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-5 text-xs">
          {/* Delivery Details */}
          <div className="border border-gray-200 dark:border-gray-700/80 rounded-xl p-4 bg-gray-50/50 dark:bg-[#202024]/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#f68b1e]" />
                <span>1. Delivery Destination</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                Doorstep Express
              </span>
            </div>

            {savedAddresses.length > 0 && (
              <div className="space-y-2">
                <label className="block font-semibold text-gray-600 dark:text-gray-400 text-[11px]">Saved Delivery Information</label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {savedAddresses.map((savedAddress) => (
                    <button key={savedAddress.id} type="button" onClick={() => { setDelivery(savedAddress); setSelectedAddressId(savedAddress.id); }} className={`rounded-lg border px-3 py-2 text-left text-xs ${selectedAddressId === savedAddress.id ? 'border-[#f68b1e] bg-[#fff3e0] dark:bg-[#2a1a00]' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-[#18181b]'}`}>
                      <span className="block font-bold text-gray-800 dark:text-gray-200">{savedAddress.label}{savedAddress.isDefault ? ' (Default)' : ''}</span>
                      <span className="mt-1 block truncate text-gray-500 dark:text-gray-400">{savedAddress.address}, {savedAddress.city}</span>
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => { setSelectedAddressId('new'); setDelivery({ fullName: '', state: '', city: '', address: '', phone: '', country: 'Nigeria', notes: '' }); }} className="text-[11px] font-bold text-[#f68b1e] hover:underline">Use a different address</button>
              </div>
            )}

            <div>
              <label className="block font-semibold text-gray-600 dark:text-gray-400 mb-1 text-[11px]">Recipient Full Name</label>
              <input type="text" required value={delivery.fullName || ''} onChange={(e) => { setSelectedAddressId('new'); setDelivery({ ...delivery, fullName: e.target.value }); }} placeholder="Enter recipient name" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e]" />
            </div>

            {/* State and City Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* State Picker */}
              <div className="relative">
                <label className="block font-semibold text-gray-600 dark:text-gray-400 mb-1 text-[11px]">
                  State
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowStateDropdown(!showStateDropdown);
                    setShowCityDropdown(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-800 dark:text-gray-200 flex justify-between items-center text-left cursor-pointer"
                >
                  <span className="truncate">{delivery.state || 'Select State'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </button>

                {showStateDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 max-h-44 overflow-y-auto">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        value={stateSearch}
                        onChange={(e) => setStateSearch(e.target.value)}
                        placeholder="Search state..."
                        className="w-full text-xs bg-transparent focus:outline-none text-gray-800 dark:text-gray-200"
                        autoFocus
                      />
                    </div>
                    {filteredStates.map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setDelivery({ ...delivery, state: st, city: '' });
                          setShowStateDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer text-xs"
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* City Picker */}
              <div className="relative">
                <label className="block font-semibold text-gray-600 dark:text-gray-400 mb-1 text-[11px]">
                  City / LGA
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowCityDropdown(!showCityDropdown);
                    setShowStateDropdown(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-800 dark:text-gray-200 flex justify-between items-center text-left cursor-pointer"
                >
                  <span className="truncate">{delivery.city || 'Select City / LGA'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </button>

                {showCityDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 max-h-44 overflow-y-auto">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        placeholder="Search city..."
                        className="w-full text-xs bg-transparent focus:outline-none text-gray-800 dark:text-gray-200"
                        autoFocus
                      />
                    </div>
                    {filteredCities.map((ct) => (
                      <button
                        key={ct}
                        type="button"
                        onClick={() => {
                          setDelivery({ ...delivery, city: ct });
                          setShowCityDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer text-xs"
                      >
                        {ct}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label className="block font-semibold text-gray-600 dark:text-gray-400 mb-1 text-[11px]">
                Street Address &amp; House Number
              </label>
              <input
                type="text"
                required
                value={delivery.address}
                onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
                placeholder="Street address, house/flat number, landmarks"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block font-semibold text-gray-600 dark:text-gray-400 mb-1 text-[11px]">
                Recipient Contact Phone
              </label>
              <input
                type="tel"
                required
                value={delivery.phone}
                onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })}
                placeholder="Enter contact phone number"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-600 dark:text-gray-400 mb-1 text-[11px]">Country</label>
              <input type="text" value={delivery.country || 'Nigeria'} onChange={(e) => setDelivery({ ...delivery, country: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e]" />
            </div>

            <div>
              <label className="block font-semibold text-gray-600 dark:text-gray-400 mb-1 text-[11px]">Delivery Instructions (Optional)</label>
              <textarea value={delivery.notes || ''} onChange={(e) => setDelivery({ ...delivery, notes: e.target.value })} placeholder="Add instructions for delivery" rows={2} className="w-full resize-none px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e]" />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2.5">
            <label className="font-bold text-gray-800 dark:text-gray-200 text-xs flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#f68b1e]" />
              <span>2. Payment Option</span>
            </label>

            <div className="space-y-2">
              {/* Pay on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('delivery')}
                className={`w-full p-3 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                  paymentMethod === 'delivery'
                    ? 'border-[#f68b1e] bg-[#fff3e0] dark:bg-[#2a1a00] shadow-xs'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#202024] hover:border-gray-300'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100">
                    <Truck className="w-4 h-4 text-[#f68b1e]" />
                    <span>Pay on Delivery (Cash or POS)</span>
                    <span className="text-[10px] bg-[#f68b1e]/15 text-[#f68b1e] font-bold px-1.5 py-0.2 rounded">
                      POPULAR
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Pay securely with cash or debit card POS machine upon doorstep arrival
                  </p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 ${
                    paymentMethod === 'delivery' ? 'border-[#f68b1e] bg-[#f68b1e]' : 'border-gray-400'
                  }`}
                >
                  {paymentMethod === 'delivery' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>

            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-2">
            <label className="font-bold text-gray-700 dark:text-gray-300">Coupon code</label>
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(event) => {
                  setCouponCode(event.target.value.toUpperCase());
                  setCouponApplied(false);
                }}
                placeholder="Enter coupon code"
                className="min-w-0 flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-800 dark:text-gray-200"
              />
              <button
                type="button"
                onClick={() => {
                  if (couponCode.trim() === 'NEO10') {
                    setCouponApplied(true);
                    showToast('Coupon applied: 10% off');
                  } else {
                    setCouponApplied(false);
                    showToast('Invalid coupon code');
                  }
                }}
                className="px-3 py-2 rounded-lg bg-gray-900 text-white font-bold"
              >
                Apply
              </button>
            </div>
            {couponApplied && <div className="text-emerald-600 font-bold">NEO10 applied: 10% off</div>}
          </div>

          {/* Summary Box */}
          <div className="bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
              <strong className="text-gray-800 dark:text-gray-200 font-bold">{formatPrice(total)}</strong>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Coupon discount</span>
                <strong>-{formatPrice(discount)}</strong>
              </div>
            )}
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Express Delivery ({delivery.state || 'Lagos'})</span>
              <strong className="text-emerald-600 font-bold">Free</strong>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-sm sm:text-base font-extrabold text-gray-900 dark:text-gray-100">
              <span>Total Amount</span>
              <span className="text-[#f68b1e]">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-[#f68b1e] hover:bg-[#e07a10] disabled:opacity-75 text-white font-extrabold py-3.5 px-6 rounded-xl text-sm sm:text-base transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span>Processing Order...</span>
              ) : (
                <span>Confirm Order (Pay {formatPrice(total)} on Delivery) →</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
