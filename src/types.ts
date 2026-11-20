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
  is_bar_phone?: boolean;
  is_accessory?: boolean;
  accessory_category?: string;
  brand?: string;
  created_at: string;
}

export interface Sale {
  id: string;
  memo_number?: string;
  customer_name: string;
  phone_number: string;
  application_id?: string;
  nid_number?: string;
  address: string;
  guarantor_number: string;
  emi_app?: string;
  app_username?: string;
  app_password?: string;
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
  product_price?: number;
  discount?: number;
  total_amount?: number;
  actual_sale_price?: number;
  paid_amount?: number;
  due_amount?: number;
  is_cash_sale?: boolean;
  is_accessory?: boolean;
  is_bar_phone?: boolean;
  accessory_category?: string;
  quantity_sold?: number;
  unit_price?: number;
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

export interface UserAccessRequest {
  id: string;
  uid: string;
  email: string;
  display_name: string;
  photo_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  role: 'viewer' | 'editor';
  requested_at: string;
  updated_at: string;
}

