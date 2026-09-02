import React from 'react';
import { CategoryId } from '../types';

interface CategoryNavProps {
  selectedCategory: string;
  onSelectCategory: (cat: CategoryId) => void;
}

interface NavItem {
  id: CategoryId;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'all', label: 'All Categories' },
  { id: 'phone', label: 'Phones & Tablets' },
  { id: 'laptop', label: 'Computing' },
  { id: 'tv', label: 'Electronics' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'appliance', label: 'Appliances' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'health', label: 'Health & Beauty' },
  { id: 'home', label: 'Home & Office' },
  { id: 'baby', label: 'Baby Products' }
];

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <nav className="w-full bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-gray-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
          {navItems.map((item) => {
            const isActive = selectedCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectCategory(item.id)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#f68b1e] text-white shadow-xs'
                    : 'text-gray-700 dark:text-gray-300 hover:text-[#f68b1e] hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
