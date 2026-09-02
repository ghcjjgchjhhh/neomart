import React from 'react';
import { Calendar, Clock, Package, X } from 'lucide-react';
import { Order } from '../types';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onTrackOrder: (orderId: string) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onTrackOrder,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-[#222222] text-white">
          <div>
            <h3 className="font-extrabold text-base">Order History</h3>
            <p className="text-xs text-gray-300">Your NeoMart orders</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-300" aria-label="Close order history">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto space-y-3">
          {orders.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="font-bold">No orders yet</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-black text-gray-900 dark:text-white">#{order.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${order.paymentConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {order.paymentConfirmed ? 'Confirmed' : order.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{order.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{order.items.length} item{order.items.length === 1 ? '' : 's'}</span>
                  <strong className="text-[#f68b1e]">₦{order.total.toLocaleString('en-NG')}</strong>
                </div>
                <button onClick={() => onTrackOrder(order.id)} className="w-full py-2 rounded-lg bg-[#f68b1e] text-white text-xs font-bold hover:bg-[#e07a10]">
                  Track order
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
