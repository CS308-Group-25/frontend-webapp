export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface ProductFlavor {
  id: string;
  name: string;
  color: string; // Tailwind gradient or hex for the circular swatch
}

export interface ProductSize {
  id: string;
  label: string;      // e.g. "400g"
  servings: number;   // e.g. 16
  price: number;
  originalPrice?: number;
}

export interface NutritionRow {
  label: string;
  per100g?: string;
  perServing: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // If set, shows strikethrough + discount badge
  image: string;
  images?: string[];      // Gallery images for detail page
  rating: number; // 0–5
  reviewCount: number;
  stockStatus: StockStatus;
  stockCount?: number; // Shown when status is low_stock or as explicit count

  isNew?: boolean;
  category?: string;
  tags?: string[];         // e.g. ["Vejetaryen", "Glutensiz"]

  // Variant selectors (detail page)
  flavors?: ProductFlavor[];
  sizes?: ProductSize[];

  // Detail content (accordion sections)
  ingredients?: string;
  nutritionFacts?: NutritionRow[];
  usage?: string;
  features?: string[];     // Bullet-point feature list
}
