import React, { useState } from 'react';
import { Package, Search, X, Plus, Pencil, Trash2, Star, AlertTriangle } from 'lucide-react';
import { allProducts } from '../data/products';
import { Product } from '../types';

interface AdminStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockLevels: Record<number, number>;
  onUpdateStock: (productId: number, quantity: number) => void;
  products?: Product[];
  onSaveProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: number) => void;
}

export const AdminStockModal: React.FC<AdminStockModalProps> = ({ isOpen, onClose, stockLevels, onUpdateStock, products = allProducts, onSaveProduct, onDeleteProduct }) => {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  if (!isOpen) return null;

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );
  const lowStockProducts = products.filter((product) => {
    const stock = stockLevels[product.id] ?? 10;
    return stock <= (product.lowStockThreshold ?? 5);
  });

  const updateStock = (productId: number, value: string) => {
    const nextValue = Math.max(0, Number.parseInt(value, 10) || 0);
    onUpdateStock(productId, nextValue);
  };

  const openEditor = (product?: Product) => {
    setEditing(product || { id: Date.now(), name: '', price: 0, oldPrice: 0, discount: 0, rating: 0, reviews: 0, emoji: '📦', img: '', images: [], category: 'phone', tags: [], featured: false, lowStockThreshold: 5 });
    setShowEditor(true);
  };

  const saveProduct = (event: React.FormEvent) => {
    event.preventDefault();
    if (editing?.name.trim() && onSaveProduct) onSaveProduct({ ...editing, name: editing.name.trim(), price: Number(editing.price), oldPrice: Number(editing.oldPrice), discount: Number(editing.discount), images: editing.images?.filter(Boolean), img: editing.images?.[0] || editing.img });
    setShowEditor(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => setEditing((current) => current ? { ...current, img: String(reader.result), images: [String(reader.result)] } : current);
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-[#222222] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#f68b1e] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Product &amp; Stock Management</h3>
              <p className="text-xs text-gray-300">Manage products, pricing, images, categories and inventory.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white" aria-label="Close stock management">
            <X className="w-5 h-5" />
          </button>
        </div>

        {showEditor && editing && <form onSubmit={saveProduct} className="border-b border-gray-200 bg-orange-50 p-4 dark:border-gray-800 dark:bg-orange-950/20"><div className="mb-3 flex items-center justify-between"><h4 className="font-extrabold">{products.some((product) => product.id === editing.id) ? 'Edit product' : 'Add product'}</h4><button type="button" onClick={() => setShowEditor(false)} aria-label="Close product editor"><X className="h-4 w-4" /></button></div><div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{([['name','Product name'],['price','Price'],['oldPrice','Sale/original price'],['discount','Discount %'],['category','Category'],['images','Image URLs (comma separated)']] as const).map(([key,label]) => <label key={key} className="text-[11px] font-bold">{label}<input required={key === 'name'} value={key === 'images' ? (editing.images || []).join(', ') : String(editing[key] ?? '')} onChange={(event) => setEditing({ ...editing, [key]: key === 'images' ? event.target.value.split(',').map((url) => url.trim()) : event.target.value } as Product)} type={['price','oldPrice','discount'].includes(key) ? 'number' : 'text'} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-normal dark:border-gray-700 dark:bg-[#202024]" /></label>)}<label className="text-[11px] font-bold">Upload product photo<input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs dark:border-gray-700 dark:bg-[#202024]" /><span className="mt-1 block text-[10px] font-normal text-gray-500">Choose from gallery or camera, max 2 MB.</span></label></div><div className="mt-3 flex flex-wrap items-center gap-3 text-xs"><label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(editing.featured)} onChange={(event) => setEditing({ ...editing, featured: event.target.checked })} /> Featured product</label><label className="flex items-center gap-2">Low-stock warning below <input type="number" min="0" value={editing.lowStockThreshold ?? 5} onChange={(event) => setEditing({ ...editing, lowStockThreshold: Number(event.target.value) })} className="w-16 rounded border px-2 py-1" /></label><button type="submit" className="rounded-lg bg-[#f68b1e] px-4 py-2 font-bold text-white">Save product</button></div></form>}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <button type="button" onClick={() => openEditor()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f68b1e] px-4 py-3 text-xs font-extrabold text-white hover:bg-orange-600"><Plus className="h-4 w-4" />Add product</button>
          {lowStockProducts.length > 0 && (
            <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3">
              <div className="font-extrabold text-amber-800 dark:text-amber-300">
                Low-stock alert: {lowStockProducts.length} product{lowStockProducts.length === 1 ? '' : 's'}
              </div>
              <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                {lowStockProducts.map((product) => `${product.name} (${stockLevels[product.id] ?? 10} left)`).join(', ')}
              </div>
            </div>
          )}

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
                <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 truncate font-semibold text-gray-700 dark:text-gray-300" title={product.name}>{product.featured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}{product.name}</div>
                    <div className={`text-[10px] font-bold ${stock === 0 ? 'text-red-600' : stock <= (product.lowStockThreshold ?? 5) ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {stock === 0 ? 'Unavailable' : stock <= (product.lowStockThreshold ?? 5) ? <><AlertTriangle className="mr-1 inline h-3 w-3" />Low stock</> : 'Available'} · {product.category} · ₦{product.price.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2"><input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(event) => updateStock(product.id, event.target.value)}
                    className="w-16 shrink-0 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202024] px-2 py-1.5 text-center font-bold text-gray-900 dark:text-white"
                    aria-label={`Stock quantity for ${product.name}`}
                  /><button type="button" onClick={() => openEditor(product)} className="rounded-lg border p-2 text-blue-600" title="Edit product"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => onDeleteProduct?.(product.id)} className="rounded-lg border p-2 text-red-600" title="Delete product"><Trash2 className="h-4 w-4" /></button></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
