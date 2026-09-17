import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Plus, 
  ShoppingCart, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  DollarSign,
  Package,
  Headphones,
  Speaker,
  Zap,
  Shield,
  BatteryCharging,
  Smartphone,
  Tag,
  Printer,
  History,
  Check,
  Loader2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { Product, Sale } from '../types';
import { format } from 'date-fns';

export interface AccessoryCategoryInfo {
  id: string;
  name: string;
  banglaName: string;
  iconName: string;
  color: string;
  bgLight: string;
  borderLight: string;
  sampleSuggestions: string[];
}

export const ACCESSORY_CATEGORIES: AccessoryCategoryInfo[] = [
  {
    id: 'glass',
    name: 'Mobile Glass',
    banglaName: 'মোবাইল গ্লাস / প্রটেক্টর',
    iconName: 'Shield',
    color: 'text-sky-600',
    bgLight: 'bg-sky-50',
    borderLight: 'border-sky-200',
    sampleSuggestions: [
      '11D Tempered Glass',
      'Super D Matte Glass',
      'Privacy Anti-Peep Glass',
      'UV Curved Tempered Glass',
      '9H Ceramic Screen Protector',
      'Camera Lens Protector'
    ]
  },
  {
    id: 'type_c',
    name: 'Type-C Cable',
    banglaName: 'টাইপ-সি কেবিল',
    iconName: 'Zap',
    color: 'text-blue-600',
    bgLight: 'bg-blue-50',
    borderLight: 'border-blue-200',
    sampleSuggestions: [
      '65W Fast Charging Type-C',
      '100W PD Type-C to Type-C',
      'Braided Type-C Fast Cable',
      'Remax Type-C 3A Cable',
      'Samsung Original Type-C',
      'Baseus 6A SuperCharge Type-C'
    ]
  },
  {
    id: 'type_b',
    name: 'Type-B / Micro USB',
    banglaName: 'টাইপ-বি / মাইক্রো কেবিল',
    iconName: 'Zap',
    color: 'text-amber-600',
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-200',
    sampleSuggestions: [
      'Micro USB Fast Data Cable',
      'Remax Micro USB 2.4A',
      'Braided Micro USB 1M',
      'Long Heavy Duty Micro USB'
    ]
  },
  {
    id: 'cable',
    name: 'Data Cable (General)',
    banglaName: 'সাধারণ ডাটা কেবিল',
    iconName: 'Zap',
    color: 'text-indigo-600',
    bgLight: 'bg-indigo-50',
    borderLight: 'border-indigo-200',
    sampleSuggestions: [
      'Lightning iPhone Cable',
      '3-in-1 Multi Fast Cable',
      'OTG Type-C Adapter / Cable',
      'AUX Audio Cable 3.5mm'
    ]
  },
  {
    id: 'charger',
    name: 'Charger / Adapter',
    banglaName: 'চার্জার / অ্যাডাপ্টার',
    iconName: 'BatteryCharging',
    color: 'text-emerald-600',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-200',
    sampleSuggestions: [
      'Samsung 25W Super Fast Charger',
      'Apple 20W PD USB-C Adapter',
      'Xiaomi 33W Fast Turbo Charger',
      '65W GaN Multi-Port Charger',
      'Vivo 44W Flash Charger',
      '18W Quick Charge 3.0 Adapter'
    ]
  },
  {
    id: 'headphone',
    name: 'Headphone / Earphone',
    banglaName: 'হেডফোন / ইয়ারফোন',
    iconName: 'Headphones',
    color: 'text-purple-600',
    bgLight: 'bg-purple-50',
    borderLight: 'border-purple-200',
    sampleSuggestions: [
      '3.5mm Heavy Bass Earphone',
      'Type-C Digital Earphone',
      'Havit Wired Gaming Headset',
      'Bluetooth Neckband Headphone',
      'UiiSii C100 Deep Bass Earphone'
    ]
  },
  {
    id: 'earbuds',
    name: 'Earbuds / TWS',
    banglaName: 'ইয়ারবাডস / এয়ারপডস',
    iconName: 'Headphones',
    color: 'text-rose-600',
    bgLight: 'bg-rose-50',
    borderLight: 'border-rose-200',
    sampleSuggestions: [
      'Realme Buds T100 TWS',
      'Haylou GT1 / X1 Neo Earbuds',
      'AirPods Pro 2 ANC Clone / Master',
      'Joyroom TWS Wireless Earbuds',
      'Lenovo Thinkplus LivePods'
    ]
  },
  {
    id: 'power_bank',
    name: 'Power Bank',
    banglaName: 'পাওয়ার ব্যাংক',
    iconName: 'BatteryCharging',
    color: 'text-teal-600',
    bgLight: 'bg-teal-50',
    borderLight: 'border-teal-200',
    sampleSuggestions: [
      '10,000mAh 22.5W Fast Power Bank',
      '20,000mAh 65W Laptop Power Bank',
      'Remax 10,000mAh Pocket Power Bank',
      'Joyroom Magnetic Wireless Power Bank'
    ]
  },
  {
    id: 'back_cover',
    name: 'Back Cover / Case',
    banglaName: 'ব্যাক কভার / কেসিং',
    iconName: 'Smartphone',
    color: 'text-violet-600',
    bgLight: 'bg-violet-50',
    borderLight: 'border-violet-200',
    sampleSuggestions: [
      'Silicone Soft Shockproof Cover',
      'Transparent Anti-Yellowing Clear Case',
      'Magnetic Leather Flip Case',
      'Armor Kickstand Hard Case'
    ]
  },
  {
    id: 'speaker',
    name: 'Box / Speaker',
    banglaName: 'সাউন্ড বক্স / স্পিকার',
    iconName: 'Speaker',
    color: 'text-amber-600',
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-200',
    sampleSuggestions: [
      'Mini Bluetooth Sound Box',
      'TG-113 Wireless Bluetooth Speaker',
      'KTS Wireless Party Speaker with Mic',
      'JBL Charge / Flip Portable Speaker',
      'Havit RGB Bluetooth Desktop Speaker',
      'Portable Wireless Sound Box with Torch'
    ]
  },
  {
    id: 'other',
    name: 'Other Accessories',
    banglaName: 'অন্যান্য এক্সেসরিজ',
    iconName: 'Package',
    color: 'text-gray-600',
    bgLight: 'bg-gray-50',
    borderLight: 'border-gray-200',
    sampleSuggestions: [
      'Mobile Phone Stand / Desk Holder',
      'Ring Light with Tripod',
      'Car Mobile Holder Dashboard',
      'Selfie Stick with Bluetooth Remote'
    ]
  }
];

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'glass':
      return <Shield className="w-4 h-4 text-sky-600" />;
    case 'type_c':
    case 'type_b':
    case 'cable':
      return <Zap className="w-4 h-4 text-blue-600" />;
    case 'charger':
      return <BatteryCharging className="w-4 h-4 text-emerald-600" />;
    case 'headphone':
      return <Headphones className="w-4 h-4 text-purple-600" />;
    case 'earbuds':
      return <Headphones className="w-4 h-4 text-rose-600" />;
    case 'speaker':
    case 'box':
      return <Speaker className="w-4 h-4 text-amber-600" />;
    case 'power_bank':
      return <BatteryCharging className="w-4 h-4 text-teal-600" />;
    case 'back_cover':
      return <Smartphone className="w-4 h-4 text-violet-600" />;
    default:
      return <Package className="w-4 h-4 text-gray-600" />;
  }
};

