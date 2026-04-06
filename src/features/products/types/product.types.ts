export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // If set, shows strikethrough + discount badge
  image: string;
  rating: number; // 0–5
  reviewCount: number;
  stockStatus: StockStatus;
  stockCount?: number; // Shown when status is low_stock
  isNew?: boolean;
}
