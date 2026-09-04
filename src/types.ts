export interface ImeiUnit {
  imei1: string;
  imei2?: string;
  color?: string;
}

export interface Product {
  id: string;
  name: string;
  purchase_price: number;
  selling_price: number;
  profit_margin: number;
  quantity: number;
  ram?: string;
  rom?: string;
  color?: string;
  condition?: 'new' | 'used';
  condition_note?: string;
  imeis?: string[];
  imei_units?: ImeiUnit[];
  imei_colors?: Record<string, string>;
  image_file_id?: string;
  created_at: string;
}

export interface Sale {
  id: string;
  customer_name: string;
  phone_number: string;
  nid_number: string;
  address: string;
  guarantor_number: string;
  product_id: string;
  product_name: string;
  color?: string;
  imei?: string;
  imei2?: string;
  imeis?: string[];
  ram?: string;
  rom?: string;
  image_file_ids: string[];
  sale_date: string;
  profit: number;
  purchase_price?: number;
  actual_sale_price?: number;
  is_cash_sale?: boolean;
}

export interface MobileBazarRecord {
  id: string;
  sale_id: string;
  customer_name: string;
  product_name: string;
  imei?: string;
  imei2?: string;
  ram?: string;
  rom?: string;
  down_payment: number;
  sale_profit: number;
  net_amount: number;
  created_at: string;
}
