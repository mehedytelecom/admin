import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, FileText } from 'lucide-react';
import { Sale, Product } from '../types';

interface CashMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  product?: Product | null;
  autoPrint?: boolean;
}

interface MemoItem {
  id: number;
  model: string;
  imei1: string;
  imei2: string;
  qty: number;
  price: number;
  discount: number;
}

interface TransactionEntry {
  id: number;
  method: string;
  amount: number;
  note?: string;
}

const OFFICIAL_LOGO_SRC = '/assets/aistudio/mt_logo-03_8f27a2d4.jpg';

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
৪. ওয়ারেন্টি সেবা পেতে হলে অবশ্যই এই সেলস ইনভয়েস এবং ফোনের মূল বক্স সাথে আনতে হবে।`;

const bnWords0to99 = [
  'শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়',
  'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোল', 'সতেরো', 'আঠারো', 'ঊনিশ',
  'বিশ', 'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আটাশ', 'ঊনত্রিশ',
  'ত্রিশ', 'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ',
  'চল্লিশ', 'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ',
  'পঞ্চাশ', 'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট',
  'ষাট', 'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর',
  'সত্তর', 'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি',
  'আশি', 'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'আটাশি', 'ঊননব্বই',
  'নব্বই', 'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই',
];

function numberToBengaliWords(amount: number): string {
  let n = Math.floor(Math.abs(Number(amount) || 0));
  if (n === 0) return 'শূন্য টাকা মাত্র';
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
  return `${parts.join(' ')} টাকা মাত্র`;
}

const enOnes = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const enTens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function enTwoDigits(n: number): string {
  if (n < 20) return enOnes[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o > 0 ? `${enTens[t]}-${enOnes[o]}` : enTens[t];
}

function enThreeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const rem = n % 100;
  const parts: string[] = [];
  if (h > 0) parts.push(`${enOnes[h]} Hundred`);
  if (rem > 0) parts.push(enTwoDigits(rem));
  return parts.join(' ');
}

function numberToEnglishWords(amount: number): string {
  let n = Math.floor(Math.abs(Number(amount) || 0));
  if (n === 0) return 'Zero Taka Only';
  if (n > 999999999) return `${n.toLocaleString('en-IN')} Taka Only`;

  const parts: string[] = [];
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  if (crore > 0) parts.push(`${enThreeDigits(crore)} Crore`);

  const lakh = Math.floor(n / 100000);
  n %= 100000;
  if (lakh > 0) parts.push(`${enTwoDigits(lakh)} Lakh`);

  const thousand = Math.floor(n / 1000);
  n %= 1000;
  if (thousand > 0) parts.push(`${enTwoDigits(thousand)} Thousand`);

  if (n > 0) parts.push(enThreeDigits(n));
  return `${parts.join(' ')} Taka Only`;
}

function formatMoney(num: number): string {
  const val = Number(num) || 0;
  return val.toLocaleString('en-IN');
}

// Standard Code 39 encoding table (each char = 9 elements: bar, space, bar, space, ...)
const CODE39_MAP: Record<string, string> = {
  '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn',
  '4': 'nnnwwnnnw', '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw',
  '8': 'wnnwnnwnn', '9': 'nnwwnnwnn', 'A': 'wnnnnwnnw', 'B': 'nnwnnwnnw',
  'C': 'wnwnnwnnn', 'D': 'nnnnwwnnw', 'E': 'wnnnwwnnn', 'F': 'nnwnwwnnn',
  'G': 'nnnnnwwnw', 'H': 'wnnnnwwnn', 'I': 'nnwnnwwnn', 'J': 'nnnnwwwnn',
  'K': 'wnnnnnnww', 'L': 'nnwnnnnww', 'M': 'wnwnnnnwn', 'N': 'nnnnwnnww',
  'O': 'wnnnwnnwn', 'P': 'nnwnwnnwn', 'Q': 'nnnnnnwww', 'R': 'wnnnnnwwn',
  'S': 'nnwnnnwwn', 'T': 'nnnnwnwwn', 'U': 'wwnnnnnnw', 'V': 'nwwnnnnnw',
  'W': 'wwwnnnnnn', 'X': 'nwnnwnnnw', 'Y': 'wwnnwnnnn', 'Z': 'nwwnwnnnn',
  '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', '$': 'nwnwnwnnn',
  '/': 'nwnwnnnwn', '+': 'nwnnnwnwn', '%': 'nnnwnwnwn', '*': 'nwnnwnwnn',
};

const InvoiceBarcode: React.FC<{ value: string; height?: number }> = ({ value, height = 34 }) => {
  const { bars, totalWidth, sanitized } = useMemo(() => {
    const clean = (value || 'MT-2026')
      .toUpperCase()
      .replace(/[^0-9A-Z\-. $/+%]/g, '')
      .slice(0, 20) || 'MT-2026';
    const encoded = `*${clean}*`;
    const narrow = 1.35;
    const wide = 3.2;
    const gap = 1.4;
    let x = 2;
    const rects: { x: number; w: number }[] = [];

    for (let c = 0; c < encoded.length; c++) {
      const pattern = CODE39_MAP[encoded[c]] || CODE39_MAP['-'];
      for (let i = 0; i < pattern.length; i++) {
        const w = pattern[i] === 'w' ? wide : narrow;
        if (i % 2 === 0) {
          rects.push({ x, w });
        }
        x += w;
      }
      x += gap;
    }

    return { bars: rects, totalWidth: x + 2, sanitized: clean };
  }, [value]);

  return (
    <div className="inline-flex flex-col items-end">
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full max-w-[175px] h-[30px]"
        preserveAspectRatio="none"
        aria-label={`Barcode ${sanitized}`}
      >
        {bars.map((b, idx) => (
          <rect key={idx} x={b.x} y={0} width={b.w} height={height} fill="#111827" />
        ))}
      </svg>
      <span className="memo-font-num text-[9px] font-bold tracking-[0.22em] text-[#374151] mt-0.5">
        {sanitized}
      </span>
    </div>
  );
};

const MehedyTelecomLogo: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <svg viewBox="0 0 44 44" className="w-8 h-8" aria-label="Mehedy Telecom">
        <defs>
          <linearGradient id="mtSwooshCompact" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
        </defs>
        <path
          d="M5 17 C13 6, 31 6, 39 14"
          fill="none"
          stroke="url(#mtSwooshCompact)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <rect x="16" y="12" width="12" height="19" rx="2.2" fill="#111827" />
        <rect x="18" y="14.5" width="8" height="12.5" rx="0.8" fill="#FFFFFF" />
        <circle cx="22" cy="29.2" r="0.9" fill="#DC2626" />
        <text
          x="22"
          y="40"
          textAnchor="middle"
          fontSize="10"
          fontWeight="900"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fill="#DC2626"
        >
          MT
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 260 76"
      className="w-full h-full max-w-[240px]"
      role="img"
      aria-label="Mehedy Telecom Logo"
    >
      <defs>
        <linearGradient id="mtBrandArc" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="55%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
      </defs>
      {/* Top Swoosh & Smartphone Emblem */}
      <path
        d="M36 26 C72 4, 168 3, 214 20"
        fill="none"
        stroke="url(#mtBrandArc)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M207 14 L216 20.5 L205 23.5"
        fill="none"
        stroke="#111827"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="116" y="6" width="16" height="24" rx="3" fill="#111827" />
      <rect x="118.5" y="9" width="11" height="15.5" rx="1" fill="#F8FAFC" />
      <circle cx="124" cy="27.2" r="1.2" fill="#DC2626" />
      {/* Brand Wordmark */}
      <text
        x="4"
        y="53"
        fontSize="27"
        fontWeight="900"
        letterSpacing="-0.5"
        fontFamily="Plus Jakarta Sans, sans-serif"
        fill="#111827"
      >
        Mehedy
      </text>
      <text
        x="114"
        y="53"
        fontSize="27"
        fontWeight="900"
        letterSpacing="-0.5"
        fontFamily="Plus Jakarta Sans, sans-serif"
        fill="#DC2626"
      >
        Telecom
      </text>
      {/* Subtitle */}
      <text
        x="5"
        y="69"
        fontSize="9.6"
        fontWeight="700"
        letterSpacing="0.4"
        fontFamily="Plus Jakarta Sans, sans-serif"
        fill="#334155"
      >
        Smart Phone, Buy-Sell-Exchange, Best Deal
      </text>
    </svg>
  );
};

export const CashMemoModal: React.FC<CashMemoModalProps> = ({
  isOpen,
  onClose,
  sale,
  product,
  autoPrint = false,
}) => {
  const [printFormat, setPrintFormat] = useState<'a4' | 'pos80'>('a4');
  const [logoError, setLogoError] = useState(false);
  const autoPrintedSaleIdRef = useRef<string | null>(null);

  // Shop identity
  const shopNameBn = 'মেহেদী টেলিকম';
  const shopAddressBn = 'নাগেশ্বরী, কুড়িগ্রাম (২য় তলা)';
  const shopAddressEn = 'Nageshwari, Kurigram (2nd Floor)';
  const shopPhone = '01922-299968';

  const [memoNo, setMemoNo] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [paymentType, setPaymentType] = useState('Cash');
  const [emiAppName, setEmiAppName] = useState('');
  const [emiMonths] = useState<number>(6);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [transactions, setTransactions] = useState<TransactionEntry[]>([
    { id: 1, method: 'Cash (নগদ)', amount: 0 },
  ]);
  const [items, setItems] = useState<MemoItem[]>([]);

  // Populate invoice fields whenever `sale` changes
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
    const variantParts = [ram && rom ? `${ram}/${rom}` : ram || rom, color].filter(Boolean);
    const fullModelName =
      variantParts.length > 0 ? `${sale.product_name} (${variantParts.join(', ')})` : sale.product_name;

    const resolvedImei2 =
      sale.imei2 || product?.imei_units?.find((u) => u.imei1 === sale.imei)?.imei2 || '';

    const qty = sale.quantity_sold || 1;
    const totalAmt = sale.total_amount ?? sale.actual_sale_price ?? 0;
    const disc = sale.discount ?? 0;
    const unitPrice = sale.product_price ?? Math.round((totalAmt + disc) / Math.max(1, qty));
    const paidAmt = sale.paid_amount ?? totalAmt;
    const resolvedApp =
      sale.emi_app ||
      (sale.guarantor_number && sale.guarantor_number !== 'N/A' ? sale.guarantor_number : '');

    setMemoNo(computedMemo);
    setDateStr(formattedDate);
    setPaymentType(sale.is_cash_sale ? 'Cash' : 'Installment');
    setEmiAppName(resolvedApp);
    setCustomerName(sale.customer_name || '');
    setCustomerPhone(sale.phone_number && sale.phone_number !== 'N/A' ? sale.phone_number : '');
    setCustomerAddress(sale.address && sale.address !== 'N/A' ? sale.address : '');
    setTransactions([
      {
        id: 1,
        method: sale.is_cash_sale ? 'Cash (নগদ)' : resolvedApp ? `Installment (${resolvedApp})` : 'Cash / Down Payment',
        amount: paidAmt,
      },
    ]);
    setItems([
      {
        id: 1,
        model: fullModelName || '',
        imei1: sale.imei || '',
        imei2: resolvedImei2 || '',
        qty: qty,
        price: unitPrice,
        discount: disc,
      },
    ]);
  }, [sale, product]);

  // Automatically open system Print dialog right after a new sale is submitted
  useEffect(() => {
    if (!isOpen || !sale) {
      autoPrintedSaleIdRef.current = null;
      return;
    }
    if (autoPrint && autoPrintedSaleIdRef.current !== sale.id) {
      autoPrintedSaleIdRef.current = sale.id;
      const timer = window.setTimeout(() => {
        window.print();
      }, 420);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen, sale, autoPrint]);

  if (!isOpen || !sale) return null;

  const isEmiSale = paymentType === 'Installment';
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0),
    0
  );
  const totalDiscount = items.reduce((sum, item) => sum + (Number(item.discount) || 0), 0);
  const grossTotal = Math.max(0, subtotal - totalDiscount);
  const paidAmount = transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  const outstanding = Math.max(0, grossTotal - paidAmount);
  const effectiveMonthlyEmi = emiMonths > 0 ? Math.round(outstanding / emiMonths) : outstanding;

  const warrantyLines = DEFAULT_WARRANTY_TERMS
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const modalContent = (
    <div
      id="cash-memo-print-root"
      className="fixed inset-0 z-[130] bg-[#E5E7EB] text-[#111827] flex flex-col overflow-hidden"
    >
      {/* Print Isolation, Full-Color Enforcement & A4 / 80mm Paper Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        .memo-studio-root {
          font-family: 'Hind Siliguri', 'Plus Jakarta Sans', sans-serif;
        }
        .memo-font-num {
          font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif;
          font-variant-numeric: tabular-nums;
        }

        /* Brand-matched Metallic Silver & Crimson Header */
        .mt-invoice-header {
          background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 60%, #FEE2E2 100%) !important;
          border-top: 6px solid #DC2626 !important;
        }
        .mt-brand-strip {
          background: linear-gradient(90deg, #111827 0%, #1F2937 65%, #DC2626 100%) !important;
        }
        .mt-table-head {
          background: linear-gradient(90deg, #111827 0%, #374151 100%) !important;
        }
        .mt-gross-row {
          background: linear-gradient(90deg, #FEF2F2 0%, #FEE2E2 100%) !important;
        }

        /* Seamless Official Logo Blending (removes light metallic jpg background cleanly) */
        .mt-official-logo {
          mix-blend-mode: multiply;
          filter: brightness(1.36) contrast(1.48) saturate(1.18);
          transform: scale(1.32);
          transform-origin: center center;
        }

        /* Always keep paper strictly light even if app is in Dark Mode */
        #receipt-paper,
        #receipt-paper .paper-white {
          background-color: #FFFFFF !important;
          color: #111827 !important;
        }
        #receipt-paper .paper-card {
          background-color: #F8FAFC !important;
        }
        #receipt-paper .paper-imei {
          background-color: #F1F5F9 !important;
          border-left: 3px solid #DC2626 !important;
        }

        /* A4 Sales Invoice Dimensions (210mm x 297mm screen preview, guaranteed 1-page print) */
        .receipt-a4 {
          width: 210mm;
          min-height: 278mm;
          padding: 7mm 9mm;
          box-sizing: border-box;
          background: #FFFFFF !important;
          box-shadow: 0 22px 50px -16px rgba(17, 24, 39, 0.25), 0 0 0 1px rgba(17, 24, 39, 0.08);
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .receipt-a4-frame {
          flex: 1;
          min-height: 264mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid #CBD5E1;
          background: #FFFFFF !important;
          overflow: hidden;
        }

        /* 80mm POS Receipt */
        .receipt-80mm {
          width: 302px;
          max-width: 100%;
          min-height: 155mm;
          padding: 14px;
          box-sizing: border-box;
          background: #FFFFFF !important;
          box-shadow: 0 20px 45px -15px rgba(17, 24, 39, 0.22), 0 0 0 1px rgba(17, 24, 39, 0.08);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        /* Tilted Rubber Stamp */
        .mt-rubber-stamp {
          transform: rotate(-11deg);
          border-style: double;
          border-width: 4px;
          letter-spacing: 0.14em;
        }

        /* Full-Color, Zero-Browser-URL, Guaranteed Single-Page Print Engine */
        @page {
          size: ${printFormat === 'pos80' ? '80mm auto' : 'A4 portrait'};
          margin: 0;
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: ${printFormat === 'pos80' ? '80mm' : '100%'} !important;
            min-height: 0 !important;
            height: auto !important;
            background: #FFFFFF !important;
            overflow: visible !important;
          }
          /* Hide the rest of the web app completely so zero extra blank pages appear */
          body > *:not(#cash-memo-print-root) {
            display: none !important;
          }
          #cash-memo-print-root,
          .memo-studio-root,
          #memo-workspace-scroll,
          #memo-workspace-grid,
          #memo-preview-column {
            position: static !important;
            inset: auto !important;
            display: block !important;
            width: ${printFormat === 'pos80' ? '80mm' : '100%'} !important;
            min-height: 0 !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
            overflow: visible !important;
            background: #FFFFFF !important;
          }
          .no-print {
            display: none !important;
          }
          #receipt-paper {
            box-shadow: none !important;
            margin: 0 auto !important;
            border-radius: 0 !important;
          }
          .receipt-a4 {
            width: 100% !important;
            max-width: 210mm !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: 266mm !important;
            padding: 6mm 8mm !important;
            overflow: hidden !important;
            display: block !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .receipt-a4-frame {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            height: auto !important;
            min-height: 246mm !important;
            max-height: 254mm !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .receipt-80mm {
            width: 80mm !important;
            max-width: 80mm !important;
            min-height: auto !important;
            padding: 3mm !important;
          }
        }
      `}</style>

      <div className="memo-studio-root flex flex-col h-full overflow-hidden">
        {/* ================= TOP CHARCOAL & CRIMSON STUDIO BAR ================= */}
        <header className="no-print bg-[#111827] text-white border-b-2 border-[#DC2626] shadow-lg shrink-0">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            {/* Brand Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] border border-[#DC2626]/60 flex items-center justify-center overflow-hidden shrink-0">
                {!logoError ? (
                  <img
                    src={OFFICIAL_LOGO_SRC}
                    alt="Mehedy Telecom"
                    onError={() => setLogoError(true)}
                    className="w-full h-full object-contain scale-125"
                    style={{ mixBlendMode: 'multiply', filter: 'brightness(1.3) contrast(1.4)' }}
                  />
                ) : (
                  <MehedyTelecomLogo compact />
                )}
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight whitespace-nowrap">
                  মেহেদী টেলিকম <span className="text-[#EF4444]">মেমো প্রিন্ট</span>
                </h1>
                <p className="text-xs text-slate-400">
                  Direct Print Ready · A4 Sales Invoice &amp; 80mm POS
                </p>
              </div>
            </div>

            {/* Format Switcher & Primary Print CTA */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Format Toggle Segmented Control */}
              <div className="bg-[#1F2937] p-1 rounded-lg border border-slate-700 flex items-center">
                <button
                  type="button"
                  onClick={() => setPrintFormat('a4')}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    printFormat === 'a4'
                      ? 'bg-[#DC2626] text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>A4 Sales Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintFormat('pos80')}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    printFormat === 'pos80'
                      ? 'bg-[#DC2626] text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  80mm POS
                </button>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-md transition-colors cursor-pointer whitespace-nowrap"
              >
                <Printer className="w-4 h-4 stroke-[2.2]" />
                <span>Print Invoice (প্রিন্ট)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800 hover:bg-[#DC2626]/20 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="বন্ধ করুন (Close)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* ================= DIRECT PRINT PREVIEW WORKSPACE ================= */}
        <div id="memo-workspace-scroll" className="flex-1 overflow-y-auto">
          <div
            id="memo-workspace-grid"
            className="max-w-[1100px] mx-auto px-3 sm:px-6 py-5 flex flex-col items-center"
          >
            <div
              id="memo-preview-column"
              className="flex flex-col items-center w-full overflow-x-auto pb-6"
            >
              {/* Quiet Preview Info Strip */}
              <div className="no-print w-full max-w-[210mm] flex items-center justify-between text-xs text-slate-600 mb-2.5 px-1">
                <span className="font-semibold text-[#111827]">
                  প্রিন্ট প্রিভিউ — {printFormat === 'a4' ? 'A4 Sales Invoice (1 Page)' : '80mm POS Thermal Receipt'}
                </span>
                <span className="text-[11px] text-slate-500">
                  ফুল কালার প্রিন্ট · ওয়েবসাইট লিংক ছাড়াই পরিচ্ছন্ন রশিদ
                </span>
              </div>

              {printFormat === 'a4' ? (
                /* ================= TEMPLATE 1: A4 SALES INVOICE (210mm x 297mm) ================= */
                <div id="receipt-paper" className="receipt-a4 shrink-0">
                  <div className="receipt-a4-frame">
                    {/* TOP & MAIN BODY */}
                    <div>
                      {/* 1. Metallic Silver-to-Soft-Red Header Banner with Crimson Top Border */}
                      <div className="mt-invoice-header px-6 py-3.5 flex items-center justify-between gap-5">
                        {/* Top-Left: Official Mehedy Telecom Logo (Blended Seamlessly) */}
                        <div className="w-[240px] h-[74px] overflow-hidden flex items-center justify-start shrink-0">
                          {!logoError ? (
                            <img
                              src={OFFICIAL_LOGO_SRC}
                              alt="Mehedy Telecom Official Logo"
                              referrerPolicy="no-referrer"
                              onError={() => setLogoError(true)}
                              className="mt-official-logo w-full h-full object-contain"
                            />
                          ) : (
                            <MehedyTelecomLogo />
                          )}
                        </div>

                        {/* Top-Right: SALES INVOICE Badge + Shop Address & Phone */}
                        <div className="text-right space-y-1">
                          <div
                            className="inline-block px-3.5 py-1 rounded text-[11px] font-extrabold tracking-wider uppercase text-white shadow-xs"
                            style={{
                              background: 'linear-gradient(90deg, #111827 0%, #DC2626 100%)',
                            }}
                          >
                            SALES INVOICE / ক্যাশ মেমো
                          </div>
                          <div className="text-[11.5px] font-bold text-[#111827] pt-0.5">
                            {shopAddressBn} | {shopAddressEn}
                          </div>
                          <div className="memo-font-num text-[13px] font-extrabold text-[#DC2626] tracking-wide">
                            Hotline: {shopPhone}
                          </div>
                        </div>
                      </div>

                      {/* 2. Brand Strip (Dark Charcoal to Crimson Red Gradient) */}
                      <div className="mt-brand-strip text-[#F1F5F9] py-1.5 px-5 text-center text-[10px] font-extrabold tracking-[0.2em] uppercase">
                        SAMSUNG &nbsp;|&nbsp; XIAOMI &nbsp;|&nbsp; OPPO &nbsp;|&nbsp; TECNO &nbsp;|&nbsp; INFINIX &nbsp;|&nbsp; ITEL &nbsp;|&nbsp; HONOR &nbsp;|&nbsp; iPHONE
                      </div>

                      {/* Main Content Body */}
                      <div className="px-6 py-4 space-y-3.5 paper-white">
                        {/* 3. Customer, Invoice Meta & Dynamic Barcode Card */}
                        <div className="paper-card border border-[#E2E8F0] rounded-lg p-3 grid grid-cols-12 gap-4 text-[11.5px]">
                          {/* Left: Customer Info */}
                          <div className="col-span-7 space-y-1.5 pr-4 border-r border-[#E2E8F0]">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] pb-1 border-b border-[#E2E8F0]">
                              গ্রাহকের বিবরণ (Customer Information)
                            </div>
                            <div className="grid grid-cols-12 gap-1 items-baseline">
                              <span className="col-span-4 text-[#64748B] font-medium">
                                ক্রেতার নাম (Customer):
                              </span>
                              <span className="col-span-8 font-bold text-[#111827] text-[13px]">
                                {customerName || 'Walk-in Customer'}
                              </span>
                            </div>
                            <div className="grid grid-cols-12 gap-1 items-baseline">
                              <span className="col-span-4 text-[#64748B] font-medium">
                                মোবাইল নং (Contact):
                              </span>
                              <span className="col-span-8 memo-font-num font-bold text-[#111827]">
                                {customerPhone || 'N/A'}
                              </span>
                            </div>
                            <div className="grid grid-cols-12 gap-1 items-baseline">
                              <span className="col-span-4 text-[#64748B] font-medium">
                                ঠিকানা (Address):
                              </span>
                              <span className="col-span-8 font-medium text-[#334155] leading-snug">
                                {customerAddress || 'N/A'}
                              </span>
                            </div>
                            {emiAppName && (
                              <div className="grid grid-cols-12 gap-1 items-baseline">
                                <span className="col-span-4 text-[#64748B] font-medium">
                                  কিস্তির অ্যাপ (App):
                                </span>
                                <span className="col-span-8 font-bold text-[#111827]">
                                  {emiAppName}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Right: Invoice Meta & Scannable Barcode */}
                          <div className="col-span-5 flex flex-col justify-between gap-1.5">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[#64748B] font-medium">
                                  মেমো নং (Invoice N°):
                                </span>
                                <span className="memo-font-num font-extrabold text-[#111827] bg-white px-2 py-0.5 rounded border border-[#CBD5E1] text-[11px]">
                                  {memoNo}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[#64748B] font-medium">তারিখ (Date):</span>
                                <span className="memo-font-num font-bold text-[#111827]">
                                  {dateStr}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[#64748B] font-medium">
                                  ধরন (Payment Type):
                                </span>
                                <span className="font-bold text-[#111827]">{paymentType}</span>
                              </div>
                            </div>

                            <div className="pt-1.5 border-t border-[#E2E8F0] flex justify-end">
                              <InvoiceBarcode value={memoNo} height={28} />
                            </div>
                          </div>
                        </div>

                        {/* 4. A4 Itemized Table & IMEI Box */}
                        <div className="border border-[#CBD5E1] rounded-lg overflow-hidden">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr
                                className="mt-table-head text-white text-[11px]"
                                style={{ borderBottom: '2px solid #DC2626' }}
                              >
                                <th className="py-2.5 px-2.5 text-center w-10 font-bold">নং</th>
                                <th className="py-2.5 px-3 font-bold">
                                  স্মার্টফোন / পণ্যের বিবরণ ও IMEI
                                </th>
                                <th className="py-2.5 px-2.5 text-right w-24 font-bold">দর (৳)</th>
                                <th className="py-2.5 px-2 text-center w-14 font-bold">পরিমাণ</th>
                                <th className="py-2.5 px-2.5 text-right w-20 font-bold">ছাড় (৳)</th>
                                <th className="py-2.5 px-3 text-right w-28 font-bold">মোট (৳)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((item, index) => {
                                const rawLine = (Number(item.qty) || 0) * (Number(item.price) || 0);
                                const itemDisc = Number(item.discount) || 0;
                                const lineTotal = Math.max(0, rawLine - itemDisc);
                                const hasImei = Boolean(item.imei1 || item.imei2);

                                return (
                                  <tr
                                    key={item.id}
                                    className="border-b border-[#E2E8F0]"
                                    style={{
                                      backgroundColor: index % 2 === 1 ? '#F8FAFC' : '#FFFFFF',
                                    }}
                                  >
                                    <td className="py-3 px-2.5 text-center memo-font-num text-xs font-bold text-[#475569] align-top">
                                      {String(index + 1).padStart(2, '0')}
                                    </td>
                                    <td className="py-3 px-3 align-top">
                                      <div className="font-bold text-[12.5px] text-[#111827] leading-snug">
                                        {item.model || (
                                          <span className="text-slate-400 italic font-normal">
                                            পণ্যের মডেল লিখুন...
                                          </span>
                                        )}
                                      </div>
                                      {hasImei && (
                                        <div className="paper-imei mt-1.5 px-2.5 py-1 rounded-r text-[10.5px] memo-font-num text-[#1F2937] inline-flex flex-wrap gap-x-4 gap-y-0.5">
                                          {item.imei1 && (
                                            <span>
                                              <strong className="text-[#111827]">IMEI 1:</strong>{' '}
                                              {item.imei1}
                                            </span>
                                          )}
                                          {item.imei2 && (
                                            <span>
                                              <strong className="text-[#111827]">IMEI 2:</strong>{' '}
                                              {item.imei2}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-3 px-2.5 text-right memo-font-num text-xs font-semibold text-[#334155] align-top">
                                      {formatMoney(item.price)}
                                    </td>
                                    <td className="py-3 px-2 text-center memo-font-num text-xs font-bold text-[#111827] align-top">
                                      {item.qty || 1}
                                    </td>
                                    <td className="py-3 px-2.5 text-right memo-font-num text-xs font-semibold text-[#DC2626] align-top">
                                      {itemDisc > 0 ? formatMoney(itemDisc) : '—'}
                                    </td>
                                    <td className="py-3 px-3 text-right memo-font-num text-[12.5px] font-extrabold text-[#111827] align-top">
                                      {formatMoney(lineTotal)}
                                    </td>
                                  </tr>
                                );
                              })}

                              {/* Balanced filler row only for single-item invoices so multi-item never overflows 1 page */}
                              {items.length < 2 && (
                                <tr
                                  className="border-b border-[#F1F5F9]"
                                  style={{ height: '34px', backgroundColor: '#FFFFFF' }}
                                >
                                  <td colSpan={6} />
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* 5. Bottom Financial Summary & Transaction Details Box */}
                        <div className="grid grid-cols-12 gap-4 items-stretch">
                          {/* Left: Transaction Details Table + Amount in Words */}
                          <div className="col-span-7 flex flex-col justify-between gap-2.5">
                            <div className="border border-[#CBD5E1] rounded-lg overflow-hidden">
                              <div className="bg-[#F8FAFC] px-3 py-1.5 border-b border-[#CBD5E1] flex items-center justify-between">
                                <span className="text-[10.5px] font-extrabold text-[#111827] uppercase tracking-wider">
                                  Transaction Details (লেনদেনের বিবরণ)
                                </span>
                                <span className="text-[10px] font-semibold text-[#64748B]">
                                  {paymentType}
                                </span>
                              </div>
                              <table className="w-full text-[11.5px] border-collapse">
                                <thead>
                                  <tr className="bg-[#F1F5F9] text-[#475569] text-[10px] border-b border-[#E2E8F0]">
                                    <th className="py-1 px-3 text-left font-bold">
                                      পেমেন্ট মাধ্যম (Payment Method)
                                    </th>
                                    <th className="py-1 px-3 text-right font-bold">
                                      জমার পরিমাণ (Amount ৳)
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {transactions.map((tx) => (
                                    <tr key={tx.id} className="border-b border-[#F1F5F9] last:border-b-0">
                                      <td className="py-1.5 px-3 font-semibold text-[#111827]">
                                        {tx.method}
                                      </td>
                                      <td className="py-1.5 px-3 text-right memo-font-num font-bold text-[#111827]">
                                        ৳ {formatMoney(tx.amount)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Amount in Words (English & Bengali) */}
                            <div className="paper-card border border-[#E2E8F0] rounded-lg px-3 py-2 space-y-1">
                              <div className="text-[11.5px] leading-snug">
                                <span className="font-bold text-[#64748B]">In Words: </span>
                                <span className="font-extrabold text-[#111827]">
                                  {numberToEnglishWords(grossTotal)}
                                </span>
                              </div>
                              <div className="text-[11.5px] leading-snug pt-1 border-t border-[#E2E8F0]">
                                <span className="font-bold text-[#64748B]">কথায়: </span>
                                <span className="font-bold text-[#334155]">
                                  {numberToBengaliWords(grossTotal)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Financial Summary Table (Cash vs EMI Dynamic 3 Rows) */}
                          <div className="col-span-5 border border-[#CBD5E1] rounded-lg overflow-hidden text-[12px] flex flex-col justify-between paper-white">
                            {isEmiSale ? (
                              <>
                                <div className="mt-gross-row flex-1 px-4 py-3 flex justify-between items-center border-b border-[#FECACA]">
                                  <span className="font-extrabold text-[#991B1B] text-[12.5px]">
                                    Total Amount / মোট টাকা
                                  </span>
                                  <span className="memo-font-num font-extrabold text-[#DC2626] text-[14.5px]">
                                    ৳ {formatMoney(grossTotal)}
                                  </span>
                                </div>

                                <div className="flex-1 px-4 py-3 flex justify-between items-center border-b border-[#E2E8F0]">
                                  <span className="text-[#475569] font-semibold">
                                    Down Payment / ডাউন পেমেন্ট
                                  </span>
                                  <span className="memo-font-num font-extrabold text-[#111827] text-[13.5px]">
                                    ৳ {formatMoney(paidAmount)}
                                  </span>
                                </div>

                                <div
                                  className="flex-1 px-4 py-3 flex justify-between items-center font-extrabold"
                                  style={{
                                    backgroundColor: '#FEF2F2',
                                    color: '#DC2626',
                                  }}
                                >
                                  <div>
                                    <div>Monthly EMI / মাসিক কিস্তি</div>
                                    <div className="text-[10px] font-semibold text-[#64748B]">
                                      ({emiMonths} মাস)
                                    </div>
                                  </div>
                                  <span className="memo-font-num text-[14px]">
                                    ৳ {formatMoney(effectiveMonthlyEmi)}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex-1 px-4 py-3 flex justify-between items-center border-b border-[#E2E8F0]">
                                  <span className="text-[#475569] font-semibold">
                                    Total Amount / মোট টাকা
                                  </span>
                                  <span className="memo-font-num font-extrabold text-[#111827] text-[13.5px]">
                                    ৳ {formatMoney(subtotal)}
                                  </span>
                                </div>

                                <div className="flex-1 px-4 py-3 flex justify-between items-center border-b border-[#E2E8F0]">
                                  <span className="text-[#475569] font-semibold">
                                    Discount Amount / ছাড়
                                  </span>
                                  <span className="memo-font-num font-bold text-[#DC2626] text-[13px]">
                                    - ৳ {formatMoney(totalDiscount)}
                                  </span>
                                </div>

                                <div
                                  className="flex-1 px-4 py-3 flex justify-between items-center font-extrabold"
                                  style={{ color: '#065F46', backgroundColor: '#ECFDF5' }}
                                >
                                  <span className="text-[12.5px]">Paid Amount / পরিশোধিত</span>
                                  <span className="memo-font-num text-[14.5px]">
                                    ৳ {formatMoney(paidAmount)}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM: TERMS, DYNAMIC STAMP & SIGNATURES */}
                    <div className="px-6 pb-4 pt-2 space-y-4 paper-white">
                      {/* Terms & Conditions + Dynamic Rubber Stamp Row */}
                      <div className="grid grid-cols-12 gap-4 items-end">
                        {/* Left: Shop Warranty Terms */}
                        <div className="col-span-8">
                          {warrantyLines.length > 0 && (
                            <div className="paper-card border border-[#E2E8F0] rounded-lg p-3">
                              <div className="text-[10.5px] font-extrabold text-[#111827] pb-1 mb-1 border-b border-[#E2E8F0] flex items-center justify-between">
                                <span>ওয়ারেন্টি ও বিক্রয় শর্তাবলী (Terms &amp; Conditions)</span>
                                <span className="text-[9px] font-bold text-[#DC2626] uppercase">
                                  Mehedy Telecom Policy
                                </span>
                              </div>
                              <ul className="space-y-0.5 text-[10px] text-[#334155]">
                                {warrantyLines.map((line, i) => (
                                  <li key={i} className="leading-snug">
                                    {line}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Right: PAID Rubber Stamp raised cleanly above Authorized Signature */}
                        <div className="col-span-4 flex flex-col items-center justify-center self-center pb-5">
                          <div
                            className="mt-rubber-stamp px-5 py-1.5 rounded-md text-center select-none"
                            style={{
                              borderColor: '#059669',
                              color: '#047857',
                              backgroundColor: 'rgba(236, 253, 245, 0.85)',
                            }}
                          >
                            <div className="text-base font-black leading-none tracking-[0.22em]">
                              PAID
                            </div>
                            <div className="text-[8.5px] font-bold tracking-wider uppercase mt-1">
                              পরিশোধিত · {dateStr}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Signature Row */}
                      <div className="pt-6 border-t border-dashed border-[#CBD5E1] flex items-end justify-between text-[11.5px]">
                        <div className="text-center">
                          <div className="w-48 border-t border-[#475569] pt-1 font-bold text-[#334155]">
                            ক্রেতার স্বাক্ষর (Customer Signature)
                          </div>
                        </div>

                        <div className="text-center text-[10px] text-[#64748B] font-semibold pb-0.5">
                          ধন্যবাদ! আবার আসবেন — {shopNameBn}
                        </div>

                        <div className="text-center">
                          <div className="w-52 border-t border-[#111827] pt-1 font-extrabold text-[#111827]">
                            কর্তৃপক্ষের স্বাক্ষর (Authorized Signature)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ================= TEMPLATE 2: 80MM THERMAL POS RECEIPT ================= */
                <div id="receipt-paper" className="receipt-80mm shrink-0">
                  <div className="text-[#111827] flex flex-col justify-between h-full">
                    <div>
                      {/* Header with Official Logo */}
                      <div className="text-center border-b-2 border-[#DC2626] pb-2.5">
                        <div className="w-[180px] h-[52px] mx-auto overflow-hidden flex items-center justify-center mb-1">
                          {!logoError ? (
                            <img
                              src={OFFICIAL_LOGO_SRC}
                              alt="Mehedy Telecom"
                              referrerPolicy="no-referrer"
                              onError={() => setLogoError(true)}
                              className="mt-official-logo w-full h-full object-contain"
                            />
                          ) : (
                            <MehedyTelecomLogo />
                          )}
                        </div>
                        <div
                          className="inline-block text-white text-[9px] font-extrabold tracking-widest px-2.5 py-0.5 rounded uppercase mb-1"
                          style={{ background: 'linear-gradient(90deg, #111827, #DC2626)' }}
                        >
                          SALES INVOICE / POS RECEIPT
                        </div>
                        <p className="text-[10.5px] font-semibold text-[#111827]">
                          {shopAddressBn}
                        </p>
                        <p className="memo-font-num text-[11px] font-extrabold text-[#DC2626]">
                          Hotline: {shopPhone}
                        </p>
                        <p className="text-[7.5px] font-bold tracking-wider text-[#475569] mt-1 uppercase">
                          SAMSUNG | XIAOMI | OPPO | TECNO | INFINIX | ITEL | HONOR | iPHONE
                        </p>
                      </div>

                      {/* Meta Info */}
                      <div className="py-2 border-b border-dashed border-[#94A3B8] text-[10.5px] space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Invoice N°:</span>
                          <span className="memo-font-num font-bold">{memoNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Date:</span>
                          <span className="memo-font-num font-semibold">{dateStr}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Payment Type:</span>
                          <span className="font-bold">{paymentType}</span>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="py-2 border-b border-dashed border-[#94A3B8] text-[10.5px] space-y-0.5">
                        <div>
                          <span className="text-[#64748B]">ক্রেতা:</span>{' '}
                          <strong>{customerName || 'Walk-in Customer'}</strong>
                        </div>
                        {customerPhone && (
                          <div>
                            <span className="text-[#64748B]">মোবাইল:</span>{' '}
                            <span className="memo-font-num font-semibold">{customerPhone}</span>
                          </div>
                        )}
                        {customerAddress && (
                          <div>
                            <span className="text-[#64748B]">ঠিকানা:</span> {customerAddress}
                          </div>
                        )}
                      </div>

                      {/* Items Header */}
                      <div className="flex justify-between text-[10px] font-bold bg-[#111827] text-white px-2 py-1 mt-2 rounded-xs">
                        <span>বিবরণ ও IMEI</span>
                        <span>মোট (৳)</span>
                      </div>

                      {/* Items List */}
                      <div>
                        {items.map((item, idx) => {
                          const rawLine = (Number(item.qty) || 0) * (Number(item.price) || 0);
                          const itemDisc = Number(item.discount) || 0;
                          const lineTotal = Math.max(0, rawLine - itemDisc);
                          return (
                            <div
                              key={item.id}
                              className="py-1.5 border-b border-dashed border-[#CBD5E1] text-[11px]"
                            >
                              <div className="font-bold text-[#111827] leading-snug">
                                {idx + 1}. {item.model || 'Unnamed Item'}
                              </div>
                              {item.imei1 && (
                                <div className="memo-font-num text-[9.5px] text-[#334155]">
                                  IMEI 1: {item.imei1}
                                </div>
                              )}
                              {item.imei2 && (
                                <div className="memo-font-num text-[9.5px] text-[#334155]">
                                  IMEI 2: {item.imei2}
                                </div>
                              )}
                              <div className="flex justify-between items-center mt-0.5 memo-font-num text-[10px]">
                                <span className="text-[#475569]">
                                  {item.qty || 1} × ৳{formatMoney(item.price)}
                                  {itemDisc > 0 ? ` (-৳${formatMoney(itemDisc)})` : ''}
                                </span>
                                <span className="font-bold text-[#111827]">
                                  ৳{formatMoney(lineTotal)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Totals (Cash vs EMI Dynamic 3 Rows) */}
                      <div className="pt-2 space-y-1 text-[11px]">
                        {isEmiSale ? (
                          <>
                            <div className="mt-gross-row flex justify-between text-xs font-extrabold text-[#991B1B] px-2 py-1 rounded border border-[#FECACA]">
                              <span>Total Amount / মোট টাকা:</span>
                              <span className="memo-font-num text-[#DC2626]">
                                ৳{formatMoney(grossTotal)}
                              </span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span>Down Payment / ডাউন পেমেন্ট:</span>
                              <span className="memo-font-num">৳{formatMoney(paidAmount)}</span>
                            </div>
                            <div className="flex justify-between font-extrabold text-[#DC2626]">
                              <span>Monthly EMI ({emiMonths}m):</span>
                              <span className="memo-font-num">
                                ৳{formatMoney(effectiveMonthlyEmi)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between font-bold">
                              <span>Total Amount / মোট টাকা:</span>
                              <span className="memo-font-num">৳{formatMoney(subtotal)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-[#DC2626]">
                              <span>Discount Amount / ছাড়:</span>
                              <span className="memo-font-num">
                                - ৳{formatMoney(totalDiscount)}
                              </span>
                            </div>
                            <div
                              className="flex justify-between text-xs font-extrabold px-2 py-1 rounded border border-emerald-200"
                              style={{ color: '#065F46', backgroundColor: '#ECFDF5' }}
                            >
                              <span>Paid Amount / পরিশোধিত:</span>
                              <span className="memo-font-num">৳{formatMoney(paidAmount)}</span>
                            </div>
                          </>
                        )}
                        <div className="text-[9px] text-[#334155] pt-1 border-t border-dotted border-[#CBD5E1] space-y-0.5">
                          <div>
                            <strong>In Words:</strong> {numberToEnglishWords(grossTotal)}
                          </div>
                          <div>
                            <strong>কথায়:</strong> {numberToBengaliWords(grossTotal)}
                          </div>
                        </div>
                      </div>

                      {/* Barcode */}
                      <div className="pt-2 flex justify-center">
                        <InvoiceBarcode value={memoNo} height={28} />
                      </div>
                    </div>

                    {/* Compact Warranty, Status & Signatures */}
                    <div className="mt-2.5 pt-2 border-t border-dashed border-[#94A3B8] space-y-2.5">
                      {warrantyLines.length > 0 && (
                        <div className="paper-card text-[8.5px] text-[#334155] p-1.5 rounded border border-[#E2E8F0] space-y-0.5 text-left">
                          <div className="font-bold text-[#111827]">ওয়ারেন্টি শর্তাবলী:</div>
                          {warrantyLines.map((line, i) => (
                            <p key={i} className="leading-tight">
                              {line}
                            </p>
                          ))}
                        </div>
                      )}
                      <div className="text-center">
                        <span
                          className="inline-block text-[10px] font-black tracking-widest px-3 py-0.5 rounded border-2"
                          style={{
                            borderColor: outstanding === 0 ? '#059669' : '#DC2626',
                            color: outstanding === 0 ? '#047857' : '#DC2626',
                          }}
                        >
                          {outstanding === 0 ? 'PAID / পরিশোধিত' : 'DUE / কিস্তি'}
                        </span>
                      </div>
                      <div className="flex justify-between items-end pt-3 text-[9px] font-semibold">
                        <span className="border-t border-[#64748B] px-1.5 pt-0.5">
                          Customer Sign
                        </span>
                        <span className="border-t border-[#111827] px-1.5 pt-0.5 font-bold">
                          Authorized Sign
                        </span>
                      </div>
                      <div className="text-center text-[10px] font-bold text-[#111827]">
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

  return createPortal(modalContent, document.body);
};