export const getCategoryName = (category: string): string => {
  const found = ACCESSORY_CATEGORIES.find(c => c.id === category);
  return found ? found.name : 'Accessories';
};

interface AccessoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  sales: Sale[];
  onAddAccessory: (data: {
    name: string;
    accessory_category: string;
    purchase_price: number;
    selling_price: number;
    quantity: number;
    brand?: string;
    color?: string;
    condition_note?: string;
  }) => Promise<void>;
  onEditAccessory: (id: string, data: Partial<Product>) => Promise<void>;
  onDeleteAccessory: (id: string) => Promise<void>;
  onSellAccessory: (data: {
    product: Product;
    quantity: number;
    salePrice: number;
    customerName: string;
    phoneNumber: string;
    saleDate: string;
    isCashSale: boolean;
  }) => Promise<void>;
}

export const AccessoriesModal: React.FC<AccessoriesModalProps> = ({
  isOpen,
  onClose,
  products,
  sales,
  onAddAccessory,
  onEditAccessory,
  onDeleteAccessory,
  onSellAccessory
}) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'add' | 'sales'>('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Form states for adding / editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'glass',
    brand: '',
    quantity: '10',
    purchase_price: '',
    selling_price: '',
    color: '',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Sell Dialog state
  const [sellingProduct, setSellingProduct] = useState<Product | null>(null);
  const [sellQuantity, setSellQuantity] = useState<number>(1);
  const [sellPricePerUnit, setSellPricePerUnit] = useState<string>('');
  const [sellCustomerName, setSellCustomerName] = useState<string>('Cash Sale');
  const [sellCustomerPhone, setSellCustomerPhone] = useState<string>('');
  const [isSellingSubmit, setIsSellingSubmit] = useState<boolean>(false);

  // Last completed sale receipt state
  const [lastReceipt, setLastReceipt] = useState<{
    saleId?: string;
    productName: string;
    categoryName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    customerName: string;
    customerPhone: string;
    date: string;
  } | null>(null);

  // Filter only accessories products
  const accessoryProducts = useMemo(() => {
    return (products || []).filter(p => p && p.is_accessory);
  }, [products]);

  // Filter accessory sales
  const accessorySales = useMemo(() => {
    return (sales || []).filter(s => s && s.is_accessory);
  }, [sales]);

  // Overall calculations for accessories
  const stats = useMemo(() => {
    const totalModels = accessoryProducts.length;
    const totalQuantity = accessoryProducts.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
    const inStockModels = accessoryProducts.filter(p => (Number(p.quantity) || 0) > 0).length;
    const totalRetailValue = accessoryProducts.reduce((sum, p) => sum + Math.round((Number(p.purchase_price) || 0) * (Number(p.quantity) || 0)), 0);
    const totalCustomerValue = accessoryProducts.reduce((sum, p) => sum + Math.round((Number(p.selling_price) || 0) * (Number(p.quantity) || 0)), 0);
    const totalProjectedProfit = totalCustomerValue - totalRetailValue;

    // Sales summary
    const totalSoldPieces = accessorySales.reduce((sum, s) => sum + (Number(s.quantity_sold) || 1), 0);
    const totalSalesRevenue = accessorySales.reduce((sum, s) => sum + (Number(s.actual_sale_price) || 0), 0);
    const totalSalesProfit = accessorySales.reduce((sum, s) => sum + (Number(s.profit) || 0), 0);

    return {
      totalModels,
      totalQuantity,
      inStockModels,
      totalRetailValue,
      totalCustomerValue,
      totalProjectedProfit,
      totalSoldPieces,
      totalSalesRevenue,
      totalSalesProfit
    };
  }, [accessoryProducts, accessorySales]);

  // Filtered products list based on search and category
  const filteredProducts = useMemo(() => {
    let list = accessoryProducts;

    if (inStockOnly) {
      list = list.filter(p => (Number(p.quantity) || 0) > 0);
    }

    if (selectedCategoryFilter !== 'all') {
      list = list.filter(p => (p.accessory_category || 'other') === selectedCategoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.color && p.color.toLowerCase().includes(q)) ||
        (p.accessory_category && p.accessory_category.toLowerCase().includes(q)) ||
        (p.condition_note && p.condition_note.toLowerCase().includes(q))
      );
    }

    return list;
  }, [accessoryProducts, inStockOnly, selectedCategoryFilter, searchQuery]);

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'glass',
      brand: '',
      quantity: '10',
      purchase_price: '',
      selling_price: '',
      color: '',
      note: ''
    });
  };

  // Pre-fill form when editing
  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.accessory_category || 'glass',
      brand: product.brand || '',
      quantity: String(product.quantity || 0),
      purchase_price: String(product.purchase_price || ''),
      selling_price: String(product.selling_price || ''),
      color: product.color || '',
      note: product.condition_note || ''
    });
    setActiveTab('add');
  };

  // Handle submit Add / Edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('অনুগ্রহ করে পণ্যের নাম (Product Name) লিখুন');
      return;
    }

    const pPrice = Number(formData.purchase_price) || 0;
    const sPrice = Number(formData.selling_price) || 0;
    const qty = Math.max(0, parseInt(formData.quantity) || 0);

    setIsSubmitting(true);
    try {
      if (editingId) {
        await onEditAccessory(editingId, {
          name: formData.name.trim(),
          accessory_category: formData.category,
          brand: formData.brand.trim(),
          purchase_price: pPrice,
          selling_price: sPrice,
          profit_margin: sPrice - pPrice,
          quantity: qty,
          color: formData.color.trim(),
          condition_note: formData.note.trim()
        });
      } else {
        await onAddAccessory({
          name: formData.name.trim(),
          accessory_category: formData.category,
          brand: formData.brand.trim(),
          purchase_price: pPrice,
          selling_price: sPrice,
          quantity: qty,
          color: formData.color.trim(),
          condition_note: formData.note.trim()
        });
      }
      resetForm();
      setActiveTab('stock');
    } catch (err: any) {
      console.error('Error saving accessory:', err);
      alert('সংরক্ষণ করতে সমস্যা হয়েছে: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Quick Sell Dialog
  const openQuickSell = (product: Product) => {
    setSellingProduct(product);
    setSellQuantity(1);
    setSellPricePerUnit(String(product.selling_price || ''));
    setSellCustomerName('Cash Sale');
    setSellCustomerPhone('');
  };

  // Handle Confirm Sell
  const handleConfirmSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellingProduct) return;

    const available = Number(sellingProduct.quantity) || 0;
    if (sellQuantity > available) {
      alert(`স্টকে মাত্র ${available} পিস রয়েছে! আপনি ${sellQuantity} পিস বিক্রয় করতে পারবেন না।`);
      return;
    }

    const unitPrice = Number(sellPricePerUnit) || Number(sellingProduct.selling_price) || 0;
    const totalAmount = unitPrice * sellQuantity;

    setIsSellingSubmit(true);
    try {
      await onSellAccessory({
        product: sellingProduct,
        quantity: sellQuantity,
        salePrice: totalAmount,
        customerName: sellCustomerName.trim() || 'Cash Sale',
        phoneNumber: sellCustomerPhone.trim() || 'N/A',
        saleDate: new Date().toISOString(),
        isCashSale: true
      });

      // Prepare receipt data
      setLastReceipt({
        productName: sellingProduct.name,
        categoryName: getCategoryName(sellingProduct.accessory_category || 'other'),
        quantity: sellQuantity,
        unitPrice: unitPrice,
        totalAmount: totalAmount,
        customerName: sellCustomerName.trim() || 'Cash Sale',
        customerPhone: sellCustomerPhone.trim() || 'N/A',
        date: format(new Date(), 'dd MMM yyyy, hh:mm a')
      });

      setSellingProduct(null);
    } catch (err: any) {
      console.error('Failed to sell accessory:', err);
      alert('বিক্রয় সম্পন্ন করতে সমস্যা হয়েছে: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSellingSubmit(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col my-auto max-h-[94vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-inner">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight">
                    Accessories Management (এক্সেসরিজ বিভাগ)
                  </h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                    {stats.totalQuantity} Pcs Stock • {stats.totalModels} Items
                  </span>
                </div>
                <p className="text-xs text-teal-100/90 mt-0.5">
                  Mobile Glass, Cables, Charger, Headphones, Earbuds & All Shop Accessories
                </p>
              </div>
            </div>

            <button 
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-gray-50 border-b border-gray-200 gap-2 shrink-0 flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('stock')}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'stock'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Stock List ({accessoryProducts.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab('add');
                }}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'add'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>{editingId ? 'Edit Product' : 'Add New Accessory'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sales')}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'sales'
                    ? 'bg-purple-700 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Sales History ({accessorySales.length})</span>
              </button>
            </div>

            {/* Quick action button */}
            {activeTab === 'stock' && accessoryProducts.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const inStockItem = accessoryProducts.find(p => (p.quantity || 0) > 0);
                  if (inStockItem) openQuickSell(inStockItem);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>⚡ Quick Sell</span>
              </button>
            )}
          </div>

          {/* Top Quick Stats Summary Bar */}
          <div className="px-4 sm:px-6 py-2.5 bg-teal-50/50 border-b border-teal-100 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center shrink-0">
            <div className="bg-white p-2 rounded-xl border border-teal-100 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Total Stock (পিস)</p>
              <p className="text-base font-black text-teal-900">
                {stats.totalQuantity} <span className="text-xs font-normal text-gray-500">Pcs</span>
              </p>
              <p className="text-[10px] text-gray-400 font-medium">{stats.inStockModels} in stock / {stats.totalModels} items</p>
            </div>

            <div className="bg-white p-2 rounded-xl border border-teal-100 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Purchase Cost (ক্রয়)</p>
              <p className="text-base font-black text-gray-900">
                ৳{stats.totalRetailValue.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400 font-medium">Total investment</p>
            </div>

            <div className="bg-white p-2 rounded-xl border border-teal-100 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Selling Value (বিক্রয়)</p>
              <p className="text-base font-black text-blue-600">
                ৳{stats.totalCustomerValue.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400 font-medium">Est. revenue</p>
            </div>

            <div className="bg-white p-2 rounded-xl border border-teal-100 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Stock Profit (লাভ)</p>
              <p className="text-base font-black text-emerald-600">
                +৳{stats.totalProjectedProfit.toLocaleString()}
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold">Margin on stock</p>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white p-2 rounded-xl border border-purple-100 shadow-2xs">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Total Sold (বিক্রিত)</p>
              <p className="text-base font-black text-purple-700">
                {stats.totalSoldPieces} <span className="text-xs font-normal text-gray-500">Pcs</span>
              </p>
              <p className="text-[10px] text-purple-700 font-bold">Profit: +৳{stats.totalSalesProfit.toLocaleString()}</p>
            </div>
          </div>

          {/* TAB 1: STOCK LIST */}
          {activeTab === 'stock' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Category Pills Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all border cursor-pointer ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  All ({accessoryProducts.length})
                </button>
                {ACCESSORY_CATEGORIES.map(cat => {
                  const count = accessoryProducts.filter(p => p.accessory_category === cat.id).length;
                  const isSelected = selectedCategoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search & Stock Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search accessories (e.g. 11D Glass, Type C cable, 25W charger, Remax, Havit)..."
                    className="w-full pl-10 pr-8 py-2 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-xs sm:text-sm font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                      inStockOnly
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${inStockOnly ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <span>In Stock Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('add');
                    }}
                    className="px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Accessory</span>
                  </button>
                </div>
              </div>

              {/* Table / Empty State */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Headphones className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">
                    {searchQuery ? 'কোনো এক্সেসরিজ খুঁজে পাওয়া যায়নি' : 'এখনো কোনো এক্সেসরিজ যুক্ত করা হয়নি'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    {searchQuery 
                      ? 'ভিন্ন কোনো নাম বা ক্যাটাগরি দিয়ে অনুসন্ধান করে দেখুন।'
                      : 'মোবাইল গ্লাস, টাইপ-সি কেবিল, চার্জার, হেডফোন ইত্যাদি যুক্ত করতে উপরের "+ Add Accessory" বাটনে ক্লিক করুন।'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('add');
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন এক্সেসরিজ যুক্ত করুন</span>
                  </button>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                        <tr>
                          <th className="px-3.5 py-3">Product Name & Category</th>
                          <th className="px-3 py-3 text-center">Brand</th>
                          <th className="px-3 py-3 text-right">Purchase (ক্রয়)</th>
                          <th className="px-3 py-3 text-right">Selling (বিক্রয়)</th>
                          <th className="px-3 py-3 text-right">Profit/Unit</th>
                          <th className="px-3.5 py-3 text-center">Stock (পিস)</th>
                          <th className="px-3 py-3 text-right">Stock Val</th>
                          <th className="px-3.5 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {filteredProducts.map((p, idx) => {
                          const stockQty = Number(p.quantity) || 0;
                          const pPrice = Number(p.purchase_price) || 0;
                          const sPrice = Number(p.selling_price) || 0;
                          const profit = sPrice - pPrice;
                          const totalVal = sPrice * stockQty;
                          const catInfo = ACCESSORY_CATEGORIES.find(c => c.id === p.accessory_category);

                          return (
                            <tr key={p.id} className="hover:bg-teal-50/20 transition-colors">
                              <td className="px-3.5 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center shrink-0">
                                    {getCategoryIcon(p.accessory_category || 'other')}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-gray-900 text-xs">
                                        {p.name}
                                      </span>
                                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${catInfo ? `${catInfo.bgLight} ${catInfo.color} ${catInfo.borderLight}` : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                        {catInfo ? catInfo.name : 'Accessory'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                                      {p.color && (
                                        <span className="text-gray-500 font-medium">Color: {p.color}</span>
                                      )}
                                      {p.condition_note && (
                                        <span className="italic text-gray-400">• {p.condition_note}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-3 py-3 text-center">
                                <span className="font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                                  {p.brand || 'General'}
                                </span>
                              </td>

                              <td className="px-3 py-3 text-right font-medium text-gray-700">
                                ৳{pPrice.toLocaleString()}
                              </td>

                              <td className="px-3 py-3 text-right font-bold text-blue-600">
                                ৳{sPrice.toLocaleString()}
                              </td>

                              <td className="px-3 py-3 text-right font-bold text-emerald-600">
                                +৳{profit.toLocaleString()}
                              </td>

                              <td className="px-3.5 py-3 text-center">
                                {stockQty > 5 ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {stockQty} Pcs
                                  </span>
                                ) : stockQty > 0 ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    {stockQty} Pcs (Low)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                                    Stock Out
                                  </span>
                                )}
                              </td>

                              <td className="px-3 py-3 text-right font-bold text-gray-800">
                                ৳{totalVal.toLocaleString()}
                              </td>

                              <td className="px-3.5 py-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {stockQty > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => openQuickSell(p)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                                      title="Sell this accessory"
                                    >
                                      <ShoppingCart className="w-3 h-3" />
                                      <span>Sell</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => startEdit(p)}
                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`আপনি কি "${p.name}" মুছে ফেলতে চান?`)) {
                                        onDeleteAccessory(p.id);
                                      }
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD / EDIT ACCESSORY */}
          {activeTab === 'add' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <form onSubmit={handleSubmitForm} className="max-w-3xl mx-auto space-y-4">
                <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-teal-600 text-white">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-teal-950">
                        {editingId ? 'Edit Accessory Product (এক্সেসরিজ তথ্য পরিবর্তন)' : 'Add New Accessory (নতুন এক্সেসরিজ যুক্ত করুন)'}
                      </h3>
                      <p className="text-xs text-teal-800">
                        গ্লাস, কেবিল, চার্জার, হেডফোন ইত্যাদি খুব সহজে ক্যাটাগরি ও স্টক দিয়ে যুক্ত করুন
                      </p>
                    </div>
                  </div>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-3 py-1 bg-white text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-semibold border border-gray-200"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {/* 1. Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-teal-600" />
                    <span>Select Category (ক্যাটাগরি সিলেক্ট করুন) *</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {ACCESSORY_CATEGORIES.map(cat => {
                      const isSelected = formData.category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat.id })}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-teal-700 text-white border-teal-700 shadow-md ring-2 ring-teal-200'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300 hover:bg-teal-50/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`p-1 rounded-md ${isSelected ? 'bg-white/20 text-white' : `${cat.bgLight} ${cat.color}`}`}>
                              {getCategoryIcon(cat.id)}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-tight">{cat.name}</p>
                            <p className={`text-[10px] truncate ${isSelected ? 'text-teal-100' : 'text-gray-400'}`}>
                              {cat.banglaName}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Suggestions for Selected Category */}
                {ACCESSORY_CATEGORIES.find(c => c.id === formData.category)?.sampleSuggestions && (
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                    <p className="text-[11px] font-bold text-gray-500 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Quick Suggestions (১-ক্লিকে নাম পূরণ করুন):</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {ACCESSORY_CATEGORIES.find(c => c.id === formData.category)!.sampleSuggestions.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFormData({ ...formData, name: s })}
                          className="px-2.5 py-1 bg-white hover:bg-teal-50 text-gray-700 hover:text-teal-800 text-xs font-semibold rounded-lg border border-gray-200 hover:border-teal-300 transition-colors cursor-pointer"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Product Name & Brand */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Product Name (পণ্যের নাম) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. 11D Matte Glass for iPhone 15 Pro, Samsung 25W Fast Charger..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Brand / Manufacturer
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={e => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g. Samsung, Remax, Havit, Anker..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                {/* 3. Quantity, Purchase Price, Selling Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-teal-50/30 p-3.5 rounded-2xl border border-teal-100">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Stock Quantity (পরিমাণ / পিস) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.quantity}
                      onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm font-bold text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Purchase Price (ক্রয় মূল্য ৳)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">৳</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.purchase_price}
                        onChange={e => setFormData({ ...formData, purchase_price: e.target.value })}
                        placeholder="0"
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Selling Price (বিক্রয় মূল্য ৳) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 font-bold">৳</span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.selling_price}
                        onChange={e => setFormData({ ...formData, selling_price: e.target.value })}
                        placeholder="0"
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-blue-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Profit Margin Preview */}
                <div className="flex items-center justify-between px-3.5 py-2 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800">
                  <span>প্রতি পিসে আনুমানিক লাভ (Profit / Pcs):</span>
                  <span className="text-sm font-black text-emerald-700">
                    ৳{Math.max(0, (Number(formData.selling_price) || 0) - (Number(formData.purchase_price) || 0)).toLocaleString()}
                  </span>
                </div>

                {/* 4. Color & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Color / Variant (রং / ধরণ)
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={e => setFormData({ ...formData, color: e.target.value })}
                      placeholder="e.g. Black, White, 1 Meter, 2 Meter, 65W..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Note / Warranty
                    </label>
                    <input
                      type="text"
                      value={formData.note}
                      onChange={e => setFormData({ ...formData, note: e.target.value })}
                      placeholder="e.g. 6 Months Warranty, Original Product..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('stock')}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-teal-100 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{editingId ? 'Update Product' : 'Confirm Add to Stock'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: SALES HISTORY */}
          {activeTab === 'sales' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Accessories Sales Log (এক্সেসরিজ বিক্রয় লগ)
                  </h3>
                  <p className="text-xs text-gray-500">
                    এক্সেসরিজের সকল নগদ ও কাস্টমার বিক্রয় রেকর্ড
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-xl">
                    Total Revenue: ৳{stats.totalSalesRevenue.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                    Total Profit: ৳{stats.totalSalesProfit.toLocaleString()}
                  </span>
                </div>
              </div>

              {accessorySales.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-700">এখনো কোনো এক্সেসরিজ বিক্রয় রেকর্ড নেই</p>
                  <p className="text-xs text-gray-400 mt-1">
                    স্টক তালিকা থেকে কোনো এক্সেসরিজ বিক্রয় করলে এখানে স্বয়ংক্রিয়ভাবে হিসাব যুক্ত হবে।
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                        <tr>
                          <th className="px-3.5 py-3">Date & Time</th>
                          <th className="px-3.5 py-3">Product Name</th>
                          <th className="px-3 py-3">Customer</th>
                          <th className="px-3 py-3 text-center">Quantity</th>
                          <th className="px-3 py-3 text-right">Sale Price (৳)</th>
                          <th className="px-3 py-3 text-right">Profit (৳)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {accessorySales.map(s => (
                          <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3.5 py-3 text-gray-500 whitespace-nowrap">
                              {s.sale_date ? format(new Date(s.sale_date), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                            </td>
                            <td className="px-3.5 py-3 font-bold text-gray-900">
                              {s.product_name}
                            </td>
                            <td className="px-3 py-3 text-gray-700">
                              {s.customer_name || 'Cash Sale'}
                              {s.phone_number && s.phone_number !== 'N/A' && (
                                <span className="block text-[10px] text-gray-400">{s.phone_number}</span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-center font-bold text-gray-800">
                              {s.quantity_sold || 1} Pcs
                            </td>
                            <td className="px-3 py-3 text-right font-bold text-blue-600">
                              ৳{(s.actual_sale_price || 0).toLocaleString()}
                            </td>
                            <td className="px-3 py-3 text-right font-bold text-emerald-600">
                              +৳{(s.profit || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="p-3.5 px-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500 shrink-0">
            <span>Mehedy Telecom • Accessories Inventory</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>

      {/* QUICK SELL POPUP DIALOG */}
      {sellingProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h3 className="font-bold text-base">Sell Accessory (এক্সেসরিজ বিক্রয়)</h3>
              </div>
              <button
                type="button"
                onClick={() => setSellingProduct(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmSell} className="p-4 space-y-3.5">
              {/* Product Info Card */}
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">{sellingProduct.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800">
                    Stock: {sellingProduct.quantity} Pcs
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-3">
                  <span>Regular Price: ৳{sellingProduct.selling_price}</span>
                  <span>Cost: ৳{sellingProduct.purchase_price}</span>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Quantity (পিস / সংখ্যা) *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSellQuantity(prev => Math.max(1, prev - 1))}
                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-lg flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={Number(sellingProduct.quantity) || 1}
                    required
                    value={sellQuantity}
                    onChange={e => setSellQuantity(Math.min(Number(sellingProduct.quantity) || 1, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="flex-1 text-center py-2 rounded-xl border border-gray-200 font-bold text-base outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setSellQuantity(prev => Math.min(Number(sellingProduct.quantity) || 1, prev + 1))}
                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-lg flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price Per Unit */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Selling Price Per Unit (প্রতি পিস বিক্রয় মূল্য ৳) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">৳</span>
                  <input
                    type="number"
                    required
                    min="0"
                    value={sellPricePerUnit}
                    onChange={e => setSellPricePerUnit(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-200 font-bold text-base text-blue-600 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={sellCustomerName}
                    onChange={e => setSellCustomerName(e.target.value)}
                    placeholder="Cash Sale"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Phone (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={sellCustomerPhone}
                    onChange={e => setSellCustomerPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Total Amount (সর্বমোট বিল):</span>
                  <span className="font-bold text-gray-900 text-sm">
                    ৳{((Number(sellPricePerUnit) || 0) * sellQuantity).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Estimated Profit (লাভ):</span>
                  <span>
                    +৳{(((Number(sellPricePerUnit) || 0) - (Number(sellingProduct.purchase_price) || 0)) * sellQuantity).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSellingProduct(null)}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSellingSubmit}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-100 disabled:opacity-50 cursor-pointer"
                >
                  {isSellingSubmit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm & Sell (৳{((Number(sellPricePerUnit) || 0) * sellQuantity).toLocaleString()})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* SALE RECEIPT MODAL */}
      {lastReceipt && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Receipt className="w-5 h-5" />
                <h3 className="font-bold text-sm">Sale Completed (বিক্রয় সম্পন্ন!)</h3>
              </div>
              <button
                type="button"
                onClick={() => setLastReceipt(null)}
                className="p-1 text-white hover:bg-white/20 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-black text-gray-900 text-base">Mehedy Telecom</h4>
              <p className="text-[11px] text-gray-500 -mt-2">Accessories Cash Receipt</p>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-semibold text-gray-800">{lastReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-semibold text-gray-800">{lastReceipt.customerName}</span>
                </div>
                {lastReceipt.customerPhone !== 'N/A' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone:</span>
                    <span className="font-semibold text-gray-800">{lastReceipt.customerPhone}</span>
                  </div>
                )}
                <div className="h-px bg-gray-200 my-1" />
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">{lastReceipt.productName}</span>
                  <span className="font-bold text-gray-900">{lastReceipt.quantity} pcs</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Unit Price:</span>
                  <span>৳{lastReceipt.unitPrice.toLocaleString()}</span>
                </div>
                <div className="h-px bg-gray-200 my-1" />
                <div className="flex justify-between font-black text-sm text-gray-900">
                  <span>Total Paid:</span>
                  <span className="text-emerald-600">৳{lastReceipt.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2 bg-gray-800 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLastReceipt(null)}
                  className="flex-1 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  OK (সম্পন্ন)
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
