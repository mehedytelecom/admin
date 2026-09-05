import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Plus, 
  Package, 
  ShoppingCart, 
  List, 
  X, 
  Search, 
  TrendingUp, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  Image as ImageIcon,
  Loader2,
  LogOut,
  ChevronRight,
  Trash2,
  Edit2,
  BarChart3,
  ArrowDownCircle,
  Clock,
  Calculator,
  Camera,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Tag,
  Printer,
  Download,
  FileSpreadsheet,
  FileText,
  Eye,
  Check,
  Layers,
  ChevronLeft,
  Smartphone,
  Boxes,
  CheckCircle2
} from 'lucide-react';
import { animate, motion, AnimatePresence } from 'motion/react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  increment,
  deleteDoc,
  writeBatch,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { format, isToday, isSameMonth, parseISO } from 'date-fns';
import { auth, db } from './firebase';
import { Product, Sale, MobileBazarRecord } from './types';
import { uploadImageToTelegram, getTelegramImageUrl } from './services/telegramService';
import { handleFirestoreError, OperationType } from './lib/firestoreUtils';
import { BarcodeScanner } from './components/BarcodeScanner';
import { PhotoCapture } from './components/PhotoCapture';
import { BrandStockModal } from './components/BrandStockModal';
import { UsedMobileModal } from './components/UsedMobileModal';
import { ProductSummaryModal } from './components/ProductSummaryModal';
import { BarPhoneModal } from './components/BarPhoneModal';

