import type { Category } from '../types/category.types';

/**
 * Derives productCount from the mock product data so the numbers stay consistent.
 * The category names match the values already used in mock-products.ts.
 */
export const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Protein Tozu',
    description: 'Whey, kazein, izole ve diğer protein tozu çeşitleri.',
    productCount: 24,
    createdAt: '2023-10-12T08:30:00Z',
  },
  {
    id: 2,
    name: 'Amino Asit',
    description: 'BCAA, EAA, glutamin ve arjinin gibi serbest form amino asitler.',
    productCount: 18,
    createdAt: '2023-10-15T09:45:00Z',
  },
  {
    id: 3,
    name: 'Kilo Aldırıcılar',
    description: 'Yüksek kalorili mass gainer ve karbonhidrat tozları.',
    productCount: 8,
    createdAt: '2023-11-02T14:20:00Z',
  },
  {
    id: 4,
    name: 'Performans',
    description: 'Pre-workout, kreatin ve enerji artırıcı supplementler.',
    productCount: 15,
    createdAt: '2023-11-20T11:10:00Z',
  },
  {
    id: 5,
    name: 'Vitamin & Mineral',
    description: 'Günlük ihtiyacınız olan multivitamin ve mineraller.',
    productCount: 32,
    createdAt: '2023-12-05T16:00:00Z',
  },
  {
    id: 6,
    name: 'Sağlıklı Atıştırmalık',
    description: 'Protein barlar, fıstık ezmeleri ve diyet ürünler.',
    productCount: 11,
    createdAt: '2024-01-10T10:30:00Z',
  },
];
