import React, { useState } from 'react';
import { CheckCircle2, ClipboardCheck, X } from 'lucide-react';
import { Order } from '../types';

interface ConfirmOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onConfirmOrder: (orderId: string) => void;
}

export const ConfirmOrdersModal: React.FC<ConfirmOrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  onConfirmOrder,
}) => {
  const [orderToConfirm, setOrderToConfirm] = useState<Order | null>(null);
  const [confirmedOrderIds, setConfirmedOrderIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const pendingOrders = orders.filter((order) => !confirmedOrderIds.includes(order.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#18181b]">
        <div className="flex items-center justify-between border-b border-gray-200 bg-[#222222] px-5 py-4 text-white dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-extrabold">Confirm Orders</h2>
              <p className="text-xs text-gray-300">Review and approve customer orders</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white" aria-label="Close confirm orders room">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          {pendingOrders.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
              <p className="mt-3 font-bold text-gray-900 dark:text-white">All orders are confirmed</p>
              <p className="mt-1 text-xs text-gray-500">New pending orders will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-gray-900 dark:text-white">Order #{order.id}</p>
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{order.phone} · {order.date}</p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{order.items.length} item{order.items.length === 1 ? '' : 's'} · {order.address}</p>
                    </div>
                    <p className="font-black text-[#f68b1e]">₦{order.total.toLocaleString()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOrderToConfirm(order)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Review and confirm
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {orderToConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-[#18181b]">
            <h3 className="font-extrabold text-gray-900 dark:text-white">Confirm order #{orderToConfirm.id}?</h3>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">This will mark the customer's payment as confirmed.</p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setOrderToConfirm(null)} className="flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-xs font-bold dark:border-gray-700 dark:text-gray-300">Cancel</button>
              <button type="button" onClick={() => { onConfirmOrder(orderToConfirm.id); setConfirmedOrderIds((previous) => [...previous, orderToConfirm.id]); setOrderToConfirm(null); }} className="flex-1 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-700">Confirm order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