// --- Components ---

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxWidthClass = "max-w-2xl",
  headerRight
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
  maxWidthClass?: string;
  headerRight?: React.ReactNode;
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidthClass} max-h-[92vh] overflow-hidden flex flex-col`}
        >
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <div className="flex items-center gap-2">
              {headerRight}
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const Counter = ({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });
    return controls.stop;
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
};

const SummaryItem = ({ 
  icon: Icon, 
  label, 
  value, 
  colorClass, 
  symbol = "", 
  prefix = "", 
  suffix = "",
  subtitle,
  subtitleClass,
  onClick
}: { 
  icon?: any; 
  label: string; 
  value: string | number; 
  colorClass: string; 
  symbol?: string; 
  prefix?: string; 
  suffix?: string;
  subtitle?: string;
  subtitleClass?: string;
  onClick?: () => void;
}) => (
  <div 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all ${
      onClick ? 'cursor-pointer hover:border-blue-400 hover:shadow-blue-100/50 active:scale-[0.98]' : ''
    }`}
  >
    <div className={`p-3 rounded-full mb-3 ${colorClass}`}>
      {Icon ? <Icon className="w-6 h-6 text-white" /> : <span className="text-xl font-bold text-white leading-none">{symbol}</span>}
    </div>
    <span className="text-sm font-medium text-gray-500 mb-1 text-center">{label}</span>
    <span className="text-lg font-bold text-gray-900">
      {typeof value === 'number' ? <Counter value={value} prefix={prefix} suffix={suffix} /> : value}
    </span>
    {subtitle && (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 border ${
        subtitleClass || 'text-blue-800 bg-blue-50 border-blue-200'
      }`}>
        {subtitle}
      </span>
    )}
  </div>
);

const RestrictedAccess = ({ user, onLogout }: { user: FirebaseUser; onLogout: () => void }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-red-100"
    >
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldCheck className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">Access Restricted</h2>
      <p className="text-gray-500 mb-8 leading-relaxed">
        Hello <span className="font-bold text-gray-700">{user.displayName || user.email}</span>, this dashboard is reserved for the administrator only. Your current account does not have permission to view this data.
      </p>
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-600">
          Logged in as: <span className="font-mono font-bold">{user.email}</span>
        </div>
        <button 
          onClick={onLogout}
          className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>
    </motion.div>
  </div>
);

const TelegramImage: React.FC<{ fileId: string }> = ({ fileId }) => {
  const [url, setUrl] = useState<string | null>(() => {
    const cached = localStorage.getItem(`tg_file_${fileId}`);
    if (cached) {
      try {
        const { url, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 3600000) return url;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [error, setError] = useState(false);

  useEffect(() => {
    getTelegramImageUrl(fileId)
      .then(setUrl)
      .catch(() => setError(true));
  }, [fileId]);

  if (error) return <div className="aspect-square bg-red-50 rounded-xl flex items-center justify-center text-red-500 text-xs text-center p-2">Failed to load image</div>;
  if (!url) return <div className="aspect-square bg-gray-100 rounded-xl animate-pulse flex items-center justify-center"><Loader2 className="w-5 h-5 text-gray-300 animate-spin" /></div>;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-xl overflow-hidden border border-gray-100 hover:opacity-90 transition-opacity">
      <img src={url} alt="Sale" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
    </a>
  );
}

const CustomerAvatar = ({ fileId }: { fileId?: string }) => {
  const [url, setUrl] = useState<string | null>(() => {
    if (!fileId) return null;
    const cached = localStorage.getItem(`tg_file_${fileId}`);
    if (cached) {
      try {
        const { url, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 3600000) return url;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (fileId) {
      getTelegramImageUrl(fileId).then(setUrl);
    }
  }, [fileId]);

  if (url) {
    return (
      <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shrink-0 shadow-sm">
        <img src={url} alt="Customer" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
      <User className="w-6 h-6 text-gray-400" />
    </div>
  );
};

const BannerBranding: React.FC<{ fileId: string | null }> = ({ fileId }) => {
  const [url, setUrl] = useState<string | null>(() => {
    if (!fileId) return null;
    const cached = localStorage.getItem(`tg_file_${fileId}`);
    if (cached) {
      try {
        const { url, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 3600000) return url;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (fileId) {
      getTelegramImageUrl(fileId).then(setUrl);
    } else {
      setUrl(null);
    }
  }, [fileId]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden transition-all duration-700">
      {url ? (
        <>
          <img 
            src={url} 
            alt="Banner" 
            className="w-full h-full object-cover object-center sm:object-[50%_35%]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-blue-600 to-blue-400 opacity-20" />
      )}
    </div>
  );
};

const LogoBranding: React.FC<{ fileId: string | null; className?: string }> = ({ fileId, className }) => {
  const [url, setUrl] = useState<string | null>(() => {
    if (!fileId) return null;
    const cached = localStorage.getItem(`tg_file_${fileId}`);
    if (cached) {
      try {
        const { url, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 3600000) return url;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (fileId) {
      getTelegramImageUrl(fileId).then(setUrl);
    } else {
      setUrl(null);
    }
  }, [fileId]);

  if (!url) return (
    <div className={`bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 ${className}`}>
      <ShoppingCart className="w-6 h-6 text-white" />
    </div>
  );

  return (
    <div className={`rounded-xl overflow-hidden shadow-lg shadow-blue-100 ${className}`}>
      <img 
        src={url} 
        alt="Logo" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

// --- Constants ---
const ADMIN_EMAILS = ['mehedyhossain160619@gmail.com', 'likee350@gmail.com'];

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [mobileBazarRecords, setMobileBazarRecords] = useState<MobileBazarRecord[]>([]);
  
  const isSuperAdmin = Boolean(user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));
  // Modals
  const [activeScanner, setActiveScanner] = useState<'product' | 'productImei1' | 'productImei2' | 'sale' | 'cashSale' | 'search' | null>(null);
  const [activePhotoCapture, setActivePhotoCapture] = useState<'sale' | 'editSale' | null>(null);
  const imei1InputRef = useRef<HTMLInputElement>(null);
  const imei2InputRef = useRef<HTMLInputElement>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isSaleProductOpen, setIsSaleProductOpen] = useState(false);
  const [saleTab, setSaleTab] = useState<'emi' | 'cash'>('emi');
  const [isCashSaleOpen, setIsCashSaleOpen] = useState(false);
  const [isSaleListOpen, setIsSaleListOpen] = useState(false);
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isMobileBazarOpen, setIsMobileBazarOpen] = useState(false);
  const [isBrandStockOpen, setIsBrandStockOpen] = useState(false);
  const [isUsedMobileModalOpen, setIsUsedMobileModalOpen] = useState(false);
  const [isProductSummaryOpen, setIsProductSummaryOpen] = useState(false);
  const [isBarPhoneModalOpen, setIsBarPhoneModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClearStockModalOpen, setIsClearStockModalOpen] = useState(false);
  const [notAvailableImei, setNotAvailableImei] = useState<{ isOpen: boolean; imei: string; source: 'sale' | 'cashSale' | 'search' }>({
    isOpen: false,
    imei: '',
    source: 'sale'
  });
  const [isEmiCalcOpen, setIsEmiCalcOpen] = useState(false);
  const [emiConfig, setEmiConfig] = useState({
    productId: '',
    downPayment: '',
    interestRate: '',
    serviceCharge: '',
    months: 3
  });
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editSaleImages, setEditSaleImages] = useState<File[]>([]);
  const [bannerFileId, setBannerFileId] = useState<string | null>(null);
  const [logoFileId, setLogoFileId] = useState<string | null>(null);

  // Form States
  const [productSearch, setProductSearch] = useState('');
  const [productConditionFilter, setProductConditionFilter] = useState<'all' | 'new' | 'used'>('all');
  const [reportStartDate, setReportStartDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [reportEndDate, setReportEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [newProduct, setNewProduct] = useState({
    id: '', // For updating existing
    name: '',
    purchase_price: '',
    selling_price: '',
    quantity: '',
    ram: '',
    rom: '',
    color: '',
    tempUnitColor: '',
    condition: 'new' as 'new' | 'used',
    condition_note: '',
    is_bar_phone: false,
    imei_units: [] as { imei1: string; imei2?: string; color?: string }[],
    tempImei1: '',
    tempImei2: '',
    imeis: [] as string[],
    imei_colors: {} as Record<string, string>,
    image: null as File | null,
    image_file_id: ''
  });
  const [saleImeiInput, setSaleImeiInput] = useState('');
  const [cashImeiInput, setCashImeiInput] = useState('');

  const [newSale, setNewSale] = useState({
    customer_name: '',
    phone_number: '',
    nid_number: '',
    address: '',
    guarantor_number: '',
    product_id: '',
    imei: '',
    color: '',
    images: [] as File[],
    sale_date: format(new Date(), "yyyy-MM-dd'T'HH:mm")
  });

  const [cashSale, setCashSale] = useState({
    product_id: '',
    imei: '',
    color: '',
    actual_sale_price: '',
    sale_date: format(new Date(), "yyyy-MM-dd'T'HH:mm")
  });
  const [newMobileBazar, setNewMobileBazar] = useState({
    sale_id: '',
    down_payment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saleSearch, setSaleSearch] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    const qProducts = query(collection(db, 'products'), orderBy('created_at', 'desc'));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
    });

    const qSales = query(collection(db, 'sales'), orderBy('sale_date', 'desc'));
    const unsubSales = onSnapshot(qSales, (snapshot) => {
      setSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'sales');
    });

    const qMobileBazar = query(collection(db, 'mobile_bazar'), orderBy('created_at', 'desc'));
    const unsubMobileBazar = onSnapshot(qMobileBazar, (snapshot) => {
      setMobileBazarRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MobileBazarRecord)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'mobile_bazar');
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'shop'), (doc) => {
      if (doc.exists()) {
        setBannerFileId(doc.data().banner_file_id);
        setLogoFileId(doc.data().logo_file_id);
      }
    });

    return () => {
      unsubProducts();
      unsubSales();
      unsubMobileBazar();
      unsubSettings();
    };
  }, [user]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login failed:', error);
      const code = error?.code || '';
      if (code === 'auth/network-request-failed') {
        setLoginError(
          'Network request failed. This commonly occurs inside the AI Studio preview iframe because browser security restrictions block cross-origin popups. Please click "Open in New Tab to Sign In" below to log in.'
        );
      } else if (code === 'auth/popup-blocked') {
        setLoginError('Sign-in popup was blocked by your browser. Please allow popups or open the app in a new tab.');
      } else if (code === 'auth/popup-closed-by-user') {
        setLoginError('Sign-in popup was closed before completing. Please try again.');
      } else if (code === 'auth/cancelled-popup-request') {
        setLoginError('Sign-in request was cancelled. Please try again.');
      } else if (code === 'auth/unauthorized-domain') {
        setLoginError('This domain is not authorized in Firebase Authentication settings. Please open the app in a new tab.');
      } else {
        setLoginError(error?.message || 'Login failed. Please check your network connection and try again.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleUpdateBanner = async (file: File) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const fileId = await uploadImageToTelegram(file, (percent) => {
        setUploadProgress(prev => ({ ...prev, 'banner': percent }));
      });
      await updateDoc(doc(db, 'settings', 'shop'), {
        banner_file_id: fileId
      }).catch(async () => {
        // If doc doesn't exist, create it
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'settings', 'shop'), {
          banner_file_id: fileId
        });
      });
      alert('Banner updated successfully!');
    } catch (error: any) {
      console.error('Failed to update banner:', error);
      alert(`Failed to update banner: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(prev => {
        const next = { ...prev };
        delete next['banner'];
        return next;
      });
    }
  };

  const handleUpdateLogo = async (file: File) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const fileId = await uploadImageToTelegram(file, (percent) => {
        setUploadProgress(prev => ({ ...prev, 'logo': percent }));
      });
      await updateDoc(doc(db, 'settings', 'shop'), {
        logo_file_id: fileId
      }).catch(async () => {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'settings', 'shop'), {
          logo_file_id: fileId
        });
      });
      alert('Logo updated successfully!');
    } catch (error: any) {
      console.error('Failed to update logo:', error);
      alert(`Failed to update logo: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(prev => {
        const next = { ...prev };
        delete next['logo'];
        return next;
      });
    }
  };

  // Summary Stats
  const calculateDynamicProfit = useCallback((sale: Sale) => {
    const product = products.find(p => p.id === sale.product_id);
    if (product) {
      // If it's a cash sale or has actual_sale_price, use that.
      // Otherwise use product's current selling price.
      const sellingPrice = sale.actual_sale_price || product.selling_price;
      return sellingPrice - product.purchase_price;
    }
    return sale.profit || 0; // Fallback to stored profit
  }, [products]);

  const currentMonthSales = useMemo(() => {
    const now = new Date();
    return sales
      .filter(s => isSameMonth(parseISO(s.sale_date), now))
      .sort((a, b) => parseISO(b.sale_date).getTime() - parseISO(a.sale_date).getTime());
  }, [sales]);

  const currentMonthTotal = useMemo(() => {
    return currentMonthSales.reduce((acc, s) => {
      if (s.actual_sale_price) return acc + s.actual_sale_price;
      const product = products.find(p => p.id === s.product_id);
      return acc + (product?.selling_price || ((s.profit || 0) + (s.purchase_price || 0)) || 0);
    }, 0);
  }, [currentMonthSales, products]);

  const stats = useMemo(() => {
    const todaySales = sales.filter(s => isToday(parseISO(s.sale_date)));
    const monthlySales = sales.filter(s => isSameMonth(parseISO(s.sale_date), new Date()));
    
    const todayProfit = todaySales.reduce((acc, s) => acc + calculateDynamicProfit(s), 0);
    const monthlyProfit = monthlySales.reduce((acc, s) => acc + calculateDynamicProfit(s), 0);
    
    const mobileBazarTotal = mobileBazarRecords.reduce((acc, r) => {
      const sale = sales.find(s => s.id === r.sale_id);
      if (sale) {
        const profit = calculateDynamicProfit(sale);
        return acc + (r.down_payment - profit);
      }
      return acc + r.net_amount;
    }, 0);

    const usedProducts = products.filter(p => p.condition === 'used');
    const usedQuantity = usedProducts.reduce((acc, p) => acc + p.quantity, 0);
    const usedProductsCount = usedProducts.length;

    const barProducts = products.filter(p => p.is_bar_phone);
    const barQuantity = barProducts.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
    const barProductsCount = barProducts.length;

    return {
      todayCount: todaySales.length,
      todayProfit,
      monthlyCount: monthlySales.length,
      monthlyProfit,
      monthlyTotalSale: currentMonthTotal,
      totalProducts: products.length,
      totalQuantity: products.filter(p => p.condition !== 'used').reduce((acc, p) => acc + p.quantity, 0),
      totalStockValue: products.reduce((acc, p) => acc + Math.round((Number(p.purchase_price) || 0) * (Number(p.quantity) || 0)), 0),
      usedQuantity,
      usedProductsCount,
      barQuantity,
      barProductsCount,
      mobileBazarTotal
    };
  }, [sales, products, mobileBazarRecords, currentMonthTotal, calculateDynamicProfit]);

  // Actions
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
    }
  };

  const handleClearAllStock = async () => {
    if (products.length === 0) {
      alert('বর্তমানে স্টকে কোনো পণ্য নেই, স্টক ইতিমধ্যে সম্পূর্ণ খালি।');
      return;
    }
    setIsSubmitting(true);
    try {
      // Chunk batch operations to stay safely within Firestore batch limits
      const chunkSize = 400;
      for (let i = 0; i < products.length; i += chunkSize) {
        const chunk = products.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach(p => {
          batch.delete(doc(db, 'products', p.id));
        });
        await batch.commit();
      }
      setIsClearStockModalOpen(false);
      setIsSettingsOpen(false);
      alert('সফল হয়েছে! বর্তমান স্টক সম্পূর্ণ খালি করা হয়েছে। আপনার পূর্বের সকল বিক্রয় তথ্য (Sales History) অক্ষত ও ১০০% সুরক্ষিত আছে। এখন আপনি নতুন স্টক এন্ট্রি করতে পারবেন।');
    } catch (error: any) {
      console.error('Failed to clear stock:', error);
      handleFirestoreError(error, OperationType.DELETE, 'products');
      alert(`স্টক খালি করতে সমস্যা হয়েছে: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddImeiUnit = () => {
    const i1 = (newProduct.tempImei1 || '').trim();
    const i2 = (newProduct.tempImei2 || '').trim();
    const uColor = (newProduct.tempUnitColor || '').trim() || (newProduct.color || '').trim();

    if (!i1) {
      alert('দয়া করে IMEI 1 নম্বরটি লিখুন বা স্ক্যান করুন।');
      imei1InputRef.current?.focus();
      return;
    }

    const currentUnits = newProduct.imei_units || [];
    if (currentUnits.some(u => u.imei1 === i1 || (u.imei2 && u.imei2 === i1))) {
      alert(`এই IMEI (${i1}) ইতিমধ্যেই অন্য একটি ইউনিটে যুক্ত করা আছে!`);
      return;
    }
    if (i2 && currentUnits.some(u => u.imei1 === i2 || (u.imei2 && u.imei2 === i2))) {
      alert(`এই IMEI (${i2}) ইতিমধ্যেই অন্য একটি ইউনিটে যুক্ত করা আছে!`);
      return;
    }

    const newUnit = { imei1: i1, imei2: i2 || undefined, color: uColor || undefined };
    const updatedUnits = [...currentUnits, newUnit];
    const updatedColors = { ...(newProduct.imei_colors || {}) };
    if (uColor) {
      if (i1) updatedColors[i1] = uColor;
      if (i2) updatedColors[i2] = uColor;
    }

    setNewProduct(prev => ({
      ...prev,
      imei_units: updatedUnits,
      imei_colors: updatedColors,
      tempImei1: '',
      tempImei2: '',
      tempUnitColor: '',
      quantity: String(updatedUnits.length)
    }));

    setTimeout(() => {
      imei1InputRef.current?.focus();
    }, 100);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const pPrice = Number(newProduct.purchase_price);
      const sPrice = Number(newProduct.selling_price);
      const profit = sPrice - pPrice;

      let imageFileId = newProduct.image_file_id;
      if (newProduct.image) {
        imageFileId = await uploadImageToTelegram(newProduct.image, (percent) => {
          setUploadProgress(prev => ({ ...prev, 'product_image': percent }));
        });
      }

      let currentUnits = [...(newProduct.imei_units || [])];
      if (newProduct.tempImei1 && !newProduct.is_bar_phone) {
        const i1 = newProduct.tempImei1.trim();
        const i2 = (newProduct.tempImei2 || '').trim();
        const uColor = (newProduct.tempUnitColor || newProduct.color || '').trim();
        if (i1 && !currentUnits.some(u => u.imei1 === i1 || u.imei2 === i1)) {
          currentUnits.push({ imei1: i1, imei2: i2 || undefined, color: uColor || undefined });
        }
      }

      const allImeis: string[] = [];
      const imeiColors: Record<string, string> = { ...(newProduct.imei_colors || {}) };

      if (currentUnits.length > 0) {
        currentUnits.forEach(u => {
          if (u.imei1 && !allImeis.includes(u.imei1)) allImeis.push(u.imei1);
          if (u.imei2 && !allImeis.includes(u.imei2)) allImeis.push(u.imei2);
          const uColor = (u.color || newProduct.color || '').trim();
          if (uColor) {
            if (u.imei1) imeiColors[u.imei1] = uColor;
            if (u.imei2) imeiColors[u.imei2] = uColor;
          }
        });
      }
      if (newProduct.imeis && newProduct.imeis.length > 0) {
        newProduct.imeis.forEach(i => {
          if (i && !allImeis.includes(i)) allImeis.push(i);
          if (newProduct.color && !imeiColors[i]) imeiColors[i] = newProduct.color;
        });
      }

      // 1 Piece = 1 Unit (even if it has 2 IMEIs)
      const hasUnits = currentUnits.length > 0;
      const finalQuantity = hasUnits ? currentUnits.length : Number(newProduct.quantity || 1);

      if (newProduct.id) {
        // Update existing product
        const updateData: any = {
          name: newProduct.name,
          purchase_price: pPrice,
          selling_price: sPrice,
          profit_margin: profit,
          quantity: hasUnits ? currentUnits.length : Number(newProduct.quantity || 0),
          ram: newProduct.ram,
          rom: newProduct.rom,
          color: newProduct.color,
          condition: newProduct.condition || 'new',
          condition_note: newProduct.condition_note || '',
          is_bar_phone: Boolean(newProduct.is_bar_phone),
          image_file_id: imageFileId,
          imeis: allImeis,
          imei_units: currentUnits,
          imei_colors: imeiColors
        };
        await updateDoc(doc(db, 'products', newProduct.id), updateData);
      } else {
        // Add new product
        await addDoc(collection(db, 'products'), {
          name: newProduct.name,
          purchase_price: pPrice,
          selling_price: sPrice,
          profit_margin: profit,
          quantity: finalQuantity,
          ram: newProduct.ram,
          rom: newProduct.rom,
          color: newProduct.color,
          condition: newProduct.condition || 'new',
          condition_note: newProduct.condition_note || '',
          is_bar_phone: Boolean(newProduct.is_bar_phone),
          imeis: allImeis,
          imei_units: currentUnits,
          imei_colors: imeiColors,
          image_file_id: imageFileId,
          created_at: new Date().toISOString()
        });
      }

      setNewProduct({ id: '', name: '', purchase_price: '', selling_price: '', quantity: '', ram: '', rom: '', color: '', tempUnitColor: '', condition: 'new', condition_note: '', is_bar_phone: false, imei_units: [], tempImei1: '', tempImei2: '', imeis: [], imei_colors: {}, image: null, image_file_id: '' });
      setIsAddProductOpen(false);
    } catch (error) {
      console.error('Failed to add/update product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaleProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (newSale.images.length === 0) {
      alert('Please upload at least one image');
      return;
    }
    setIsSubmitting(true);

    try {
      const product = products.find(p => p.id === newSale.product_id);
      if (!product || product.quantity <= 0) {
        alert('Product out of stock');
        return;
      }

      // 1. Upload images to Telegram
      const imageFileIds = await Promise.all(
        newSale.images.map(file => 
          uploadImageToTelegram(file, (percent) => {
            setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
          })
        )
      );

      // 2. Record sale
      const soldImei = (newSale.imei || '').trim();
      const matchedUnit = product.imei_units?.find(u => u.imei1 === soldImei || u.imei2 === soldImei);
      const remainingUnits = (product.imei_units || []).filter(u => u !== matchedUnit && u.imei1 !== soldImei && u.imei2 !== soldImei);
      const remainingImeis = (product.imeis || []).filter(i => {
        if (matchedUnit) {
          return i !== matchedUnit.imei1 && i !== matchedUnit.imei2;
        }
        return i !== soldImei;
      });

      const newStockQuantity = (product.imei_units && product.imei_units.length > 0)
        ? remainingUnits.length
        : Math.max(0, (product.quantity || 1) - 1);

      await addDoc(collection(db, 'sales'), {
        customer_name: newSale.customer_name,
        phone_number: newSale.phone_number,
        nid_number: newSale.nid_number,
        address: newSale.address,
        guarantor_number: newSale.guarantor_number,
        product_id: product.id,
        product_name: product.name,
        color: newSale.color || matchedUnit?.color || (soldImei && product.imei_colors?.[soldImei]) || product.color || '',
        imei: soldImei,
        imei2: matchedUnit ? (matchedUnit.imei1 === soldImei ? (matchedUnit.imei2 || '') : matchedUnit.imei1) : '',
        ram: product.ram || '',
        rom: product.rom || '',
        image_file_ids: imageFileIds,
        sale_date: new Date(newSale.sale_date).toISOString(),
        profit: product.profit_margin,
        actual_sale_price: product.selling_price
      });

      // 3. Decrease stock
      const stockUpdate: any = {
        quantity: newStockQuantity,
        imeis: remainingImeis,
        imei_units: remainingUnits
      };
      
      await updateDoc(doc(db, 'products', product.id), stockUpdate);

      setNewSale({
        customer_name: '',
        phone_number: '',
        nid_number: '',
        address: '',
        guarantor_number: '',
        product_id: '',
        images: [],
        sale_date: format(new Date(), "yyyy-MM-dd'T'HH:mm")
      });
      localStorage.removeItem('draft_newSale');
      setUploadProgress({});
      setIsSaleProductOpen(false);
    } catch (error: any) {
      console.error('Failed to record sale:', error);
      alert(`Failed to record sale: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCashSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const product = products.find(p => p.id === cashSale.product_id);
      if (!product || product.quantity <= 0) {
        alert('Product out of stock');
        return;
      }

      const actualPrice = Number(cashSale.actual_sale_price);
      const profit = actualPrice - product.purchase_price;

      const soldImei = (cashSale.imei || '').trim();
      const matchedUnit = product.imei_units?.find(u => u.imei1 === soldImei || u.imei2 === soldImei);
      const remainingUnits = (product.imei_units || []).filter(u => u !== matchedUnit && u.imei1 !== soldImei && u.imei2 !== soldImei);
      const remainingImeis = (product.imeis || []).filter(i => {
        if (matchedUnit) {
          return i !== matchedUnit.imei1 && i !== matchedUnit.imei2;
        }
        return i !== soldImei;
      });

      const newStockQuantity = (product.imei_units && product.imei_units.length > 0)
        ? remainingUnits.length
        : Math.max(0, (product.quantity || 1) - 1);

      await addDoc(collection(db, 'sales'), {
        customer_name: 'Cash Sale',
        phone_number: 'N/A',
        nid_number: 'N/A',
        address: 'N/A',
        guarantor_number: 'N/A',
        product_id: product.id,
        product_name: product.name,
        color: cashSale.color || matchedUnit?.color || (soldImei && product.imei_colors?.[soldImei]) || product.color || '',
        imei: soldImei,
        imei2: matchedUnit ? (matchedUnit.imei1 === soldImei ? (matchedUnit.imei2 || '') : matchedUnit.imei1) : '',
        ram: product.ram || '',
        rom: product.rom || '',
        image_file_ids: [],
        sale_date: new Date(cashSale.sale_date).toISOString(),
        profit: profit,
        actual_sale_price: actualPrice,
        is_cash_sale: true
      });

      const stockUpdate: any = {
        quantity: newStockQuantity,
        imeis: remainingImeis,
        imei_units: remainingUnits
      };

      await updateDoc(doc(db, 'products', product.id), stockUpdate);

      setCashSale({ 
        product_id: '', 
        actual_sale_price: '',
        sale_date: format(new Date(), "yyyy-MM-dd'T'HH:mm") 
      });
      localStorage.removeItem('draft_cashSale');
      setIsCashSaleOpen(false);
      setIsSaleProductOpen(false);
    } catch (error) {
      console.error('Failed to record cash sale:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSale = async (id: string, productId: string) => {
    if (!window.confirm('Are you sure you want to delete this sale record? This will restore the product quantity back to inventory if the product still exists.')) return;
    try {
      await deleteDoc(doc(db, 'sales', id));
      
      try {
        await updateDoc(doc(db, 'products', productId), {
          quantity: increment(1)
        });
      } catch (e) {
        console.warn('Product no longer exists, skipped updating quantity.');
      }

      // Check if there are any mobile bazar records associated with this sale and delete them
      const mbRecordsToDelete = mobileBazarRecords.filter(mb => mb.sale_id === id);
      for (const record of mbRecordsToDelete) {
        try {
          await deleteDoc(doc(db, 'mobile_bazar', record.id));
        } catch (e) {
          console.error("Failed to delete associated mobile bazar record", e);
        }
      }

      setSelectedSale(null);
    } catch (error) {
      console.error('Failed to delete sale:', error);
      alert('Failed to delete sale');
    }
  };

  const handleEditSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSale || isSubmitting) return;
    setIsSubmitting(true);

    try {
      let updatedImageFileIds = [...editingSale.image_file_ids];

      // Upload new images if any
      if (editSaleImages.length > 0) {
        const newImageFileIds = await Promise.all(
          editSaleImages.map(file => 
            uploadImageToTelegram(file, (percent) => {
              setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
            })
          )
        );
        updatedImageFileIds = [...updatedImageFileIds, ...newImageFileIds];
      }

      await updateDoc(doc(db, 'sales', editingSale.id), {
        customer_name: editingSale.customer_name,
        phone_number: editingSale.phone_number,
        nid_number: editingSale.nid_number,
        address: editingSale.address,
        guarantor_number: editingSale.guarantor_number,
        profit: Number(editingSale.profit),
        actual_sale_price: Number(editingSale.actual_sale_price || 0),
        sale_date: new Date(editingSale.sale_date).toISOString(),
        image_file_ids: updatedImageFileIds
      });
      setEditingSale(null);
      setEditSaleImages([]);
      setUploadProgress({});
      setSelectedSale(null);
    } catch (error: any) {
      console.error('Failed to update sale:', error);
      alert(`Failed to update sale: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMobileBazarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const sale = sales.find(s => s.id === newMobileBazar.sale_id);
      if (!sale) {
        alert('Please select a valid sale');
        return;
      }

      const downPayment = Number(newMobileBazar.down_payment);
      const netAmount = downPayment - sale.profit;

      await addDoc(collection(db, 'mobile_bazar'), {
        sale_id: sale.id,
        customer_name: sale.customer_name,
        product_name: sale.product_name,
        color: sale.color || '',
        imei: sale.imei || '',
        ram: sale.ram || '',
        rom: sale.rom || '',
        down_payment: downPayment,
        sale_profit: sale.profit,
        net_amount: netAmount,
        created_at: new Date().toISOString()
      });

      setNewMobileBazar({ sale_id: '', down_payment: '' });
      setIsMobileBazarOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'mobile_bazar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetMobileBazar = async () => {
    console.log('Resetting Mobile Bazar records...', mobileBazarRecords.length);
    if (mobileBazarRecords.length === 0) {
      alert('No records to clear.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ALL ${mobileBazarRecords.length} Mobile Bazar records? This cannot be undone.`)) return;
    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      mobileBazarRecords.forEach(record => {
        console.log('Adding to batch delete:', record.id);
        batch.delete(doc(db, 'mobile_bazar', record.id));
      });
      await batch.commit();
      console.log('Batch delete successful');
      alert('All Mobile Bazar records have been cleared.');
    } catch (error) {
      console.error('Failed to reset Mobile Bazar:', error);
      handleFirestoreError(error, OperationType.DELETE, 'mobile_bazar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) || 0);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = sortedProducts;
    if (productConditionFilter !== 'all') {
      result = result.filter(p => (p.condition || 'new') === productConditionFilter);
    }
    if (productSearch) {
      const search = productSearch.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(search) ||
        (p.condition_note && p.condition_note.toLowerCase().includes(search)) ||
        (p.condition === 'used' && ('used পুরাতন 2nd hand second hand'.includes(search))) ||
        (p.ram && p.ram.toLowerCase().includes(search)) ||
        (p.rom && p.rom.toLowerCase().includes(search)) ||
        (p.color && p.color.toLowerCase().includes(search)) ||
        (p.imei_units && p.imei_units.some(u => 
          (u.color && u.color.toLowerCase().includes(search)) ||
          (u.imei1 && u.imei1.toLowerCase().includes(search)) ||
          (u.imei2 && u.imei2.toLowerCase().includes(search))
        )) ||
        (p.imeis && p.imeis.some(imei => imei.toLowerCase().includes(search)))
      );
    }
    return result;
  }, [sortedProducts, productConditionFilter, productSearch]);

  const filteredSales = useMemo(() => {
    if (!saleSearch) return sales;
    const search = saleSearch.toLowerCase();
    return sales.filter(s => 
      s.customer_name.toLowerCase().includes(search) ||
      s.phone_number.includes(search) ||
      s.nid_number.includes(search)
    );
  }, [sales, saleSearch]);

  const monthlyReportStats = useMemo(() => {
    const reportSales = sales.filter(s => {
      const date = format(parseISO(s.sale_date), 'yyyy-MM-dd');
      return date >= reportStartDate && date <= reportEndDate;
    }).sort((a, b) => parseISO(a.sale_date).getTime() - parseISO(b.sale_date).getTime());

    let totalRetailPrice = 0;
    let totalMrp = 0;
    let totalProfit = 0;

    const rows = reportSales.map((s, idx) => {
      const product = products.find(p => p.id === s.product_id);
      const retailPrice = (s.purchase_price !== undefined && s.purchase_price !== null)
        ? s.purchase_price
        : (product?.purchase_price ?? Math.max(0, (s.actual_sale_price || 0) - s.profit));
      const mrp = s.actual_sale_price ?? product?.selling_price ?? 0;
      const profit = calculateDynamicProfit(s);

      totalRetailPrice += (retailPrice || 0);
      totalMrp += (mrp || 0);
      totalProfit += profit;

      const modelSpec = [
        s.product_name,
        (s.ram || s.rom) ? `(${s.ram || ''}${s.ram && s.rom ? '/' : ''}${s.rom || ''})` : '',
        s.color ? `[${s.color}]` : ''
      ].filter(Boolean).join(' ');

      return {
        sl: idx + 1,
        id: s.id,
        saleDate: format(parseISO(s.sale_date), 'dd/MM/yyyy'),
        time: format(parseISO(s.sale_date), 'hh:mm a'),
        model: modelSpec,
        customerName: s.customer_name,
        customerMobile: s.phone_number || '-',
        retailPrice: retailPrice || 0,
        mrp: mrp || 0,
        profit: profit
      };
    });

    return { 
      totalSales: reportSales.length, 
      totalRetailPrice,
      totalMrp,
      totalProfit, 
      rows,
      reportSales 
    };
  }, [sales, products, reportStartDate, reportEndDate, calculateDynamicProfit]);

  const handleExportMonthlyCSV = () => {
    if (!monthlyReportStats.rows.length) {
      alert('No sales found for the selected date range.');
      return;
    }
    const headers = ['SL', 'Date', 'Model', 'Customer Mobile', 'Customer Name', 'Retail Price (BDT)', 'MRP (BDT)', 'Profit (BDT)'];
    const csvRows = [
      headers.join(','),
      ...monthlyReportStats.rows.map(r => [
        r.sl,
        `"${r.saleDate}"`,
        `"${r.model.replace(/"/g, '""')}"`,
        `"${r.customerMobile}"`,
        `"${r.customerName.replace(/"/g, '""')}"`,
        r.retailPrice,
        r.mrp,
        r.profit
      ].join(',')),
      ['', '', '"TOTAL"', '', '', monthlyReportStats.totalRetailPrice, monthlyReportStats.totalMrp, monthlyReportStats.totalProfit].join(',')
    ];

    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales_report_${reportStartDate}_to_${reportEndDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('printable-a4-sheet');
    if (!element) {
      window.print();
      return;
    }
    setIsGeneratingPdf(true);
    try {
      // @ts-ignore
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = (html2pdfModule.default || html2pdfModule) as any;
      const opt = {
        margin: [6, 6, 6, 6],
        filename: `Sales_Report_${reportStartDate}_to_${reportEndDate}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Failed to generate PDF via html2pdf:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const mobileBazarPreview = useMemo(() => {
    const sale = sales.find(s => s.id === newMobileBazar.sale_id);
    if (!sale || !newMobileBazar.down_payment) return null;
    const profit = calculateDynamicProfit(sale);
    const downPayment = Number(newMobileBazar.down_payment);
    const net = downPayment - profit;
    return { profit, downPayment, net };
  }, [newMobileBazar, sales, calculateDynamicProfit]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl w-full max-w-md text-center border border-gray-100"
        >
          <LogoBranding fileId={logoFileId} className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mehedy Telecom</h1>
          <p className="text-gray-500 mb-6 text-sm">Manage your inventory and sales efficiently</p>

          {loginError && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 leading-relaxed">
                  <p className="font-semibold text-amber-900 mb-1">Sign-in Notice</p>
                  <p>{loginError}</p>
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3 active:scale-[0.99]"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          {isInIframe && (
            <div className="mt-5 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 mb-2">
                Running in preview frame? If Google Sign-in fails due to browser restrictions:
              </p>
              <a
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-xs text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 py-2.5 px-4 rounded-xl transition-all w-full border border-blue-200"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open App in New Tab to Sign In
              </a>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <RestrictedAccess user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 h-28 sm:h-36 shadow-md relative">
        <div className="absolute inset-0 overflow-hidden rounded-b-2xl pointer-events-none">
          <BannerBranding fileId={bannerFileId} />
        </div>
        
        {/* Action Buttons & User Info - Top Right */}
        <div className="absolute top-1 right-1 sm:top-2 sm:right-4 z-20 flex items-center gap-1 sm:gap-3">
          <div className="hidden lg:flex flex-col items-end mr-1">
            <span className="text-[8px] font-black text-gray-900 uppercase tracking-wider bg-white/20 px-1 rounded">{user.displayName}</span>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 sm:p-2 bg-white/40 hover:bg-white backdrop-blur-md rounded-full shadow-sm border border-white/40 transition-all text-gray-800 hover:text-blue-600"
            title="Shop Settings"
          >
            <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button 
            onClick={handleLogout} 
            className="p-1.5 sm:p-2 bg-white/40 hover:bg-red-50 backdrop-blur-md rounded-full shadow-sm border border-white/40 transition-all group"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-800 group-hover:text-red-600" />
          </button>
        </div>

        {/* Brand Elements - Logo and Name Stacked */}
        <div className="relative z-10 px-3 sm:px-6 pt-1.5 sm:pt-2.5 flex flex-col items-start gap-0.5 sm:gap-1">
          <LogoBranding 
            fileId={logoFileId} 
            className="w-8 h-8 sm:w-11 sm:h-11 shadow-md rounded-lg border border-white/40" 
          />
          <h1 className="text-[10px] sm:text-xs font-black text-gray-900 tracking-tighter drop-shadow-md uppercase -ml-1">
            Mehedy Telecom
          </h1>
          <div className="relative w-32 sm:w-44 mt-0.5 sm:mt-1 -ml-1 sm:-ml-1.5 flex gap-1 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500" />
              <input 
                type="text"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const query = productSearch.trim();
                    if (query) {
                      // Check if it's an IMEI-like search (numeric / digits with length >= 8) or exact match
                      const isDigits = /^\d{6,}$/.test(query);
                      const isImeiFound = products.some(p => 
                        p.imeis?.some(i => i.toLowerCase().includes(query.toLowerCase())) ||
                        p.imei_units?.some(u => (u.imei1 && u.imei1.toLowerCase().includes(query.toLowerCase())) || (u.imei2 && u.imei2.toLowerCase().includes(query.toLowerCase())))
                      );
                      const isNameFound = products.some(p => 
                        p.name.toLowerCase().includes(query.toLowerCase()) || 
                        (p.color && p.color.toLowerCase().includes(query.toLowerCase())) ||
                        p.imei_units?.some(u => u.color && u.color.toLowerCase().includes(query.toLowerCase()))
                      );
                      if (!isImeiFound && !isNameFound && isDigits) {
                        setNotAvailableImei({
                          isOpen: true,
                          imei: query,
                          source: 'search'
                        });
                      }
                    }
                  }
                }}
                placeholder="Search products..."
                className="w-full pl-6 pr-6 py-0.5 sm:py-1 text-[9px] sm:text-xs rounded-md border border-gray-200 bg-white/90 focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-400 font-medium"
              />
              {productSearch && (
                <button 
                  onClick={() => setProductSearch('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              )}
            </div>
            <button 
              onClick={() => setActiveScanner('search')}
              className="text-gray-500 hover:text-blue-600 p-0.5 rounded-md hover:bg-gray-100 transition-colors"
              title="Scan Barcode"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Quick search suggestions dropdown */}
            {productSearch && (
              <div className="absolute left-0 top-full mt-1.5 w-64 sm:w-72 bg-white border border-gray-150 rounded-xl shadow-xl py-1.5 z-50 max-h-56 overflow-y-auto">
                <div className="px-3 py-1 bg-gray-50 border-b border-gray-100 text-[9px] sm:text-[10px] text-gray-450 font-black tracking-widest uppercase flex justify-between items-center sticky top-0 z-10">
                  <span>Matched ({filteredProducts.length})</span>
                  <button onClick={() => setProductSearch('')} className="hover:text-red-500 normal-case font-bold">Clear</button>
                </div>
                {filteredProducts.length === 0 ? (
                  <div className="px-3 py-2 text-[10px] sm:text-xs text-gray-500 italic">No products found matching "{productSearch}"</div>
                ) : (
                  filteredProducts.map(p => (
                    <div 
                      key={p.id}
                      className="px-3 py-2 hover:bg-violet-50/50 border-b border-gray-50 last:border-0 cursor-pointer flex flex-col gap-1 transition-colors"
                      onClick={() => {
                        const elem = document.getElementById(`product-row-${p.id}`);
                        if (elem) {
                          elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          elem.classList.add('bg-violet-100/70', 'transition-colors', 'duration-300');
                          setTimeout(() => {
                            elem.classList.remove('bg-violet-100/70');
                          }, 3000);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="font-bold text-[10px] sm:text-xs text-gray-800 line-clamp-1">{p.name}</span>
                          {p.condition === 'used' && (
                            <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 shrink-0">Used</span>
                          )}
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${p.quantity > 0 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                          {p.quantity > 0 ? `${p.quantity} In Stock` : 'Out'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-gray-500 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span>{p.ram ? `${p.ram}/${p.rom}` : 'No RAM/ROM'}</span>
                          {p.color && (
                            <span className="text-gray-600 font-medium bg-gray-100 px-1 rounded text-[9px]">
                              {p.color}
                            </span>
                          )}
                        </div>
                        <span className="text-violet-600 font-extrabold">৳{p.selling_price.toLocaleString()}</span>
                      </div>
                      {p.imeis && p.imeis.length > 0 && (
                        <div className="text-[8px] text-gray-400 font-mono flex items-center gap-1">
                          <span>IMEI:</span>
                          <span className="truncate max-w-[170px]">{p.imeis.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Summary Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              <button 
                onClick={() => {
                  setNewProduct({ id: '', name: '', purchase_price: '', selling_price: '', quantity: '', ram: '', rom: '', color: '', condition: 'new', condition_note: '', is_bar_phone: false, tempImei1: '', tempImei2: '', imei_units: [], imeis: [], imei_colors: {}, image: null, image_file_id: '' });
                  setIsAddProductOpen(true);
                }}
                className="flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-100"
              >
                <Plus className="w-5 h-5" /> Add Product
              </button>
              
              <button 
                onClick={() => {
                  setSaleImeiInput('');
                  setCashImeiInput('');
                  setNewSale({
                    customer_name: '',
                    phone_number: '',
                    nid_number: '',
                    address: '',
                    guarantor_number: '',
                    product_id: '',
                    imei: '',
                    color: '',
                    images: [],
                    sale_date: format(new Date(), "yyyy-MM-dd'T'HH:mm")
                  });
                  setCashSale({
                    product_id: '',
                    imei: '',
                    color: '',
                    actual_sale_price: '',
                    sale_date: format(new Date(), "yyyy-MM-dd'T'HH:mm")
                  });
                  setSaleTab('emi');
                  setIsSaleProductOpen(true);
                }}
                className="flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-100"
              >
                <ShoppingCart className="w-5 h-5" /> Sell Product
              </button>
              <button 
                onClick={() => setIsSaleListOpen(true)}
                className="flex items-center justify-center gap-2 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-100"
              >
                <List className="w-5 h-5" /> Sale List
              </button>
              <button 
                onClick={() => setIsMonthlyReportOpen(true)}
                className="flex items-center justify-center gap-2 py-4 bg-gray-800 hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg shadow-gray-200"
              >
                <BarChart3 className="w-5 h-5" /> Monthly Report
              </button>
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* 1. Brand New */}
              <SummaryItem 
                icon={ShoppingCart} 
                label="Brand New" 
                value={stats.totalQuantity} 
                suffix=" Pcs"
                colorClass="bg-blue-600" 
                subtitle="Click for Brand List"
                subtitleClass="text-blue-700 bg-blue-50 border-blue-200"
                onClick={() => setIsBrandStockOpen(true)}
              />
              {/* 2. Used Mobile */}
              <SummaryItem 
                icon={RotateCcw} 
                label="Used Mobile" 
                value={stats.usedQuantity} 
                suffix=" Pcs"
                colorClass="bg-amber-600" 
                subtitle={`${stats.usedProductsCount} Models`}
                subtitleClass="text-amber-800 bg-amber-50 border-amber-200"
                onClick={() => setIsUsedMobileModalOpen(true)}
              />
              {/* 3. Bar Phone */}
              <SummaryItem 
                icon={Smartphone} 
                label="Bar Phone" 
                value={stats.barQuantity} 
                suffix=" Pcs"
                colorClass="bg-blue-600" 
                subtitle={`${stats.barProductsCount} Models`}
                subtitleClass="text-blue-800 bg-blue-50 border-blue-200"
                onClick={() => setIsBarPhoneModalOpen(true)}
              />
              {/* 4. Product Summary */}
              <SummaryItem 
                icon={Layers} 
                label="Product Summary" 
                value={products.length} 
                suffix=" Models"
                colorClass="bg-indigo-600" 
                subtitle="Click for Summary"
                subtitleClass="text-indigo-800 bg-indigo-50 border-indigo-200"
                onClick={() => setIsProductSummaryOpen(true)}
              />
              {/* 5. Total Stock */}
              <SummaryItem 
                symbol="৳" 
                label="Total Stock" 
                value={stats.totalStockValue} 
                prefix="৳"
                colorClass="bg-blue-500" 
              />
              {/* 6. Today Sale */}
              <SummaryItem 
                icon={Calendar} 
                label="Today Sale" 
                value={stats.todayCount} 
                colorClass="bg-blue-500" 
              />
              {/* 7. Today Profit */}
              <SummaryItem 
                symbol="৳" 
                label="Today Profit" 
                value={stats.todayProfit} 
                prefix="৳"
                colorClass="bg-emerald-500" 
              />
              {/* 8. Monthly Sale */}
              <SummaryItem 
                icon={TrendingUp} 
                label="Monthly Sale" 
                value={stats.monthlyCount} 
                colorClass="bg-purple-500" 
              />
              {/* 9. Monthly Profit */}
              <SummaryItem 
                symbol="৳" 
                label="Monthly Profit" 
                value={stats.monthlyProfit} 
                prefix="৳"
                colorClass="bg-orange-500" 
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200 mb-8" />

        {/* Current Month Sales Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              Monthly Sales List ({format(new Date(), 'MMMM')})
            </h2>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold border border-blue-100">
                Count: {currentMonthSales.length}
              </div>
              <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-100">
                Total: ৳{currentMonthTotal.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-[10px] sm:text-xs font-black uppercase tracking-widest sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">Model Number</th>
                  <th className="px-6 py-4 text-right">Selling Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentMonthSales.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="w-8 h-8 text-gray-300" />
                        <p className="text-gray-400 italic">No sales recorded this month yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentMonthSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                          <span>{sale.product_name}</span>
                          {(sale.ram || sale.rom) && (
                            <span className="text-[10px] font-medium text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                              {sale.ram}/{sale.rom}
                            </span>
                          )}
                          {sale.color && sale.color !== '' && (
                            <div 
                              className={`w-2.5 h-2.5 rounded-full shadow border-white border ${
                                sale.color === 'Black' ? 'bg-black' :
                                sale.color === 'Titanium Gray' ? 'bg-slate-500' :
                                sale.color === 'Blue' ? 'bg-blue-500' :
                                sale.color === 'Gold' ? 'bg-yellow-500' :
                                sale.color === 'Orange' ? 'bg-orange-500' : 'bg-transparent'
                              }`}
                              title={sale.color}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            {format(parseISO(sale.sale_date), 'dd MMM')}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {format(parseISO(sale.sale_date), 'hh:mm a')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-black text-emerald-600 text-lg">
                          ৳{(sale.actual_sale_price || products.find(p => p.id === sale.product_id)?.selling_price || 0).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="h-px bg-gray-200 mb-8" />

        {/* Product Stock List */}
        <div id="stock-list-section" className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                Product Stock List
              </h2>
              {/* Filter Tabs */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1 text-xs font-bold">
                <button
                  onClick={() => setProductConditionFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${productConditionFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  All ({products.length})
                </button>
                <button
                  onClick={() => setProductConditionFilter('new')}
                  className={`px-3 py-1 rounded-lg transition-all ${productConditionFilter === 'new' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Brand New ({products.filter(p => (p.condition || 'new') === 'new').length})
                </button>
                <button
                  onClick={() => setProductConditionFilter('used')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${productConditionFilter === 'used' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <RotateCcw className="w-3 h-3 text-amber-600" />
                  Used ({products.filter(p => p.condition === 'used').length})
                </button>
              </div>

              {isSuperAdmin && products.length > 0 && (
                <button
                  onClick={() => setIsClearStockModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-colors shadow-2xs"
                  title="বর্তমান স্টক সম্পূর্ণ খালি করুন (পূর্বের বিক্রয় ইতিহাস সুরক্ষিত থাকবে)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Stock</span>
                </button>
              )}
            </div>
            {productSearch && (
              <span className="text-xs bg-gray-150 text-gray-600 font-semibold px-2 py-1 rounded-md border border-gray-200">
                Matched {filteredProducts.length} list {filteredProducts.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                <tr>
                  <th className="px-4 sm:px-6 py-4">Product Name</th>
                  <th className="px-4 sm:px-6 py-4">Variant</th>
                  <th className="px-4 sm:px-6 py-4">Date Added</th>
                  <th className="px-4 sm:px-6 py-4">Purchase</th>
                  <th className="px-4 sm:px-6 py-4">Selling</th>
                  <th className="px-4 sm:px-6 py-4">Profit/Pcs</th>
                  <th className="px-4 sm:px-6 py-4">Stock</th>
                  <th className="px-4 sm:px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} id={`product-row-${product.id}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                          {product.image_file_id ? (
                            <TelegramImage fileId={product.image_file_id} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-gray-900">{product.name}</span>
                            {product.condition === 'used' && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                <RotateCcw className="w-2.5 h-2.5" /> Used
                              </span>
                            )}
                          </div>
                          {product.condition_note && (
                            <span className="text-[10px] text-amber-700 italic font-medium">{product.condition_note}</span>
                          )}
                          {product.color && product.color !== '' && (
                            <div className="flex items-center gap-1 mt-1">
                              <div 
                                className={`w-3 h-3 rounded-full shadow border-white border ${
                                  product.color === 'Black' ? 'bg-black' :
                                  product.color === 'Titanium Gray' ? 'bg-slate-500' :
                                  product.color === 'Blue' ? 'bg-blue-500' :
                                  product.color === 'Gold' ? 'bg-yellow-500' :
                                  product.color === 'Orange' ? 'bg-orange-500' : 'bg-transparent'
                                }`}
                                title={product.color}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-gray-500 text-sm">
                      {product.ram && product.rom ? `${product.ram}/${product.rom}` : '-'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-gray-400 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {product.created_at ? format(parseISO(product.created_at), 'dd MMM yyyy') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-gray-600 font-medium">৳{product.purchase_price}</td>
                    <td className="px-4 sm:px-6 py-4 text-gray-600">৳{product.selling_price}</td>
                    <td className="px-4 sm:px-6 py-4 text-emerald-600 font-bold">৳{product.profit_margin}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold w-fit ${
                          product.quantity > 10 ? 'bg-emerald-100 text-emerald-700' : 
                          product.quantity > 0 ? 'bg-orange-100 text-orange-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {product.quantity} Pcs
                        </span>
                        {product.imeis && product.imeis.length > 0 && (
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {product.imeis.slice(0, 2).map((imei, idx) => (
                              <span key={idx} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono" title={imei}>
                                {imei.length > 8 ? imei.slice(-6) : imei}
                              </span>
                            ))}
                            {product.imeis.length > 2 && (
                              <span className="text-[9px] text-blue-500 font-bold px-1 py-0.5">+{product.imeis.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => {
                            setNewProduct({
                              id: product.id,
                              name: product.name,
                              purchase_price: String(product.purchase_price),
                              selling_price: String(product.selling_price),
                              quantity: '0',
                              ram: product.ram || '',
                              rom: product.rom || '',
                              color: product.color || '',
                              condition: product.condition || 'new',
                              condition_note: product.condition_note || '',
                              is_bar_phone: Boolean(product.is_bar_phone),
                              imei_units: product.imei_units || [],
                              tempImei1: '',
                              tempImei2: '',
                              imeis: [],
                              imei_colors: {},
                              image: null,
                              image_file_id: product.image_file_id || ''
                            });
                            setIsAddProductOpen(true);
                          }}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="Edit / Restock"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <Package className="w-10 h-10 text-gray-300" />
                        <p className="font-bold text-gray-700 text-sm">স্টকে কোনো পণ্য নেই (No Stock in Inventory)</p>
                        <p className="text-xs text-gray-400">নতুন পণ্য এন্ট্রি করতে নিচে ক্লিক করুন</p>
                        <button
                          type="button"
                          onClick={() => {
                            setNewProduct({ id: '', name: '', purchase_price: '', selling_price: '', quantity: '', ram: '', rom: '', color: '', condition: 'new', condition_note: '', imeis: [], imei_colors: {}, image: null, image_file_id: '' });
                            setIsAddProductOpen(true);
                          }}
                          className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-100"
                        >
                          <Plus className="w-4 h-4" /> Add New Product
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-100">
                <tr>
                  <td colSpan={3} className="px-4 sm:px-6 py-4 font-black text-gray-900 uppercase tracking-wider">Total Stock Summary</td>
                  <td className="px-4 sm:px-6 py-4 font-black text-blue-600">৳<Counter value={stats.totalStockValue} /></td>
                  <td colSpan={2}></td>
                  <td colSpan={2} className="px-4 sm:px-6 py-4 font-black text-gray-900">
                    <Counter value={products.reduce((acc, p) => acc + p.quantity, 0)} suffix=" Pcs Total" />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>

      <Modal 
        isOpen={isAddProductOpen} 
        onClose={() => setIsAddProductOpen(false)} 
        title={newProduct.id ? (newProduct.condition === 'used' ? "Update Used Product" : "Update Product") : (newProduct.condition === 'used' ? "Add Used Product (পুরাতন পণ্য)" : "Add New Product (নতুন পণ্য)")}
      >
        <form onSubmit={handleAddProduct} className="space-y-4">
          {/* Bar Phone Checkbox */}
          <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-blue-600 text-white">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-blue-900">Bar Phone (বাটন ফোন)</div>
                <div className="text-[11px] text-blue-600">বাটন ফোন বা ফিচার ফোন হিসেবে তালিকাভুক্ত করুন</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox"
                checked={Boolean(newProduct.is_bar_phone)}
                onChange={e => setNewProduct({ ...newProduct, is_bar_phone: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Condition Selection Card (Only for Smart / Standard Phones) */}
          {!newProduct.is_bar_phone && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Product Condition (পণ্যের অবস্থা)</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewProduct({ ...newProduct, condition: 'new' })}
                  className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all text-left ${
                    newProduct.condition === 'new'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm ring-1 ring-blue-500'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${newProduct.condition === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Brand New</div>
                    <div className="text-[11px] text-gray-500">নতুন ইনটেক পণ্য</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setNewProduct({ ...newProduct, condition: 'used' })}
                  className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all text-left ${
                    newProduct.condition === 'used'
                      ? 'border-amber-600 bg-amber-50/70 text-amber-900 shadow-sm ring-1 ring-amber-500'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${newProduct.condition === 'used' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Used / 2nd Hand</div>
                    <div className="text-[11px] text-gray-500">ব্যবহৃত / পুরাতন পণ্য</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* If Used, show Condition Notes Card */}
          {!newProduct.is_bar_phone && newProduct.condition === 'used' && (
            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
              <label className="block text-xs font-bold text-amber-900">Used Device Condition & Notes (ঐচ্ছিক বিবরণ)</label>
              <input
                type="text"
                value={newProduct.condition_note}
                onChange={e => setNewProduct({ ...newProduct, condition_note: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white text-sm"
                placeholder="e.g. 98% Fresh, Battery 89%, Box included"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Like New (99%)', 'Good Condition', 'Minor Scratches', 'Box & Charger', 'Only Device', 'Battery 85%+'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const current = newProduct.condition_note;
                      if (!current) {
                        setNewProduct({ ...newProduct, condition_note: tag });
                      } else if (!current.includes(tag)) {
                        setNewProduct({ ...newProduct, condition_note: `${current}, ${tag}` });
                      }
                    }}
                    className="text-[10px] font-semibold bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Select Existing Product (Optional)</label>
            <select 
              value={newProduct.id}
              onChange={e => {
                const id = e.target.value;
                if (id) {
                  const p = products.find(prod => prod.id === id);
                  if (p) {
                    setNewProduct({
                      id: p.id,
                      name: p.name,
                      purchase_price: String(p.purchase_price),
                      selling_price: String(p.selling_price),
                      quantity: '', // Reset quantity for restock
                      ram: p.ram || '',
                      rom: p.rom || '',
                      color: p.color || '',
                      condition: p.condition || 'new',
                      condition_note: p.condition_note || '',
                      is_bar_phone: Boolean(p.is_bar_phone),
                      imei_units: p.imei_units || [],
                      tempImei1: '',
                      tempImei2: '',
                      imeis: [],
                      imei_colors: {},
                      image: null,
                      image_file_id: p.image_file_id || ''
                    });
                  }
                } else {
                  setNewProduct({ id: '', name: '', purchase_price: '', selling_price: '', quantity: '', ram: '', rom: '', color: '', condition: 'new', condition_note: '', is_bar_phone: false, imei_units: [], tempImei1: '', tempImei2: '', imeis: [], imei_colors: {}, image: null, image_file_id: '' });
                }
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">-- Create New Product --</option>
              {sortedProducts.map(p => (
                <option key={p.id} value={p.id}>{p.condition === 'used' ? '[USED] ' : ''}{p.is_bar_phone ? '[BAR] ' : ''}{p.name} {p.ram ? `(${p.ram}/${p.rom})` : ''} - Stock: {p.quantity}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
            <input 
              required
              type="text"
              value={newProduct.name}
              onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder={newProduct.is_bar_phone ? "e.g. Nokia 105, Itel 2163, Symphony L25..." : "e.g. iPhone 15 Pro"}
            />
          </div>

          {!newProduct.is_bar_phone && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Product Image</label>
              <div className="flex items-center gap-4">
                {newProduct.image_file_id && !newProduct.image && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                    <TelegramImage fileId={newProduct.image_file_id} />
                  </div>
                )}
                {newProduct.image && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                    <img src={URL.createObjectURL(newProduct.image)} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 text-gray-500">
                      <ImageIcon className="w-5 h-5" />
                      <span className="text-xs font-bold">{newProduct.image ? newProduct.image.name : "Choose Image"}</span>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) setNewProduct({...newProduct, image: file});
                      }}
                    />
                  </label>
                  {uploadProgress['product_image'] !== undefined && (
                    <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all" style={{ width: `${uploadProgress['product_image']}%` }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!newProduct.is_bar_phone && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">RAM</label>
                <input 
                  type="text"
                  value={newProduct.ram}
                  onChange={e => setNewProduct({...newProduct, ram: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 8GB"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ROM</label>
                <input 
                  type="text"
                  value={newProduct.rom}
                  onChange={e => setNewProduct({...newProduct, rom: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 256GB"
                />
              </div>
            </div>
          )}

          {!newProduct.is_bar_phone && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Color</label>
              <input 
                type="text"
                value={newProduct.color}
                onChange={e => setNewProduct({...newProduct, color: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Titanium Black, Deep Purple, Blue, Gold..."
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Purchase Price (ক্রয় মূল্য)</label>
              <input 
                required
                type="number"
                value={newProduct.purchase_price}
                onChange={e => setNewProduct({...newProduct, purchase_price: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Selling Price (বিক্রয় মূল্য)</label>
              <input 
                required
                type="number"
                value={newProduct.selling_price}
                onChange={e => setNewProduct({...newProduct, selling_price: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-emerald-800">Estimated Profit Margin</span>
              <span className="text-lg font-black text-emerald-600">
                ৳{Math.max(0, Number(newProduct.selling_price || 0) - Number(newProduct.purchase_price || 0))}
              </span>
            </div>
          </div>

          {!newProduct.is_bar_phone && (
            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <span>IMEI & Color Units</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-md border border-blue-200">
                      ১ পিস = ২টি IMEI + ১টি Color
                    </span>
                  </label>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    প্রতিটি ফোনের জন্য ২টি IMEI এবং কালার ভ্যারিয়েন্ট যোগ করুন (২টি IMEI = ১ পিস স্টক)
                  </p>
                </div>
                <span className="text-xs bg-blue-600 text-white font-black px-2.5 py-1 rounded-lg shadow-2xs">
                  {(newProduct.imei_units || []).length} Pcs Added
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  {/* IMEI 1 */}
                  <div className="sm:col-span-5 relative">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      IMEI 1 (Primary)
                    </label>
                    <div className="relative">
                      <input 
                        ref={imei1InputRef}
                        type="text"
                        placeholder="Scan/Type IMEI 1..."
                        value={newProduct.tempImei1 || ''}
                        onChange={e => setNewProduct({...newProduct, tempImei1: e.target.value})}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (newProduct.tempImei1 || '').trim();
                            if (val.length >= 8 && !newProduct.name) {
                              const tac = val.substring(0, 8);
                              const match = products.find(p => p.imeis?.some(i => i.startsWith(tac)));
                              if (match) {
                                setNewProduct(prev => ({
                                  ...prev,
                                  name: match.name,
                                  ram: match.ram || '',
                                  rom: match.rom || '',
                                  color: match.color || '',
                                  purchase_price: String(match.purchase_price),
                                  selling_price: String(match.selling_price)
                                }));
                              }
                            }
                            imei2InputRef.current?.focus();
                          }
                        }}
                        className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono font-medium"
                      />
                      <button 
                        type="button"
                        onClick={() => setActiveScanner('productImei1')}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 p-1"
                        title="Scan IMEI 1 with Camera"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* IMEI 2 */}
                  <div className="sm:col-span-4 relative">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      IMEI 2 (Secondary)
                    </label>
                    <div className="relative">
                      <input 
                        ref={imei2InputRef}
                        type="text"
                        placeholder="Scan/Type IMEI 2..."
                        value={newProduct.tempImei2 || ''}
                        onChange={e => setNewProduct({...newProduct, tempImei2: e.target.value})}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImeiUnit();
                          }
                        }}
                        className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono font-medium"
                      />
                      <button 
                        type="button"
                        onClick={() => setActiveScanner('productImei2')}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 p-1"
                        title="Scan IMEI 2 with Camera"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Unit Color */}
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Color (রং)
                    </label>
                    <input 
                      type="text"
                      placeholder={newProduct.color || "e.g. Blue"}
                      value={newProduct.tempUnitColor || ''}
                      onChange={e => setNewProduct({...newProduct, tempUnitColor: e.target.value})}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImeiUnit();
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Add Unit Button */}
                <div className="flex justify-between items-center pt-1 border-t border-blue-50">
                  <span className="text-[11px] text-gray-500 italic">
                    * ১টি ফোনে ২টি IMEI স্ক্যান করে Add Unit চাপলে ১ পিস স্টক হিসেবে সেভ হবে।
                  </span>
                  <button
                    type="button"
                    onClick={handleAddImeiUnit}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
                  >
                    <span>+ Add 1 Piece Unit</span>
                    <span className="text-[10px] opacity-80">(1 Pc Stock)</span>
                  </button>
                </div>
              </div>

              {/* List of Units Added */}
              {(newProduct.imei_units || []).length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {(newProduct.imei_units || []).map((unit, idx) => (
                    <div key={idx} className="bg-white border border-blue-200 px-3 py-2 rounded-xl text-xs flex items-center justify-between shadow-2xs hover:border-blue-300 transition-colors">
                      <div className="font-mono text-gray-800 flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-blue-700 font-sans">Pc {idx + 1}:</span>
                        <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          <strong className="text-gray-400 font-sans mr-1">IMEI 1:</strong>{unit.imei1}
                        </span>
                        {unit.imei2 && (
                          <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                            <strong className="text-gray-400 font-sans mr-1">IMEI 2:</strong>{unit.imei2}
                          </span>
                        )}
                        {unit.color && (
                          <span className="bg-purple-50 text-purple-700 font-sans font-bold px-2 py-0.5 rounded-full border border-purple-200 text-[11px]">
                            Color: {unit.color}
                          </span>
                        )}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          const units = (newProduct.imei_units || []).filter((_, i) => i !== idx);
                          setNewProduct({
                            ...newProduct,
                            imei_units: units,
                            quantity: String(units.length)
                          });
                        }} 
                        className="text-red-500 hover:text-red-700 font-bold ml-2 p-1 hover:bg-red-50 rounded"
                        title="Remove this unit"
                      >
                        &times; Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center justify-between">
              <span>{newProduct.id ? "Stock Quantity" : "Initial Quantity (Stock)"}</span>
              {newProduct.id && (
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-xs border border-blue-100">
                  Current Stock: {products.find(p => p.id === newProduct.id)?.quantity || 0} Pcs
                </span>
              )}
            </label>
            <input 
              required
              type="number"
              value={!newProduct.is_bar_phone && (newProduct.imei_units || []).length > 0 ? (newProduct.imei_units || []).length : newProduct.quantity}
              onChange={e => setNewProduct({...newProduct, quantity: e.target.value})}
              readOnly={!newProduct.is_bar_phone && (newProduct.imei_units || []).length > 0}
              className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                !newProduct.is_bar_phone && (newProduct.imei_units || []).length > 0 ? 'bg-gray-100 font-bold text-gray-700 cursor-not-allowed' : ''
              }`}
              placeholder="0"
            />
            {!newProduct.is_bar_phone && (newProduct.imei_units || []).length > 0 && (
              <p className="text-[11px] text-blue-600 mt-1 font-medium">
                * IMEI ইউনিটের সংখ্যার সাথে অটোমেটিক সিঙ্ক করা হয়েছে (প্রতি ১ পিস = ২টি IMEI)।
              </p>
            )}
          </div>
          <button 
            disabled={isSubmitting}
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> {newProduct.id ? "Update Product" : "Confirm Add Product"}</>}
          </button>
        </form>
      </Modal>

      {/* Unified Sell Product Modal */}
      <Modal 
        isOpen={isSaleProductOpen} 
        onClose={() => setIsSaleProductOpen(false)} 
        title={saleTab === 'emi' ? "Sell Product (EMI / Regular)" : "Sell Product (Cash Sale)"}
      >
        {/* Sale Type Selector Tabs */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Select Sale Type (বিক্রয়ের ধরণ)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSaleTab('emi')}
              className={`p-3 sm:p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all text-left cursor-pointer ${
                saleTab === 'emi'
                  ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-sm ring-1 ring-emerald-500'
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${saleTab === 'emi' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'}`}>
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm leading-tight">EMI / Regular Sell</div>
                <div className="text-[11px] text-gray-500">কিস্তি ও ডকুমেন্টসহ</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSaleTab('cash')}
              className={`p-3 sm:p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all text-left cursor-pointer ${
                saleTab === 'cash'
                  ? 'border-orange-500 bg-orange-50/80 text-orange-950 shadow-sm ring-1 ring-orange-400'
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${saleTab === 'cash' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500'}`}>
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm leading-tight">Cash Sell</div>
                <div className="text-[11px] text-gray-500">দ্রুত নগদ মূল্যে বিক্রয়</div>
              </div>
            </button>
          </div>
        </div>

        {saleTab === 'emi' ? (
          /* EMI / Regular Sale Form */
          <form onSubmit={handleSaleProduct} className="space-y-6">
            {/* Step 1: Product Selection & IMEI Scan */}
            <div className="space-y-4 bg-gray-50/80 p-4 sm:p-5 rounded-2xl border border-gray-200/80">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>Step 1: Scan IMEI or Select Product</span>
                </h3>
                {newSale.product_id && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Product Selected
                  </span>
                )}
              </div>

              {/* Scan IMEI Input */}
              <div className="bg-white p-3 sm:p-4 rounded-xl border border-blue-200 shadow-xs">
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Scan IMEI to Select Product (IMEI স্ক্যান করুন)</span>
                  <span className="text-[11px] text-blue-600 font-normal">Press Enter or Camera</span>
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={saleImeiInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSaleImeiInput(val);
                      const trimmed = val.trim();
                      if (!trimmed) {
                        // User cleared IMEI -> form completely blank
                        setNewSale(prev => ({
                          customer_name: '',
                          phone_number: '',
                          nid_number: '',
                          address: '',
                          guarantor_number: '',
                          product_id: '',
                          imei: '',
                          color: '',
                          images: [],
                          sale_date: prev.sale_date || format(new Date(), "yyyy-MM-dd'T'HH:mm")
                        }));
                      } else {
                        const match = products.find(p => p.imeis?.includes(trimmed));
                        if (match) {
                          setNewSale(prev => ({
                            ...prev,
                            product_id: match.id,
                            imei: trimmed,
                            color: match.imei_colors?.[trimmed] || match.color || ''
                          }));
                        } else if (newSale.product_id) {
                          // While typing or changing IMEI away from matched product, blank out product info
                          setNewSale(prev => ({
                            customer_name: '',
                            phone_number: '',
                            nid_number: '',
                            address: '',
                            guarantor_number: '',
                            product_id: '',
                            imei: '',
                            color: '',
                            images: [],
                            sale_date: prev.sale_date || format(new Date(), "yyyy-MM-dd'T'HH:mm")
                          }));
                        }
                      }
                    }}
                    placeholder="Scan / Type IMEI here & press Enter..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const imei = saleImeiInput.trim();
                        if (imei) {
                          const match = products.find(p => p.imeis?.includes(imei));
                          if (match) {
                            setNewSale(prev => ({
                              ...prev,
                              product_id: match.id,
                              imei: imei,
                              color: match.imei_colors?.[imei] || match.color || ''
                            }));
                          } else {
                            setNewSale(prev => ({
                              customer_name: '',
                              phone_number: '',
                              nid_number: '',
                              address: '',
                              guarantor_number: '',
                              product_id: '',
                              imei: '',
                              color: '',
                              images: [],
                              sale_date: prev.sale_date || format(new Date(), "yyyy-MM-dd'T'HH:mm")
                            }));
                            setNotAvailableImei({
                              isOpen: true,
                              imei: imei,
                              source: 'sale'
                            });
                          }
                        } else {
                          setNewSale(prev => ({
                            customer_name: '',
                            phone_number: '',
                            nid_number: '',
                            address: '',
                            guarantor_number: '',
                            product_id: '',
                            imei: '',
                            color: '',
                            images: [],
                            sale_date: prev.sale_date || format(new Date(), "yyyy-MM-dd'T'HH:mm")
                          }));
                        }
                      }
                    }}
                    className="flex-1 w-full px-4 py-2.5 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-mono"
                  />
                  <button 
                    type="button"
                    onClick={() => setActiveScanner('sale')}
                    className="px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center text-blue-600 shadow-xs"
                    title="Camera Scanner"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                {newSale.imei && (
                  <div className="mt-2.5 p-2 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
                    <span className="text-xs text-emerald-800 font-bold font-mono">
                      ✓ Scanned EMI IMEI: {newSale.imei}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => {
                        setSaleImeiInput('');
                        setNewSale(prev => ({
                          customer_name: '',
                          phone_number: '',
                          nid_number: '',
                          address: '',
                          guarantor_number: '',
                          product_id: '',
                          imei: '',
                          color: '',
                          images: [],
                          sale_date: prev.sale_date || format(new Date(), "yyyy-MM-dd'T'HH:mm")
                        }));
                      }} 
                      className="text-xs text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
                    >
                      &times; Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Select Product Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Or Select Product from Stock List (তালিকা থেকে পছন্দ করুন)
                </label>
                <select 
                  required
                  value={newSale.product_id}
                  onChange={e => {
                    const selectedId = e.target.value;
                    if (!selectedId) {
                      setSaleImeiInput('');
                      setNewSale(prev => ({
                        customer_name: '',
                        phone_number: '',
                        nid_number: '',
                        address: '',
                        guarantor_number: '',
                        product_id: '',
                        imei: '',
                        color: '',
                        images: [],
                        sale_date: prev.sale_date || format(new Date(), "yyyy-MM-dd'T'HH:mm")
                      }));
                      return;
                    }
                    const matchedProd = products.find(p => p.id === selectedId);
                    const selectedImei = matchedProd?.imeis?.includes(saleImeiInput.trim())
                      ? saleImeiInput.trim()
                      : (matchedProd?.imeis?.[0] || '');
                    setSaleImeiInput(selectedImei);
                    setNewSale(prev => ({
                      ...prev,
                      product_id: selectedId,
                      imei: selectedImei,
                      color: (selectedImei && matchedProd?.imei_colors?.[selectedImei]) || matchedProd?.color || ''
                    }));
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium"
                >
                  <option value="">Choose a product from inventory...</option>
                  {sortedProducts.map(p => (
                    <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                      {p.condition === 'used' ? '[USED] ' : ''}{p.name} {p.ram ? `(${p.ram}/${p.rom})` : ''} - {p.quantity > 0 ? `Stock: ${p.quantity}` : 'Out of Stock'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Preview Card */}
              {newSale.product_id && (
                <div className="flex items-center gap-4 p-3.5 bg-white rounded-xl border border-blue-100 shadow-xs">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0">
                    {products.find(p => p.id === newSale.product_id)?.image_file_id ? (
                      <TelegramImage fileId={products.find(p => p.id === newSale.product_id)!.image_file_id!} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-gray-900 text-sm">{products.find(p => p.id === newSale.product_id)?.name}</p>
                      {products.find(p => p.id === newSale.product_id)?.condition === 'used' && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">Used</span>
                      )}
                    </div>
                    {products.find(p => p.id === newSale.product_id)?.condition_note && (
                      <p className="text-[11px] text-amber-700 italic font-medium">{products.find(p => p.id === newSale.product_id)?.condition_note}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {products.find(p => p.id === newSale.product_id)?.ram}/{products.find(p => p.id === newSale.product_id)?.rom}
                    </p>
                    <p className="text-sm font-black text-blue-600 mt-0.5">৳{products.find(p => p.id === newSale.product_id)?.selling_price.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Customer Details & Images - ONLY unlocked when product_id is selected */}
            {!newSale.product_id ? (
              <div className="p-8 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/60 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-gray-800">
                  প্রথমে IMEI স্ক্যান করুন অথবা প্রোডাক্ট সিলেক্ট করুন
                </p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  প্রোডাক্ট সিলেক্ট না করা পর্যন্ত নিচের সকল ফর্ম কলাম সম্পূর্ণ খালি থাকবে।
                </p>
              </div>
            ) : (
              <>
                {/* Product Color */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Product Color (রং)</label>
                  <input 
                    type="text"
                    value={newSale.color || products.find(p => p.id === newSale.product_id)?.color || ''}
                    onChange={e => setNewSale({...newSale, color: e.target.value})}
                    placeholder="e.g. Titanium Blue, Black, Green..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white font-medium"
                  />
                </div>

                {/* Customer Information */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Customer Information</h3>
                    <div className="w-1/2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Sale Date & Time</label>
                      <input 
                        required
                        type="datetime-local"
                        value={newSale.sale_date}
                        onChange={e => setNewSale({...newSale, sale_date: e.target.value})}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Customer Name</label>
                      <input 
                        required
                        type="text"
                        value={newSale.customer_name}
                        onChange={e => setNewSale({...newSale, customer_name: e.target.value})}
                        placeholder="ক্রেতার নাম লিখুন"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number (Bkash)</label>
                      <input 
                        required
                        type="tel"
                        value={newSale.phone_number}
                        onChange={e => setNewSale({...newSale, phone_number: e.target.value})}
                        placeholder="017xxxxxxxx"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">NID Number</label>
                      <input 
                        required
                        type="text"
                        value={newSale.nid_number}
                        onChange={e => setNewSale({...newSale, nid_number: e.target.value})}
                        placeholder="জাতীয় পরিচয়পত্র নম্বর"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Guarantor Phone</label>
                      <input 
                        type="tel"
                        value={newSale.guarantor_number}
                        onChange={e => setNewSale({...newSale, guarantor_number: e.target.value})}
                        placeholder="জামিনদারের মোবাইল নম্বর"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Address</label>
                    <textarea 
                      required
                      value={newSale.address}
                      onChange={e => setNewSale({...newSale, address: e.target.value})}
                      placeholder="গ্রাহকের সম্পূর্ণ ঠিকানা লিখুন..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Image Upload (Telegram)</h3>
                    <button 
                      type="button" 
                      onClick={() => setActivePhotoCapture('sale')}
                      className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-blue-200 transition-colors"
                    >
                      <Camera className="w-4 h-4" /> Take Photo
                    </button>
                  </div>
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer relative bg-gray-50/50">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files) {
                          setNewSale({...newSale, images: Array.from(e.target.files)});
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1.5" />
                    <p className="text-sm font-bold text-gray-600">Click to upload images</p>
                    <p className="text-xs text-gray-400">Minimum 1 image required</p>
                    {newSale.images.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {newSale.images.map((f, i) => (
                          <div key={i} className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs font-bold text-gray-600">
                              <span>{f.name}</span>
                              <span>{uploadProgress[f.name] || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-blue-600 h-full transition-all duration-300"
                                style={{ width: `${uploadProgress[f.name] || 0}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShoppingCart className="w-5 h-5" /> Confirm EMI Sale</>}
                </button>
              </>
            )}
          </form>
        ) : (
          /* Cash Sale Form */
          <form onSubmit={handleCashSale} className="space-y-5">
            {/* Step 1: Scan IMEI or Select Product */}
            <div className="space-y-4 bg-gray-50/80 p-4 sm:p-5 rounded-2xl border border-gray-200/80">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>Step 1: Scan IMEI or Select Product</span>
                </h3>
                {cashSale.product_id && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Product Selected
                  </span>
                )}
              </div>

              {/* Scan IMEI */}
              <div className="bg-white p-3 sm:p-4 rounded-xl border border-emerald-200 shadow-xs">
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Scan IMEI to Select Product (IMEI স্ক্যান করুন)</span>
                  <span className="text-[11px] text-emerald-600 font-normal">Press Enter or Camera</span>
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={cashImeiInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCashImeiInput(val);
                      const trimmed = val.trim();
                      if (!trimmed) {
                        // Cleared IMEI -> form completely blank
                        setCashSale(prev => ({
                          product_id: '',
                          imei: '',
                          color: '',
                          actual_sale_price: '',
                          sale_date: prev.sale_date || format(new Date(), "yyyy-MM-dd'T'HH:mm")
                        }));
                      } else {
                        const match = products.find(p => p.imeis?.includes(trimmed));
                        if (match) {
                          setCashSale(prev => ({
                            ...prev,
                            product_id: match.id,
                            imei: trimmed,
                            color: match.imei_colors?.[trimmed] || match.color || '',
                            actual_sale_price: String(match.selling_price)
                          }));
                        } else if (cashSale.product_id) {
                          // While typing or changing IMEI away from matched product, blank out product info
                          setCashSale(prev => ({
                            product_id: '',
                            imei: '',
                            color: '',
                            actual_sale_price: '',
                            sale_date: prev.sale_date || format(new Date(), "yyyy-MM-dd'T'HH:mm")
                          }));
                        }
                      }
                    }}
                    placeholder="Scan / Type IMEI here & press Enter..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const imei = cashImeiInput.trim();
                        if (imei) {
                          const match = products.find(p => p.imeis?.includes(imei));
                          if (match) {
                            setCashSale(prev => ({
                              ...prev,
                              product_id: match.id,
                              imei: imei,
                              color: match.imei_colors?.[imei] || match.color || '',
                              actual_sale_price: String(match.selling_price)
                            }));
                          } else {
                            setCashSale(prev => ({
                              product_id: '',
                              imei: '',
                              color: '',
                              actual_sale_price: '',
                              sale_date: prev.sale_date || format(new Date(), "yyyy-MM-dd'T'HH:mm")
                            }));
                            setNotAvailableImei({
                              isOpen: true,
                              imei: imei,
                              source: 'cashSale'
                            });
                          }
                        } else {
                          setCashSale(prev => ({
                            product_id: '',
                            imei: '',
                            color: '',
                            actual_sale_price: '',
                            sale_date: prev.sale_date || format(new Date(), "yyyy-MM-dd'T'HH:mm")
                          }));
                        }
                      }
                    }}
                    className="flex-1 w-full px-4 py-2.5 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-mono"
                  />
                  <button 
                    type="button"
                    onClick={() => setActiveScanner('cashSale')}
                    className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center text-emerald-600 shadow-xs"
                    title="Camera Scanner"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                {cashSale.imei && (
                  <div className="mt-2.5 p-2 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
                    <span className="text-xs text-emerald-800 font-bold font-mono">
                      ✓ Scanned Cash IMEI: {cashSale.imei}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => {
                        setCashImeiInput('');
                        setCashSale(prev => ({
                          product_id: '',
                          imei: '',
                          color: '',
                          actual_sale_price: '',
                          sale_date: prev.sale_date || format(new Date(), "yyyy-MM-dd'T'HH:mm")
                        }));
                      }} 
                      className="text-xs text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
                    >
                      &times; Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Select Product Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Or Select Product from Stock List (তালিকা থেকে পছন্দ করুন)
                </label>
                <select 
                  required
                  value={cashSale.product_id}
                  onChange={e => {
                    const selectedId = e.target.value;
                    if (!selectedId) {
                      setCashImeiInput('');
                      setCashSale(prev => ({
                        product_id: '',
                        imei: '',
                        color: '',
                        actual_sale_price: '',
                        sale_date: prev.sale_date || format(new Date(), "yyyy-MM-dd'T'HH:mm")
                      }));
                      return;
                    }
                    const matchedProd = products.find(p => p.id === selectedId);
                    const selectedImei = matchedProd?.imeis?.includes(cashImeiInput.trim())
                      ? cashImeiInput.trim()
                      : (matchedProd?.imeis?.[0] || '');
                    setCashImeiInput(selectedImei);
                    setCashSale(prev => ({
                      ...prev,
                      product_id: selectedId,
                      imei: selectedImei,
                      color: (selectedImei && matchedProd?.imei_colors?.[selectedImei]) || matchedProd?.color || '',
                      actual_sale_price: matchedProd ? String(matchedProd.selling_price) : ''
                    }));
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm font-medium"
                >
                  <option value="">Choose a product from inventory...</option>
                  {sortedProducts.map(p => (
                    <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                      {p.condition === 'used' ? '[USED] ' : ''}{p.name} {p.ram ? `(${p.ram}/${p.rom})` : ''} - {p.quantity > 0 ? `Stock: ${p.quantity}` : 'Out of Stock'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Preview Card */}
              {cashSale.product_id && (
                <div className="flex items-center gap-4 p-3.5 bg-white rounded-xl border border-emerald-100 shadow-xs">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0">
                    {products.find(p => p.id === cashSale.product_id)?.image_file_id ? (
                      <TelegramImage fileId={products.find(p => p.id === cashSale.product_id)!.image_file_id!} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-gray-900 text-sm">{products.find(p => p.id === cashSale.product_id)?.name}</p>
                      {products.find(p => p.id === cashSale.product_id)?.condition === 'used' && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">Used</span>
                      )}
                    </div>
                    {products.find(p => p.id === cashSale.product_id)?.condition_note && (
                      <p className="text-[11px] text-amber-700 italic font-medium">{products.find(p => p.id === cashSale.product_id)?.condition_note}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {products.find(p => p.id === cashSale.product_id)?.ram}/{products.find(p => p.id === cashSale.product_id)?.rom}
                    </p>
                    <p className="text-sm font-black text-emerald-600 mt-0.5">৳{products.find(p => p.id === cashSale.product_id)?.selling_price.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Cash Sale Price & Profit - ONLY unlocked when product_id is selected */}
            {!cashSale.product_id ? (
              <div className="p-8 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/60 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto border border-orange-100">
                  <CreditCard className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-gray-800">
                  প্রথমে IMEI স্ক্যান করুন অথবা প্রোডাক্ট সিলেক্ট করুন
                </p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  প্রোডাক্ট সিলেক্ট না করা পর্যন্ত নগদ বিক্রয়ের মূল্য ও লাভের কলাম খালি থাকবে।
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Product Color (রং)</label>
                    <input 
                      type="text"
                      value={cashSale.color || products.find(p => p.id === cashSale.product_id)?.color || ''}
                      onChange={e => setCashSale({...cashSale, color: e.target.value})}
                      placeholder="e.g. Titanium Blue, Black, Green..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white font-medium"
                    />
                  </div>
                  <div className="sm:w-1/2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Sale Date & Time</label>
                    <input 
                      required
                      type="datetime-local"
                      value={cashSale.sale_date}
                      onChange={e => setCashSale({...cashSale, sale_date: e.target.value})}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Actual Sale Price (প্রকৃত বিক্রয় মূল্য - ৳)</label>
                  <input 
                    required
                    type="number"
                    value={cashSale.actual_sale_price}
                    onChange={e => setCashSale({...cashSale, actual_sale_price: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-base font-bold"
                    placeholder="গ্রাহক কত টাকা প্রদান করেছেন লিখুন"
                  />
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-emerald-800">Calculated Profit (মোট লাভ)</span>
                    <span className="text-lg font-black text-emerald-600">
                      ৳{Math.max(0, Number(cashSale.actual_sale_price || 0) - (products.find(p => p.id === cashSale.product_id)?.purchase_price || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-5 h-5" /> Complete Cash Sale</>}
                </button>
              </>
            )}
          </form>
        )}
      </Modal>

      {/* Monthly Report Modal */}
      <Modal 
        isOpen={isMonthlyReportOpen} 
        onClose={() => setIsMonthlyReportOpen(false)} 
        title="Monthly Sales & Profit Sheet"
        maxWidthClass="max-w-6xl"
        headerRight={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportMonthlyCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 transition-colors shadow-xs"
              title="Download Excel / CSV File"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Excel/CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPrintPreviewOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
              title="Print & PDF Preview"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Print Preview</span>
            </button>
          </div>
        }
      >
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 8mm 6mm;
            }
            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            body * {
              visibility: hidden !important;
            }
            #printable-a4-sheet, #printable-a4-sheet *,
            #printable-monthly-sheet, #printable-monthly-sheet * {
              visibility: visible !important;
            }
            #printable-a4-sheet,
            #printable-monthly-sheet {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              display: block !important;
              background: #ffffff !important;
              box-shadow: none !important;
              border: none !important;
            }
            .no-print {
              display: none !important;
            }
            .excel-print-table {
              width: 100% !important;
              border-collapse: collapse !important;
              font-size: 8.5pt !important;
              border: 1.5px solid #000000 !important;
            }
            .excel-print-table th, .excel-print-table td {
              border: 1px solid #333333 !important;
              padding: 3px 5px !important;
              color: #000000 !important;
            }
            .excel-print-table th {
              background-color: #f1f5f9 !important;
              font-weight: 700 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .excel-print-table tr {
              page-break-inside: avoid !important;
            }
            .excel-print-total {
              background-color: #e2e8f0 !important;
              font-weight: 800 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>

        <div className="space-y-4">
          {/* Top Controls: Date Filter & Quick Presets */}
          <div className="no-print bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase">From:</label>
                <input 
                  type="date"
                  value={reportStartDate}
                  onChange={e => setReportStartDate(e.target.value)}
                  className="px-3 py-1.5 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold text-gray-800"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase">To:</label>
                <input 
                  type="date"
                  value={reportEndDate}
                  onChange={e => setReportEndDate(e.target.value)}
                  className="px-3 py-1.5 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold text-gray-800"
                />
              </div>
            </div>

            {/* Quick date range buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">Quick:</span>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setReportStartDate(format(now, 'yyyy-MM-01'));
                  setReportEndDate(format(now, 'yyyy-MM-dd'));
                }}
                className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-gray-100 text-gray-700 rounded-md border border-gray-200 transition-colors"
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const firstOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                  const lastOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
                  setReportStartDate(format(firstOfPrevMonth, 'yyyy-MM-dd'));
                  setReportEndDate(format(lastOfPrevMonth, 'yyyy-MM-dd'));
                }}
                className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-gray-100 text-gray-700 rounded-md border border-gray-200 transition-colors"
              >
                Last Month
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setReportStartDate(format(now, 'yyyy-MM-dd'));
                  setReportEndDate(format(now, 'yyyy-MM-dd'));
                }}
                className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-gray-100 text-gray-700 rounded-md border border-gray-200 transition-colors"
              >
                Today
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100">
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Total Sales</p>
              <p className="text-2xl font-black text-blue-900 mt-0.5">{monthlyReportStats.totalSales} <span className="text-xs font-normal text-blue-600">Pcs</span></p>
            </div>
            <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-100">
              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Total Retail (Buy)</p>
              <p className="text-xl sm:text-2xl font-black text-amber-900 mt-0.5">৳{monthlyReportStats.totalRetailPrice.toLocaleString()}</p>
            </div>
            <div className="p-3.5 bg-purple-50/70 rounded-xl border border-purple-100">
              <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Total MRP (Sale)</p>
              <p className="text-xl sm:text-2xl font-black text-purple-900 mt-0.5">৳{monthlyReportStats.totalMrp.toLocaleString()}</p>
            </div>
            <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-100">
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Total Profit</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">৳{monthlyReportStats.totalProfit.toLocaleString()}</p>
            </div>
          </div>

          {/* Printable Excel-Style Sheet Container */}
          <div id="printable-monthly-sheet" className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            {/* Sheet Header (Visible in print and screen) */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
              <div>
                <h1 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <span>MEHEDY TELECOM</span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">Sales & Profit Sheet</span>
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Report Period: <span className="font-semibold text-gray-700">{reportStartDate}</span> to <span className="font-semibold text-gray-700">{reportEndDate}</span> | Total Records: <span className="font-semibold text-gray-700">{monthlyReportStats.totalSales}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPrintPreviewOpen(true)}
                  className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
                  title="Open full A4 Print and PDF Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Print & PDF Preview</span>
                </button>
                <div className="text-left sm:text-right text-[11px] text-gray-400">
                  Printed: {format(new Date(), 'dd/MM/yyyy hh:mm a')}
                </div>
              </div>
            </div>

            {/* Excel Sheet Table */}
            <div className="overflow-x-auto">
              <table className="excel-print-table w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-gray-800 font-bold uppercase tracking-wider border-b border-gray-300">
                    <th className="py-2.5 px-2 border border-gray-300 text-center w-10">#</th>
                    <th className="py-2.5 px-3 border border-gray-300 w-24">Date</th>
                    <th className="py-2.5 px-3 border border-gray-300">Model</th>
                    <th className="py-2.5 px-3 border border-gray-300 w-36 sm:w-44">Customer Mobile</th>
                    <th className="py-2.5 px-3 border border-gray-300 text-right w-28">Retail Price</th>
                    <th className="py-2.5 px-3 border border-gray-300 text-right w-28">MRP</th>
                    <th className="py-2.5 px-3 border border-gray-300 text-right w-28">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-sans">
                  {monthlyReportStats.rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400 font-medium border border-gray-300">
                        No sales records found for the selected date range ({reportStartDate} to {reportEndDate}).
                      </td>
                    </tr>
                  ) : (
                    monthlyReportStats.rows.map((row, idx) => (
                      <tr 
                        key={row.id} 
                        className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}
                      >
                        <td className="py-2 px-2 border border-gray-300 text-center text-gray-500 font-mono text-[11px]">
                          {row.sl}
                        </td>
                        <td className="py-2 px-3 border border-gray-300 font-medium text-gray-700 whitespace-nowrap text-[11.5px]">
                          {row.saleDate}
                        </td>
                        <td className="py-2 px-3 border border-gray-300 font-semibold text-gray-900 text-[11.5px]">
                          {row.model}
                        </td>
                        <td className="py-2 px-3 border border-gray-300 text-gray-800 text-[11.5px]">
                          <span className="font-mono font-medium">{row.customerMobile}</span>
                          {row.customerName && (
                            <span className="block text-[10px] text-gray-400 truncate max-w-[130px]">
                              {row.customerName}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 border border-gray-300 text-right font-medium text-gray-800 tabular-nums text-[11.5px]">
                          ৳{row.retailPrice.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 border border-gray-300 text-right font-bold text-gray-900 tabular-nums text-[11.5px]">
                          ৳{row.mrp.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 border border-gray-300 text-right font-bold text-emerald-700 tabular-nums text-[11.5px]">
                          +৳{row.profit.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="excel-print-total bg-slate-200/90 text-gray-900 font-black border-t-2 border-b-2 border-gray-400 text-xs">
                    <td colSpan={4} className="py-2.5 px-3 border border-gray-300 text-left uppercase tracking-wider">
                      TOTAL / সর্বমোট ({monthlyReportStats.totalSales} Pcs)
                    </td>
                    <td className="py-2.5 px-3 border border-gray-300 text-right tabular-nums text-[12px]">
                      ৳{monthlyReportStats.totalRetailPrice.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 border border-gray-300 text-right tabular-nums text-[12px] text-blue-900">
                      ৳{monthlyReportStats.totalMrp.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 border border-gray-300 text-right tabular-nums text-[12px] text-emerald-800">
                      ৳{monthlyReportStats.totalProfit.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Print Footer note */}
            <div className="p-3 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-400 bg-slate-50/40">
              <span>Mehedy Telecom Point of Sale System</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Print & PDF Preview Modal */}
      <Modal 
        isOpen={isPrintPreviewOpen} 
        onClose={() => setIsPrintPreviewOpen(false)} 
        title="Print Preview (প্রিন্ট ও পিডিএফ প্রিভিউ)"
        maxWidthClass="max-w-5xl"
        headerRight={
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
              title="Download direct PDF File"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Save as PDF'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
              title="Print Table on A4 Sheet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Now</span>
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Notification banner */}
          <div className="no-print bg-blue-50/90 border border-blue-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-200/70 rounded-md shrink-0"><FileText className="w-4 h-4 text-blue-700" /></span>
              <span>
                <strong>A4 Print Preview:</strong> নিচে আপনার মাসিক সেলস রিপোর্টের A4 পেজ প্রিভিউ রয়েছে। আপনি <strong>'Save as PDF'</strong> বাটনে ক্লিক করে সরাসরি পিডিএফ ডাউনলোড করতে পারেন অথবা <strong>'Print Now'</strong> দিয়ে প্রিন্ট করতে পারেন।
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={handleDownloadPdf}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-xs"
              >
                {isGeneratingPdf ? 'Saving...' : 'Save as PDF'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-xs"
              >
                Print Now
              </button>
            </div>
          </div>

          {/* Desktop canvas showing A4 paper */}
          <div className="bg-slate-300/80 p-2 sm:p-6 rounded-2xl overflow-y-auto max-h-[72vh] flex justify-center shadow-inner">
            {/* The A4 Printable Paper */}
            <div 
              id="printable-a4-sheet" 
              className="bg-white text-gray-950 p-6 sm:p-8 rounded-sm shadow-xl border border-gray-300 w-full max-w-[210mm] min-h-[297mm] flex flex-col justify-between"
              style={{ boxSizing: 'border-box' }}
            >
              <div>
                {/* Letterhead / Header */}
                <div className="border-b-2 border-gray-900 pb-3 mb-4 text-center">
                  <h1 className="text-2xl font-black tracking-wider text-gray-900 uppercase">MEHEDY TELECOM</h1>
                  <p className="text-xs text-gray-600 font-medium">All Types of New & Used Smartphones, Sales, Exchange & Official Accessories</p>
                  <div className="mt-2 inline-block px-4 py-1 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-sm">
                    Monthly Sales & Profit Sheet (মাসিক সেলস রিপোর্ট)
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center justify-between text-[11px] text-gray-600 border-t border-gray-200 pt-2 font-medium">
                    <div>
                      Period: <span className="font-bold text-gray-900">{reportStartDate}</span> to <span className="font-bold text-gray-900">{reportEndDate}</span>
                    </div>
                    <div>
                      Total Records: <span className="font-bold text-gray-900">{monthlyReportStats.totalSales} Pcs</span>
                    </div>
                    <div>
                      Generated: <span className="font-bold text-gray-900">{format(new Date(), 'dd/MM/yyyy hh:mm a')}</span>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <table className="excel-print-table w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-900 font-bold uppercase tracking-wider">
                      <th className="py-2 px-2 border border-gray-400 text-center w-8">#</th>
                      <th className="py-2 px-2.5 border border-gray-400 w-22">Date</th>
                      <th className="py-2 px-2.5 border border-gray-400">Model</th>
                      <th className="py-2 px-2.5 border border-gray-400 w-36">Customer Mobile</th>
                      <th className="py-2 px-2.5 border border-gray-400 text-right w-24">Retail Price</th>
                      <th className="py-2 px-2.5 border border-gray-400 text-right w-24">MRP</th>
                      <th className="py-2 px-2.5 border border-gray-400 text-right w-24">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyReportStats.rows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-gray-500 font-medium border border-gray-400">
                          No sales records found for this period ({reportStartDate} to {reportEndDate}).
                        </td>
                      </tr>
                    ) : (
                      monthlyReportStats.rows.map((row, idx) => (
                        <tr 
                          key={row.id} 
                          className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                          <td className="py-1.5 px-2 border border-gray-300 text-center text-gray-600 font-mono text-[11px]">
                            {row.sl}
                          </td>
                          <td className="py-1.5 px-2.5 border border-gray-300 font-medium text-gray-800 whitespace-nowrap text-[11px]">
                            {row.saleDate}
                          </td>
                          <td className="py-1.5 px-2.5 border border-gray-300 font-semibold text-gray-900 text-[11px]">
                            {row.model}
                          </td>
                          <td className="py-1.5 px-2.5 border border-gray-300 text-gray-800 text-[11px]">
                            <span className="font-mono font-medium">{row.customerMobile}</span>
                            {row.customerName && (
                              <span className="block text-[9.5px] text-gray-500 truncate max-w-[130px]">
                                {row.customerName}
                              </span>
                            )}
                          </td>
                          <td className="py-1.5 px-2.5 border border-gray-300 text-right font-medium text-gray-800 tabular-nums text-[11px]">
                            ৳{row.retailPrice.toLocaleString()}
                          </td>
                          <td className="py-1.5 px-2.5 border border-gray-300 text-right font-bold text-gray-950 tabular-nums text-[11px]">
                            ৳{row.mrp.toLocaleString()}
                          </td>
                          <td className="py-1.5 px-2.5 border border-gray-300 text-right font-bold text-emerald-800 tabular-nums text-[11px]">
                            +৳{row.profit.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="excel-print-total bg-gray-200 text-gray-950 font-black text-xs border-t-2 border-b-2 border-gray-900">
                      <td colSpan={4} className="py-2.5 px-2.5 border border-gray-400 text-left uppercase tracking-wider">
                        TOTAL / সর্বমোট ({monthlyReportStats.totalSales} Pcs)
                      </td>
                      <td className="py-2.5 px-2.5 border border-gray-400 text-right tabular-nums text-[11.5px]">
                        ৳{monthlyReportStats.totalRetailPrice.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2.5 border border-gray-400 text-right tabular-nums text-[11.5px] text-blue-950">
                        ৳{monthlyReportStats.totalMrp.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2.5 border border-gray-400 text-right tabular-nums text-[11.5px] text-emerald-900">
                        ৳{monthlyReportStats.totalProfit.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Summary Badges Box */}
                <div className="mt-4 grid grid-cols-4 gap-2 border border-gray-300 bg-gray-50 p-2.5 rounded-sm text-center">
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase font-bold">Total Sold</span>
                    <span className="font-black text-sm text-gray-900">{monthlyReportStats.totalSales} Pcs</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase font-bold">Total Retail (Cost)</span>
                    <span className="font-black text-sm text-gray-900">৳{monthlyReportStats.totalRetailPrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase font-bold">Total Sales (MRP)</span>
                    <span className="font-black text-sm text-blue-900">৳{monthlyReportStats.totalMrp.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase font-bold">Total Profit</span>
                    <span className="font-black text-sm text-emerald-800">৳{monthlyReportStats.totalProfit.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Signatures & Footer */}
              <div className="mt-8 pt-4 border-t border-gray-300 flex items-end justify-between text-xs text-gray-600">
                <div>
                  <p className="font-bold text-gray-900">Mehedy Telecom POS</p>
                  <p className="text-[10px] text-gray-500">Computerized Official Report</p>
                </div>
                <div className="text-right">
                  <div className="w-48 border-b border-gray-400 mb-1"></div>
                  <p className="text-[11px] font-bold text-gray-900">Authorized Signature & Seal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Brand-Wise Quantity & Stock List Modal */}
      <BrandStockModal
        isOpen={isBrandStockOpen}
        onClose={() => setIsBrandStockOpen(false)}
        products={products}
        totalQuantity={stats.totalQuantity}
        onSellProduct={(product, isCash) => {
          setIsBrandStockOpen(false);
          if (isCash) {
            setCashSale(prev => ({
              ...prev,
              product_id: product.id,
              actual_sale_price: String(product.selling_price || ''),
              color: product.color || ''
            }));
            setSaleTab('cash');
            setIsSaleProductOpen(true);
          } else {
            setNewSale(prev => ({
              ...prev,
              product_id: product.id,
              color: product.color || ''
            }));
            setSaleTab('emi');
            setIsSaleProductOpen(true);
          }
        }}
      />

      {/* Used Mobile List Modal */}
      <UsedMobileModal
        isOpen={isUsedMobileModalOpen}
        onClose={() => setIsUsedMobileModalOpen(false)}
        products={products}
        onSellProduct={(product, isCash) => {
          setIsUsedMobileModalOpen(false);
          if (isCash) {
            setCashSale(prev => ({
              ...prev,
              product_id: product.id,
              actual_sale_price: String(product.selling_price || ''),
              color: product.color || ''
            }));
            setSaleTab('cash');
            setIsSaleProductOpen(true);
          } else {
            setNewSale(prev => ({
              ...prev,
              product_id: product.id,
              color: product.color || ''
            }));
            setSaleTab('emi');
            setIsSaleProductOpen(true);
          }
        }}
        onEditProduct={(product) => {
          setIsUsedMobileModalOpen(false);
          setNewProduct({
            id: product.id,
            name: product.name,
            purchase_price: String(product.purchase_price),
            selling_price: String(product.selling_price),
            quantity: String(product.quantity),
            ram: product.ram || '',
            rom: product.rom || '',
            color: product.color || '',
            condition: product.condition || 'used',
            condition_note: product.condition_note || '',
            is_bar_phone: Boolean(product.is_bar_phone),
            imei_units: product.imei_units || [],
            tempImei1: '',
            tempImei2: '',
            imeis: product.imeis || [],
            imei_colors: product.imei_colors || {},
            image: null,
            image_file_id: product.image_file_id || ''
          });
          setIsAddProductOpen(true);
        }}
      />

      {/* Product Summary Modal */}
      <ProductSummaryModal
        isOpen={isProductSummaryOpen}
        onClose={() => setIsProductSummaryOpen(false)}
        products={products}
        onSellProduct={(product, isCash) => {
          setIsProductSummaryOpen(false);
          if (isCash) {
            setCashSale(prev => ({
              ...prev,
              product_id: product.id,
              actual_sale_price: String(product.selling_price || ''),
              color: product.color || ''
            }));
            setSaleTab('cash');
            setIsSaleProductOpen(true);
          } else {
            setNewSale(prev => ({
              ...prev,
              product_id: product.id,
              color: product.color || ''
            }));
            setSaleTab('emi');
            setIsSaleProductOpen(true);
          }
        }}
        onEditProduct={(product) => {
          setIsProductSummaryOpen(false);
          setNewProduct({
            id: product.id,
            name: product.name,
            purchase_price: String(product.purchase_price),
            selling_price: String(product.selling_price),
            quantity: String(product.quantity),
            ram: product.ram || '',
            rom: product.rom || '',
            color: product.color || '',
            condition: product.condition || 'new',
            condition_note: product.condition_note || '',
            is_bar_phone: Boolean(product.is_bar_phone),
            imei_units: product.imei_units || [],
            tempImei1: '',
            tempImei2: '',
            imeis: product.imeis || [],
            imei_colors: product.imei_colors || {},
            image: null,
            image_file_id: product.image_file_id || ''
          });
          setIsAddProductOpen(true);
        }}
      />

      {/* Bar Phone Modal */}
      <BarPhoneModal
        isOpen={isBarPhoneModalOpen}
        onClose={() => setIsBarPhoneModalOpen(false)}
        products={products}
        onAddProduct={(isBarPhone) => {
          setIsBarPhoneModalOpen(false);
          setNewProduct({
            id: '',
            name: '',
            purchase_price: '',
            selling_price: '',
            quantity: '',
            ram: '',
            rom: '',
            color: '',
            condition: 'new',
            condition_note: '',
            is_bar_phone: isBarPhone,
            imei_units: [],
            tempImei1: '',
            tempImei2: '',
            imeis: [],
            imei_colors: {},
            image: null,
            image_file_id: ''
          });
          setIsAddProductOpen(true);
        }}
        onEditProduct={(product) => {
          setIsBarPhoneModalOpen(false);
          setNewProduct({
            id: product.id,
            name: product.name,
            purchase_price: String(product.purchase_price),
            selling_price: String(product.selling_price),
            quantity: String(product.quantity),
            ram: product.ram || '',
            rom: product.rom || '',
            color: product.color || '',
            condition: product.condition || 'new',
            condition_note: product.condition_note || '',
            is_bar_phone: Boolean(product.is_bar_phone),
            imei_units: product.imei_units || [],
            tempImei1: '',
            tempImei2: '',
            imeis: product.imeis || [],
            imei_colors: product.imei_colors || {},
            image: null,
            image_file_id: product.image_file_id || ''
          });
          setIsAddProductOpen(true);
        }}
        onDeleteProduct={handleDeleteProduct}
        onSellProduct={(product, isCash) => {
          setIsBarPhoneModalOpen(false);
          if (isCash) {
            setCashSale(prev => ({
              ...prev,
              product_id: product.id,
              actual_sale_price: String(product.selling_price || ''),
              color: product.color || ''
            }));
            setSaleTab('cash');
            setIsSaleProductOpen(true);
          } else {
            setNewSale(prev => ({
              ...prev,
              product_id: product.id,
              color: product.color || ''
            }));
            setSaleTab('emi');
            setIsSaleProductOpen(true);
          }
        }}
      />

      {/* Mobile Bazar Modal */}
      <Modal 
        isOpen={isMobileBazarOpen} 
        onClose={() => setIsMobileBazarOpen(false)} 
        title="Mobile Bazar - Add Hisab"
      >
        <div className="space-y-6">
          <form onSubmit={handleMobileBazarSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Select Sale Record</label>
              <select 
                required
                value={newMobileBazar.sale_id}
                onChange={e => setNewMobileBazar({...newMobileBazar, sale_id: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Choose a sale record...</option>
                {sales.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.customer_name} - {s.product_name} {(s.ram || s.rom) ? `(${s.ram || ''}${s.ram && s.rom ? '/' : ''}${s.rom || ''})` : ''} {s.color ? `[${s.color}]` : ''} ({format(parseISO(s.sale_date), 'MMM dd')})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Down Payment (৳)</label>
              <input 
                required
                type="number"
                value={newMobileBazar.down_payment}
                onChange={e => setNewMobileBazar({...newMobileBazar, down_payment: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter down payment amount"
              />
            </div>

            {mobileBazarPreview && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Down Payment:</span>
                  <span className="font-bold">৳{mobileBazarPreview.down_payment}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sale Profit Margin:</span>
                  <span className="font-bold text-red-500">- ৳{mobileBazarPreview.profit}</span>
                </div>
                <div className="h-px bg-blue-200 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-blue-800">Net Amount:</span>
                  <span className="text-lg font-black text-blue-600">৳{mobileBazarPreview.net}</span>
                </div>
              </div>
            )}

            <button 
              disabled={isSubmitting}
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add Hisab"}
            </button>
          </form>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Recent Hisab</h3>
                <button 
                  onClick={handleResetMobileBazar}
                  disabled={isSubmitting || mobileBazarRecords.length === 0}
                  className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase mt-1 flex items-center gap-1 disabled:opacity-30"
                >
                  <Trash2 className="w-3 h-3" /> Reset All Records
                </button>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase">Total Mobile Bazar</p>
                <p className="text-xl font-black text-blue-600">৳{stats.mobileBazarTotal}</p>
              </div>
            </div>
            <div className="max-h-[250px] overflow-y-auto space-y-2">
              {mobileBazarRecords.map(r => {
                const sale = sales.find(s => s.id === r.sale_id);
                const dynamicProfit = sale ? calculateDynamicProfit(sale) : r.sale_profit;
                const dynamicNetAmount = sale ? (r.down_payment - dynamicProfit) : r.net_amount;
                
                return (
                  <div key={r.id} className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{r.customer_name}</p>
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-gray-500">
                          {r.product_name} {(r.ram || r.rom) ? `(${r.ram || ''}${r.ram && r.rom ? '/' : ''}${r.rom || ''})` : ''}
                        </p>
                        {sale?.color && sale.color !== '' && (
                          <div 
                            className={`w-2 h-2 rounded-full shadow border-white border ${
                              sale.color === 'Black' ? 'bg-black' :
                              sale.color === 'Titanium Gray' ? 'bg-slate-500' :
                              sale.color === 'Blue' ? 'bg-blue-500' :
                              sale.color === 'Gold' ? 'bg-yellow-500' :
                              sale.color === 'Orange' ? 'bg-orange-500' : 'bg-transparent'
                            }`}
                            title={sale.color}
                          />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400">{format(parseISO(r.created_at), 'dd/MM/yyyy - hh:mm a')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">৳{dynamicNetAmount}</p>
                      <p className="text-[10px] text-gray-400">DP: ৳{r.down_payment} | Profit: ৳{dynamicProfit}</p>
                    </div>
                  </div>
                );
              })}
              {mobileBazarRecords.length === 0 && (
                <p className="text-center py-4 text-gray-400 text-sm">No records yet.</p>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* EMI Calculator Modal */}
      <Modal
        isOpen={isEmiCalcOpen}
        onClose={() => setIsEmiCalcOpen(false)}
        title="EMI Calculator"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Select Product Model</label>
              <select
                value={emiConfig.productId}
                onChange={e => setEmiConfig({ ...emiConfig, productId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
              >
                <option value="">Select a product...</option>
                {sortedProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.condition === 'used' ? '[USED] ' : ''}{p.name} {p.ram ? `(${p.ram}/${p.rom})` : ''} — ৳{p.selling_price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Down Payment (৳)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={emiConfig.downPayment}
                  onChange={e => setEmiConfig({ ...emiConfig, downPayment: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  placeholder="0%"
                  value={emiConfig.interestRate}
                  onChange={e => setEmiConfig({ ...emiConfig, interestRate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Service Charge (৳)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={emiConfig.serviceCharge}
                  onChange={e => setEmiConfig({ ...emiConfig, serviceCharge: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Duration (Months)</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setEmiConfig({ ...emiConfig, months: m })}
                    className={`py-3 rounded-xl font-bold transition-all text-sm border ${
                      emiConfig.months === m
                        ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-100'
                        : 'bg-gray-50 border-gray-150 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {m} {m === 1 ? 'Month' : 'Months'}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown Card */}
            {(() => {
              const selectedEmiProduct = products.find(p => p.id === emiConfig.productId);
              const originalPrice = selectedEmiProduct?.selling_price || 0;
              const downPayment = Number(emiConfig.downPayment || 0);
              const principal = Math.max(0, originalPrice - downPayment);
              
              const interestRate = Number(emiConfig.interestRate || 0);
              const interestAmount = principal * (interestRate / 100);
              const serviceCharge = Number(emiConfig.serviceCharge || 0);
              const totalOutstanding = principal + interestAmount + serviceCharge;
              
              const months = emiConfig.months || 3;
              const monthlyEmi = totalOutstanding / months;

              return (
                <div className="bg-violet-50/70 border border-violet-100 rounded-2xl p-6 mt-6 space-y-4">
                  <h3 className="text-sm font-extrabold text-violet-800 uppercase tracking-widest flex items-center gap-1.5">
                    <Calculator className="w-4 h-4" /> EMI Overview Details
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-y-2 text-sm border-b border-violet-100/50 pb-4">
                    <span className="text-gray-600">Product Original Price:</span>
                    <span className="font-bold text-right text-gray-900">৳{originalPrice.toLocaleString()}</span>

                    {downPayment > 0 && (
                      <>
                        <span className="text-gray-600">Down Payment Paid:</span>
                        <span className="font-bold text-right text-red-600">- ৳{downPayment.toLocaleString()}</span>
                      </>
                    )}

                    <span className="text-gray-600">Principal (Balance Amount):</span>
                    <span className="font-bold text-right text-gray-900">৳{principal.toLocaleString()}</span>

                    {interestAmount > 0 && (
                      <>
                        <span className="text-gray-600">Interest Added ({interestRate}%):</span>
                        <span className="font-bold text-right text-amber-600">+ ৳{interestAmount.toLocaleString()}</span>
                      </>
                    )}

                    {serviceCharge > 0 && (
                      <>
                        <span className="text-gray-600">Service Charge Included:</span>
                        <span className="font-bold text-right text-blue-600">+ ৳{serviceCharge.toLocaleString()}</span>
                      </>
                    )}
                  </div>

                  <div className="flex justify-between items-center bg-white/70 rounded-xl p-3 border border-violet-100">
                    <span className="text-sm font-bold text-gray-700 font-bold">Total Outstanding:</span>
                    <span className="text-lg font-black text-gray-900">৳{totalOutstanding.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center bg-violet-600 text-white rounded-xl p-4 shadow-md shadow-violet-100">
                    <div>
                      <p className="text-xs font-semibold opacity-90 uppercase tracking-wider">Monthly EMI Installment</p>
                      <p className="text-[10px] opacity-75">Payable for {months} {months === 1 ? 'month' : 'months'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-black">৳{Math.round(monthlyEmi).toLocaleString()}</p>
                      <span className="text-xs opacity-90 font-medium">/ month</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </Modal>

      {/* Sale List Modal */}
      <Modal 
        isOpen={isSaleListOpen} 
        onClose={() => setIsSaleListOpen(false)} 
        title="All Sales History"
      >
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              value={saleSearch}
              onChange={e => setSaleSearch(e.target.value)}
              placeholder="Search by name, phone, or NID..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-3">
            {filteredSales.map((sale) => (
              <button 
                key={sale.id}
                onClick={() => setSelectedSale(sale)}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <CustomerAvatar fileId={sale.image_file_ids?.[0]} />
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900">{sale.customer_name}</h4>
                    <p className="text-sm text-gray-500">{sale.phone_number}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                      <span>{sale.product_name} {(sale.ram || sale.rom) ? `(${sale.ram || ''}${sale.ram && sale.rom ? '/' : ''}${sale.rom || ''})` : ''}</span>
                      {sale.color && sale.color !== '' && (
                        <div 
                          className={`w-2 h-2 rounded-full shadow border-white border ${
                            sale.color === 'Black' ? 'bg-black' :
                            sale.color === 'Titanium Gray' ? 'bg-slate-500' :
                            sale.color === 'Blue' ? 'bg-blue-500' :
                            sale.color === 'Gold' ? 'bg-yellow-500' :
                            sale.color === 'Orange' ? 'bg-orange-500' : 'bg-transparent'
                          }`}
                          title={sale.color}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-600">
                      ৳{(sale.actual_sale_price || products.find(p => p.id === sale.product_id)?.selling_price || 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                      {format(parseISO(sale.sale_date), 'dd/MM/yyyy')}
                    </p>
                    <p className="text-[9px] text-gray-400">
                      {format(parseISO(sale.sale_date), 'hh:mm a')}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </button>
            ))}
            {filteredSales.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No sales records found.
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Sale Details Modal */}
      <Modal 
        isOpen={!!selectedSale} 
        onClose={() => setSelectedSale(null)} 
        title="Sale Details"
      >
        {selectedSale && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CustomerAvatar fileId={selectedSale.image_file_ids?.[0]} />
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Customer Details</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-bold text-gray-900">{selectedSale.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="font-bold text-gray-900">{selectedSale.phone_number}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">NID Number</p>
                      <p className="font-bold text-gray-900">{selectedSale.nid_number}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="font-bold text-gray-900">{selectedSale.address}</p>
                    </div>
                  </div>
                  {selectedSale.guarantor_number && (
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Guarantor Phone</p>
                        <p className="font-bold text-gray-900">{selectedSale.guarantor_number}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Transaction Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Product Sold</p>
                      <div className="flex flex-col gap-1">
                        <p className="font-bold text-gray-900">
                          {selectedSale.product_name} {(selectedSale.ram || selectedSale.rom) ? `(${selectedSale.ram || ''}${selectedSale.ram && selectedSale.rom ? '/' : ''}${selectedSale.rom || ''})` : ''}
                        </p>
                        {selectedSale.color && selectedSale.color !== '' && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Color:</span>
                            <div 
                              className={`w-3 h-3 rounded-full shadow border-white border ${
                                selectedSale.color === 'Black' ? 'bg-black' :
                                selectedSale.color === 'Titanium Gray' ? 'bg-slate-500' :
                                selectedSale.color === 'Blue' ? 'bg-blue-500' :
                                selectedSale.color === 'Gold' ? 'bg-yellow-500' :
                                selectedSale.color === 'Orange' ? 'bg-orange-500' : 'bg-transparent'
                              }`}
                              title={selectedSale.color}
                            />
                            <span className="text-xs font-medium text-gray-700">{selectedSale.color}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Selling Price</p>
                      <p className="font-black text-emerald-600 text-lg">
                        ৳{(selectedSale.actual_sale_price || products.find(p => p.id === selectedSale.product_id)?.selling_price || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Profit Earned</p>
                      <p className="font-bold text-orange-600">৳{calculateDynamicProfit(selectedSale).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Sale Date & Time</p>
                      <p className="font-bold text-gray-900">{format(parseISO(selectedSale.sale_date), 'dd/MM/yyyy - hh:mm a')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Uploaded Images (Telegram)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {selectedSale.image_file_ids.map((fileId: string, idx: number) => (
                  <TelegramImage key={idx} fileId={fileId} />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 flex-wrap">
              <button 
                onClick={() => handleDeleteSale(selectedSale.id, selectedSale.product_id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors mr-auto"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <button 
                onClick={() => setEditingSale(selectedSale)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Edit Sale
              </button>
              <button 
                onClick={() => setSelectedSale(null)}
                className="px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Sale Modal */}
      <Modal 
        isOpen={!!editingSale} 
        onClose={() => {
          setEditingSale(null);
          setEditSaleImages([]);
        }} 
        title="Edit Sale Record"
      >
        {editingSale && (
          <form onSubmit={handleEditSale} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Customer Name</label>
                <input 
                  required
                  type="text"
                  value={editingSale.customer_name}
                  onChange={e => setEditingSale({...editingSale, customer_name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Sale Date & Time</label>
                <input 
                  required
                  type="datetime-local"
                  value={format(new Date(editingSale.sale_date), "yyyy-MM-dd'T'HH:mm")}
                  onChange={e => setEditingSale({...editingSale, sale_date: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                <input 
                  required
                  type="tel"
                  value={editingSale.phone_number}
                  onChange={e => setEditingSale({...editingSale, phone_number: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">NID</label>
                <input 
                  required
                  type="text"
                  value={editingSale.nid_number}
                  onChange={e => setEditingSale({...editingSale, nid_number: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Selling Price (৳)</label>
                <input 
                  required
                  type="number"
                  value={editingSale.actual_sale_price || ''}
                  onChange={e => setEditingSale({...editingSale, actual_sale_price: Number(e.target.value)})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Profit (৳)</label>
                <input 
                  required
                  type="number"
                  value={editingSale.profit}
                  onChange={e => setEditingSale({...editingSale, profit: Number(e.target.value)})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Update Images</h3>
                <button 
                  type="button" 
                  onClick={() => setActivePhotoCapture('editSale')}
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-blue-200 transition-colors"
                >
                  <Camera className="w-4 h-4" /> Take Photo
                </button>
              </div>
              
              {/* Existing Images */}
              <div className="grid grid-cols-3 gap-2">
                {editingSale.image_file_ids.map((fileId, idx) => (
                  <div key={idx} className="relative group">
                    <TelegramImage fileId={fileId} />
                    <button
                      type="button"
                      onClick={() => {
                        const newIds = editingSale.image_file_ids.filter((_, i) => i !== idx);
                        setEditingSale({...editingSale, image_file_ids: newIds});
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Upload New */}
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files) {
                      setEditSaleImages(Array.from(e.target.files));
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-600">Add more images</p>
                {editSaleImages.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {editSaleImages.map((f, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-bold text-gray-600">
                          <span className="truncate max-w-[150px]">{f.name}</span>
                          <span>{uploadProgress[f.name] || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full transition-all duration-300"
                            style={{ width: `${uploadProgress[f.name] || 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button 
              disabled={isSubmitting}
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
            </button>
          </form>
        )}
      </Modal>

      {/* Shop Settings Modal */}
      <Modal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        title="Shop Settings"
      >
        <div className="space-y-8">
          {/* Logo Section */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">Shop Logo / Profile Picture</h3>
            <div className="flex items-center gap-6">
              <LogoBranding fileId={logoFileId} className="w-24 h-24" />
              {isSuperAdmin ? (
                <div className="flex-1 space-y-3">
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpdateLogo(file);
                      }}
                      className="hidden" 
                      id="logo-upload"
                      disabled={isSubmitting}
                    />
                    <label 
                      htmlFor="logo-upload"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl border border-blue-100 cursor-pointer transition-all"
                    >
                      {isSubmitting && uploadProgress['logo'] ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-xs">{uploadProgress['logo']}%</span>
                        </div>
                      ) : (
                        <>
                          <User className="w-4 h-4" />
                          {logoFileId ? "Change Logo" : "Upload Logo"}
                        </>
                      )}
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                    This logo will appear next to your shop name in the header and on the login screen.
                  </p>
                </div>
              ) : (
                <div className="flex-1">
                  <p className="text-sm text-gray-500 italic">Only the shop owner can change the logo.</p>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Banner Section */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">Shop Branding Banner</h3>
            <div className="space-y-4">
              <div className="w-full relative h-24 rounded-xl overflow-hidden border border-gray-100 shadow-inner">
                <BannerBranding fileId={bannerFileId} />
              </div>
              {isSuperAdmin ? (
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpdateBanner(file);
                    }}
                    className="hidden" 
                    id="banner-upload"
                    disabled={isSubmitting}
                  />
                  <label 
                    htmlFor="banner-upload"
                    className="flex items-center justify-center gap-2 w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-xl border-2 border-dashed border-gray-200 cursor-pointer transition-all"
                  >
                    {isSubmitting && uploadProgress['banner'] ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-xs text-blue-600">{uploadProgress['banner']}%</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-5 h-5" />
                        {bannerFileId ? "Change Banner" : "Upload Banner"}
                      </>
                    )}
                  </label>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic text-center">Only the shop owner can change the banner.</p>
              )}
              <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest">
                This banner will be displayed in the header branding area.
              </p>
            </div>

            {/* Inventory Reset Section */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Package className="w-4 h-4 text-red-500" />
                Stock Management & Reset (স্টক রিসেট)
              </h3>
              <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 space-y-3">
                <div>
                  <h4 className="font-bold text-red-900 text-sm">Clear All Current Stock (স্টক সম্পূর্ণ খালি করুন)</h4>
                  <p className="text-xs text-red-700 mt-1">
                    বর্তমান স্টকের সব পণ্য মুছে দিয়ে নতুনভাবে স্টক শুরু করুন। <strong>আপনার পূর্বের সমস্ত বিক্রয় ইতিহাস (Sales History), রিপোর্ট এবং কাস্টমার ডাটা ১০০% অক্ষত ও সুরক্ষিত থাকবে।</strong>
                  </p>
                </div>
                {isSuperAdmin ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsClearStockModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-100 transition-all text-xs sm:text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Stock ({products.length} Models / {stats.totalQuantity} Pcs)
                  </button>
                ) : (
                  <p className="text-xs text-gray-500 italic">Only the shop owner can reset inventory.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Clear All Stock Modal */}
      <Modal
        isOpen={isClearStockModalOpen}
        onClose={() => setIsClearStockModalOpen(false)}
        title="Clear All Inventory (স্টক খালি করুন)"
      >
        <div className="space-y-5">
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-red-900 text-sm sm:text-base">
                আপনি কি বর্তমান স্টক সম্পূর্ণ খালি করতে চান?
              </h4>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">
                এটি নিশ্চিত করলে আপনার বর্তমান স্টকের মোট <strong>{products.length} টি মডেল</strong> এবং <strong>{stats.totalQuantity} টি পণ্য</strong> ডাটাবেস থেকে মুছে ফেলা হবে।
              </p>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
            <h5 className="font-bold text-emerald-900 text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              আপনার ডাটা সুরক্ষার নিশ্চয়তা:
            </h5>
            <ul className="text-xs text-emerald-800 space-y-1.5 list-disc list-inside font-medium">
              <li><strong>পূর্বের সকল বিক্রয় ইতিহাস (Sales History) সম্পূর্ণ সুরক্ষিত থাকবে</strong></li>
              <li>আজকের ও চলতি মাসের সকল লাভ-ক্ষতি ও বিক্রয় রিপোর্ট বহাল থাকবে</li>
              <li>কাস্টমার তথ্য, ফোন নম্বর, NID ও মেমোর ছবি সুরক্ষিত থাকবে</li>
              <li>মোবাইল বাজার ও কিস্তি রেকর্ড অপরিবর্তিত থাকবে</li>
              <li>স্টক খালি হওয়ার পর আপনি নতুন পণ্য ফ্রেশভাবে যুক্ত করতে পারবেন</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsClearStockModalOpen(false)}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-xs sm:text-sm order-2 sm:order-1"
            >
              Cancel (বাতিল করুন)
            </button>
            <button
              type="button"
              onClick={handleClearAllStock}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all text-xs sm:text-sm order-1 sm:order-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Clearing Stock...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>হ্যাঁ, সম্পূর্ণ স্টক খালি করুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* IMEI Not Available in Stock Modal Popup */}
      <Modal
        isOpen={notAvailableImei.isOpen}
        onClose={() => setNotAvailableImei(prev => ({ ...prev, isOpen: false }))}
        title="IMEI Not Available (স্টকে পাওয়া যায়নি)"
      >
        <div className="space-y-4 sm:space-y-5 text-center">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center border-4 border-red-100 shadow-inner">
            <AlertCircle className="w-8 h-8 sm:w-9 sm:h-9 text-red-600 animate-pulse" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100/70 border border-red-200 text-red-800 text-xs font-black uppercase tracking-wider mb-2">
              <span>Not Available In Stock</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
              এই IMEI নম্বরটি বর্তমান স্টকে যুক্ত নেই!
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              {notAvailableImei.source === 'search' 
                ? 'অনুসন্ধানকৃত IMEI নম্বরটি আপনার কোনো সক্রিয় পণ্যের তালিকায় পাওয়া যায়নি।' 
                : 'বিক্রয় করার আগে পণ্যটি এবং এর IMEI নম্বর স্টকে (Add Product) যোগ করুন।'}
            </p>
          </div>

          {notAvailableImei.imei && (
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-left space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Scanned / Entered IMEI</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm sm:text-base font-bold text-gray-800 tracking-wider select-all break-all">
                  {notAvailableImei.imei}
                </span>
                <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded border border-red-100 shrink-0 ml-2">
                  0 Available
                </span>
              </div>
            </div>
          )}

          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 text-left">
            <p className="text-xs text-amber-900 font-medium leading-relaxed flex items-start gap-2">
              <span className="text-amber-600 font-bold shrink-0">💡 টিপস:</span>
              <span>যদি এটি নতুন কোনো মোবাইল হয়, তবে প্রথমে <strong>Add Product</strong> বাটনে গিয়ে সঠিক IMEI ও মূল্য দিয়ে স্টকে যুক্ত করে নিন।</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={() => setNotAvailableImei(prev => ({ ...prev, isOpen: false }))}
              className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs sm:text-sm transition-colors order-2 sm:order-1"
            >
              Close (বন্ধ করুন)
            </button>
            <button
              type="button"
              onClick={() => {
                const imeiToPreFill = notAvailableImei.imei;
                setNotAvailableImei(prev => ({ ...prev, isOpen: false }));
                setNewProduct({
                  id: '',
                  name: '',
                  purchase_price: '',
                  selling_price: '',
                  quantity: '1',
                  ram: '',
                  rom: '',
                  color: '',
                  condition: 'new',
                  condition_note: '',
                  imeis: imeiToPreFill ? [imeiToPreFill] : [],
                  imei_colors: {},
                  image: null,
                  image_file_id: ''
                });
                setIsAddProductOpen(true);
              }}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-md shadow-blue-200 flex items-center justify-center gap-1.5 order-1 sm:order-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Stock (স্টকে যোগ করুন)</span>
            </button>
          </div>
        </div>
      </Modal>

      {activeScanner && (
        <BarcodeScanner 
          onClose={() => setActiveScanner(null)}
          onResult={(imei) => {
            if (activeScanner === 'productImei1') {
              let name = newProduct.name;
              let ram = newProduct.ram;
              let rom = newProduct.rom;
              let color = newProduct.color;
              let purchase_price = newProduct.purchase_price;
              let selling_price = newProduct.selling_price;
              
              if (imei.length >= 8 && !name) {
                const tac = imei.substring(0, 8);
                const match = products.find(p => p.imeis?.some(i => i.startsWith(tac)));
                if (match) {
                  name = match.name;
                  ram = match.ram || '';
                  rom = match.rom || '';
                  color = match.color || '';
                  purchase_price = String(match.purchase_price);
                  selling_price = String(match.selling_price);
                }
              }
              setNewProduct(prev => ({
                ...prev,
                name,
                ram: ram || '',
                rom: rom || '',
                color: color || '',
                purchase_price,
                selling_price,
                tempImei1: imei
              }));
              setActiveScanner(null);
              setTimeout(() => {
                imei2InputRef.current?.focus();
              }, 150);
            } else if (activeScanner === 'productImei2') {
              const i1 = (newProduct.tempImei1 || '').trim();
              const i2 = imei.trim();
              const uColor = (newProduct.tempUnitColor || '').trim() || (newProduct.color || '').trim();

              if (i1 && i2) {
                const currentUnits = newProduct.imei_units || [];
                const newUnit = { imei1: i1, imei2: i2, color: uColor || undefined };
                const updatedUnits = [...currentUnits, newUnit];
                const updatedColors = { ...(newProduct.imei_colors || {}) };
                if (uColor) {
                  updatedColors[i1] = uColor;
                  updatedColors[i2] = uColor;
                }
                setNewProduct(prev => ({
                  ...prev,
                  imei_units: updatedUnits,
                  imei_colors: updatedColors,
                  tempImei1: '',
                  tempImei2: '',
                  tempUnitColor: '',
                  quantity: String(updatedUnits.length)
                }));
              } else {
                setNewProduct(prev => ({ ...prev, tempImei2: i2 }));
              }
              setActiveScanner(null);
            } else if (activeScanner === 'product') {
              if (!newProduct.tempImei1) {
                let name = newProduct.name;
                let ram = newProduct.ram;
                let rom = newProduct.rom;
                let color = newProduct.color;
                let purchase_price = newProduct.purchase_price;
                let selling_price = newProduct.selling_price;
                
                if (imei.length >= 8 && !name) {
                  const tac = imei.substring(0, 8);
                  const match = products.find(p => p.imeis?.some(i => i.startsWith(tac)));
                  if (match) {
                    name = match.name;
                    ram = match.ram || '';
                    rom = match.rom || '';
                    color = match.color || '';
                    purchase_price = String(match.purchase_price);
                    selling_price = String(match.selling_price);
                  }
                }
                setNewProduct(prev => ({
                  ...prev,
                  name,
                  ram: ram || '',
                  rom: rom || '',
                  color: color || '',
                  purchase_price,
                  selling_price,
                  tempImei1: imei
                }));
              } else if (imei !== newProduct.tempImei1) {
                // 2nd scan combines into 1 piece!
                const i1 = newProduct.tempImei1.trim();
                const i2 = imei.trim();
                const uColor = (newProduct.tempUnitColor || '').trim() || (newProduct.color || '').trim();

                const currentUnits = newProduct.imei_units || [];
                const newUnit = { imei1: i1, imei2: i2, color: uColor || undefined };
                const updatedUnits = [...currentUnits, newUnit];
                const updatedColors = { ...(newProduct.imei_colors || {}) };
                if (uColor) {
                  updatedColors[i1] = uColor;
                  updatedColors[i2] = uColor;
                }
                setNewProduct(prev => ({
                  ...prev,
                  imei_units: updatedUnits,
                  imei_colors: updatedColors,
                  tempImei1: '',
                  tempImei2: '',
                  tempUnitColor: '',
                  quantity: String(updatedUnits.length)
                }));
                setActiveScanner(null);
              }
            } else if (activeScanner === 'cashSale') {
              const match = products.find(p => p.imeis?.includes(imei) || p.imei_units?.some(u => u.imei1 === imei || u.imei2 === imei));
              if (match) {
                const unit = match.imei_units?.find(u => u.imei1 === imei || u.imei2 === imei);
                const colorVariant = unit?.color || match.imei_colors?.[imei] || match.color || '';
                setCashImeiInput(imei);
                setCashSale(prev => ({
                  ...prev,
                  product_id: match.id,
                  imei: imei,
                  color: colorVariant,
                  actual_sale_price: String(match.selling_price)
                }));
                setActiveScanner(null);
              } else {
                setActiveScanner(null);
                setCashImeiInput(imei);
                setCashSale(prev => ({
                  product_id: '',
                  imei: '',
                  color: '',
                  actual_sale_price: '',
                  sale_date: prev.sale_date || format(new Date(), "yyyy-MM-dd'T'HH:mm")
                }));
                setNotAvailableImei({
                  isOpen: true,
                  imei: imei,
                  source: 'cashSale'
                });
              }
            } else if (activeScanner === 'sale') {
              const match = products.find(p => p.imeis?.includes(imei) || p.imei_units?.some(u => u.imei1 === imei || u.imei2 === imei));
              if (match) {
                const unit = match.imei_units?.find(u => u.imei1 === imei || u.imei2 === imei);
                const colorVariant = unit?.color || match.imei_colors?.[imei] || match.color || '';
                setSaleImeiInput(imei);
                setNewSale(prev => ({
                  ...prev,
                  product_id: match.id,
                  imei: imei,
                  color: colorVariant
                }));
                setActiveScanner(null);
              } else {
                setActiveScanner(null);
                setSaleImeiInput(imei);
                setNewSale(prev => ({
                  customer_name: '',
                  phone_number: '',
                  nid_number: '',
                  address: '',
                  guarantor_number: '',
                  product_id: '',
                  imei: '',
                  color: '',
                  images: [],
                  sale_date: prev.sale_date || format(new Date(), "yyyy-MM-dd'T'HH:mm")
                }));
                setNotAvailableImei({
                  isOpen: true,
                  imei: imei,
                  source: 'sale'
                });
              }
            } else if (activeScanner === 'search') {
              const isFound = products.some(p => 
                p.imeis?.includes(imei) || 
                p.imei_units?.some(u => u.imei1 === imei || u.imei2 === imei) ||
                p.name.toLowerCase().includes(imei.toLowerCase())
              );
              setProductSearch(imei);
              setActiveScanner(null);
              if (!isFound) {
                setNotAvailableImei({
                  isOpen: true,
                  imei: imei,
                  source: 'search'
                });
              }
            }
          }}
        />
      )}

      {activePhotoCapture && (
        <PhotoCapture
          onClose={() => setActivePhotoCapture(null)}
          onCapture={(file) => {
            if (activePhotoCapture === 'sale') {
              setNewSale(prev => ({ ...prev, images: [...prev.images, file] }));
            } else if (activePhotoCapture === 'editSale') {
              setEditSaleImages(prev => [...prev, file]);
            }
            setActivePhotoCapture(null);
          }}
        />
      )}
    </div>
  );
}
