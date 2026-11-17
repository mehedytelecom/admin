import React, { useState, useEffect } from 'react';
import { Printer, X, Plus, Trash2, RotateCcw, Sparkles, Smartphone } from 'lucide-react';
import { Sale, Product } from '../types';

interface CashMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  product?: Product | null;
}

interface MemoItem {
  id: number;
  model: string;
  imei1: string;
  imei2: string;
  qty: number;
  price: number;
}

export const getSaleMemoNumber = (sale: Sale): string => {
  if (sale.memo_number && sale.memo_number.trim() !== '') {
    return sale.memo_number.trim();
  }
  const yearPart = sale.sale_date ? sale.sale_date.slice(0, 4) : '2026';
  const idPart = (sale.id || '0000').slice(-4).toUpperCase();
  return `MT-${yearPart}-${idPart}`;
};

const DEFAULT_WARRANTY_TERMS = `১. বিক্রিত পণ্য ফেরতযোগ্য নয়, তবে শর্তসাপেক্ষে পরিবর্তনযোগ্য।
২. অফিসিয়াল ফোনের ক্ষেত্রে কোম্পানি প্রদত্ত সার্ভিস ওয়ারেন্টি প্রযোজ্য হবে।
৩. পানিতে ভিজলে, হাত থেকে পড়ে ভাঙলে, ডিসপ্লে বা ফিজিক্যাল ড্যামেজ হলে ওয়ারেন্টি বাতিল বলে গণ্য হবে।
৪. ওয়ারেন্টি সেবা পেতে হলে অবশ্যই এই ক্যাশ মেমো এবং ফোনের মূল বক্স সাথে আনতে হবে।`;

const bnWords0to99 = [
  "শূন্য", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়",
  "দশ", "এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোল", "সতেরো", "আঠারো", "ঊনিশ",
  "বিশ", "একুশ", "বাইশ", "তেইশ", "চব্বিশ", "পঁচিশ", "ছাব্বিশ", "সাতাশ", "আটাশ", "ঊনত্রিশ",
  "ত্রিশ", "একত্রিশ", "বত্রিশ", "তেত্রিশ", "চৌত্রিশ", "পঁয়ত্রিশ", "ছত্রিশ", "সাঁইত্রিশ", "আটত্রিশ", "ঊনচল্লিশ",
  "চল্লিশ", "একচল্লিশ", "বিয়াল্লিশ", "তেতাল্লিশ", "চুয়াল্লিশ", "পঁয়তাল্লিশ", "ছেচল্লিশ", "সাতচল্লিশ", "আটচল্লিশ", "ঊনপঞ্চাশ",
  "পঞ্চাশ", "একান্ন", "বায়ান্ন", "তিপ্পান্ন", "চুয়ান্ন", "পঞ্চান্ন", "ছাপ্পান্ন", "সাতান্ন", "আটান্ন", "ঊনষাট",
  "ষাট", "একষট্টি", "বাষট্টি", "তেষট্টি", "চৌষট্টি", "পঁয়ষট্টি", "ছেষট্টি", "সাতষট্টি", "আটষট্টি", "ঊনসত্তর",
  "সত্তর", "একাত্তর", "বাহাত্তর", "তিয়াত্তর", "চুয়াত্তর", "পঁচাত্তর", "ছিয়াত্তর", "সাতাত্তর", "আটাত্তর", "ঊনআশি",
  "আশি", "একাশি", "বিরাশি", "তিরাশি", "চুরাশি", "পঁচাশি", "ছিয়াশি", "সাতাশি", "আটাশি", "ঊননব্বই",
  "নব্বই", "একানব্বই", "বিরানব্বই", "তিরানব্বই", "চুরানব্বই", "পঁচানব্বই", "ছিয়ানব্বই", "সাতানব্বই", "আটানব্বই", "নিরানব্বই"
];

function numberToBengaliWords(amount: number): string {
  let n = Math.floor(Math.abs(Number(amount) || 0));
  if (n === 0) return "শূন্য টাকা মাত্র";
  if (n > 99999999) return `${n.toLocaleString('en-IN')} টাকা মাত্র`;
  const parts: string[] = [];
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  if (crore > 0) parts.push(`${crore < 100 ? bnWords0to99[crore] : crore} কোটি`);
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  if (lakh > 0) parts.push(`${bnWords0to99[lakh]} লক্ষ`);
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  if (thousand > 0) parts.push(`${bnWords0to99[thousand]} হাজার`);
  const hundred = Math.floor(n / 100);
  n %= 100;
  if (hundred > 0) parts.push(`${bnWords0to99[hundred]} শত`);
  if (n > 0) parts.push(bnWords0to99[n]);
  return `${parts.join(" ")} টাকা মাত্র`;
}

