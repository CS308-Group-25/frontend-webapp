import InvoiceDetailPage from '@/features/orders/components/InvoiceDetailPage';

interface InvoiceRouteProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Fatura Detayı',
};

export default async function InvoiceRoute({ params }: InvoiceRouteProps) {
  const { id } = await params;
  return <InvoiceDetailPage orderId={id} />;
}
