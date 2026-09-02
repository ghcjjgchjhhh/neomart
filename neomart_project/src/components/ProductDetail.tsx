import React, { useState } from 'react';
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  ThumbsUp,
  MessageSquarePlus,
  X
} from 'lucide-react';
import { Product, Review } from '../types';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'date' | 'helpful'>) => void;
  onVoteHelpful: (reviewId: number) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onBack,
  onAddToCart,
  reviews,
  onAddReview,
  onVoteHelpful
}) => {
  const [activeThumb, setActiveThumb] = useState<'real' | 'emoji'>('real');
  const [imgError, setImgError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Review Form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [votedIds, setVotedIds] = useState<number[]>([]);

  const formatPrice = (amount: number) => {
    return '₦' + amount.toLocaleString('en-NG');
  };

  const productReviews = reviews.filter((r) => r.productId === product.id);
  const totalReviews = productReviews.length;
  const avgRating = totalReviews
    ? (
        productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      ).toFixed(1)
    : product.rating.toFixed(1);

  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: productReviews.filter((r) => r.rating === star).length
  }));

  const handleAddToCart = () => {
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleHelpfulClick = (reviewId: number) => {
    if (!votedIds.includes(reviewId)) {
      setVotedIds([...votedIds, reviewId]);
      onVoteHelpful(reviewId);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewText.trim()) return;

    onAddReview({
      productId: product.id,
      reviewer: reviewerName.trim(),
      rating: reviewRating,
      text: reviewText.trim(),
      productName: product.name,
      productEmoji: product.emoji
    });

    setReviewerName('');
    setReviewText('');
    setShowReviewModal(false);
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 sm:p-6 mb-6 shadow-xs border border-gray-200 dark:border-gray-800">
      {/* Top back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-[#f68b1e] hover:underline mb-4 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to products</span>
      </button>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
        {/* Gallery (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="w-full aspect-square bg-gray-50 dark:bg-[#242424] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex items-center justify-center overflow-hidden">
            {activeThumb === 'real' && product.img && !imgError ? (
              <img
                src={product.img}
                alt={product.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-8xl select-none">{product.emoji}</span>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2.5 mt-3">
            <button
              onClick={() => setActiveThumb('real')}
              className={`w-16 h-16 rounded-xl border p-1 bg-white dark:bg-[#242424] overflow-hidden flex items-center justify-center transition-all cursor-pointer ${
                activeThumb === 'real'
                  ? 'border-[#f68b1e] ring-2 ring-[#f68b1e]/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
              }`}
            >
              {product.img && !imgError ? (
                <img
                  src={product.img}
                  alt="Thumbnail"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-2xl">{product.emoji}</span>
              )}
            </button>
            <button
              onClick={() => setActiveThumb('emoji')}
              className={`w-16 h-16 rounded-xl border p-1 bg-white dark:bg-[#242424] flex items-center justify-center transition-all cursor-pointer ${
                activeThumb === 'emoji'
                  ? 'border-[#f68b1e] ring-2 ring-[#f68b1e]/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
              }`}
            >
              <span className="text-3xl">{product.emoji}</span>
            </button>
          </div>
        </div>

        {/* Product Details (7 cols) */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <span className="inline-block bg-[#fff3e0] dark:bg-[#2a1a00] text-[#f68b1e] border border-[#f68b1e]/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
              Official Store
            </span>

            <h1 className="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-gray-100 leading-snug">
              {product.name}
            </h1>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Brand: <strong className="text-gray-700 dark:text-gray-300 capitalize">{product.tags[0] || 'Original'}</strong> | Category: <strong className="text-gray-700 dark:text-gray-300 capitalize">{product.category}</strong>
            </p>

            {/* Ratings row */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-[#f68b1e]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(Number(avgRating))
                        ? 'fill-[#f68b1e]'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {avgRating} ({totalReviews || product.reviews} verified ratings)
              </span>
            </div>

            {/* Price Box */}
            <div className="mt-4 p-4 rounded-xl bg-linear-to-r from-[#fff3e0]/50 to-transparent dark:from-[#2a1a00]/40 border border-[#f68b1e]/20">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-[#f68b1e]">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice > product.price && (
                  <>
                    <span className="text-sm text-gray-400 line-through font-semibold">
                      {formatPrice(product.oldPrice)}
                    </span>
                    <span className="bg-[#e02020] text-white text-xs font-bold px-2 py-0.5 rounded">
                      -{product.discount}%
                    </span>
                  </>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#f68b1e]" />
                <span>+ shipping from ₦1,000 to Lekki-Ajah (Sangotedo)</span>
              </div>
            </div>

            {/* Value Props Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>100% Authentic Product Warranty</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Fast Nationwide Delivery</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                <RotateCcw className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>7 Days Free Return Policy</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Eligible for Cash on Delivery</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#f68b1e] hover:bg-[#e07a10] text-white hover:shadow-lg'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-3.5 border border-gray-300 dark:border-gray-700 hover:border-[#f68b1e] rounded-xl text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-[#f68b1e] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verified Reviews Section */}
      <div className="pt-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800 flex-wrap gap-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Verified Customer Reviews
          </h3>
          <button
            onClick={() => setShowReviewModal(true)}
            className="text-xs font-bold text-[#f68b1e] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Rating Summary Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 mt-4 bg-gray-50 dark:bg-[#222222] rounded-xl">
          <div className="sm:col-span-4 flex flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800 pb-3 sm:pb-0">
            <div className="text-4xl font-extrabold text-[#f68b1e]">{avgRating}</div>
            <div className="flex text-[#f68b1e] my-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(Number(avgRating)) ? 'fill-[#f68b1e]' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {totalReviews} verified ratings
            </span>
          </div>

          <div className="sm:col-span-8 flex flex-col justify-center space-y-1.5 text-xs">
            {starCounts.map(({ star, count }) => {
              const pct = totalReviews ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-7 font-bold text-gray-600 dark:text-gray-400">{star}★</span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#f68b1e] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-right text-gray-500 text-[11px]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review list */}
        <div className="mt-4 space-y-3">
          {productReviews.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              No reviews yet for this product. Be the first to share your experience!
            </div>
          ) : (
            productReviews.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#f68b1e]/20 text-[#f68b1e] font-bold text-xs flex items-center justify-center">
                      {r.reviewer.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-gray-800 dark:text-gray-200">
                        {r.reviewer}
                      </div>
                      <div className="text-[10px] text-gray-400">{r.date}</div>
                    </div>
                  </div>

                  <div className="flex text-[#f68b1e]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= r.rating ? 'fill-[#f68b1e]' : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  {r.text}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3 h-3" /> Verified Purchase
                  </span>
                  <button
                    onClick={() => handleHelpfulClick(r.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                      votedIds.includes(r.id)
                        ? 'bg-[#fff3e0] text-[#f68b1e] border-[#f68b1e]'
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#f68b1e]'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Helpful ({r.helpful + (votedIds.includes(r.id) ? 1 : 0)})</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                Write a Review
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Tunde Balogun"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? 'text-[#f68b1e] fill-[#f68b1e]'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Review Comment
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell other shoppers what you liked or how the product performs..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#f68b1e] resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#f68b1e] hover:bg-[#e07a10] text-white rounded-xl font-bold cursor-pointer transition-colors shadow-sm"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