function formatMoney(num: number): string {
  const val = Number(num) || 0;
  return val.toLocaleString('en-IN');
}

export const CashMemoModal: React.FC<CashMemoModalProps> = ({
  isOpen,
  onClose,
  sale,
  product,
}) => {
  const [printFormat, setPrintFormat] = useState<'a5' | 'pos80'>('a5');

  // Editable studio states populated from `sale`
  const [shopNameBn, setShopNameBn] = useState('মেহেদী টেলিকম');
  const [shopNameEn, setShopNameEn] = useState('MEHEDY TELECOM');
  const [shopTagline, setShopTagline] = useState('★ বিশ্বস্ত স্মার্টফোন ও গ্যাজেট শোরুম');
  const [shopAddressBn, setShopAddressBn] = useState('নাগেশ্বরী, কুড়িগ্রাম (২য় তলা)');
  const [shopAddressEn, setShopAddressEn] = useState('Nageshwari, Kurigram (2nd Floor)');
  const [shopPhone, setShopPhone] = useState('01922-299968');

  const [memoNo, setMemoNo] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [saleType, setSaleType] = useState('নগদ (Cash)');
  const [paymentMethod, setPaymentMethod] = useState('নগদ / Cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [warrantyTerms, setWarrantyTerms] = useState(DEFAULT_WARRANTY_TERMS);
  const [items, setItems] = useState<MemoItem[]>([]);

  // Populate state whenever `sale` changes
  useEffect(() => {
    if (!sale) return;

    const computedMemo = getSaleMemoNumber(sale);
    const d = new Date(sale.sale_date);
    const formattedDate = isNaN(d.getTime())
      ? sale.sale_date
      : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

    const ram = sale.ram || product?.ram || '';
    const rom = sale.rom || product?.rom || '';
    const color = sale.color || product?.color || '';
    const variantParts = [
      ram && rom ? `${ram}/${rom}` : ram || rom,
      color
    ].filter(Boolean);
    const fullModelName = variantParts.length > 0
      ? `${sale.product_name} (${variantParts.join(', ')})`
      : sale.product_name;

    const resolvedImei2 =
      sale.imei2 ||
      product?.imei_units?.find((u) => u.imei1 === sale.imei)?.imei2 ||
      '';

    const qty = sale.quantity_sold || sale.quantity || 1;
    const totalAmt = sale.total_amount ?? sale.actual_sale_price ?? 0;
    const disc = sale.discount ?? 0;
    const unitPrice = sale.product_price ?? (totalAmt + disc);
    const paidAmt = sale.paid_amount ?? totalAmt;

    setMemoNo(computedMemo);
    setDateStr(formattedDate);
    setSaleType(sale.is_cash_sale ? 'নগদ (Cash)' : 'কিস্তি / রেগুলার (EMI)');
    setPaymentMethod(sale.is_cash_sale ? 'নগদ / Cash' : 'Cash + bKash / EMI');
    setCustomerName(sale.customer_name || '');
    setCustomerPhone(sale.phone_number && sale.phone_number !== 'N/A' ? sale.phone_number : '');
    setCustomerAddress(sale.address && sale.address !== 'N/A' ? sale.address : '');
    setDiscount(disc);
    setPaid(paidAmt);
    setWarrantyTerms(DEFAULT_WARRANTY_TERMS);
    setItems([
      {
        id: 1,
        model: fullModelName || '',
        imei1: sale.imei || '',
        imei2: resolvedImei2 || '',
        qty: qty,
        price: unitPrice,
      },
    ]);
  }, [sale, product]);

  if (!isOpen || !sale) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0),
    0
  );
  const netTotal = Math.max(0, subtotal - (Number(discount) || 0));
  const due = Math.max(0, netTotal - (Number(paid) || 0));

  const warrantyLines = (warrantyTerms || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const handleUpdateItem = (id: number, field: keyof MemoItem, value: string | number) => {
    setItems((prev) => {
      const updated = prev.map((it) => (it.id === id ? { ...it, [field]: value } : it));
      if (field === 'price' || field === 'qty') {
        const newSub = updated.reduce(
          (s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0),
          0
        );
        setPaid(Math.max(0, newSub - (Number(discount) || 0)));
      }
      return updated;
    });
  };

  const handleAddItem = () => {
    const nextId = items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    setItems((prev) => [
      ...prev,
      { id: nextId, model: '', imei1: '', imei2: '', qty: 1, price: 0 },
    ]);
  };

  const handleRemoveItem = (id: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleResetNewMemo = () => {
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(
      today.getMonth() + 1
    ).padStart(2, '0')}/${today.getFullYear()}`;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setMemoNo(`MT-${today.getFullYear()}-${randomNum}`);
    setDateStr(formattedDate);
    setSaleType('নগদ (Cash)');
    setPaymentMethod('নগদ / Cash');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setDiscount(0);
    setPaid(0);
    setItems([{ id: 1, model: '', imei1: '', imei2: '', qty: 1, price: 0 }]);
  };

  const handleLoadSampleData = () => {
    setMemoNo('MT-2026-0842');
    setDateStr('17/11/2026');
    setSaleType('নগদ (Cash)');
    setPaymentMethod('Cash + bKash');
    setCustomerName('মোঃ তানভীর আহমেদ');
    setCustomerPhone('01715-849210');
    setCustomerAddress('কলেজ মোড়, নাগেশ্বরী, কুড়িগ্রাম');
    setDiscount(0);
    setPaid(31500);
    setItems([
      {
        id: 1,
        model: 'Xiaomi Redmi Note 13 Pro 5G (8GB/256GB, Midnight Black)',
        imei1: '864290061234567',
        imei2: '864290061234575',
        qty: 1,
        price: 31500,
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-[130] bg-[#EEF2F6] text-slate-800 flex flex-col overflow-hidden print:bg-white print:block print:overflow-visible">
      {/* Print Isolation & Canva Header Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        .memo-studio-root {
          font-family: 'Hind Siliguri', 'Plus Jakarta Sans', sans-serif;
        }
        .memo-font-num {
          font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif;
          font-variant-numeric: tabular-nums;
        }
        .canva-header-bg {
          background: linear-gradient(135deg, #091A30 0%, #0F294A 58%, #163B6B 100%);
          position: relative;
          overflow: hidden;
        }
        .canva-header-bg::before {
          content: "";
          position: absolute;
          top: -45%;
          right: -10%;
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .canva-header-bg::after {
          content: "";
          position: absolute;
          bottom: -55%;
          left: 16%;
          width: 220px;
          height: 220px;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .receipt-a5 {
          width: 100%;
          max-width: 148mm;
          min-height: 210mm;
          background: #FFFFFF;
          box-shadow: 0 20px 45px -15px rgba(15, 41, 74, 0.22), 0 0 1px 1px rgba(15, 41, 74, 0.08);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .receipt-80mm {
          width: 302px;
          max-width: 100%;
          min-height: 155mm;
          background: #FFFFFF;
          box-shadow: 0 20px 45px -15px rgba(15, 41, 74, 0.22), 0 0 1px 1px rgba(15, 41, 74, 0.08);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .watermark-layer {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 0;
          opacity: 0.045;
        }
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #receipt-paper,
          #receipt-paper * {
            visibility: visible !important;
          }
          #receipt-paper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            right: 0 !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .receipt-a5 {
            width: 148mm !important;
            max-width: 148mm !important;
            min-height: 204mm !important;
            border: 1px solid #CBD5E1 !important;
          }
          .receipt-80mm {
            width: 302px !important;
            max-width: 302px !important;
            min-height: auto !important;
            border: none !important;
          }
          @page {
            size: ${printFormat === 'pos80' ? '80mm auto' : 'A5 portrait'};
            margin: 3mm;
          }
        }
      `}</style>

      <div className="memo-studio-root flex flex-col h-full overflow-hidden">
        {/* ================= TOP DARK NAVY BAR (Matches Screenshot 1:1) ================= */}
        <header className="bg-[#091A30] text-white border-b border-white/10 shadow-lg shrink-0 print:hidden">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            {/* Brand Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FBBF24] to-[#B48E1E] text-[#091A30] flex items-center justify-center shadow-md shrink-0">
                <Smartphone className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                    মেহেদী টেলিকম
                  </h1>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#06B6D4]/20 text-[#22D3EE] border border-[#22D3EE]/30">
                    POS &amp; MEMO STUDIO
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  স্মার্টফোন সেলস রিসিট ও ক্যাশ মেমো জেনারেটর
                </p>
              </div>
            </div>

            {/* Format Switcher & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Format Toggle Pill */}
              <div className="bg-[#0F294A] p-1 rounded-xl border border-white/15 flex items-center">
                <button
                  type="button"
                  onClick={() => setPrintFormat('a5')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    printFormat === 'a5'
                      ? 'bg-[#FBBF24] text-[#091A30] shadow-sm'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  A5 Cash Memo (স্ট্যান্ডার্ড মেমো)
                </button>
                <button
                  type="button"
                  onClick={() => setPrintFormat('pos80')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    printFormat === 'pos80'
                      ? 'bg-[#FBBF24] text-[#091A30] shadow-sm'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  80mm POS (থার্মাল রিসিট)
                </button>
              </div>

              {/* New Memo Button */}
              <button
                type="button"
                onClick={handleResetNewMemo}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন মেমো</span>
              </button>

              {/* Print Receipt Button */}
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] hover:from-[#06B6D4] hover:to-[#0891B2] text-[#091A30] text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 stroke-[2.3]" />
                <span>প্রিন্ট রশিদ (Print Receipt)</span>
              </button>

              {/* Close Modal Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 hover:text-white transition-all cursor-pointer"
                title="বন্ধ করুন (Close)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* ================= MAIN 2-COLUMN WORKSPACE ================= */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: LIVE EDITOR */}
            <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden print:hidden">
              <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0F294A]" />
                  <h2 className="font-bold text-sm sm:text-base text-[#091A30]">
                    মেমো তথ্য এডিটর (Live Editor)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSampleData}
                  className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 underline cursor-pointer"
                >
                  স্যাম্পল ডাটা লোড করুন
                </button>
              </div>

              <div className="p-5 space-y-5 max-h-[calc(100vh-150px)] overflow-y-auto">
                {/* 1. Memo & Payment Info */}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    ১. মেমো ও পেমেন্ট তথ্য (MEMO &amp; PAYMENT)
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        মেমো নং (Memo No)
                      </label>
                      <input
                        type="text"
                        value={memoNo}
                        onChange={(e) => setMemoNo(e.target.value)}
                        className="memo-font-num w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:border-[#0F294A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        তারিখ (Date)
                      </label>
                      <input
                        type="text"
                        value={dateStr}
                        onChange={(e) => setDateStr(e.target.value)}
                        className="memo-font-num w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:border-[#0F294A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        বিক্রয়ের ধরন (Sale Type)
                      </label>
                      <select
                        value={saleType}
                        onChange={(e) => setSaleType(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white focus:border-[#0F294A] outline-none"
                      >
                        <option value="নগদ (Cash)">নগদ (Cash)</option>
                        <option value="কিস্তি / রেগুলার (EMI)">কিস্তি / রেগুলার (EMI)</option>
                        <option value="এক্সচেঞ্জ (Exchange)">এক্সচেঞ্জ (Exchange)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        পেমেন্ট মাধ্যম (Payment)
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white focus:border-[#0F294A] outline-none"
                      >
                        <option value="নগদ / Cash">নগদ / Cash</option>
                        <option value="Cash + bKash">Cash + bKash</option>
                        <option value="bKash">bKash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Bank / Card">Bank / Card</option>
                      </select>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* 2. Customer Details */}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    ২. ক্রেতার তথ্য (CUSTOMER DETAILS)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        ক্রেতার নাম
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="ক্রেতার নাম লিখুন"
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:border-[#0F294A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        মোবাইল নং
                      </label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="memo-font-num w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:border-[#0F294A] outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ঠিকানা
                    </label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="ক্রেতার ঠিকানা লিখুন"
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:border-[#0F294A] outline-none"
                    />
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* 3. Product & IMEI List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      ৩. ফোনের মডেল ও IMEI (PRODUCTS)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-2.5 py-1 rounded-lg bg-[#0F294A] text-white text-[11px] font-bold flex items-center gap-1 hover:bg-[#163B6B] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> পণ্য যোগ করুন
                    </button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#0F294A] bg-white px-2 py-0.5 rounded border border-slate-200">
                            পণ্য #{idx + 1}
                          </span>
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> মুছুন
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                            স্মার্টফোন / পণ্যের মডেল ও ভ্যারিয়েন্ট
                          </label>
                          <input
                            type="text"
                            value={item.model}
                            onChange={(e) => handleUpdateItem(item.id, 'model', e.target.value)}
                            placeholder="যেমন: Xiaomi Redmi Note 13 Pro 5G (8/256GB)"
                            className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:border-[#0F294A] outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                              IMEI 1
                            </label>
                            <input
                              type="text"
                              value={item.imei1}
                              onChange={(e) => handleUpdateItem(item.id, 'imei1', e.target.value)}
                              placeholder="IMEI 1"
                              className="memo-font-num w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white focus:border-[#0F294A] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                              IMEI 2 (ঐচ্ছিক)
                            </label>
                            <input
                              type="text"
                              value={item.imei2}
                              onChange={(e) => handleUpdateItem(item.id, 'imei2', e.target.value)}
                              placeholder="IMEI 2"
                              className="memo-font-num w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white focus:border-[#0F294A] outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                              পরিমাণ (Qty)
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={item.qty}
                              onChange={(e) =>
                                handleUpdateItem(item.id, 'qty', Number(e.target.value))
                              }
                              className="memo-font-num w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white focus:border-[#0F294A] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                              দর / মূল্য (৳)
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={item.price}
                              onChange={(e) =>
                                handleUpdateItem(item.id, 'price', Number(e.target.value))
                              }
                              className="memo-font-num w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white focus:border-[#0F294A] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* 4. Billing & Discount */}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    ৪. হিসাব ও ডিসকাউন্ট (BILLING)
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        ডিসকাউন্ট / ছাড় (৳)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={discount}
                        onChange={(e) => {
                          const discVal = Number(e.target.value) || 0;
                          setDiscount(discVal);
                          setPaid(Math.max(0, subtotal - discVal));
                        }}
                        className="memo-font-num w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:border-[#0F294A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        জমার পরিমাণ / Paid (৳)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={paid}
                        onChange={(e) => setPaid(Number(e.target.value) || 0)}
                        className="memo-font-num w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:border-[#0F294A] outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 text-white grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">সাবটোটাল</div>
                      <div className="memo-font-num font-bold">৳ {formatMoney(subtotal)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">সর্বমোট বিল</div>
                      <div className="memo-font-num font-extrabold text-[#FBBF24]">
                        ৳ {formatMoney(netTotal)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">বকেয়া (Due)</div>
                      <div className="memo-font-num font-bold text-rose-400">
                        ৳ {formatMoney(due)}
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* 5. Warranty Terms */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      ৫. ওয়ারেন্টি শর্তাবলী (WARRANTY TERMS)
                    </span>
                    <button
                      type="button"
                      onClick={() => setWarrantyTerms(DEFAULT_WARRANTY_TERMS)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> ডিফল্ট
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={warrantyTerms}
                    onChange={(e) => setWarrantyTerms(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#0F294A] outline-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: LIVE RECEIPT PREVIEW */}
            <div className="lg:col-span-7 flex flex-col items-center">
              {/* Top status strip above receipt */}
              <div className="w-full max-w-[148mm] flex items-center justify-between text-xs text-slate-600 mb-2.5 px-1 print:hidden">
                <div className="flex items-center gap-2 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    লাইভ প্রিভিউ ( {printFormat === 'a5' ? 'A5 Cash Memo - 148mm × 210mm' : '80mm POS Receipt'} )
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  প্রিন্ট করলে শুধুমাত্র নিচের রশিদটিই আসবে
                </span>
              </div>

              {/* RECEIPT PAPER */}
              {printFormat === 'a5' ? (
                /* ================= TEMPLATE 1: CANVA-STYLE A5 CASH MEMO ================= */
                <div id="receipt-paper" className="receipt-a5 rounded-sm">
                  {/* Subtle Diagonal Watermark */}
                  <div className="watermark-layer">
                    <div className="text-center transform -rotate-12 select-none">
                      <Smartphone className="w-36 h-36 mx-auto text-[#0F294A]" />
                      <div className="text-3xl font-extrabold tracking-widest text-[#0F294A] mt-1">
                        {shopNameEn}
                      </div>
                      <div className="text-lg font-bold text-[#0F294A]">{shopNameBn}</div>
                    </div>
                  </div>

                  {/* TOP & MIDDLE CONTENT */}
                  <div className="relative z-10">
                    {/* Canva-Style Dark Navy Header Banner */}
                    <div className="canva-header-bg text-white px-6 pt-5 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Brand Identity */}
                        <div className="flex items-center gap-3.5">
                          <div className="w-14 h-14 rounded-2xl border-2 border-[#FBBF24] bg-[#091A30]/60 flex flex-col items-center justify-center shrink-0 shadow-md">
                            <Smartphone className="w-6 h-6 text-[#FBBF24]" />
                            <span className="text-[8px] font-extrabold tracking-widest text-[#FBBF24] mt-0.5">
                              MOBILE
                            </span>
                          </div>
                          <div>
                            <div className="inline-block px-2.5 py-0.5 rounded-full border border-[#FBBF24]/40 bg-[#091A30]/50 text-[#FBBF24] text-[10px] font-semibold mb-1">
                              {shopTagline}
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-none">
                              {shopNameBn}
                            </h1>
                            <p className="text-xs font-extrabold tracking-[0.22em] text-[#22D3EE] uppercase mt-1">
                              {shopNameEn}
                            </p>
                          </div>
                        </div>

                        {/* Right: Cash Memo Badge & Shop Address */}
                        <div className="text-right">
                          <div className="inline-block bg-gradient-to-r from-[#FBBF24] to-[#D4AF37] text-[#091A30] text-[11px] font-extrabold px-3 py-1 rounded-md shadow-xs uppercase tracking-wider mb-1.5">
                            ক্যাশ মেমো / CASH MEMO
                          </div>
                          <p className="text-xs font-semibold text-slate-100">{shopAddressBn}</p>
                          <p className="text-[10px] text-slate-300">{shopAddressEn}</p>
                          <p className="memo-font-num text-xs font-extrabold text-[#FBBF24] mt-1">
                            ✆ {shopPhone}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Gold Accent Line + Brand Strip */}
                    <div className="h-1 bg-gradient-to-r from-[#D4AF37] via-[#FBBF24] to-[#06B6D4]" />
                    <div className="bg-[#091A30] text-slate-200 py-1.5 px-4 text-center text-[10px] font-extrabold tracking-[0.18em] uppercase">
                      SAMSUNG &nbsp;|&nbsp; XIAOMI &nbsp;|&nbsp; OPPO &nbsp;|&nbsp; TECNO &nbsp;|&nbsp; INFINIX &nbsp;|&nbsp; ITEL &nbsp;|&nbsp; HONOR
                    </div>

                    {/* Body Padding */}
                    <div className="p-5 space-y-4">
                      {/* Customer & Memo Meta Box */}
                      <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 grid grid-cols-12 gap-3 text-xs">
                        <div className="col-span-7 space-y-1.5 pr-2 border-r border-slate-200">
                          <div className="flex items-baseline gap-2">
                            <span className="text-slate-500 min-w-[68px]">ক্রেতার নাম:</span>
                            <span className="font-bold text-[#091A30] text-sm">
                              {customerName || 'Walk-in Customer'}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-slate-500 min-w-[68px]">মোবাইল নং:</span>
                            <span className="memo-font-num font-bold text-slate-800">
                              {customerPhone || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-slate-500 min-w-[68px]">ঠিকানা:</span>
                            <span className="font-medium text-slate-700">
                              {customerAddress || 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-5 space-y-1.5 pl-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">মেমো নং:</span>
                            <span className="memo-font-num font-extrabold text-[#091A30] bg-white px-2 py-0.5 rounded border border-slate-300 text-[11px]">
                              {memoNo}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">তারিখ:</span>
                            <span className="memo-font-num font-bold text-slate-800">
                              {dateStr}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">ধরন:</span>
                            <span className="font-bold text-[10.5px] px-2 py-0.5 rounded bg-cyan-50 text-cyan-900 border border-cyan-200">
                              {saleType}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#0F294A] text-white text-[11px]">
                              <th className="py-2 px-2.5 text-center w-9">নং</th>
                              <th className="py-2 px-3">স্মার্টফোন / পণ্যের বিবরণ ও IMEI</th>
                              <th className="py-2 px-2 text-center w-16">পরিমাণ</th>
                              <th className="py-2 px-2.5 text-right w-24">দর (৳)</th>
                              <th className="py-2 px-3 text-right w-24">মোট (৳)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, index) => {
                              const lineTotal =
                                (Number(item.qty) || 0) * (Number(item.price) || 0);
                              const hasImei = item.imei1 || item.imei2;
                              return (
                                <tr
                                  key={item.id}
                                  className={`border-b border-slate-200/80 ${
                                    index % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                                  }`}
                                >
                                  <td className="py-2.5 px-2 text-center memo-font-num text-xs font-semibold text-slate-600 align-top">
                                    {index + 1}
                                  </td>
                                  <td className="py-2.5 px-3 align-top">
                                    <div className="font-bold text-xs text-[#091A30] leading-snug">
                                      {item.model || (
                                        <span className="text-slate-300 italic">
                                          পণ্যের মডেল লিখুন...
                                        </span>
                                      )}
                                    </div>
                                    {hasImei && (
                                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10.5px] memo-font-num text-slate-800 bg-slate-100 px-2 py-1 rounded-md border border-slate-200/90 w-fit">
                                        {item.imei1 && (
                                          <span>
                                            <strong className="text-[#0F294A]">IMEI 1:</strong>{' '}
                                            {item.imei1}
                                          </span>
                                        )}
                                        {item.imei2 && (
                                          <span>
                                            <strong className="text-[#0F294A]">IMEI 2:</strong>{' '}
                                            {item.imei2}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-2 text-center memo-font-num text-xs font-bold text-slate-700 align-top">
                                    {item.qty || 1}
                                  </td>
                                  <td className="py-2.5 px-2.5 text-right memo-font-num text-xs text-slate-700 align-top">
                                    {formatMoney(item.price)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right memo-font-num text-xs font-bold text-[#091A30] align-top">
                                    {formatMoney(lineTotal)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* In Words & Totals Row */}
                      <div className="grid grid-cols-12 gap-4 items-stretch">
                        {/* Left: In-Words & Payment Status */}
                        <div className="col-span-7 bg-slate-50/90 rounded-xl border border-slate-200 p-3 flex flex-col justify-between text-xs">
                          <div>
                            <span className="text-[10.5px] font-bold text-slate-500 block mb-0.5">
                              কথায় (In Words):
                            </span>
                            <p className="font-bold text-[#091A30] leading-snug">
                              {numberToBengaliWords(netTotal)}
                            </p>
                          </div>
                          <div className="pt-2 mt-2 border-t border-slate-200/80 flex items-center justify-between">
                            <span className="text-[10.5px] font-semibold text-[#0F294A] bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-md">
                              {paymentMethod}
                            </span>
                            {due === 0 ? (
                              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                PAID / পরিশোধিত
                              </span>
                            ) : (
                              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                                DUE / বকেয়া
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: Financial Totals Box */}
                        <div className="col-span-5 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden text-[11px]">
                          <div className="px-3 py-1.5 flex justify-between border-b border-slate-200/80">
                            <span className="text-slate-600">সাবটোটাল:</span>
                            <span className="memo-font-num font-semibold text-slate-800">
                              ৳ {formatMoney(subtotal)}
                            </span>
                          </div>
                          <div className="px-3 py-1.5 flex justify-between border-b border-slate-200/80">
                            <span className="text-slate-600">ডিসকাউন্ট:</span>
                            <span className="memo-font-num font-semibold text-emerald-700">
                              - ৳ {formatMoney(discount)}
                            </span>
                          </div>
                          <div className="px-3 py-1.5 flex justify-between bg-[#0F294A] text-white font-bold">
                            <span>সর্বমোট বিল:</span>
                            <span className="memo-font-num text-[#FBBF24]">
                              ৳ {formatMoney(netTotal)}
                            </span>
                          </div>
                          <div className="px-3 py-1.5 flex justify-between border-b border-slate-200/80">
                            <span className="text-slate-600">জমা (Paid):</span>
                            <span className="memo-font-num font-bold text-slate-900">
                              ৳ {formatMoney(paid)}
                            </span>
                          </div>
                          <div
                            className={`px-3 py-1.5 flex justify-between font-bold ${
                              due > 0 ? 'bg-rose-50 text-rose-700' : 'bg-white text-slate-700'
                            }`}
                          >
                            <span>বকেয়া (Due):</span>
                            <span className="memo-font-num">৳ {formatMoney(due)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM WARRANTY & SIGNATURES */}
                  <div className="relative z-10 px-5 pb-5 space-y-4">
                    {warrantyLines.length > 0 && (
                      <div className="bg-slate-50/95 border border-[#0F294A]/15 rounded-xl p-2.5">
                        <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#0F294A] mb-1 border-b border-slate-200 pb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                          <span>ওয়ারেন্টি ও বিক্রয় শর্তাবলী (Warranty Terms &amp; Conditions):</span>
                        </div>
                        <ul className="space-y-0.5 text-[9.5px] text-slate-700">
                          {warrantyLines.map((line, i) => (
                            <li key={i} className="leading-snug">
                              {line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-5 border-t border-dashed border-slate-300 flex items-end justify-between text-[11px]">
                      <div className="text-center">
                        <div className="w-32 border-t border-slate-500 pt-1 font-semibold text-slate-700">
                          ক্রেতার স্বাক্ষর
                        </div>
                      </div>
                      <div className="text-center text-[10px] text-slate-500 font-medium">
                        ধন্যবাদ! আবার আসবেন
                      </div>
                      <div className="text-center">
                        <div className="w-44 border-t border-[#0F294A] pt-1 font-bold text-[#0F294A]">
                          বিক্রেতার স্বাক্ষর ({shopNameBn})
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ================= TEMPLATE 2: 80MM THERMAL POS RECEIPT ================= */
                <div id="receipt-paper" className="receipt-80mm rounded-sm">
                  <div className="p-3.5 text-slate-900 flex flex-col justify-between h-full">
                    <div>
                      {/* Header */}
                      <div className="text-center border-b-2 border-[#0F294A] pb-2.5">
                        <div className="inline-block bg-[#0F294A] text-[#FBBF24] text-[9px] font-extrabold tracking-widest px-2 py-0.5 rounded uppercase mb-1">
                          CASH MEMO / POS RECEIPT
                        </div>
                        <h1 className="text-lg font-bold text-[#091A30] leading-tight">
                          {shopNameBn}
                        </h1>
                        <p className="text-[10px] font-extrabold tracking-widest text-slate-700">
                          {shopNameEn}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{shopTagline}</p>
                        <p className="text-[10.5px] font-medium text-slate-800 mt-0.5">
                          ঠিকানা: {shopAddressBn}
                        </p>
                        <p className="memo-font-num text-[11px] font-bold text-[#0F294A]">
                          মোবাইল: {shopPhone}
                        </p>
                        <p className="text-[8px] font-semibold tracking-wider text-slate-500 mt-1">
                          Samsung • Xiaomi • Oppo • Tecno • Infinix • Itel • Honor
                        </p>
                      </div>

                      {/* Meta Info */}
                      <div className="py-2 border-b border-dashed border-slate-400 text-[10.5px] space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-slate-600">মেমো নং:</span>
                          <span className="memo-font-num font-bold">{memoNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">তারিখ:</span>
                          <span className="memo-font-num font-semibold">{dateStr}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">পেমেন্ট:</span>
                          <span className="font-semibold">{paymentMethod}</span>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="py-2 border-b border-dashed border-slate-400 text-[10.5px] space-y-0.5">
                        <div>
                          <span className="text-slate-600">ক্রেতা:</span>{' '}
                          <strong>{customerName || 'Walk-in Customer'}</strong>
                        </div>
                        {customerPhone && (
                          <div>
                            <span className="text-slate-600">মোবাইল:</span>{' '}
                            <span className="memo-font-num font-semibold">{customerPhone}</span>
                          </div>
                        )}
                        {customerAddress && (
                          <div>
                            <span className="text-slate-600">ঠিকানা:</span> {customerAddress}
                          </div>
                        )}
                      </div>

                      {/* Items Header */}
                      <div className="flex justify-between text-[10px] font-bold bg-slate-100 px-1.5 py-1 mt-2 border-y border-slate-300">
                        <span>বিবরণ ও IMEI</span>
                        <span>মোট (৳)</span>
                      </div>

                      {/* Items List */}
                      <div>
                        {items.map((item, idx) => {
                          const lineTotal =
                            (Number(item.qty) || 0) * (Number(item.price) || 0);
                          return (
                            <div
                              key={item.id}
                              className="py-1.5 border-b border-dashed border-slate-300 text-[11px]"
                            >
                              <div className="font-bold text-slate-900 leading-snug">
                                {idx + 1}. {item.model || 'Unnamed Item'}
                              </div>
                              {item.imei1 && (
                                <div className="memo-font-num text-[9.5px] text-slate-700">
                                  IMEI 1: {item.imei1}
                                </div>
                              )}
                              {item.imei2 && (
                                <div className="memo-font-num text-[9.5px] text-slate-700">
                                  IMEI 2: {item.imei2}
                                </div>
                              )}
                              <div className="flex justify-between items-center mt-0.5 memo-font-num text-[10.5px]">
                                <span className="text-slate-600">
                                  {item.qty || 1} × ৳{formatMoney(item.price)}
                                </span>
                                <span className="font-bold text-slate-900">
                                  ৳{formatMoney(lineTotal)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Totals */}
                      <div className="pt-2 space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-600">সাবটোটাল:</span>
                          <span className="memo-font-num font-semibold">
                            ৳{formatMoney(subtotal)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">ডিসকাউন্ট:</span>
                          <span className="memo-font-num font-semibold">
                            - ৳{formatMoney(discount)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs font-extrabold bg-[#0F294A] text-white px-2 py-1 rounded">
                          <span>সর্বমোট বিল:</span>
                          <span className="memo-font-num text-[#FBBF24]">
                            ৳{formatMoney(netTotal)}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>জমা (Paid):</span>
                          <span className="memo-font-num">৳{formatMoney(paid)}</span>
                        </div>
                        <div
                          className={`flex justify-between font-bold ${
                            due > 0 ? 'text-rose-600' : 'text-slate-700'
                          }`}
                        >
                          <span>বকেয়া (Due):</span>
                          <span className="memo-font-num">৳{formatMoney(due)}</span>
                        </div>
                        <div className="text-[9.5px] text-slate-700 pt-1 border-t border-dotted border-slate-300">
                          <strong>কথায়:</strong> {numberToBengaliWords(netTotal)}
                        </div>
                      </div>
                    </div>

                    {/* Compact Warranty Terms, Signatures & Footer */}
                    <div className="mt-3 pt-2 border-t border-dashed border-slate-400 space-y-2.5">
                      {warrantyLines.length > 0 && (
                        <div className="text-[8.5px] text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200 space-y-0.5 text-left">
                          <div className="font-bold text-[#0F294A]">ওয়ারেন্টি ও বিক্রয় শর্তাবলী:</div>
                          {warrantyLines.map((line, i) => (
                            <p key={i} className="leading-tight">
                              {line}
                            </p>
                          ))}
                        </div>
                      )}
                      <div className="flex justify-between items-end pt-4 text-[9px] font-semibold">
                        <span className="border-t border-slate-500 px-1.5 pt-0.5">
                          ক্রেতার স্বাক্ষর
                        </span>
                        <span className="border-t border-slate-800 px-1.5 pt-0.5 font-bold">
                          বিক্রেতার স্বাক্ষর
                        </span>
                      </div>
                      <div className="text-center text-[10px] font-bold text-[#0F294A] pt-0.5">
                        ধন্যবাদ! আবার আসবেন — {shopNameBn}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
