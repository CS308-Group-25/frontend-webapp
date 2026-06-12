export interface Category {
  id: number;
  name: string;
  description?: string;
  productCount?: number;
  category_id?: number;
  createdAt?: string; // ISO date string
}

export type CategoryFormData = Omit<Category, 'id' | 'productCount' | 'createdAt'> & {
  categoryId?: number | string;
};

export type CategorySortOption = 'name_asc' | 'name_desc' | 'most_products' | 'least_products';
