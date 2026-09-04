import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Smartphone, 
  Plus, 
  ShoppingCart, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  DollarSign,
  Package,
  Boxes
} from 'lucide-react';
import { Product } from '../types';

interface BarPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddProduct: (isBarPhone: boolean) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onSellProduct: (product: Product, isCashSale?: boolean) => void;
}

export const BarPhoneModal: React.FC<BarPhoneModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onSellProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter only bar phone products
  const barProducts = useMemo(() => {
    return products.filter(p => p.is_bar_phone);
  }, [products]);

  // Summary statistics for bar phones
  const stats = useMemo(() => {
    const totalModels = barProducts.length;
    const totalQuantity = barProducts.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
    const inStockModels = barProducts.filter(p => (Number(p.quantity) || 0) > 0).length;
    const totalRetailValue = barProducts.reduce((sum, p) => sum + Math.round((Number(p.purchase_price) || 0) * (Number(p.quantity) || 0)), 0);
    const totalCustomerValue = barProducts.reduce((sum, p) => sum + Math.round((Number(p.selling_price) || 0) * (Number(p.quantity) || 0)), 0);
    const totalProjectedProfit = totalCustomerValue - totalRetailValue;

    return {
      totalModels,
      totalQuantity,
      inStockModels,
      totalRetailValue,
      totalCustomerValue,
      totalProjectedProfit
    };
  }, [barProducts]);

  // Filtered bar phones based on search
  const filteredProducts = useMemo(() => {
    let list = barProducts;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.color && p.color.toLowerCase().includes(q)) ||
        (p.imeis && p.imeis.some(i => i.toLowerCase().includes(q)))
      );
    }

    return [...list].sort((a, b) => {
      const qtyDiff = (Number(b.quantity) || 0) - (Number(a.quantity) || 0);
      if (qtyDiff !== 0) return qtyDiff;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
  }, [barProducts, searchQuery]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col border border-blue-100"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">
                    Bar Phone List (বাটন ফোন / ফিচার ফোন তালিকা)
                  </h2>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {stats.totalQuantity} Pcs ({stats.totalModels} Models)
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  View model names, retail prices, customer prices, and quantities for bar phones
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAddProduct(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-200 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Bar Phone
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bar Phone Total Section (Inside Card / Popup) */}
          <div className="px-4 sm:px-6 py-3 bg-blue-50/40 border-b border-blue-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-center">
            <div className="bg-white p-2.5 rounded-xl border border-blue-100/80 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Total Quantity</p>
              <p className="text-lg font-black text-blue-700">
                {stats.totalQuantity} <span className="text-xs font-semibold text-gray-500">Pcs</span>
              </p>
              <p className="text-[10px] text-gray-400">{stats.inStockModels} in stock / {stats.totalModels} models</p>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-blue-100/80 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Total Retail Value (ক্রয়)</p>
              <p className="text-lg font-black text-gray-800">
                ৳{stats.totalRetailValue.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400">Total purchase amount</p>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-blue-100/80 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Total Customer Value (বিক্রয়)</p>
              <p className="text-lg font-black text-emerald-600">
                ৳{stats.totalCustomerValue.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400">Total selling value</p>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-blue-100/80 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Projected Profit</p>
              <p className="text-lg font-black text-purple-600">
                ৳{stats.totalProjectedProfit.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400">Estimated profit</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-4 sm:px-6 bg-white border-b border-gray-100 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bar phone by model name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="text-xs text-gray-500 font-semibold">
              Showing {filteredProducts.length} of {barProducts.length} models
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-y-auto flex-1 p-4 sm:p-6">
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-700">No Bar Phones Found</h3>
                <p className="text-xs text-gray-400 max-w-sm">
                  {searchQuery ? 'No bar phone matches your search query.' : 'You haven\'t added any bar phones yet. Click "Add Bar Phone" to get started.'}
                </p>
                <button
                  onClick={() => onAddProduct(true)}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  + Add First Bar Phone
                </button>
              </div>
            ) : (
              <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] sm:text-xs font-black uppercase text-gray-500 tracking-wider">
                      <th className="px-4 py-3.5">Model (মডেল)</th>
                      <th className="px-4 py-3.5 text-right">Retail Price (ক্রয় মূল্য)</th>
                      <th className="px-4 py-3.5 text-right">Customer Price (বিক্রয় মূল্য)</th>
                      <th className="px-4 py-3.5 text-center">Quantity (পরিমাণ)</th>
                      <th className="px-4 py-3.5 text-center">Actions (অ্যাকশন)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white text-xs sm:text-sm">
                    {filteredProducts.map(p => (
                      <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-gray-900">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            <div>
                              <span>{p.name}</span>
                              {p.color && (
                                <span className="ml-2 text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-normal">
                                  {p.color}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-semibold text-gray-700">
                          ৳{(Number(p.purchase_price) || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600">
                          ৳{(Number(p.selling_price) || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                            (Number(p.quantity) || 0) > 0 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'bg-red-50 text-red-600 border border-red-200'
                          }`}>
                            {Number(p.quantity) || 0} Pcs
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onSellProduct(p, true)}
                              disabled={(Number(p.quantity) || 0) <= 0}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs flex items-center gap-1"
                              title="Sell Product"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" /> Sell
                            </button>
                            <button
                              onClick={() => onEditProduct(p)}
                              className="p-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteProduct(p.id)}
                              className="p-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Bar Phone Inventory Management</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-black text-white font-bold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
