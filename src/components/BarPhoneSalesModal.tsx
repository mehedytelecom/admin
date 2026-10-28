import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Smartphone, 
  Calendar, 
  ChevronRight, 
  CreditCard, 
  TrendingUp,
  Package,
  User,
  Phone
} from 'lucide-react';
import { format, parseISO, isToday, isSameMonth } from 'date-fns';
import { Sale, Product } from '../types';
import { isBarPhoneSale } from '../lib/brandUtils';

interface BarPhoneSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sales: Sale[];
  products: Product[];
  onSelectSale: (sale: Sale) => void;
}

export const BarPhoneSalesModal: React.FC<BarPhoneSalesModalProps> = ({
  isOpen,
  onClose,
  sales,
  products,
  onSelectSale
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'this_month' | 'today'>('all');
  const [saleTypeFilter, setSaleTypeFilter] = useState<'all' | 'cash' | 'regular'>('all');

  // Filter bar phone sales accurately
  const barPhoneSales = useMemo(() => {
    return (sales || []).filter(sale => isBarPhoneSale(sale, products));
  }, [sales, products]);

  const getSaleProfit = (s: Sale) => {
    const matchedProd = products.find(p => p.id === s.product_id);
    if (matchedProd) {
      const salePrice = Number(s.actual_sale_price) || Number(matchedProd.selling_price) || 0;
      return salePrice - Number(matchedProd.purchase_price || 0);
    }
    return Number(s.profit) || 0;
  };

  // Overall Statistics for Bar Phone Sales
  const stats = useMemo(() => {
    const totalSoldPcs = barPhoneSales.reduce((sum, s) => sum + (s.quantity_sold || 1), 0);
    const totalRevenue = barPhoneSales.reduce((sum, s) => {
      const price = Number(s.actual_sale_price) || 0;
      return sum + price;
    }, 0);
    const totalProfit = barPhoneSales.reduce((sum, s) => sum + getSaleProfit(s), 0);

    const monthSales = barPhoneSales.filter(s => {
      try {
        return isSameMonth(parseISO(s.sale_date), new Date());
      } catch {
        return false;
      }
    });
    const monthSoldPcs = monthSales.reduce((sum, s) => sum + (s.quantity_sold || 1), 0);
    const monthRevenue = monthSales.reduce((sum, s) => sum + (Number(s.actual_sale_price) || 0), 0);
    const monthProfit = monthSales.reduce((sum, s) => sum + getSaleProfit(s), 0);

    const todaySales = barPhoneSales.filter(s => {
      try {
        return isToday(parseISO(s.sale_date));
      } catch {
        return false;
      }
    });
    const todaySoldPcs = todaySales.reduce((sum, s) => sum + (s.quantity_sold || 1), 0);

    return {
      totalSoldPcs,
      totalRevenue,
      totalProfit,
      monthSoldPcs,
      monthRevenue,
      monthProfit,
      todaySoldPcs
    };
  }, [barPhoneSales, products]);

  // Filtered sales based on user input & tabs
  const filteredSales = useMemo(() => {
    let result = barPhoneSales;

    // Time filter
    if (timeFilter === 'this_month') {
      result = result.filter(s => {
        try {
          return isSameMonth(parseISO(s.sale_date), new Date());
        } catch {
          return false;
        }
      });
    } else if (timeFilter === 'today') {
      result = result.filter(s => {
        try {
          return isToday(parseISO(s.sale_date));
        } catch {
          return false;
        }
      });
    }

    // Sale type filter
    if (saleTypeFilter === 'cash') {
      result = result.filter(s => s.is_cash_sale);
    } else if (saleTypeFilter === 'regular') {
      result = result.filter(s => !s.is_cash_sale);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(s => 
        (s.customer_name && s.customer_name.toLowerCase().includes(q)) ||
        (s.phone_number && s.phone_number.includes(q)) ||
        (s.product_name && s.product_name.toLowerCase().includes(q)) ||
        (s.imei && s.imei.toLowerCase().includes(q)) ||
        (s.application_id && s.application_id.toLowerCase().includes(q)) ||
        (s.nid_number && s.nid_number.toLowerCase().includes(q))
      );
    }

    // Sort by sale_date descending
    return [...result].sort((a, b) => {
      const dateA = new Date(a.sale_date).getTime() || 0;
      const dateB = new Date(b.sale_date).getTime() || 0;
      return dateB - dateA;
    });
  }, [barPhoneSales, timeFilter, saleTypeFilter, searchQuery]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col border border-cyan-100 dark:border-gray-800 text-gray-900 dark:text-gray-100"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-cyan-100 dark:border-gray-800 bg-gradient-to-r from-cyan-50/90 via-white to-blue-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-850 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-600 text-white shadow-md shadow-cyan-200">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">
                    Bar Phone Sale List (বার ফোন বিক্রয় তালিকা)
                  </h2>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                    মোট বিক্রয়: {stats.totalSoldPcs} Pcs
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  বাটন/বার ফোনের বিক্রয় হিস্টোরি, কাস্টমার তথ্য, আইএমইআই ও মোট লাভের তালিকা
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
          <div className="p-4 bg-gray-50/70 border-b border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-xl border border-gray-200/70 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Total Sold (মোট বিক্রয়)
              </span>
              <div className="text-xl font-black text-gray-900 mt-0.5">
                {stats.totalSoldPcs} <span className="text-xs font-bold text-gray-500">Pcs</span>
              </div>
              <span className="text-[11px] text-cyan-600 font-bold block mt-0.5">
                আজকের সেল: {stats.todaySoldPcs} Pcs
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-200/70 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                This Month (চলতি মাস)
              </span>
              <div className="text-xl font-black text-cyan-600 mt-0.5">
                {stats.monthSoldPcs} <span className="text-xs font-bold text-gray-500">Pcs</span>
              </div>
              <span className="text-[11px] text-gray-500 font-medium block mt-0.5">
                মূল্য: ৳{stats.monthRevenue.toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-200/70 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Total Revenue (মোট মূল্য)
              </span>
              <div className="text-xl font-black text-gray-900 mt-0.5">
                ৳{stats.totalRevenue.toLocaleString()}
              </div>
              <span className="text-[11px] text-gray-500 font-medium block mt-0.5">
                সর্বমোট বিক্রয় মূল্য
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-200/70 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Total Profit (মোট লাভ)
              </span>
              <div className="text-xl font-black text-emerald-600 mt-0.5">
                ৳{stats.totalProfit.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
                চলতি মাস: ৳{stats.monthProfit.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="বার ফোনের নাম, কাস্টমার নাম, ফোন বা IMEI লিখে খুঁজুন..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Time Filters */}
              <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTimeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    timeFilter === 'all' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  সব সময় ({stats.totalSoldPcs})
                </button>
                <button
                  type="button"
                  onClick={() => setTimeFilter('this_month')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    timeFilter === 'this_month' ? 'bg-white text-cyan-700 shadow-2xs' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  এই মাস ({stats.monthSoldPcs})
                </button>
                <button
                  type="button"
                  onClick={() => setTimeFilter('today')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    timeFilter === 'today' ? 'bg-white text-cyan-700 shadow-2xs' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  আজ ({stats.todaySoldPcs})
                </button>
              </div>

              {/* Type Filters */}
              <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSaleTypeFilter('all')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    saleTypeFilter === 'all' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500'
                  }`}
                >
                  সব
                </button>
                <button
                  type="button"
                  onClick={() => setSaleTypeFilter('cash')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    saleTypeFilter === 'cash' ? 'bg-orange-500 text-white shadow-2xs' : 'text-gray-500'
                  }`}
                >
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => setSaleTypeFilter('regular')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    saleTypeFilter === 'regular' ? 'bg-blue-600 text-white shadow-2xs' : 'text-gray-500'
                  }`}
                >
                  EMI/Regular
                </button>
              </div>
            </div>
          </div>

          {/* Sales List Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-gray-100 space-y-2">
            {filteredSales.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto border border-cyan-100">
                  <Smartphone className="w-7 h-7" />
                </div>
                <p className="text-base font-bold text-gray-800">
                  কোনো বার ফোনের বিক্রয় পাওয়া যায়নি
                </p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  {searchQuery ? 'আপনার সার্চকৃত কিওয়ার্ডের সাথে মিল রেখে কোনো বার ফোন বিক্রয় পাওয়া যায়নি।' : 'এখনো পর্যন্ত কোনো বার ফোন বিক্রয় করা হয়নি।'}
                </p>
              </div>
            ) : (
              filteredSales.map((sale) => {
                const salePrice = Number(sale.actual_sale_price) || 0;
                const profit = getSaleProfit(sale);
                let formattedDate = 'N/A';
                let formattedTime = '';
                try {
                  const dateObj = parseISO(sale.sale_date);
                  formattedDate = format(dateObj, 'dd MMMM yyyy');
                  formattedTime = format(dateObj, 'hh:mm a');
                } catch {
                  formattedDate = sale.sale_date || 'N/A';
                }

                return (
                  <div
                    key={sale.id}
                    onClick={() => onSelectSale(sale)}
                    className="p-4 bg-white hover:bg-cyan-50/40 rounded-2xl border border-gray-100 hover:border-cyan-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-cyan-100/80 text-cyan-800 flex items-center justify-center shrink-0 border border-cyan-200 font-bold">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-gray-900 text-sm group-hover:text-cyan-700 transition-colors truncate">
                            {sale.product_name}
                          </h4>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200">
                            Bar Phone
                          </span>
                          {sale.is_cash_sale ? (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-0.5">
                              <CreditCard className="w-2.5 h-2.5" /> Cash Sale
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                              Regular Sale
                            </span>
                          )}
                          {sale.color && (
                            <span className="text-[10px] text-gray-500 font-medium">
                              Color: {sale.color}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-gray-700">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            {sale.customer_name}
                          </span>
                          {sale.phone_number && sale.phone_number !== 'N/A' && (
                            <span className="flex items-center gap-1 text-gray-500 font-mono">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {sale.phone_number}
                            </span>
                          )}
                          {sale.imei && (
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-600 border border-gray-200">
                              IMEI: {sale.imei}
                            </span>
                          )}
                          {sale.application_id && sale.application_id !== 'N/A' && (
                            <span className="bg-blue-50 px-1.5 py-0.5 rounded text-[10px] font-mono text-blue-700 border border-blue-100">
                              App ID: {sale.application_id}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <div className="text-left sm:text-right">
                        <p className="text-base font-black text-gray-900">
                          ৳{salePrice.toLocaleString()}
                        </p>
                        <p className="text-[11px] font-bold text-emerald-600 flex items-center sm:justify-end gap-1">
                          <TrendingUp className="w-3 h-3" />
                          লাভ: ৳{profit.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {formattedDate} {formattedTime ? `• ${formattedTime}` : ''}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-cyan-600 transition-colors" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>মোট {filteredSales.length} টি বিক্রয় রেকর্ড দেখানো হচ্ছে</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-colors cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
