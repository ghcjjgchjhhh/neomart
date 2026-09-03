import React from 'react';
import { Bell, Check, X } from 'lucide-react';
import { Order } from '../types';

interface AdminOrderAlertProps {
  order: Order | null;
  onOpenOrders: () => void;
  onDismiss: () => void;
}

export const AdminOrderAlert: React.FC<AdminOrderAlertProps> = ({
  order,
  onOpenOrders,
  onDismiss,
}) => {
  if (!order) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 admin-order-alert">
      <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-white p-4 shadow-2xl dark:border-orange-900 dark:bg-[#202024]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f68b1e] text-white">
          <Bell className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-black text-gray-900 dark:text-white">New order received</p>
          <p className="mt-0.5 truncate text-xs text-gray-600 dark:text-gray-300">
            #{order.id} · ₦{order.total.toLocaleString()}
          </p>
          <button
            type="button"
            onClick={onOpenOrders}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#f68b1e] px-3 py-2 text-xs font-bold text-white hover:bg-[#e07a10]"
          >
            <Check className="h-3.5 w-3.5" />
            Open order
          </button>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss new order notification"
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
