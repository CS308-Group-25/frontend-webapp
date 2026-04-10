import type { Category } from '../types/category.types';

/**
 * Derives productCount from the mock product data so the numbers stay consistent.
 * The category names match the values already used in mock-products.ts.
 */
export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Protein',
    description: 'Whey, kazein ve bitkisel protein tozları.',
    productCount: 2,
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Spor Gıdaları',
    description: 'Kreatin, pre-workout ve spor performans destekleyicileri.',
    productCount: 2,
    createdAt: '2024-01-12T08:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Amino Asit',
    description: 'BCAA, EAA ve esansiyel amino asit karışımları.',
    productCount: 1,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'Bar & Atıştırmalık',
    description: 'Protein barlar ve sağlıklı atıştırmalıklar.',
    productCount: 1,
    createdAt: '2024-01-18T08:00:00Z',
  },
  {
    id: 'cat-5',
    name: 'Vitamin',
    description: 'Günlük vitamin, mineral ve mikro besin takviyeleri.',
    productCount: 1,
    createdAt: '2024-01-20T08:00:00Z',
  },
  {
    id: 'cat-6',
    name: 'Sağlık',
    description: 'Genel sağlığı destekleyen omega-3 ve bitkisel takviyeler.',
    productCount: 1,
    createdAt: '2024-01-22T08:00:00Z',
  },
];
