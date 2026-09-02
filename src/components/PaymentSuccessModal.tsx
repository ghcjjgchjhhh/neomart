import React from 'react';
import { Check, Truck, Calendar, X } from 'lucide-react';
import { PaymentMethodType } from '../types';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  method: PaymentMethodType;
  orderId?: string;
  onOpenTrackLiveOrder?: (orderId?: string) => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  method,
  orderId,
  onOpenTrackLiveOrder
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Big Success Check Circle */}
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-500 flex items-center justify-center shadow-lg">
          <Check className="w-10 h-10" />
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
            {method === 'delivery' ? 'Order Submitted!' : 'Payment Submitted!'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {method === 'delivery'
              ? 'Thank you for shopping with NeoMart. Your order is awaiting confirmation.'
              : 'Your payment was submitted and is awaiting admin verification.'}
          </p>
        </div>

        {/* Info Cards */}
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#fff3e0]/50 dark:bg-[#2a1a00]/40 border border-[#f68b1e]/20 text-xs">
            <div className="w-8 h-8 rounded-lg bg-[#f68b1e]/20 text-[#f68b1e] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-gray-800 dark:text-gray-200">
                We've received your order
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                Your tracking ID will arrive via SMS &amp; Email.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-gray-800 dark:text-gray-200">
                Estimated Delivery
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                Delivered in 2 – 4 business days.
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {orderId && onOpenTrackLiveOrder && (
            <button
              onClick={() => onOpenTrackLiveOrder(orderId)}
              className="w-full border border-[#f68b1e] text-[#f68b1e] bg-[#fff3e0] hover:bg-[#ffe4b8] font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
            >
              Track my order →
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full bg-[#f68b1e] hover:bg-[#e07a10] text-white font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-md"
          >
            Continue Shopping →
          </button>
        </div>
      </div>
    </div>
  );
};
