import React from 'react';
import {
  Smartphone,
  Laptop,
  Tv,
  Shirt,
  Flame,
  Gamepad2,
  HeartPulse,
  Home,
  Baby,
  Star,
  ShoppingBasket,
  Grid
} from 'lucide-react';
import { CategoryId } from '../types';

interface SidebarProps {
  selectedCategory: string;
  onSelectCategory: (cat: CategoryId) => void;
}

interface SidebarItem {
  id: CategoryId;
  label: string;
  icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
  { id: 'all', label: 'Official Store', icon: <Star className="w-4 h-4 text-[#f68b1e]" /> },
  { id: 'appliance', label: 'Appliances', icon: <Flame className="w-4 h-4 text-[#f68b1e]" /> },
  { id: 'phone', label: 'Phones & Tablets', icon: <Smartphone className="w-4 h-4 text-[#f68b1e]" /> },
  { id: 'health', label: 'Health & Beauty', icon: <HeartPulse className="w-4 h-4 text-[#f68b1e]" /> },
  { id: 'home', label: 'Home & Office', icon: <Home className="w-4 h-4 text-[#f68b1e]" /> },
  { id: 'tv', label: 'Electronics', icon: <Tv className="w-4 h-4 text-[#f68b1e]" /> },
  { id: 'fashion', label: 'Fashion', icon: <Shirt className="w-4 h-4 text-[#f68b1e]" /> },
  { id: 'food', label: 'Supermarket', icon: <ShoppingBasket className="w-4 h-4 text-[#f68b1e]" /> },
  { id: 'laptop', label: 'Computing', icon: <Laptop className="w-4 h-4 text-[#f68b1e]" /> },
  { id: 'baby', label: 'Baby Products', icon: <Baby className="w-4 h-4 text-[#f68b1e]" /> },
  { id: 'gaming', label: 'Gaming', icon: <Gamepad2 className="w-4 h-4 text-[#f68b1e]" /> }
];

export const Sidebar: React.FC<SidebarProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <aside className="w-52 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xs border border-gray-200 dark:border-gray-800 overflow-hidden sticky top-20 hidden lg:block self-start shrink-0">
      <div className="bg-[#f68b1e] text-white px-4 py-3 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
        <Grid className="w-4 h-4" />
        <span>Categories</span>
      </div>

      <div className="py-1">
        {sidebarItems.map((item) => {
          const isActive = selectedCategory === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectCategory(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium border-b border-gray-100 dark:border-gray-800/60 last:border-0 transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-[#fff3e0] dark:bg-[#2a1a00] text-[#f68b1e] pl-5 font-bold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-[#fff3e0] dark:hover:bg-[#2a1a00] hover:text-[#f68b1e] hover:pl-5'
              }`}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
