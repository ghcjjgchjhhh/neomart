import React, { useState } from 'react';
import { Package, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Product } from '../types';

interface AdminInventoryRoomProps {
  products: Product[];
  stockLevels: Record<number, number>;
  onUpdateStock: (productId: number, quantity: number) => void;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
}

export const AdminInventoryRoom: React.FC<AdminInventoryRoomProps> = ({ products, stockLevels, onUpdateStock, onSaveProduct, onDeleteProduct }) => {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);

  const visibleProducts = products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()) || product.category.toLowerCase().includes(search.toLowerCase()));
  const createProduct = () => setEditing({ id: Date.now(), name: '', price: 0, oldPrice: 0, discount: 0, rating: 0, reviews: 0, emoji: '📦', category: 'phone', tags: [], featured: false, lowStockThreshold: 5 });
  const saveProduct = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing.name.trim()) return;
    onSaveProduct({ ...editing, name: editing.name.trim() });
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." className="w-full rounded-xl border border-gray-700 bg-gray-900/70 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-orange-500" /></div>
        <button type="button" onClick={createProduct} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-400"><Plus className="h-4 w-4" />Add Product</button>
      </div>

      {editing && <form onSubmit={saveProduct} className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold text-white">{products.some((product) => product.id === editing.id) ? 'Edit Product' : 'Add Product'}</h2><p className="mt-1 text-xs text-gray-400">Changes save directly to the Inventory workspace.</p></div><button type="button" onClick={() => setEditing(null)} aria-label="Close product editor" className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button></div><div className="grid gap-3 md:grid-cols-2"><label className="text-xs font-bold text-gray-300">Product name<input required value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm font-normal text-white outline-none focus:border-orange-500" /></label><label className="text-xs font-bold text-gray-300">Category<input value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm font-normal text-white outline-none focus:border-orange-500" /></label><label className="text-xs font-bold text-gray-300">Price<input type="number" min="0" value={editing.price} onChange={(event) => setEditing({ ...editing, price: Number(event.target.value) })} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm font-normal text-white outline-none focus:border-orange-500" /></label><label className="text-xs font-bold text-gray-300">Stock quantity<input type="number" min="0" value={stockLevels[editing.id] ?? 0} onChange={(event) => onUpdateStock(editing.id, Math.max(0, Number(event.target.value)))} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm font-normal text-white outline-none focus:border-orange-500" /></label></div><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-gray-700 px-4 py-2 text-xs font-bold text-gray-300">Cancel</button><button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white">Save Product</button></div></form>}

      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/40"><div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-xs"><thead className="border-b border-gray-800 bg-gray-900/70 text-gray-500"><tr><th className="px-5 py-4 font-semibold">Product</th><th className="px-5 py-4 font-semibold">Category</th><th className="px-5 py-4 font-semibold">Quantity</th><th className="px-5 py-4 font-semibold">Status</th><th className="px-5 py-4 font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-gray-800/70">{visibleProducts.map((product) => { const quantity = stockLevels[product.id] ?? 0; const low = quantity < 10; return <tr key={product.id} className="text-gray-300 hover:bg-white/[0.03]"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-gray-700 bg-gray-900"><Package className="h-5 w-5 text-orange-300" /></div><div><p className="font-bold text-white">{product.name}</p><p className="mt-1 text-[11px] text-gray-500">₦{product.price.toLocaleString()}</p></div></div></td><td className="px-5 py-4">{product.category}</td><td className="px-5 py-4"><div className="flex items-center gap-2"><button type="button" onClick={() => onUpdateStock(product.id, Math.max(0, quantity - 1))} aria-label={`Decrease ${product.name} quantity`} className="grid h-8 w-8 place-items-center rounded-lg border border-gray-700 text-lg text-gray-300 hover:border-orange-500 hover:text-orange-300">-</button><input aria-label={`${product.name} quantity`} type="number" min="0" value={quantity} onChange={(event) => onUpdateStock(product.id, Math.max(0, Number(event.target.value)))} className="w-16 rounded-lg border border-gray-700 bg-gray-900 px-2 py-2 text-center font-bold text-white outline-none focus:border-orange-500" /><button type="button" onClick={() => onUpdateStock(product.id, quantity + 1)} aria-label={`Increase ${product.name} quantity`} className="grid h-8 w-8 place-items-center rounded-lg border border-gray-700 text-lg text-gray-300 hover:border-orange-500 hover:text-orange-300">+</button></div></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${low ? 'bg-red-500/15 text-red-300' : 'bg-emerald-500/15 text-emerald-300'}`}>{low ? 'Low stock' : 'Healthy'}</span></td><td className="px-5 py-4"><div className="flex items-center gap-2"><button type="button" onClick={() => setEditing(product)} aria-label={`Edit ${product.name}`} className="grid h-8 w-8 place-items-center rounded-lg border border-gray-700 text-gray-300 hover:border-orange-500 hover:text-orange-300"><Pencil className="h-3.5 w-3.5" /></button><button type="button" onClick={() => onDeleteProduct(product.id)} aria-label={`Delete ${product.name}`} className="grid h-8 w-8 place-items-center rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></button></div></td></tr>; })}</tbody></table></div></div>
    </div>
  );
};
