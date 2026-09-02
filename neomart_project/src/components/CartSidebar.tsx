import React from 'react';
import { ShoppingCart, X, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onChangeQty: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  onOpenCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  isOpen,
  onClose,
  cart,
  onChangeQty,
  onRemoveItem,
  onOpenCheckout
}) => {
  if (!isOpen) return null;

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const formatPrice = (amount: number) => {
    return '₦' + amount.toLocaleString('en-NG');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-2xs transition-opacity cursor-pointer"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#1a1a1a] shadow-2xl flex flex-col justify-between border-l border-gray-200 dark:border-gray-800 animate-slideLeft">
          {/* Header */}
          <div className="bg-[#f68b1e] text-white p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 font-bold text-base">
              <ShoppingCart className="w-5 h-5" />
              <span>My Cart ({totalCount})</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-black/10 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100 dark:divide-gray-800">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 space-y-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#242424] flex items-center justify-center text-gray-300 dark:text-gray-600">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">
                    Your cart is empty
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Explore deals &amp; add items to get started
                  </p>
                </div>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-3 flex gap-3 items-start">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-[#242424] rounded-lg border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0 p-1">
                    {item.img ? (
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-3xl">{item.emoji}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                      {item.name}
                    </h4>
                    <div className="text-sm font-extrabold text-[#f68b1e]">
                      {formatPrice(item.price)}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-[#242424]">
                        <button
                          onClick={() => onChangeQty(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-gray-800 dark:text-gray-200 min-w-[20px] text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => onChangeQty(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout button */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#222222] space-y-3">
              <div className="flex items-center justify-between text-sm font-bold text-gray-800 dark:text-gray-200">
                <span>Total Amount:</span>
                <span className="text-lg text-[#f68b1e]">{formatPrice(totalPrice)}</span>
              </div>

              <button
                onClick={onOpenCheckout}
                className="w-full bg-[#f68b1e] hover:bg-[#e07a10] text-white font-extrabold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
