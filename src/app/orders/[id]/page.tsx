import { OrderDetailPage } from '@/features/orders';

interface OrderDetailRouteProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}

export const metadata = {
  title: 'Sipariş Detayı',
};

export default async function OrderDetailRoute({ params, searchParams }: OrderDetailRouteProps) {
  const { id } = await params;
  const { new: isNew } = await searchParams;

  return <OrderDetailPage orderId={id} isNewOrder={isNew === '1'} />;
}
