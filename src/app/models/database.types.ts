export interface Customer {
  id: string;
  name: string;
  phone?: string;
  whatsapp_number?: string;
  email?: string;
  country?: string;
  city?: string;
  address?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  order_date: string;
  order_type: string;
  order_status: string;
  tracking_id?: string;
  tcs_id?: string;
  total_amount: number;
  payment_status: string;
  amount_paid: number;
  amount_remaining: number;
  estimated_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  customer?: Customer;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_type: string;
  dress_type?: string;
  quantity: number;
  price: number;
  fabric_details?: string;
  dye_color?: string[];
  sale_id?: string;
  sku_code?: string;
  notes?: string;
  created_at?: string;
}

export interface Expense {
  id: string;
  expense_date: string;
  expense_type: string;
  description: string;
  cost: number;
  related_order_id?: string;
  created_at?: string;
}

export interface DeliveryCost {
  id: string;
  order_id: string;
  delivery_type?: string;
  delivery_cost?: number;
  added_to_order: boolean;
  customer_charge: number;
  created_at?: string;
}

export interface OrderWithDetails extends Order {
  customer?: Customer;
  order_items?: OrderItem[];
  delivery_cost?: DeliveryCost;
}

export interface SkuItem {
  sku_code: string;
  quantity: number;
}

export interface Sale {
  id: string;
  sale_number: string;
  sales_name?: string;
  sale_date: string;
  customer_id?: string;
  sku_items: SkuItem[];
  total_items: number;
  purchase_price_per_item?: number;
  total_stock_value?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SaleWithDetails extends Sale {
  customer?: Customer;
}

export interface BankBalance {
  id: string;
  balance: number;
  last_updated?: string;
  notes?: string;
}

export interface BankTransaction {
  id: string;
  transaction_date: string;
  amount: number;
  transaction_type: 'deposit' | 'withdrawal' | 'order_payment' | 'expense';
  description: string;
  reference_id?: string;
  created_at?: string;
}

export interface PaymentRecord {
  id: string;
  order_id: string;
  payment_date: string;
  amount: number;
  payment_method?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
