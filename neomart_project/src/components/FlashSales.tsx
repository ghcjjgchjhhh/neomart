import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FlashSalesProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onSelectProduct: (productId: number) => void;
  onSeeAll: () => void;
}

export const FlashSales: React.FC<FlashSalesProps> = ({
  products,
  onAddToCart,
  onSelectProduct,
  onSeeAll
}) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 8, mins: 24, secs: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let s = prev.secs - 1;
        let m = prev.mins;
        let h = prev.hours;

        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        if (h < 0) {
          h = 8;
          m = 0;
          s = 0;
        }
        return { hours: h, mins: m, secs: s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDigit = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 mb-4 shadow-xs border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 mb-3 border-b-2 border-[#f68b1e]">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Zap className="w-5 h-5 text-[#e02020] fill-[#e02020]" />
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-gray-100">
              Flash Sales
            </h2>
          </div>

          <span className="bg-[#e02020] text-white font-bold text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider animate-flash-badge">
            LIVE NOW
          </span>

          {/* Countdown Clock */}
          <div className="flex items-center gap-1 text-white font-bold text-xs">
            <span className="bg-[#222222] px-2 py-1 rounded min-w-7 text-center">
              {formatDigit(timeLeft.hours)}
            </span>
            <span className="text-[#e02020] font-black">:</span>
            <span className="bg-[#222222] px-2 py-1 rounded min-w-7 text-center">
              {formatDigit(timeLeft.mins)}
            </span>
            <span className="text-[#e02020] font-black">:</span>
            <span className="bg-[#222222] px-2 py-1 rounded min-w-7 text-center">
              {formatDigit(timeLeft.secs)}
            </span>
          </div>
        </div>

        <button
          onClick={onSeeAll}
          className="text-xs font-bold text-[#f68b1e] hover:underline cursor-pointer"
        >
          See All →
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onSelectProduct={onSelectProduct}
          />
        ))}
      </div>
    </div>
  );
};
