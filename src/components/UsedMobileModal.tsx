import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  RotateCcw, 
  Smartphone, 
  ShoppingCart, 
  CreditCard, 
  Edit2, 
  AlertCircle,
  TrendingUp,
  Tag,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { Product } from '../types';

interface UsedMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSellProduct?: (product: Product, isCashSale?: boolean) => void;
  onEditProduct?: (product: Product) => void;
}

export const UsedMobileModal: React.FC<UsedMobileModalProps> = ({
  isOpen,
  onClose,
  products,
  onSellProduct,
  onEditProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Filter only used products
  const usedProducts = useMemo(() => {
    return (products || []).filter(p => p && p.condition === 'used');
  }, [products]);

  // Summary statistics for used phones
  const stats = useMemo(() => {
    const totalModels = usedProducts.length;
    const totalQuantity = usedProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const inStockModels = usedProducts.filter(p => (p.quantity || 0) > 0).length;
    const totalBuyValue = usedProducts.reduce((sum, p) => sum + ((p.purchase_price || 0) * (p.quantity || 0)), 0);
    const totalSellValue = usedProducts.reduce((sum, p) => sum + ((p.selling_price || 0) * (p.quantity || 0)), 0);
    const totalProjectedProfit = totalSellValue - totalBuyValue;

    return {
      totalModels,
      totalQuantity,
      inStockModels,
      totalBuyValue,
      totalSellValue,
      totalProjectedProfit
    };
  }, [usedProducts]);

  // Filtered used products based on search & stock
  const filteredProducts = useMemo(() => {
    let list = usedProducts;

    if (inStockOnly) {
      list = list.filter(p => (p.quantity || 0) > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.ram && p.ram.toLowerCase().includes(q)) ||
        (p.rom && p.rom.toLowerCase().includes(q)) ||
        (p.color && p.color.toLowerCase().includes(q)) ||
        (p.condition_note && p.condition_note.toLowerCase().includes(q)) ||
        (p.imei_units && p.imei_units.some(u => (u.color && u.color.toLowerCase().includes(q)) || (u.imei1 && u.imei1.toLowerCase().includes(q)) || (u.imei2 && u.imei2.toLowerCase().includes(q)))) ||
        (p.imeis && p.imeis.some(i => i.toLowerCase().includes(q)))
      );
    }

    // Sort: In-stock first, then alphabetically
    return [...list].sort((a, b) => {
      const qtyDiff = (b.quantity || 0) - (a.quantity || 0);
      if (qtyDiff !== 0) return qtyDiff;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
  }, [usedProducts, inStockOnly, searchQuery]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col border border-amber-100"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-amber-100 bg-gradient-to-r from-amber-50/80 via-white to-orange-50/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-600 text-white shadow-md shadow-amber-200">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">
                    Used Mobile List (পুরাতন / ব্যবহৃত মোবাইল তালিকা)
                  </h2>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    {stats.totalQuantity} Pcs Available ({stats.totalModels} Models)
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  View model names, RAM/ROM variants, buy prices, sell prices, and condition notes
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stats Bar */}
          <div className="px-4 sm:px-6 py-3 bg-amber-50/40 border-b border-amber-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-center">
            <div className="bg-white p-2.5 rounded-xl border border-amber-100/80 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Total Stock</p>
              <p className="text-lg font-black text-amber-700">
                {stats.totalQuantity} <span className="text-xs font-semibold text-gray-500">Pcs</span>
              </p>
              <p className="text-[10px] text-gray-400">{stats.inStockModels} in stock / {stats.totalModels} models</p>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-amber-100/80 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Total Buy Price (ক্রয়)</p>
              <p className="text-lg font-black text-gray-800">
                ৳{stats.totalBuyValue.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400">Total purchase value</p>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-amber-100/80 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Total Sell Price (বিক্রয়)</p>
              <p className="text-lg font-black text-blue-600">
                ৳{stats.totalSellValue.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400">Total selling value</p>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-amber-100/80 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Projected Profit</p>
              <p className="text-lg font-black text-emerald-600">
                +৳{stats.totalProjectedProfit.toLocaleString()}
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold">Margin on stock</p>
            </div>
          </div>

          {/* Search & In-Stock Filter Bar */}
          <div className="p-3 sm:p-4 border-b border-gray-150 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search used mobile by model name, variant, or IMEI..."
                className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm bg-gray-50 hover:bg-gray-100/60 focus:bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  inStockOnly
                    ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${inStockOnly ? 'text-amber-700' : 'text-gray-400'}`} />
                <span>In Stock Only ({stats.inStockModels})</span>
              </button>
            </div>
          </div>

          {/* Product List Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-50/50">
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
                <Smartphone className="w-12 h-12 text-amber-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-800">
                  {usedProducts.length === 0 
                    ? 'No Used Mobile in Stock' 
                    : 'No Used Mobile Matched Your Search'}
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  {usedProducts.length === 0
                    ? 'You can add used phones using the "Add Product" button on the dashboard (select Used condition).'
                    : 'Try searching with a different model name or reset the in-stock filter.'}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setInStockOnly(false); }}
                    className="mt-4 px-4 py-2 bg-amber-50 text-amber-800 font-bold text-xs rounded-xl hover:bg-amber-100 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                {/* Table Header (Desktop) */}
                <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 bg-slate-100/70 border-b border-gray-200 text-[11px] font-black text-gray-600 uppercase tracking-wider">
                  <div className="col-span-4">Model Name & Variant</div>
                  <div className="col-span-2 text-center">Available Stock</div>
                  <div className="col-span-2 text-right">Buy Price (ক্রয়)</div>
                  <div className="col-span-2 text-right">Sell Price (বিক্রয়)</div>
                  <div className="col-span-2 text-right">Action</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-150">
                  {filteredProducts.map((product) => {
                    const isAvailable = (product.quantity || 0) > 0;
                    const profitPerUnit = (product.selling_price || 0) - (product.purchase_price || 0);

                    return (
                      <div
                        key={product.id}
                        className="p-4 hover:bg-amber-50/30 transition-colors flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center"
                      >
                        {/* 1. Model Name, Variant, Color & Condition Note */}
                        <div className="w-full md:col-span-4 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                              Used
                            </span>
                            <h4 className="text-sm font-black text-gray-900 tracking-tight">
                              {product.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {/* Variant (RAM / ROM) */}
                            {(product.ram || product.rom) ? (
                              <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                Variant: {product.ram || ''}{product.ram && product.rom ? ' / ' : ''}{product.rom || ''}
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">No variant</span>
                            )}

                            {/* Color */}
                            {product.color && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                  style={{ backgroundColor: product.color.toLowerCase() }}
                                />
                                {product.color}
                              </span>
                            )}
                          </div>

                          {/* Condition Note */}
                          {product.condition_note && (
                            <p className="text-[11px] text-amber-800 bg-amber-50/80 px-2 py-1 rounded-lg border border-amber-200/80 mt-1.5 line-clamp-2">
                              <b>Note:</b> {product.condition_note}
                            </p>
                          )}

                          {/* Saved IMEIs info */}
                          {product.imeis && product.imeis.length > 0 && (
                            <div className="mt-1 text-[10px] text-gray-500 font-mono flex items-center gap-1">
                              <span className="font-semibold text-gray-700">IMEI ({product.imeis.length}):</span>
                              <span className="truncate max-w-[200px]">{product.imeis.join(', ')}</span>
                            </div>
                          )}
                        </div>

                        {/* 2. Stock / Quantity */}
                        <div className="w-full md:col-span-2 flex md:justify-center items-center justify-between md:text-center">
                          <span className="text-xs text-gray-500 md:hidden font-bold">Stock Quantity:</span>
                          <span className={`text-xs sm:text-sm font-black px-2.5 py-1 rounded-xl border ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-red-50 text-red-600 border-red-200'
                          }`}>
                            {isAvailable ? `${product.quantity} Pcs In Stock` : 'Out of Stock'}
                          </span>
                        </div>

                        {/* 3. Buy Price (ক্রয় মূল্য) */}
                        <div className="w-full md:col-span-2 flex md:justify-end items-center justify-between md:text-right">
                          <span className="text-xs text-gray-500 md:hidden font-bold">Buy Price (ক্রয়):</span>
                          <div>
                            <span className="text-sm font-black text-gray-800">
                              ৳{product.purchase_price.toLocaleString()}
                            </span>
                            <span className="hidden md:block text-[10px] text-gray-400 font-medium">Purchase Cost</span>
                          </div>
                        </div>

                        {/* 4. Sell Price (বিক্রয় মূল্য) */}
                        <div className="w-full md:col-span-2 flex md:justify-end items-center justify-between md:text-right">
                          <span className="text-xs text-gray-500 md:hidden font-bold">Sell Price (বিক্রয়):</span>
                          <div>
                            <span className="text-base font-black text-blue-600">
                              ৳{product.selling_price.toLocaleString()}
                            </span>
                            <span className={`hidden md:block text-[10px] font-bold ${profitPerUnit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              Profit: +৳{profitPerUnit.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* 5. Actions */}
                        <div className="w-full md:col-span-2 flex items-center justify-end gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                          {onEditProduct && (
                            <button
                              type="button"
                              onClick={() => {
                                onEditProduct(product);
                                onClose();
                              }}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {onSellProduct && isAvailable && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  onSellProduct(product, false);
                                  onClose();
                                }}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                                title="Regular Sale"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Sale</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  onSellProduct(product, true);
                                  onClose();
                                }}
                                className="px-2.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                                title="Cash Sale"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Cash</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3.5 sm:p-4 border-t border-gray-150 bg-white flex items-center justify-between text-xs text-gray-500">
            <div>
              <span>Showing <b>{filteredProducts.length}</b> of <b>{usedProducts.length}</b> used models</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
