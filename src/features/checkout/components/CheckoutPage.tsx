'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useCartStore } from '@/features/cart';
import StepIndicator from './StepIndicator';
import AddressStep from './AddressStep';
import ShippingStep from './ShippingStep';
import PaymentStep from './PaymentStep';
import OrderSummaryPanel from './OrderSummaryPanel';
import { CheckoutStep, AddressFormData, PaymentMethod } from '../types';
import { createOrder, CreateOrderPayload } from '../api';
import { saveAddress } from '../addressApi';
import { CreditCardFormValues } from '../schemas';

function detectCardBrand(cardNumber: string): string {
  if (cardNumber.startsWith('4')) return 'Visa';
  if (cardNumber.startsWith('5')) return 'Mastercard';
  if (cardNumber.startsWith('3')) return 'Amex';
  return 'Unknown';
}

function getPaymentMethodLabel(
  method: PaymentMethod,
  cardNumber: string
): string {
  if (method === 'cod_cash') return 'Kapıda Ödeme (Nakit)';
  if (method === 'cod_card') return 'Kapıda Ödeme (Kredi Kartı)';
  return cardNumber ? detectCardBrand(cardNumber) : 'Kredi Kartı';
}

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { items, clearCart } = useCartStore();
  const [step, setStep] = useState<CheckoutStep>(1);
  const [addressData, setAddressData] = useState<AddressFormData | null>(null);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('credit_card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddressComplete = (data: AddressFormData) => {
    setAddressData(data);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShippingComplete = () => {
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSubmit = async ({
    method,
    cardDetails,
  }: {
    method: PaymentMethod;
    cardDetails?: CreditCardFormValues;
  }) => {
    if (!addressData) return;

    setIsSubmitting(true);
    try {
      // --- Pre-flight: sync only items that are NOT yet in the server cart ---
      // Logged-in users: items are already sent one-by-one via addItem() → POST /api/v1/cart/items
      // Re-sending them via bulk would DOUBLE quantities on the server (backend does qty += existing).
      // We only send items that truly weren't synced (no cartItemId = never reached the server).
      const unsynced = items.filter(
        (i) =>
          !i.cartItemId &&
          !isNaN(parseInt(i.productId)) &&
          parseInt(i.productId) > 0
      );
      if (unsynced.length > 0) {
        const { bulkAddCartItems } =
          await import('@/features/cart/api/cart.api');
        await bulkAddCartItems(
          unsynced.map((i) => ({
            product_id: parseInt(i.productId),
            quantity: i.quantity,
          }))
        );
      }

      const deliveryAddress = [
        `${addressData.firstName} ${addressData.lastName}`,
        addressData.address,
        addressData.apartment || null,
        `${addressData.district}/${addressData.city}`,
        addressData.phone,
      ]
        .filter(Boolean)
        .join(', ');

      const rawCardNumber =
        method === 'credit_card' && cardDetails
          ? cardDetails.cardNumber.replace(/\s/g, '')
          : '';

      const payload: CreateOrderPayload = {
        delivery_address: deliveryAddress,
        card_number: rawCardNumber,
        card_last4: rawCardNumber.slice(-4),
        card_brand: getPaymentMethodLabel(method, rawCardNumber),
      };

      const order = await createOrder(payload);

      if (addressData.saveAddress) {
        await saveAddress({
          title: addressData.title,
          first_name: addressData.firstName,
          last_name: addressData.lastName,
          address: addressData.address,
          apartment: addressData.apartment,
          city: addressData.city,
          district: addressData.district,
          phone: addressData.phone,
        }).catch(() => {
          toast.warning('Adres kaydedilemedi, ancak siparişiniz oluşturuldu.');
        });
      }

      clearCart();
      // Invalidate product cache so stock counts reflect the purchase
      // 'products' covers the listing page, 'product' covers individual detail pages
      // 'orders' ensures the orders page shows the new order immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['product'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
      ]);
      toast.success('Siparişiniz başarıyla oluşturuldu!');
      router.push(`/orders/${order.id}?new=1`);
    } catch (err) {
      toast.error('Sipariş oluşturulamadı.', {
        description:
          typeof err === 'string' ? err : 'Lütfen bilgilerinizi kontrol edin.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && step === 1) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-xl font-bold text-slate-700">Sepetiniz boş</p>
          <p className="text-sm text-slate-500">
            Ödeme yapmak için önce sepetinize ürün ekleyin.
          </p>
          <button
            onClick={() => router.push('/search')}
            className="rounded-xl bg-indigo-700 px-6 py-3 font-bold text-white transition-colors hover:bg-indigo-800"
          >
            Alışverişe Başla
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_400px]">
            {/* Left: Steps */}
            <div>
              <StepIndicator currentStep={step} />

              {step === 1 && (
                <div>
                  <h2 className="mb-4 text-xl font-black text-slate-900">
                    <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-700 text-sm font-bold text-white">
                      1
                    </span>
                    Adres
                  </h2>
                  <AddressStep
                    defaultValues={addressData ?? undefined}
                    onComplete={handleAddressComplete}
                  />
                </div>
              )}

              {step === 2 && addressData && (
                <div>
                  <h2 className="mb-4 text-xl font-black text-slate-900">
                    <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-700 text-sm font-bold text-white">
                      2
                    </span>
                    Kargo
                  </h2>
                  <ShippingStep
                    addressData={addressData}
                    onBack={() => setStep(1)}
                    onComplete={handleShippingComplete}
                  />
                </div>
              )}

              {step === 3 && addressData && (
                <div>
                  <h2 className="mb-4 text-xl font-black text-slate-900">
                    <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-700 text-sm font-bold text-white">
                      3
                    </span>
                    Ödeme
                  </h2>
                  <PaymentStep
                    addressData={addressData}
                    paymentMethod={paymentMethod}
                    onPaymentMethodChange={setPaymentMethod}
                    onBack={() => setStep(2)}
                    onSubmit={handleOrderSubmit}
                    isSubmitting={isSubmitting}
                  />
                </div>
              )}
            </div>

            {/* Right: Order Summary */}
            <OrderSummaryPanel paymentMethod={paymentMethod} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
