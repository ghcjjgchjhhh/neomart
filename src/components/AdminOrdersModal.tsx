import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Building2,
  Package,
  Phone,
  MapPin,
  Search,
  Check
} from 'lucide-react';
import { FulfillmentStatus, Order } from '../types';

interface AdminOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onConfirmOrderPayment: (orderId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: FulfillmentStatus) => void;
  onOpenStockManagement: () => void;
  onOpenLiveGps: (orderId: string) => void;
  onOpenSalesReport: () => void;
  onOpenCustomerManagement: () => void;
  onEnableNotifications: () => void;
}

export const AdminOrdersModal: React.FC<AdminOrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  onConfirmOrderPayment,
  onUpdateOrderStatus,
  onOpenStockManagement,
  onOpenLiveGps,
  onOpenSalesReport,
  onOpenCustomerManagement,
  onEnableNotifications,
}) => {
  const [search, setSearch] = useState('');
  const [orderToConfirm, setOrderToConfirm] = useState<Order | null>(null);

  if (!isOpen) return null;

  const handleConfirm = (id: string) => {
    const order = orders.find((item) => item.id === id);
    if (order) setOrderToConfirm(order);
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.id.toLowerCase().includes(search.toLowerCase()) ||
      (ord.phone && ord.phone.includes(search)) ||
      (ord.address && ord.address.toLowerCase().includes(search.toLowerCase()));

    return matchesSearch;
  });

  const pendingCount = orders.filter(
    (o) => o.paymentConfirmed !== true
  ).length;
  const processingCount = orders.filter((o) => o.status === 'Processing').length;
  const openOrderValue = orders.reduce((total, order) => total + order.total, 0);
  const formattedOrderValue = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(openOrderValue);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {orderToConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-[#18181b]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Confirm this order?</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Review the details before confirming payment.</p>
              </div>
              <button
                type="button"
                onClick={() => setOrderToConfirm(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close confirmation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 rounded-xl bg-gray-50 p-3 text-xs dark:bg-[#202024]">
              <div className="flex justify-between gap-3"><span className="text-gray-500">Order</span><strong>#{orderToConfirm.id}</strong></div>
              <div className="flex justify-between gap-3"><span className="text-gray-500">Customer</span><strong className="truncate">{orderToConfirm.phone}</strong></div>
              <div className="flex justify-between gap-3"><span className="text-gray-500">Total</span><strong className="text-[#f68b1e]">₦{orderToConfirm.total.toLocaleString()}</strong></div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setOrderToConfirm(null)}
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-xs font-bold text-gray-700 dark:border-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirmOrderPayment(orderToConfirm.id);
                  setOrderToConfirm(null);
                }}
                className="flex-1 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Confirm order
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-[#222222] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#f68b1e] text-white flex items-center justify-center font-bold text-sm shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  Vendor &amp; Order Manager
                </h3>
                {pendingCount > 0 && (
                  <span className="bg-[#f68b1e] text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                    {pendingCount} Pending Order{pendingCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-300">
                <span>Account</span>
                <strong className="text-white">8135648242</strong>
                <span className="text-gray-500">•</span>
                <span>OPay</span>
                <strong className="text-[#f68b1e]">IFEANYICHUKWU FRANKLIN ANOMA</strong>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#18181b]">
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-3">
            <div className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Open orders</div>
            <div className="mt-1 text-lg font-black text-gray-900 dark:text-white">{orders.length}</div>
          </div>
          <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20 p-3">
            <div className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400">Processing</div>
            <div className="mt-1 text-lg font-black text-gray-900 dark:text-white">{processingCount}</div>
          </div>
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 p-3 min-w-0">
            <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Order value</div>
            <div className="mt-1 text-sm font-black text-gray-900 dark:text-white truncate" title={openOrderValue.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}>
              {formattedOrderValue}
            </div>
          </div>
        </div>

        <div className="mx-4 mt-4">
          <button
            type="button"
            onClick={onEnableNotifications}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500 px-4 py-2.5 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
          >
            Enable phone alerts for new orders
          </button>
          <button
            onClick={onOpenSalesReport}
            className="w-full px-4 py-2.5 rounded-xl border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-bold text-xs transition-colors"
          >
            Open Sales Report
          </button>
          <button
            onClick={onOpenCustomerManagement}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#f68b1e] px-4 py-2.5 text-xs font-bold text-[#f68b1e] transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/20"
          >
            Manage Customers
          </button>
        </div>

        {/* Orders List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3.5 text-xs">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-40 text-gray-400" />
              <div className="font-bold">No orders found</div>
              <p className="text-[11px]">When customers place orders, they appear here.</p>
            </div>
          ) : (
            filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-[#202024] border border-gray-200 dark:border-gray-800 space-y-3 transition-all hover:border-gray-300"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-gray-900 dark:text-white">
                      #{ord.id}
                    </span>
                    <span className="text-[11px] text-gray-400">{ord.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-[#f68b1e]">
                      ₦{ord.total.toLocaleString()}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        ord.paymentConfirmed === true
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800 animate-pulse'
                      }`}
                    >
                      {ord.paymentConfirmed === true ? '✓ Order Confirmed' : '⌛ Order Pending'}
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white dark:bg-[#18181b] p-3 rounded-xl border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Phone className="w-3.5 h-3.5 text-[#f68b1e]" />
                    <span>Customer Phone: <strong>{ord.phone || '08135642842'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <MapPin className="w-3.5 h-3.5 text-[#f68b1e]" />
                    <span className="truncate">Destination: <strong>{ord.address}</strong></span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <div className="text-[10px] text-gray-400">
                    {ord.status === 'Processing'
                      ? '👉 Review this order, then click confirm:'
                      : ord.paymentConfirmed === true
                      ? '✅ Order confirmed. Ready for courier delivery.'
                      : '⏳ Order is waiting for confirmation.'}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenLiveGps(ord.id)}
                      className="px-3 py-2 rounded-xl border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      title="Open live GPS for this order"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Live GPS</span>
                    </button>
                    {ord.paymentConfirmed !== true && (
                      <button
                        onClick={() => handleConfirm(ord.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:shadow-lg"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Order</span>
                      </button>
                    )}
                    <select
                      value={ord.status === 'Order Confirmed' ? 'Processing' : ord.status}
                      onChange={(event) => onUpdateOrderStatus(ord.id, event.target.value as FulfillmentStatus)}
                      className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-800 dark:text-gray-200 font-bold text-xs cursor-pointer"
                      aria-label={`Update status for order ${ord.id}`}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-[#18181b]">
          <button
            onClick={onOpenStockManagement}
            className="w-full px-4 py-2.5 rounded-xl border border-[#f68b1e] text-[#f68b1e] hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] font-bold text-xs transition-colors"
          >
            Open Stock Management
          </button>
        </div>
      </div>
    </div>
  );
};