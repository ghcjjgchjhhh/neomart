import React, { useState } from 'react';
import { Package, Search, X } from 'lucide-react';
import { allProducts } from '../data/products';

interface AdminStockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminStockModal: React.FC<AdminStockModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [stockLevels, setStockLevels] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem('neomart_stock_levels');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  if (!isOpen) return null;

  const filteredProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const updateStock = (productId: number, value: string) => {
    const nextValue = Math.max(0, Number.parseInt(value, 10) || 0);
    const updated = { ...stockLevels, [productId]: nextValue };
    setStockLevels(updated);
    localStorage.setItem('neomart_stock_levels', JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-[#222222] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#f68b1e] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Stock Management</h3>
              <p className="text-xs text-gray-300">Set product quantities before accepting orders.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white" aria-label="Close stock management">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202024] text-gray-800 dark:text-gray-200 outline-none focus:border-[#f68b1e]"
              aria-label="Search products for stock management"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredProducts.map((product) => {
              const stock = stockLevels[product.id] ?? 10;
              return (
                <div key={product.id} className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-gray-700 dark:text-gray-300" title={product.name}>{product.name}</div>
                    <div className={`text-[10px] font-bold ${stock === 0 ? 'text-red-600' : stock < 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {stock === 0 ? 'Unavailable' : stock < 5 ? 'Low stock' : 'Available'}
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(event) => updateStock(product.id, event.target.value)}
                    className="w-16 shrink-0 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202024] px-2 py-1.5 text-center font-bold text-gray-900 dark:text-white"
                    aria-label={`Stock quantity for ${product.name}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
