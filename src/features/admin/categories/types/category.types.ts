export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  createdAt: string; // ISO date string
}

export type CategoryFormData = Omit<Category, 'id' | 'productCount' | 'createdAt'>;

export type CategorySortOption = 'name_asc' | 'name_desc' | 'most_products' | 'least_products';
