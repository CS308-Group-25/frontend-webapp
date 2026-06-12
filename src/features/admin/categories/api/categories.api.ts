import apiClient from '@/lib/api-client';
import { Category, CategoryFormData } from '../types/category.types';

export const fetchAdminCategories = async (): Promise<Category[]> => {
  return apiClient.get<Category[]>('/v1/admin/categories/sub-categories') as unknown as Category[];
};

export const createCategory = async (data: CategoryFormData): Promise<Category> => {
  const payload = {
    name: data.name,
    description: data.description || '',
    category_id: data.categoryId,
  };
  const response = await apiClient.post<Category>('/v1/admin/categories/sub-categories', payload);
  return response as unknown as Category;
};

export const updateCategory = async ({
  id,
  data,
}: {
  id: number;
  data: CategoryFormData;
}): Promise<Category> => {
  const payload = {
    name: data.name,
    description: data.description || '',
    category_id: data.categoryId,
  };
  const response = await apiClient.patch<Category>(`/v1/admin/categories/sub-categories/${id}`, payload);
  return response as unknown as Category;
};

export const deleteCategory = async ({ id }: { id: number }): Promise<void> => {
  await apiClient.delete(`/v1/admin/categories/sub-categories/${id}`);
};
