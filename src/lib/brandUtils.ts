import { Product } from '../types';

export interface BrandStockSummary {
  brand: string;
  totalQuantity: number;
  availableModelsCount: number;
  totalModelsCount: number;
  newQuantity: number;
  usedQuantity: number;
  totalStockValue: number;
  products: Product[];
}

const BRAND_RULES: { brand: string; keywords: string[] }[] = [
  { brand: 'Apple', keywords: ['apple', 'iphone', 'ipad', 'ios'] },
  { brand: 'Samsung', keywords: ['samsung', 'galaxy'] },
  { brand: 'Xiaomi / Redmi', keywords: ['xiaomi', 'redmi', 'poco', 'mi '] },
  { brand: 'Vivo', keywords: ['vivo', 'iqoo'] },
  { brand: 'Oppo', keywords: ['oppo'] },
  { brand: 'Realme', keywords: ['realme', 'narzo'] },
  { brand: 'Infinix', keywords: ['infinix', 'hot ', 'smart '] },
  { brand: 'Tecno', keywords: ['tecno', 'spark', 'camon', 'pova', 'pop '] },
  { brand: 'OnePlus', keywords: ['oneplus', '1+'] },
  { brand: 'Motorola', keywords: ['motorola', 'moto'] },
  { brand: 'Google Pixel', keywords: ['google', 'pixel'] },
  { brand: 'Honor / Huawei', keywords: ['honor', 'huawei'] },
  { brand: 'Walton', keywords: ['walton', 'primo'] },
  { brand: 'Symphony', keywords: ['symphony', 'helio'] },
  { brand: 'Nokia', keywords: ['nokia'] },
  { brand: 'Itel', keywords: ['itel'] },
  { brand: 'Lava', keywords: ['lava'] },
  { brand: 'Sony', keywords: ['sony', 'xperia'] },
  { brand: 'Asus', keywords: ['asus', 'rog'] }
];

export function getBrandFromProductName(name: string): string {
  if (!name) return 'Other';
  const cleanName = name.trim();
  const lower = cleanName.toLowerCase();

  for (const rule of BRAND_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return rule.brand;
    }
  }

  // Fallback: Use the first alphanumeric token capitalized
  const match = cleanName.match(/^[a-zA-Z0-9]+/);
  if (match && match[0].length >= 2) {
    const word = match[0];
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  return 'Other';
}

export function groupProductsByBrand(products: Product[]): BrandStockSummary[] {
  const brandMap = new Map<string, {
    brand: string;
    totalQuantity: number;
    availableModelsCount: number;
    totalModelsCount: number;
    newQuantity: number;
    usedQuantity: number;
    totalStockValue: number;
    products: Product[];
  }>();

  if (!products || !Array.isArray(products)) {
    return [];
  }

  products.forEach(product => {
    const brand = getBrandFromProductName(product.name);
    let entry = brandMap.get(brand);
    if (!entry) {
      entry = {
        brand,
        totalQuantity: 0,
        availableModelsCount: 0,
        totalModelsCount: 0,
        newQuantity: 0,
        usedQuantity: 0,
        totalStockValue: 0,
        products: []
      };
      brandMap.set(brand, entry);
    }

    const qty = Math.max(0, product.quantity || 0);
    entry.totalModelsCount += 1;
    if (qty > 0) {
      entry.availableModelsCount += 1;
    }

    if (product.condition === 'used') {
      entry.usedQuantity += qty;
    } else {
      entry.newQuantity += qty;
      entry.totalQuantity += qty; // Total quantity strictly represents Brand New stock
    }

    entry.totalStockValue += Math.round((Number(product.purchase_price) || 0) * qty);
    entry.products.push(product);
  });

  // Sort each brand's products by available quantity desc, then by name
  brandMap.forEach(entry => {
    entry.products.sort((a, b) => {
      if ((b.quantity || 0) !== (a.quantity || 0)) {
        return (b.quantity || 0) - (a.quantity || 0);
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
  });

  // Convert to array and sort brands:
  // 1. Brands with stock first (sorted by totalQuantity descending)
  // 2. Brands with 0 stock at the end
  return Array.from(brandMap.values()).sort((a, b) => {
    if (b.totalQuantity !== a.totalQuantity) {
      return b.totalQuantity - a.totalQuantity;
    }
    if (b.availableModelsCount !== a.availableModelsCount) {
      return b.availableModelsCount - a.availableModelsCount;
    }
    return a.brand.localeCompare(b.brand);
  });
}

export function getBrandBadgeStyle(brand: string): { bg: string; text: string; border: string; accent: string } {
  const b = brand.toLowerCase();
  if (b.includes('samsung')) {
    return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', accent: 'bg-blue-600' };
  }
  if (b.includes('apple') || b.includes('iphone')) {
    return { bg: 'bg-slate-100', text: 'text-slate-900', border: 'border-slate-300', accent: 'bg-slate-900' };
  }
  if (b.includes('xiaomi') || b.includes('redmi')) {
    return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', accent: 'bg-orange-500' };
  }
  if (b.includes('vivo')) {
    return { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', accent: 'bg-sky-600' };
  }
  if (b.includes('oppo')) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', accent: 'bg-emerald-600' };
  }
  if (b.includes('realme')) {
    return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', accent: 'bg-amber-500' };
  }
  if (b.includes('infinix')) {
    return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', accent: 'bg-teal-600' };
  }
  if (b.includes('tecno')) {
    return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', accent: 'bg-indigo-600' };
  }
  if (b.includes('oneplus')) {
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', accent: 'bg-red-600' };
  }
  if (b.includes('walton')) {
    return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', accent: 'bg-rose-600' };
  }
  return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', accent: 'bg-gray-700' };
}
