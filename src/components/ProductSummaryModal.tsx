import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Layers, 
  Smartphone, 
  ShoppingCart, 
  CreditCard, 
  ArrowUpDown, 
  CheckCircle2, 
  Printer, 
  Download,
  AlertCircle,
  Tag
} from 'lucide-react';
import { Product } from '../types';

interface ProductSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSellProduct?: (product: Product, isCashSale?: boolean) => void;
  onEditProduct?: (product: Product) => void;
}

type SortField = 'name' | 'profit' | 'quantity' | 'mrp' | 'retail';

export const ProductSummaryModal: React.FC<ProductSummaryModalProps> = ({
  isOpen,
  onClose,
  products,
  onSellProduct,
  onEditProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [conditionFilter, setConditionFilter] = useState<'all' | 'new' | 'used'>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Overall calculations for all products
  const totals = useMemo(() => {
    let totalQty = 0;
    let totalRetailVal = 0;
    let totalMrpVal = 0;
    let totalProfitVal = 0;
    let inStockModels = 0;

    products.forEach(p => {
      const qty = p.quantity || 0;
      totalQty += qty;
      if (qty > 0) inStockModels += 1;
      totalRetailVal += (p.purchase_price || 0) * qty;
      totalMrpVal += (p.selling_price || 0) * qty;
      totalProfitVal += ((p.selling_price || 0) - (p.purchase_price || 0)) * qty;
    });

    return {
      totalModels: products.length,
      inStockModels,
      totalQuantity: totalQty,
      totalRetail: totalRetailVal,
      totalMrp: totalMrpVal,
      totalProfit: totalProfitVal
    };
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (inStockOnly) {
      list = list.filter(p => (p.quantity || 0) > 0);
    }

    if (conditionFilter !== 'all') {
      list = list.filter(p => (p.condition || 'new') === conditionFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.ram && p.ram.toLowerCase().includes(q)) ||
        (p.rom && p.rom.toLowerCase().includes(q)) ||
        (p.color && p.color.toLowerCase().includes(q)) ||
        (p.condition_note && p.condition_note.toLowerCase().includes(q)) ||
        (p.imeis && p.imeis.some(i => i.toLowerCase().includes(q)))
      );
    }

    // Sort list
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      } else if (sortField === 'profit') {
        const profitA = (a.selling_price || 0) - (a.purchase_price || 0);
        const profitB = (b.selling_price || 0) - (b.purchase_price || 0);
        comparison = profitA - profitB;
      } else if (sortField === 'quantity') {
        comparison = (a.quantity || 0) - (b.quantity || 0);
      } else if (sortField === 'mrp') {
        comparison = (a.selling_price || 0) - (b.selling_price || 0);
      } else if (sortField === 'retail') {
        comparison = (a.purchase_price || 0) - (b.purchase_price || 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [products, inStockOnly, conditionFilter, searchQuery, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'name' ? 'asc' : 'desc');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col border border-indigo-100"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">
                    Product Summary (প্রোডাক্ট সামারি)
                  </h2>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {totals.totalModels} Models • {totals.totalQuantity} Pcs
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Complete list of products with Name, Variant, Retail Price, MRP, and Profit breakdown
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-colors shadow-2xs"
                title="Print this product summary"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
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

          {/* Top Summary Stats Bar */}
          <div className="px-4 sm:px-6 py-3 bg-indigo-50/30 border-b border-indigo-100 grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 text-center">
            <div className="bg-white p-2.5 rounded-xl border border-indigo-100/70 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Total Stock</p>
              <p className="text-base sm:text-lg font-black text-indigo-900">
                {totals.totalQuantity} <span className="text-xs font-normal text-gray-500">Pcs</span>
              </p>
              <p className="text-[10px] text-gray-400">{totals.inStockModels} in stock / {totals.totalModels} models</p>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-indigo-100/70 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Total Retail (ক্রয়)</p>
              <p className="text-base sm:text-lg font-black text-gray-900">
                ৳{totals.totalRetail.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400">Total purchase cost</p>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-indigo-100/70 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Total MRP (বিক্রয়)</p>
              <p className="text-base sm:text-lg font-black text-blue-600">
                ৳{totals.totalMrp.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400">Total selling value</p>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-indigo-100/70 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Est. Stock Profit</p>
              <p className="text-base sm:text-lg font-black text-emerald-600">
                +৳{totals.totalProfit.toLocaleString()}
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold">Total margin on stock</p>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white p-2.5 rounded-xl border border-indigo-100/70 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Avg Margin / Unit</p>
              <p className="text-base sm:text-lg font-black text-purple-700">
                ৳{totals.totalQuantity > 0 ? Math.round(totals.totalProfit / totals.totalQuantity).toLocaleString() : 0}
              </p>
              <p className="text-[10px] text-purple-600 font-medium">Per phone profit</p>
            </div>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="p-3 sm:p-4 border-b border-gray-150 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by product name, variant (RAM/ROM), or color..."
                className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm bg-gray-50 hover:bg-gray-100/60 focus:bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
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

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* In-Stock Toggle */}
              <button
                type="button"
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  inStockOnly
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${inStockOnly ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span>In Stock Only</span>
              </button>

              {/* Condition Filter */}
              <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setConditionFilter('all')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    conditionFilter === 'all' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setConditionFilter('new')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    conditionFilter === 'new' ? 'bg-white text-blue-600 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  New
                </button>
                <button
                  type="button"
                  onClick={() => setConditionFilter('used')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    conditionFilter === 'used' ? 'bg-white text-amber-600 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Used
                </button>
              </div>

              {/* Sort selector for mobile / dropdown */}
              <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-xl">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={sortField}
                  onChange={e => handleSort(e.target.value as SortField)}
                  className="bg-transparent font-bold text-gray-800 outline-none cursor-pointer text-xs"
                >
                  <option value="name">Sort: Name</option>
                  <option value="profit">Sort: Profit</option>
                  <option value="quantity">Sort: Stock Qty</option>
                  <option value="retail">Sort: Retail Price</option>
                  <option value="mrp">Sort: MRP</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="ml-1 text-[11px] font-black text-indigo-600 uppercase px-1 hover:text-indigo-800"
                  title="Toggle Ascending / Descending"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Product Summary Table */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-50/50">
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
                <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-700 font-bold text-base">No products matched your criteria</p>
                <p className="text-xs text-gray-400 mt-1">Try clearing search keywords or resetting filters</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setInStockOnly(false);
                    setConditionFilter('all');
                  }}
                  className="mt-3 px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                {/* Desktop Table Header */}
                <div className="hidden lg:grid grid-cols-12 gap-2 px-4 py-3 bg-slate-100 border-b border-gray-200 text-[11px] font-black text-gray-600 uppercase tracking-wider items-center">
                  <div className="col-span-4 cursor-pointer hover:text-indigo-600 flex items-center gap-1" onClick={() => handleSort('name')}>
                    <span>Product Name & Variant</span>
                    {sortField === 'name' && <span className="text-indigo-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                  <div className="col-span-1 text-center cursor-pointer hover:text-indigo-600" onClick={() => handleSort('quantity')}>
                    <span>Stock</span>
                    {sortField === 'quantity' && <span className="text-indigo-600 ml-0.5">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                  <div className="col-span-2 text-right cursor-pointer hover:text-indigo-600" onClick={() => handleSort('retail')}>
                    <span>Retail Price (ক্রয়)</span>
                    {sortField === 'retail' && <span className="text-indigo-600 ml-0.5">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                  <div className="col-span-2 text-right cursor-pointer hover:text-indigo-600" onClick={() => handleSort('mrp')}>
                    <span>MRP (বিক্রয়)</span>
                    {sortField === 'mrp' && <span className="text-indigo-600 ml-0.5">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                  <div className="col-span-2 text-right cursor-pointer hover:text-indigo-600" onClick={() => handleSort('profit')}>
                    <span>Profit (লাভ)</span>
                    {sortField === 'profit' && <span className="text-indigo-600 ml-0.5">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-150">
                  {filteredProducts.map((product, idx) => {
                    const isAvailable = (product.quantity || 0) > 0;
                    const profitPerUnit = (product.selling_price || 0) - (product.purchase_price || 0);
                    const totalProfitOnStock = profitPerUnit * (product.quantity || 0);

                    return (
                      <div
                        key={product.id}
                        className="p-3.5 sm:p-4 hover:bg-indigo-50/30 transition-colors flex flex-col lg:grid lg:grid-cols-12 gap-2.5 sm:gap-2 items-start lg:items-center"
                      >
                        {/* 1. Product Name & Variant */}
                        <div className="w-full lg:col-span-4 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold text-gray-400">
                              {idx + 1}.
                            </span>

                            {product.condition === 'used' ? (
                              <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                Used
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                New
                              </span>
                            )}

                            <h4 className="text-sm font-black text-gray-900 tracking-tight">
                              {product.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                            {(product.ram || product.rom) ? (
                              <span className="font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-[11px] border border-gray-200">
                                {product.ram || ''}{product.ram && product.rom ? ' / ' : ''}{product.rom || ''}
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">No variant</span>
                            )}

                            {product.color && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                                <span
                                  className="w-2 h-2 rounded-full border border-black/10"
                                  style={{ backgroundColor: product.color.toLowerCase() }}
                                />
                                {product.color}
                              </span>
                            )}

                            {product.imeis && product.imeis.length > 0 && (
                              <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                                IMEI: {product.imeis.length}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 2. Stock Quantity */}
                        <div className="w-full lg:col-span-1 flex lg:justify-center items-center justify-between lg:text-center">
                          <span className="text-xs text-gray-500 lg:hidden font-bold">Stock Qty:</span>
                          <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-red-50 text-red-600 border-red-200'
                          }`}>
                            {product.quantity} Pcs
                          </span>
                        </div>

                        {/* 3. Retail Price (ক্রয় মূল্য) */}
                        <div className="w-full lg:col-span-2 flex lg:justify-end items-center justify-between lg:text-right">
                          <span className="text-xs text-gray-500 lg:hidden font-bold">Retail Price (ক্রয়):</span>
                          <div>
                            <span className="text-sm font-bold text-gray-800">
                              ৳{(product.purchase_price || 0).toLocaleString()}
                            </span>
                            <span className="hidden lg:block text-[10px] text-gray-400">Unit Cost</span>
                          </div>
                        </div>

                        {/* 4. MRP (বিক্রয় মূল্য) */}
                        <div className="w-full lg:col-span-2 flex lg:justify-end items-center justify-between lg:text-right">
                          <span className="text-xs text-gray-500 lg:hidden font-bold">MRP (বিক্রয়):</span>
                          <div>
                            <span className="text-sm font-black text-blue-600">
                              ৳{(product.selling_price || 0).toLocaleString()}
                            </span>
                            <span className="hidden lg:block text-[10px] text-blue-400">Unit MRP</span>
                          </div>
                        </div>

                        {/* 5. Profit (লাভ) */}
                        <div className="w-full lg:col-span-2 flex lg:justify-end items-center justify-between lg:text-right">
                          <span className="text-xs text-gray-500 lg:hidden font-bold">Profit (লাভ):</span>
                          <div>
                            <span className={`text-sm font-black ${
                              profitPerUnit >= 0 ? 'text-emerald-700' : 'text-red-600'
                            }`}>
                              {profitPerUnit >= 0 ? `+৳${profitPerUnit.toLocaleString()}` : `-৳${Math.abs(profitPerUnit).toLocaleString()}`}
                            </span>
                            {isAvailable && (
                              <span className="hidden lg:block text-[10px] font-bold text-emerald-600">
                                Stock: +৳{totalProfitOnStock.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 6. Quick Action */}
                        <div className="w-full lg:col-span-1 flex items-center justify-end lg:justify-center gap-1.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                          {onSellProduct && isAvailable ? (
                            <button
                              type="button"
                              onClick={() => {
                                onSellProduct(product, false);
                                onClose();
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95"
                              title="Sell this product"
                            >
                              <ShoppingCart className="w-3 h-3" />
                              <span>Sell</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">N/A</span>
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
              <span>Showing <b>{filteredProducts.length}</b> of <b>{products.length}</b> total models</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="sm:hidden px-3 py-1.5 bg-gray-100 text-gray-700 font-bold rounded-xl"
              >
                Print
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
