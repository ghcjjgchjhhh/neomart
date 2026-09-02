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
  reportOrders: Order[];
  onConfirmOrderPayment: (orderId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: FulfillmentStatus) => void;
  onOpenStockManagement: () => void;
}

export const AdminOrdersModal: React.FC<AdminOrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  reportOrders,
  onConfirmOrderPayment,
  onUpdateOrderStatus,
  onOpenStockManagement,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const handleConfirm = (id: string) => {
    onConfirmOrderPayment(id);
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
  const confirmedOrders = reportOrders.filter((order) => order.paymentConfirmed === true);
  const confirmedSales = confirmedOrders.reduce((total, order) => total + order.total, 0);
  const formattedConfirmedSales = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(confirmedSales);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
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
              <p className="text-xs text-gray-300">
                Account: <strong>8135648242</strong> (OPay - IFEANYICHUKWU FRANKLIN ANOMA)
              </p>
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

        <div className="mx-4 mt-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#202024] p-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">Sales Report</h4>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">All synced orders</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">Confirmed orders</div>
              <div className="text-lg font-black text-gray-900 dark:text-white">{confirmedOrders.length}</div>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">Confirmed sales</div>
              <div className="text-sm font-black text-gray-900 dark:text-white truncate" title={confirmedSales.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}>
                {formattedConfirmedSales}
              </div>
            </div>
          </div>
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