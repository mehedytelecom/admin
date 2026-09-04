import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronLeft, 
  Search, 
  Smartphone, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Tag,
  Boxes
} from 'lucide-react';
import { Product } from '../types';
import { groupProductsByBrand, getBrandBadgeStyle, BrandStockSummary } from '../lib/brandUtils';

interface BrandStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  totalQuantity: number;
  onSellProduct?: (product: Product, isCashSale?: boolean) => void;
}

export const BrandStockModal: React.FC<BrandStockModalProps> = ({
  isOpen,
  onClose,
  products,
  totalQuantity,
  onSellProduct
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [conditionFilter, setConditionFilter] = useState<'all' | 'new' | 'used'>('all');
  const [availableOnly, setAvailableOnly] = useState(true);

  // Group products into brand summaries
  const brandSummaries = useMemo(() => {
    return groupProductsByBrand(products);
  }, [products]);

  // Filtered brands for brand selection view
  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return brandSummaries;
    const q = searchQuery.toLowerCase();
    return brandSummaries.filter(b => 
      b.brand.toLowerCase().includes(q) ||
      b.products.some(p => p.name.toLowerCase().includes(q))
    );
  }, [brandSummaries, searchQuery]);

  // Selected brand data
  const currentBrandData = useMemo(() => {
    if (!selectedBrand) return null;
    return brandSummaries.find(b => b.brand === selectedBrand) || null;
  }, [brandSummaries, selectedBrand]);

  // Filtered products within selected brand
  const filteredBrandProducts = useMemo(() => {
    if (!currentBrandData) return [];
    let list = currentBrandData.products;

    if (availableOnly) {
      list = list.filter(p => (p.quantity || 0) > 0);
    }

    if (conditionFilter !== 'all') {
      list = list.filter(p => (p.condition || 'new') === conditionFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.ram && p.ram.toLowerCase().includes(q)) ||
        (p.rom && p.rom.toLowerCase().includes(q)) ||
        (p.color && p.color.toLowerCase().includes(q)) ||
        (p.imeis && p.imeis.some(i => i.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [currentBrandData, availableOnly, conditionFilter, searchQuery]);

  const handleOpenBrand = (brand: string) => {
    setSelectedBrand(brand);
    setSearchQuery('');
  };

  const handleBackToBrands = () => {
    setSelectedBrand(null);
    setSearchQuery('');
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
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col border border-gray-100"
        >
          {/* Modal Header */}
          <div className="p-4 sm:p-6 border-b border-gray-150 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {selectedBrand ? (
                <button
                  type="button"
                  onClick={handleBackToBrands}
                  className="p-2 -ml-1 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors flex items-center gap-1 font-bold text-xs shadow-xs cursor-pointer"
                  title="Back to all brands"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">All Brands</span>
                </button>
              ) : (
                <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200">
                  <Boxes className="w-6 h-6" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                    {selectedBrand ? `${selectedBrand} — Stock List` : 'Total Quantity by Brand'}
                  </h2>
                  <span className="text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {selectedBrand && currentBrandData
                      ? `${currentBrandData.totalQuantity} Pcs Available`
                      : `${totalQuantity} Pcs Total`}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedBrand
                    ? `Showing available inventory models for ${selectedBrand}`
                    : 'Select any brand below to view available model stock'}
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

          {/* Quick Brand Switcher Pills (when a brand is selected) */}
          {selectedBrand && (
            <div className="px-4 sm:px-6 py-2 bg-slate-50 border-b border-gray-150 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
              <span className="text-[11px] font-bold text-gray-400 uppercase shrink-0 mr-1">Brands:</span>
              <button
                type="button"
                onClick={handleBackToBrands}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
              >
                ← View All ({brandSummaries.length})
              </button>
              {brandSummaries.map(b => {
                const isCurrent = b.brand === selectedBrand;
                const style = getBrandBadgeStyle(b.brand);
                return (
                  <button
                    key={b.brand}
                    type="button"
                    onClick={() => handleOpenBrand(b.brand)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg shrink-0 transition-all border ${
                      isCurrent
                        ? `${style.bg} ${style.text} ${style.border} ring-2 ring-blue-400 shadow-xs`
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span>{b.brand}</span>
                    <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                      b.totalQuantity > 0 ? 'bg-blue-100 text-blue-700 font-extrabold' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {b.totalQuantity}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="p-3 sm:p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={selectedBrand ? `Search model in ${selectedBrand}...` : 'Search brand or model...'}
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {selectedBrand && (
              <div className="flex items-center gap-2 flex-wrap">
                {/* Available only toggle */}
                <button
                  type="button"
                  onClick={() => setAvailableOnly(!availableOnly)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                    availableOnly 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs' 
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${availableOnly ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span>Available Only</span>
                </button>

                {/* Condition filter */}
                <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setConditionFilter('all')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      conditionFilter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setConditionFilter('new')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      conditionFilter === 'new' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    New
                  </button>
                  <button
                    type="button"
                    onClick={() => setConditionFilter('used')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      conditionFilter === 'used' ? 'bg-white text-amber-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Used
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/40">
            {/* VIEW 1: BRAND SELECTION GRID */}
            {!selectedBrand && (
              <div>
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <span>Choose a Brand ({filteredBrands.length})</span>
                  <span>Total Available Stock: {totalQuantity} Pcs</span>
                </div>

                {filteredBrands.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
                    <Smartphone className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 font-bold text-sm">No brands matched &quot;{searchQuery}&quot;</p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Clear Search
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {filteredBrands.map(b => {
                      const style = getBrandBadgeStyle(b.brand);
                      const hasStock = b.totalQuantity > 0;
                      return (
                        <div
                          key={b.brand}
                          onClick={() => handleOpenBrand(b.brand)}
                          className={`group bg-white p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            hasStock
                              ? 'border-gray-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-50/70 hover:-translate-y-0.5'
                              : 'border-gray-150 opacity-70 hover:opacity-100 hover:border-gray-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2.5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm uppercase ${style.bg} ${style.text} border ${style.border} shrink-0 shadow-xs`}>
                                  {b.brand.substring(0, 2)}
                                </div>
                                <div className="min-w-0">
                                  <h3 className="text-base font-black text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                    {b.brand}
                                  </h3>
                                  <p className="text-[11px] text-gray-400 font-medium">
                                    {b.totalModelsCount} {b.totalModelsCount === 1 ? 'Model' : 'Models'}
                                  </p>
                                </div>
                              </div>

                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 border ${
                                hasStock
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-red-50 text-red-600 border-red-100'
                              }`}>
                                {hasStock ? `${b.availableModelsCount} In Stock` : 'Out of Stock'}
                              </span>
                            </div>

                            {/* Quantity highlight */}
                            <div className="flex items-baseline gap-1.5 my-2">
                              <span className={`text-2xl font-black ${hasStock ? 'text-blue-600' : 'text-gray-400'}`}>
                                {b.totalQuantity}
                              </span>
                              <span className="text-xs font-bold text-gray-500">Pcs Available</span>
                            </div>
                          </div>

                          {/* Condition mini breakdown & click cue */}
                          <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2 text-gray-500">
                              {b.newQuantity > 0 && (
                                <span className="font-semibold text-gray-700">New: <b className="text-blue-600">{b.newQuantity}</b></span>
                              )}
                              {b.usedQuantity > 0 && (
                                <span className="font-semibold text-gray-700">Used: <b className="text-amber-600">{b.usedQuantity}</b></span>
                              )}
                            </div>
                            <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                              View List →
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: SELECTED BRAND'S AVAILABLE PRODUCT LIST */}
            {selectedBrand && currentBrandData && (
              <div className="space-y-4">
                {/* Brand Status Card */}
                <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${getBrandBadgeStyle(currentBrandData.brand).bg} ${getBrandBadgeStyle(currentBrandData.brand).text} border ${getBrandBadgeStyle(currentBrandData.brand).border}`}>
                      {currentBrandData.brand.substring(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-gray-900">{currentBrandData.brand}</h3>
                        <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                          Verified Brand
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Total {currentBrandData.totalQuantity} Pcs available across {currentBrandData.availableModelsCount} models
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <div className="px-3 py-1.5 bg-blue-50 rounded-xl border border-blue-100 text-center">
                      <p className="text-[10px] font-bold text-blue-600 uppercase">Available</p>
                      <p className="text-base font-black text-blue-900">{currentBrandData.totalQuantity} <span className="text-[10px] font-normal">Pcs</span></p>
                    </div>
                    <div className="px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase">New</p>
                      <p className="text-base font-black text-emerald-800">{currentBrandData.newQuantity} <span className="text-[10px] font-normal">Pcs</span></p>
                    </div>
                    <div className="px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100 text-center">
                      <p className="text-[10px] font-bold text-amber-600 uppercase">Used</p>
                      <p className="text-base font-black text-amber-800">{currentBrandData.usedQuantity} <span className="text-[10px] font-normal">Pcs</span></p>
                    </div>
                  </div>
                </div>

                {/* Available Models List Table */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                  <div className="p-3.5 bg-slate-50/70 border-b border-gray-200 flex items-center justify-between text-xs font-bold text-gray-600">
                    <span>Available Models ({filteredBrandProducts.length})</span>
                    <span className="text-gray-400 font-medium text-[11px]">
                      Click &quot;Sell&quot; to quickly start a sale
                    </span>
                  </div>

                  {filteredBrandProducts.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="font-semibold text-sm">No models found under current filters.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setAvailableOnly(false);
                          setConditionFilter('all');
                        }}
                        className="mt-2.5 px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-150">
                      {filteredBrandProducts.map((product) => {
                        const isAvailable = (product.quantity || 0) > 0;
                        return (
                          <div
                            key={product.id}
                            className="p-4 hover:bg-blue-50/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-gray-200 flex items-center justify-center shrink-0 text-gray-500">
                                <Smartphone className="w-5 h-5" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-sm font-black text-gray-900 tracking-tight">
                                    {product.name}
                                  </h4>
                                  
                                  {product.condition === 'used' ? (
                                    <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                      Used
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                      New
                                    </span>
                                  )}

                                  {(product.ram || product.rom) && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                                      {product.ram || ''}{product.ram && product.rom ? '/' : ''}{product.rom || ''}
                                    </span>
                                  )}

                                  {product.color && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                                      <span
                                        className="w-2 h-2 rounded-full border border-black/10"
                                        style={{ backgroundColor: product.color.toLowerCase() }}
                                      />
                                      {product.color}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
                                  <span>
                                    Selling Price: <b className="text-gray-900 font-extrabold">৳{product.selling_price.toLocaleString()}</b>
                                  </span>
                                  {product.purchase_price > 0 && (
                                    <span className="text-gray-400">
                                      Buy: ৳{product.purchase_price.toLocaleString()}
                                    </span>
                                  )}
                                  {product.imeis && product.imeis.length > 0 && (
                                    <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                                      IMEI: {product.imeis.length} saved
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Quantity Badge & Quick Actions */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                              <div className="text-left sm:text-right">
                                <span className={`inline-block text-xs sm:text-sm font-black px-3 py-1 rounded-xl border ${
                                  isAvailable
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-red-50 text-red-600 border-red-200'
                                }`}>
                                  {isAvailable ? `${product.quantity} Pcs In Stock` : 'Out of Stock'}
                                </span>
                              </div>

                              {onSellProduct && isAvailable && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onSellProduct(product, false);
                                      onClose();
                                    }}
                                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                                    title="Regular EMI / Guarantee Sale"
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
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-3.5 sm:p-4 border-t border-gray-150 bg-white flex items-center justify-between text-xs text-gray-500">
            <div>
              {selectedBrand ? (
                <button
                  type="button"
                  onClick={handleBackToBrands}
                  className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to all brands
                </button>
              ) : (
                <span>Click any brand above to view its available inventory</span>
              )}
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
