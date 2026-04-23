import type { Metadata } from 'next';
import WishlistPage from '@/features/wishlist/components/WishlistPage';

export const metadata: Metadata = {
  title: 'Favorilerim | SUpplements',
  description: 'Kaydettiğiniz ürünler, güncel fiyatlar ve aktif indirimler.',
};

export default function WishlistRoute() {
  return <WishlistPage />;
}
