import React, { useState } from 'react';
import { ShoppingCart, Check, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => boolean | void;
  onSelectProduct: (productId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onSelectProduct
}) => {
  const [imgError, setImgError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const formatPrice = (amount: number) => {
    return '₦' + amount.toLocaleString('en-NG');
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart(product) !== false) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-[#f68b1e]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= Math.round(rating) ? 'fill-[#f68b1e]' : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      onClick={() => onSelectProduct(product.id)}
      className="group bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#f68b1e] dark:hover:border-[#f68b1e] transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      {/* Top Image Wrap */}
      <div className="relative pt-[100%] bg-gray-50 dark:bg-[#242424] overflow-hidden">
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-[#e02020] text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-xs">
            -{product.discount}%
          </span>
        )}

        <div className="absolute inset-0 flex items-center justify-center p-3">
          {product.img && !imgError ? (
            <img
              src={product.img}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <span className="text-5xl select-none group-hover:scale-110 transition-transform">
              {product.emoji}
            </span>
          )}
        </div>
      </div>

      {/* Info Wrap */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <h3 className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-relaxed h-8">
            {product.name}
          </h3>

          <div className="mt-1.5 space-y-0.5">
            <div className="text-sm sm:text-base font-extrabold text-[#f68b1e]">
              {formatPrice(product.price)}
            </div>
            {product.oldPrice > product.price && (
              <div className="text-[11px] text-gray-400 dark:text-gray-500 line-through">
                {formatPrice(product.oldPrice)}
              </div>
            )}
          </div>

          <div className="mt-1.5 flex items-center gap-1.5">
            {renderStars(product.rating)}
            <span className="text-[10px] text-gray-400">
              ({product.reviews.toLocaleString()})
            </span>
          </div>
        </div>

        {/* Add To Cart */}
        <button
          onClick={handleAddClick}
          className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
            isAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-linear-to-b from-[#f39d3d] to-[#f68b1e] hover:from-[#ea8c1b] hover:to-[#dc7a0d] text-white hover:shadow-sm'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
