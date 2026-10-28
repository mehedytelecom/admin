import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Check, Package, Smartphone, ChevronDown, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { getBrandFromProductName, getBrandBadgeStyle } from '../lib/brandUtils';

interface ProductSelectComboboxProps {
  products: Product[];
  selectedProductId: string;
  onSelect: (productId: string) => void;
  accentColor?: 'emerald' | 'blue' | 'orange';
  label?: string;
  required?: boolean;
}

export const ProductSelectCombobox: React.FC<ProductSelectComboboxProps> = ({
  products,
  selectedProductId,
  onSelect,
  accentColor = 'emerald',
  label = 'Select Product (প্রোডাক্ট পছন্দ করুন)',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Selected product object
  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || null;
  }, [products, selectedProductId]);

  // Extract all unique brands available in the products list
  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach(p => {
      const b = p.brand || getBrandFromProductName(p.name);
      if (b && b !== 'Other') brandSet.add(b);
    });

    // Sort brands: Helio & Honor first, then alphabetical
    const sorted = Array.from(brandSet).sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      if (aLower.includes('helio')) return -1;
      if (bLower.includes('helio')) return 1;
      if (aLower.includes('honor')) return -1;
      if (bLower.includes('honor')) return 1;
      return a.localeCompare(b);
    });

    return sorted;
  }, [products]);

  // Filter products based on search query, brand filter, and prioritize matches
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products
      .filter(p => {
        // Exclude accessories from phone sales dropdown
        if (p.is_accessory) return false;

        const brand = (p.brand || getBrandFromProductName(p.name)).toLowerCase();
        const name = p.name.toLowerCase();
        const ramRom = `${p.ram || ''}/${p.rom || ''}`.toLowerCase();
        const condition = p.condition === 'used' ? 'used সেকেন্ড হ্যান্ড পুরাতন' : 'new ব্র্যান্ড নিউ নতুন';

        // Brand filter pill
        if (selectedBrandFilter !== 'all') {
          const targetBrand = selectedBrandFilter.toLowerCase();
          if (!brand.includes(targetBrand) && !name.includes(targetBrand)) {
            return false;
          }
        }

        // Search query
        if (!query) return true;

        // Check if query matches brand, name, specs, or condition
        return (
          brand.includes(query) ||
          name.includes(query) ||
          ramRom.includes(query) ||
          condition.includes(query)
        );
      })
      .sort((a, b) => {
        // 1. In stock products first
        const aInStock = (a.quantity || 0) > 0 ? 1 : 0;
        const bInStock = (b.quantity || 0) > 0 ? 1 : 0;
        if (bInStock !== aInStock) return bInStock - aInStock;

        // 2. If query exists, prioritize items where brand or name starts with query
        if (query) {
          const aBrand = (a.brand || getBrandFromProductName(a.name)).toLowerCase();
          const bBrand = (b.brand || getBrandFromProductName(b.name)).toLowerCase();
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();

          const aStartsBrand = aBrand.startsWith(query);
          const bStartsBrand = bBrand.startsWith(query);
          if (aStartsBrand && !bStartsBrand) return -1;
          if (!aStartsBrand && bStartsBrand) return 1;

          const aStartsName = aName.startsWith(query);
          const bStartsName = bName.startsWith(query);
          if (aStartsName && !bStartsName) return -1;
          if (!aStartsName && bStartsName) return 1;
        }

        // 3. Alphabetical sort
        return a.name.localeCompare(b.name);
      });
  }, [products, searchQuery, selectedBrandFilter]);

  // Reset highlighted index when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredProducts.length, searchQuery, selectedBrandFilter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredProducts.length - 1 ? prev + 1 : prev));
      scrollIntoView(highlightedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
      scrollIntoView(highlightedIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const product = filteredProducts[highlightedIndex];
      if (product) {
        onSelect(product.id);
        setIsOpen(false);
        setSearchQuery('');
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const scrollIntoView = (index: number) => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('[data-product-item]');
      const target = items[index] as HTMLElement;
      if (target) {
        target.scrollIntoView({ block: 'nearest' });
      }
    }
  };

  const themeClasses = {
    emerald: {
      ring: 'focus-within:ring-emerald-500 focus-within:border-emerald-500',
      activeBorder: 'border-emerald-500',
      activeBg: 'bg-emerald-50 text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      text: 'text-emerald-600',
      itemHover: 'hover:bg-emerald-50/70',
      itemActive: 'bg-emerald-50 text-emerald-900 font-bold'
    },
    blue: {
      ring: 'focus-within:ring-blue-500 focus-within:border-blue-500',
      activeBorder: 'border-blue-500',
      activeBg: 'bg-blue-50 text-blue-700',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      text: 'text-blue-600',
      itemHover: 'hover:bg-blue-50/70',
      itemActive: 'bg-blue-50 text-blue-900 font-bold'
    },
    orange: {
      ring: 'focus-within:ring-orange-500 focus-within:border-orange-500',
      activeBorder: 'border-orange-500',
      activeBg: 'bg-orange-50 text-orange-700',
      badge: 'bg-orange-100 text-orange-800 border-orange-200',
      text: 'text-orange-600',
      itemHover: 'hover:bg-orange-50/70',
      itemActive: 'bg-orange-50 text-orange-900 font-bold'
    }
  }[accentColor];

  return (
    <div className="relative w-full" ref={containerRef} onKeyDown={handleKeyDown}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
          <Smartphone className={`w-3.5 h-3.5 ${themeClasses.text}`} />
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
        <span className="text-[11px] text-gray-500 font-medium">
          কিবোর্ডে কোম্পানির নাম লিখুন (যেমন: S, V, Helio)
        </span>
      </div>

      {/* Hidden input for HTML form validation */}
      {required && (
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          style={{ opacity: 0, width: 0, height: 0, position: 'absolute', pointerEvents: 'none' }}
          value={selectedProductId}
          onChange={() => {}}
          required
        />
      )}

      {/* Selected Product Banner (if selected and dropdown closed) */}
      {selectedProduct && !isOpen ? (
        <div 
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => searchInputRef.current?.focus(), 50);
          }}
          className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all bg-white shadow-xs ${themeClasses.activeBorder}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${themeClasses.badge}`}>
              <Package className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-sm text-gray-900 truncate">
                  {selectedProduct.name}
                </span>
                {selectedProduct.condition === 'used' ? (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    Used
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    New
                  </span>
                )}
                {selectedProduct.ram && selectedProduct.rom && (
                  <span className="text-[11px] text-gray-500 font-medium">
                    ({selectedProduct.ram}/{selectedProduct.rom})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs">
                <span className={`font-black ${themeClasses.text}`}>
                  ৳{selectedProduct.selling_price.toLocaleString()}
                </span>
                <span className="text-gray-300">•</span>
                <span className={`text-[11px] font-bold ${selectedProduct.quantity > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {selectedProduct.quantity > 0 ? `স্টক: ${selectedProduct.quantity} Pcs` : 'স্টক শেষ'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect('');
                setSearchQuery('');
                setIsOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="রিমুভ করুন"
            >
              <X className="w-4 h-4" />
            </button>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${themeClasses.activeBg}`}>
              বদলান ▾
            </span>
          </div>
        </div>
      ) : (
        /* Search Input Box */
        <div className={`relative flex items-center rounded-xl border border-gray-300 bg-white transition-all shadow-xs ${themeClasses.ring}`}>
          <Search className="w-4 h-4 text-gray-400 ml-3.5 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="কোম্পানি বা মডেলের নাম লিখুন (যেমন: Helio, Honor, Samsung, Vivo, Xiaomi)..."
            className="w-full px-3 py-2.5 outline-none text-sm font-medium bg-transparent placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              className="p-1 mr-1 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 mr-1 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Quick Company / Brand Filter Pills */}
          <div className="p-2.5 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                কোম্পানি অনুযায়ী দ্রুত ফিল্টার:
              </span>
              <span className="text-[10px] text-gray-400">
                {filteredProducts.length} টি প্রোডাক্ট পাওয়া গেছে
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedBrandFilter('all')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
                  selectedBrandFilter === 'all'
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                সব ({products.filter(p => !p.is_accessory).length})
              </button>
              {availableBrands.map(brand => {
                const count = products.filter(p => {
                  if (p.is_accessory) return false;
                  const b = p.brand || getBrandFromProductName(p.name);
                  return b.toLowerCase().includes(brand.toLowerCase());
                }).length;

                const style = getBrandBadgeStyle(brand);
                const isSelected = selectedBrandFilter.toLowerCase() === brand.toLowerCase();

                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => {
                      if (selectedBrandFilter.toLowerCase() === brand.toLowerCase()) {
                        setSelectedBrandFilter('all');
                      } else {
                        setSelectedBrandFilter(brand);
                      }
                      searchInputRef.current?.focus();
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg shrink-0 transition-all cursor-pointer border ${
                      isSelected
                        ? `${style.accent} text-white shadow-xs border-transparent`
                        : `${style.bg} ${style.text} ${style.border} hover:opacity-80`
                    }`}
                  >
                    {brand} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Items List */}
          <div ref={listRef} className="max-h-72 overflow-y-auto divide-y divide-gray-100">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Package className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-700">কোন প্রোডাক্ট পাওয়া যায়নি</p>
                <p className="text-xs text-gray-400">
                  অন্য কোনো কোম্পানি বা মডেলের নাম লিখে চেষ্টা করুন
                </p>
                {selectedBrandFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedBrandFilter('all')}
                    className="text-xs text-blue-600 font-bold hover:underline mt-1"
                  >
                    সব ব্র্যান্ডের তালিকা দেখুন
                  </button>
                )}
              </div>
            ) : (
              filteredProducts.map((p, index) => {
                const brand = p.brand || getBrandFromProductName(p.name);
                const brandStyle = getBrandBadgeStyle(brand);
                const isSelected = p.id === selectedProductId;
                const isHighlighted = index === highlightedIndex;
                const isOutOfStock = (p.quantity || 0) <= 0;

                return (
                  <div
                    key={p.id}
                    data-product-item
                    onClick={() => {
                      onSelect(p.id);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`p-3 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? themeClasses.itemActive
                        : isHighlighted
                        ? themeClasses.itemHover
                        : 'hover:bg-gray-50'
                    } ${isOutOfStock ? 'opacity-60 bg-gray-50/50' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${brandStyle.bg} ${brandStyle.border} ${brandStyle.text}`}>
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded border ${brandStyle.bg} ${brandStyle.text} ${brandStyle.border}`}>
                            {brand}
                          </span>
                          <span className="font-bold text-sm text-gray-900 truncate">
                            {p.name}
                          </span>
                          {p.condition === 'used' ? (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                              Used
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                              New
                            </span>
                          )}
                          {p.ram && p.rom && (
                            <span className="text-xs text-gray-500 font-medium">
                              ({p.ram}/{p.rom})
                            </span>
                          )}
                        </div>
                        {p.condition_note && (
                          <p className="text-[11px] text-amber-700 italic truncate mt-0.5">
                            {p.condition_note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <div className="text-sm font-black text-gray-900">
                        ৳{p.selling_price.toLocaleString()}
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-800 font-mono'
                          }`}
                        >
                          {isOutOfStock ? 'স্টক নেই' : `Stock: ${p.quantity}`}
                        </span>
                        {isSelected && (
                          <Check className={`w-3.5 h-3.5 ${themeClasses.text} ml-1`} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Guide */}
          <div className="p-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 px-3">
            <span>↑↓ কী দিয়ে সিলেক্ট করুন, Enter চাপুন</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-800 font-bold cursor-pointer"
            >
              বন্ধ করুন (Esc)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
