import React, { useState } from 'react';
import {
  X,
  Landmark,
  CreditCard,
  Truck,
  CheckCircle2,
  Building2,
  ChevronDown,
  Search
} from 'lucide-react';
import { CartItem, PaymentMethodType, DeliveryDetails, CardDetails } from '../types';
import { nigerianStates, stateCities } from '../data/locations';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onCompleteOrder: (method: PaymentMethodType, deliveryDetails?: DeliveryDetails) => void;
  showToast: (msg: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  onCompleteOrder,
  showToast
}) => {
  if (!isOpen) return null;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('bank');
  const [isProcessing, setIsProcessing] = useState(false);

  // Card state
  const [card, setCard] = useState<CardDetails>({
    holderName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  // Delivery state
  const [delivery, setDelivery] = useState<DeliveryDetails>({
    state: '',
    city: '',
    address: '',
    phone: '',
    notes: ''
  });

  // State / City Picker UI state
  const [stateSearch, setStateSearch] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal;

  const formatPrice = (amount: number) => {
    return '₦' + amount.toLocaleString('en-NG');
  };

  // Card formatting
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    setCard({ ...card, cardNumber: formatted });
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    setCard({ ...card, expiry: raw });
  };

  const filteredStates = nigerianStates.filter((s) =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const availableCities = delivery.state ? stateCities[delivery.state] || [delivery.state] : [];
  const filteredCities = availableCities.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const validateAndSubmit = () => {
    if (cart.length === 0) {
      showToast('Your cart is empty');
      return;
    }

    if (paymentMethod === 'card') {
      const cleanNum = card.cardNumber.replace(/\s+/g, '');
      if (!card.holderName.trim()) {
        showToast('Please enter the cardholder name');
        return;
      }
      if (cleanNum.length !== 16) {
        showToast('Card number must be 16 digits');
        return;
      }
      if (card.expiry.length !== 4) {
        showToast('Expiry must be MMYY format (4 digits)');
        return;
      }
      if (card.cvv.length !== 3) {
        showToast('CVV must be 3 digits');
        return;
      }
    }

    if (paymentMethod === 'delivery') {
      if (!delivery.state) {
        showToast('Please select your state');
        return;
      }
      if (!delivery.city) {
        showToast('Please select your City / LGA');
        return;
      }
      if (!delivery.address.trim()) {
        showToast('Please enter your full street delivery address');
        return;
      }
      if (!delivery.phone.trim() || delivery.phone.replace(/\D/g, '').length < 10) {
        showToast('Please provide a valid contact phone number');
        return;
      }
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onCompleteOrder(paymentMethod, paymentMethod === 'delivery' ? delivery : undefined);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#1a1a1a] z-10">
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-gray-100">
              Your Bag &amp; Checkout
            </h3>
            <p className="text-xs text-gray-400">Complete your order securely</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-5 text-xs">
          {/* Summary Box */}
          <div className="bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
              <strong className="text-gray-800 dark:text-gray-200 font-bold">{formatPrice(subtotal)}</strong>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Shipping / Delivery</span>
              <strong className="text-emerald-600 font-bold">Free</strong>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-sm sm:text-base font-extrabold text-gray-900 dark:text-gray-100">
              <span>Total Amount</span>
              <span className="text-[#f68b1e]">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="block font-bold text-gray-800 dark:text-gray-200">
              Select Payment Method
            </label>
            <div className="grid grid-cols-1 gap-2">
              {/* Bank Transfer */}
              <label
                onClick={() => setPaymentMethod('bank')}
                className={`hidden flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  paymentMethod === 'bank'
                    ? 'border-[#f68b1e] bg-[#fff3e0]/40 dark:bg-[#2a1a00]/40 ring-1 ring-[#f68b1e]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bank'}
                  onChange={() => setPaymentMethod('bank')}
                  className="accent-[#f68b1e]"
                />
                <Landmark className="w-4 h-4 text-[#f68b1e]" />
                <span className="font-bold text-gray-800 dark:text-gray-200">Bank Transfer</span>
              </label>

              {/* Card Payment */}
              <label
                onClick={() => setPaymentMethod('card')}
                className={`hidden flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-[#f68b1e] bg-[#fff3e0]/40 dark:bg-[#2a1a00]/40 ring-1 ring-[#f68b1e]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="accent-[#f68b1e]"
                />
                <CreditCard className="w-4 h-4 text-[#f68b1e]" />
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  Card Payment (Visa / Mastercard / Verve)
                </span>
              </label>

              {/* Delivery Payment */}
              <label
                onClick={() => setPaymentMethod('delivery')}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  paymentMethod === 'delivery'
                    ? 'border-[#f68b1e] bg-[#fff3e0]/40 dark:bg-[#2a1a00]/40 ring-1 ring-[#f68b1e]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'delivery'}
                  onChange={() => setPaymentMethod('delivery')}
                  className="accent-[#f68b1e]"
                />
                <Truck className="w-4 h-4 text-[#f68b1e]" />
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  Payment on Delivery (Cash / POS)
                </span>
              </label>
            </div>
          </div>

          {/* Conditional Form 1: Bank Transfer Details */}
          {paymentMethod === 'bank' && (
            <div className="bg-[#fff3e0]/50 dark:bg-[#2a1a00]/40 border border-[#f68b1e]/30 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f68b1e]/20 text-[#f68b1e] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                    Official GTBank Account
                  </h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                    Make a direct transfer of the exact order amount to our verified company account.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-3 border border-gray-200 dark:border-gray-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Bank Name</span>
                  <strong className="font-bold text-gray-800 dark:text-gray-200">Guaranty Trust Bank (GTBank)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Account Name</span>
                  <strong className="font-bold text-gray-800 dark:text-gray-200">NeoMart Global Ltd</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Account Number</span>
                  <strong className="font-bold text-[#f68b1e] text-sm tracking-wider">0123456789</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Amount to Transfer</span>
                  <strong className="font-extrabold text-[#f68b1e] text-sm">{formatPrice(total)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Conditional Form 2: Card Payment */}
          {paymentMethod === 'card' && (
            <div className="space-y-4">
              {/* Virtual Card Preview */}
              <div className="relative bg-gradient-to-br from-[#1a1a2e] via-[#1f3c88] to-[#0f172a] text-white p-5 rounded-2xl shadow-xl overflow-hidden min-h-[170px] flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-400 to-amber-200 shadow-inner"></div>
                  <span className="font-black italic text-base tracking-widest opacity-80">NEO PAY</span>
                </div>
                <div className="font-mono text-base sm:text-lg tracking-widest my-2">
                  {card.cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div className="flex justify-between items-end text-[10px]">
                  <div>
                    <div className="opacity-60 uppercase tracking-wider">Card Holder</div>
                    <div className="font-bold text-xs uppercase tracking-wide">
                      {card.holderName || 'YOUR NAME'}
                    </div>
                  </div>
                  <div>
                    <div className="opacity-60 uppercase tracking-wider">Expires</div>
                    <div className="font-bold text-xs">
                      {card.expiry
                        ? `${card.expiry.slice(0, 2)}/${card.expiry.slice(2, 4)}`
                        : 'MM/YY'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Inputs */}
              <div className="space-y-2.5">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={card.holderName}
                    onChange={(e) =>
                      setCard({
                        ...card,
                        holderName: e.target.value.replace(/[^A-Za-z\s.'-]/g, '')
                      })
                    }
                    placeholder="e.g. Chukwuemeka Adeleke"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    maxLength={19}
                    value={card.cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e] font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Expiry (MMYY)
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={card.expiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      placeholder="0828"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      maxLength={3}
                      value={card.cvv}
                      onChange={(e) =>
                        setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })
                      }
                      placeholder="•••"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conditional Form 3: Payment on Delivery */}
          {paymentMethod === 'delivery' && (
            <div className="space-y-3">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed bg-[#fff3e0]/40 dark:bg-[#2a1a00]/30 p-3 rounded-lg border border-[#f68b1e]/20">
                Pay for your order in cash or with card POS upon delivery. Please ensure your Nigerian delivery address and phone number are accurate so our dispatch team can contact you.
              </p>

              {/* State Picker */}
              <div className="relative">
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  State
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowStateDropdown(!showStateDropdown);
                    setShowCityDropdown(false);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-800 dark:text-gray-200 flex justify-between items-center text-left cursor-pointer focus:border-[#f68b1e]"
                >
                  <span>{delivery.state || 'Click to select your state'}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showStateDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#222222] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto">
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
                        type="button"
                        onClick={() => {
                          setDelivery({ ...delivery, state: st, city: '' });
                          setShowStateDropdown(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer"
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* City / LGA Picker */}
              {delivery.state && (
                <div className="relative">
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Select Your City / LGA
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCityDropdown(!showCityDropdown);
                      setShowStateDropdown(false);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-800 dark:text-gray-200 flex justify-between items-center text-left cursor-pointer focus:border-[#f68b1e]"
                  >
                    <span>{delivery.city || 'Select City / LGA'}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {showCityDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#222222] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto">
                      <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                          placeholder="Search city / LGA..."
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
                          className="w-full text-left px-3.5 py-2 hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer"
                        >
                          {ct}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Delivery Address */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Delivery Address (Street, House No, Landmark)
                </label>
                <textarea
                  rows={2}
                  value={delivery.address}
                  onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
                  placeholder="e.g. 15 Admiralty Way, Opposite Ebeano Supermarket, Lekki Phase 1"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e] resize-none"
                ></textarea>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Recipient Phone Number
                </label>
                <input
                  type="tel"
                  value={delivery.phone}
                  onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })}
                  placeholder="e.g. 08012345678"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer & Trigger */}
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#222222] rounded-b-2xl">
          <button
            disabled={isProcessing}
            onClick={validateAndSubmit}
            className="w-full bg-[#f68b1e] hover:bg-[#e07a10] disabled:opacity-75 text-white font-extrabold py-3.5 px-6 rounded-xl text-sm sm:text-base transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span>Processing Order...</span>
            ) : paymentMethod === 'bank' ? (
              <span>I have transferred the money →</span>
            ) : paymentMethod === 'delivery' ? (
              <span>Confirm Order on Delivery →</span>
            ) : (
              <span>Pay {formatPrice(total)} Now →</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
