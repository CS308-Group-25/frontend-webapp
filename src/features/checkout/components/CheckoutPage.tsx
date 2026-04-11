'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { CreditCardFormValues } from '../schemas';

function detectCardBrand(cardNumber: string): string {
  if (cardNumber.startsWith('4')) return 'Visa';
  if (cardNumber.startsWith('5')) return 'Mastercard';
  if (cardNumber.startsWith('3')) return 'Amex';
  return 'Unknown';
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [step, setStep] = useState<CheckoutStep>(1);
  const [addressData, setAddressData] = useState<AddressFormData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
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
        card_brand: rawCardNumber ? detectCardBrand(rawCardNumber) : '',
      };

      const order = await createOrder(payload);
      clearCart();
      toast.success('Siparişiniz başarıyla oluşturuldu!');
      router.push(`/orders/${order.id}?new=1`);
    } catch (err) {
      toast.error('Sipariş oluşturulamadı.', {
        description: typeof err === 'string' ? err : 'Lütfen bilgilerinizi kontrol edin.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && step === 1) {
    return (
      <ProtectedRoute>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4 px-4">
          <p className="text-xl font-bold text-slate-700">Sepetiniz boş</p>
          <p className="text-slate-500 text-sm">Ödeme yapmak için önce sepetinize ürün ekleyin.</p>
          <button
            onClick={() => router.push('/search')}
            className="px-6 py-3 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 transition-colors"
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
            {/* Left: Steps */}
            <div>
              <StepIndicator currentStep={step} />

              {step === 1 && (
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-700 text-white rounded-full text-sm font-bold mr-2">
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
                  <h2 className="text-xl font-black text-slate-900 mb-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-700 text-white rounded-full text-sm font-bold mr-2">
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
                  <h2 className="text-xl font-black text-slate-900 mb-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-700 text-white rounded-full text-sm font-bold mr-2">
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
