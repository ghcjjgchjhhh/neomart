import React from 'react';

interface BrandsStripProps {
  onSearchBrand: (brand: string) => void;
}

const brands = [
  'Apple',
  'Samsung',
  'HP',
  'Dell',
  'Lenovo',
  'Sony',
  'LG',
  'Hisense',
  'Xiaomi',
  'Tecno',
  'Infinix',
  'Nike',
  'Adidas',
  'Asus',
  'Panasonic'
];

export const BrandsStrip: React.FC<BrandsStripProps> = ({ onSearchBrand }) => {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 mb-4 shadow-xs border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#f68b1e]">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Top Brands</h2>
      </div>

      <div data-horizontal-swipe className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => onSearchBrand(brand)}
            className="px-4 py-2 bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:border-[#f68b1e] hover:text-[#f68b1e] whitespace-nowrap transition-all cursor-pointer hover:shadow-xs hover:-translate-y-0.5"
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  );
};
