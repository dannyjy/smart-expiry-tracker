
export interface Product {
  id: number;
  name: string;
  category: string;
  min_stock_level: number;
}

export interface Batch {
  batch_id: number;
  product_name: string;
  category: string;
  batch_num: string;
  expiry_date: string;
  quantity: number;
  cost_per_unit: number;
}

export interface Alert {
  id: number;
  product_name: string;
  expiry_date: string;
  trigger_date: string;
  status: 'pending' | 'resolved';
}

export interface InventoryStats {
  totalItems: number;
  nearExpiryCount: number;
  expiredCount: number;
  deadCapital: number;
}
