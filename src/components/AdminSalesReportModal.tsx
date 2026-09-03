import React from 'react';
import { BarChart3, X } from 'lucide-react';
import { Order } from '../types';

interface AdminSalesReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export const AdminSalesReportModal: React.FC<AdminSalesReportModalProps> = ({ isOpen, onClose, orders }) => {
  if (!isOpen) return null;

  const confirmedOrders = orders.filter((order) => order.paymentConfirmed === true);
  const confirmedSales = confirmedOrders.reduce((total, order) => total + order.total, 0);
  const formattedSales = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(confirmedSales);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-[#222222] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#f68b1e] flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Sales Report</h3>
              <p className="text-xs text-gray-300">Confirmed orders and sales</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-300" aria-label="Close sales report">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5">
          <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20 p-4">
            <div className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400">Confirmed orders</div>
            <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">{confirmedOrders.length}</div>
          </div>
          <div className="min-w-0 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 p-4">
            <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Confirmed sales</div>
            <div className="mt-2 text-lg font-black text-gray-900 dark:text-white truncate" title={confirmedSales.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}>{formattedSales}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
