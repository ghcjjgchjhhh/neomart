import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Smartphone, Laptop, Shirt, Gamepad2, Flame, Tv } from 'lucide-react';
import { CategoryId } from '../types';

interface HeroSliderProps {
  onSelectCategory: (category: CategoryId) => void;
}

interface Slide {
  badge: string;
  title: string;
  subtitle: string;
  cta: string;
  category: CategoryId;
  bgGradient: string;
  emoji: string;
}

const slides: Slide[] = [
  {
    badge: '🔥 Hot Deal',
    title: 'Mega Phone\nSale is Live!',
    subtitle: 'Up to 60% off on flagship smartphones & accessories',
    cta: 'Shop Now →',
    category: 'phone',
    bgGradient: 'from-[#1a1a2e] via-[#16213e] to-[#0f3460]',
    emoji: '📱'
  },
  {
    badge: '⚡ Flash Deal',
    title: 'Laptop Week\nStarts Today!',
    subtitle: 'Premium laptops at unbeatable Nigerian wholesale prices',
    cta: 'Explore Deals →',
    category: 'laptop',
    bgGradient: 'from-[#2d1b69] via-[#1b2a47] to-[#11998e]',
    emoji: '💻'
  },
  {
    badge: '🎉 Super Sale',
    title: 'Fashion Fiesta\nUp to 70% OFF',
    subtitle: 'Trendy styles, shoes, sneakers & corporate wears',
    cta: 'Grab It Now →',
    category: 'fashion',
    bgGradient: 'from-[#c31432] via-[#5c1d3f] to-[#240b36]',
    emoji: '👟'
  },
  {
    badge: '🏠 Home Week',
    title: 'Appliance\nBonanza Sale!',
    subtitle: 'Upgrade your home with top verified refrigerator & AC brands',
    cta: 'Buy Now →',
    category: 'appliance',
    bgGradient: 'from-[#134e5e] via-[#245b59] to-[#71b280]',
    emoji: '🏠'
  }
];

export const HeroSlider: React.FC<HeroSliderProps> = ({ onSelectCategory }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="space-y-3.5 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Main Slider Carousel (3 columns) */}
        <div className="md:col-span-3 relative h-64 sm:h-72 rounded-xl overflow-hidden shadow-md group">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-linear-to-r ${slide.bgGradient} p-6 sm:p-10 flex flex-col justify-center text-white transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div className="relative z-10 max-w-md space-y-2">
                <span className="inline-block bg-[#f68b1e] text-white text-[11px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                  {slide.badge}
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight whitespace-pre-line">
                  {slide.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-200 line-clamp-2">
                  {slide.subtitle}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onSelectCategory(slide.category)}
                    className="bg-[#f68b1e] hover:bg-[#e07a10] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
                  >
                    {slide.cta}
                  </button>
                </div>
              </div>

              {/* Background Ghost Icon / Emoji */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl sm:text-9xl opacity-20 select-none pointer-events-none">
                {slide.emoji}
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentSlide ? 'w-6 bg-[#f68b1e]' : 'w-2 bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Hero Side Ads (1 column) */}
        <div className="hidden md:flex flex-col gap-2.5">
          <button
            onClick={() => onSelectCategory('phone')}
            className="flex-1 bg-linear-to-br from-[#f68b1e] to-[#e53935] rounded-xl p-4 text-white flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Smartphone className="w-7 h-7 mb-1" />
            <span className="font-extrabold text-sm">Phones</span>
            <span className="text-[11px] opacity-90">Up to 50% OFF</span>
          </button>

          <button
            onClick={() => onSelectCategory('laptop')}
            className="flex-1 bg-linear-to-br from-[#1565c0] to-[#6a1b9a] rounded-xl p-4 text-white flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Laptop className="w-7 h-7 mb-1" />
            <span className="font-extrabold text-sm">Laptops</span>
            <span className="text-[11px] opacity-90">Big Discounts</span>
          </button>

          <button
            onClick={() => onSelectCategory('fashion')}
            className="flex-1 bg-linear-to-br from-[#2e7d32] to-[#00acc1] rounded-xl p-4 text-white flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Shirt className="w-7 h-7 mb-1" />
            <span className="font-extrabold text-sm">Fashion</span>
            <span className="text-[11px] opacity-90">New Arrivals</span>
          </button>
        </div>
      </div>

      {/* Featured Banner Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          onClick={() => onSelectCategory('gaming')}
          className="bg-linear-to-r from-[#e53935] to-[#c62828] text-white p-4 rounded-xl flex items-center gap-3.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left cursor-pointer"
        >
          <Gamepad2 className="w-8 h-8 opacity-90 shrink-0" />
          <div>
            <div className="font-bold text-sm">Gaming Zone</div>
            <div className="text-[11px] text-white/80">PS5, Xbox &amp; PC Gaming Gear</div>
          </div>
        </button>

        <button
          onClick={() => onSelectCategory('appliance')}
          className="bg-linear-to-r from-[#1976d2] to-[#0d47a1] text-white p-4 rounded-xl flex items-center gap-3.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left cursor-pointer"
        >
          <Flame className="w-8 h-8 opacity-90 shrink-0" />
          <div>
            <div className="font-bold text-sm">Home Appliances</div>
            <div className="text-[11px] text-white/80">Best Brands, Best Prices</div>
          </div>
        </button>

        <button
          onClick={() => onSelectCategory('tv')}
          className="bg-linear-to-r from-[#388e3c] to-[#1b5e20] text-white p-4 rounded-xl flex items-center gap-3.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left cursor-pointer"
        >
          <Tv className="w-8 h-8 opacity-90 shrink-0" />
          <div>
            <div className="font-bold text-sm">Smart TVs</div>
            <div className="text-[11px] text-white/80">4K UHD &amp; OLED Collection</div>
          </div>
        </button>
      </div>
    </div>
  );
};
