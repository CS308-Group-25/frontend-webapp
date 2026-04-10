'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Banknote, Loader2 } from 'lucide-react';
import { creditCardSchema, CreditCardFormValues } from '../schemas';
import { PaymentMethod, AddressFormData } from '../types';

const COD_FEE = 59;

interface PaymentStepProps {
  addressData: AddressFormData;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onBack: () => void;
  onSubmit: (data: {
    method: PaymentMethod;
    cardDetails?: CreditCardFormValues;
    billingAddressSameAsShipping: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
}

const inputClass = (hasError: boolean) =>
  `w-full text-slate-900 placeholder:text-slate-400 px-4 py-2.5 bg-slate-50 border rounded-xl outline-none transition-all focus:bg-white focus:ring-4 ${
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100 hover:border-slate-300'
  }`;

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

export default function PaymentStep({
  addressData,
  paymentMethod,
  onPaymentMethodChange,
  onBack,
  onSubmit,
  isSubmitting,
}: PaymentStepProps) {
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [termsError, setTermsError] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreditCardFormValues>({
    resolver: zodResolver(creditCardSchema),
    mode: 'onSubmit',
  });

  const handleFormSubmit = async (cardData?: CreditCardFormValues) => {
    if (!agreedToTerms) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    await onSubmit({
      method: paymentMethod,
      cardDetails: cardData,
      billingAddressSameAsShipping,
    });
  };

  const handleNonCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFormSubmit(undefined);
  };

  const paymentOptions: Array<{ value: PaymentMethod; label: string; icon: React.ReactNode; fee?: number }> = [
    {
      value: 'credit_card',
      label: 'Kredi Kartı',
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      value: 'cod_cash',
      label: 'Kapıda Ödeme (Nakit)',
      icon: <Banknote className="w-4 h-4" />,
      fee: COD_FEE,
    },
    {
      value: 'cod_card',
      label: 'Kapıda Ödeme (Kredi Kartı)',
      icon: <CreditCard className="w-4 h-4" />,
      fee: COD_FEE,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Payment Method Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
          Ödeme Yöntemi
        </h3>
        <div className="flex flex-col gap-2">
          {paymentOptions.map((option) => {
            const isSelected = paymentMethod === option.value;
            return (
              <label
                key={option.value}
                className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => onPaymentMethodChange(option.value)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-indigo-600' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                </div>
                <span className={`flex items-center gap-2 flex-1 text-sm font-semibold ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                  {option.icon}
                  {option.label}
                </span>
                {option.fee && (
                  <span className="text-xs font-bold text-slate-500 shrink-0">
                    {option.fee} TL İşlem Bedeli
                  </span>
                )}
              </label>
            );
          })}
        </div>

        {/* Credit Card Form */}
        {paymentMethod === 'credit_card' && (
          <form
            id="credit-card-form"
            onSubmit={handleSubmit(handleFormSubmit)}
            noValidate
            className="mt-4 space-y-3 pt-4 border-t border-slate-100"
          >
            {/* Card Number */}
            <div>
              <input
                {...register('cardNumber')}
                placeholder="Kart Numarası"
                maxLength={19}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  setValue('cardNumber', formatted, { shouldValidate: false });
                }}
                className={inputClass(!!errors.cardNumber)}
              />
              {errors.cardNumber && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.cardNumber.message}</p>
              )}
            </div>

            {/* Card Holder */}
            <div>
              <div className="relative">
                <label className="absolute top-1 left-4 text-[10px] text-slate-400 font-medium">
                  Kart Üzerindeki İsim
                </label>
                <input
                  {...register('cardHolder')}
                  placeholder=" "
                  className={`${inputClass(!!errors.cardHolder)} pt-5 pb-1`}
                />
              </div>
              {errors.cardHolder && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.cardHolder.message}</p>
              )}
            </div>

            {/* Expiry + CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  {...register('expiry')}
                  placeholder="Ay / Yıl"
                  maxLength={5}
                  onChange={(e) => {
                    const formatted = formatExpiry(e.target.value);
                    setValue('expiry', formatted, { shouldValidate: false });
                  }}
                  className={inputClass(!!errors.expiry)}
                />
                {errors.expiry && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.expiry.message}</p>
                )}
              </div>
              <div>
                <input
                  {...register('cvv')}
                  placeholder="CVC"
                  maxLength={4}
                  type="password"
                  className={inputClass(!!errors.cvv)}
                />
                {errors.cvv && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.cvv.message}</p>
                )}
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Checkboxes */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={billingAddressSameAsShipping}
            onChange={(e) => setBillingAddressSameAsShipping(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-slate-300 accent-indigo-600"
          />
          <span className="text-sm text-slate-600">
            Fatura adresim teslimat adresimle aynı
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => {
              setAgreedToTerms(e.target.checked);
              if (e.target.checked) setTermsError(false);
            }}
            className="w-4 h-4 mt-0.5 rounded border-slate-300 accent-indigo-600"
          />
          <span className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">Gizlilik Sözleşmesini</span> ve{' '}
            <span className="font-semibold text-slate-800">Satış Sözleşmesini</span> okudum, onaylıyorum.
          </span>
        </label>
        {termsError && (
          <p className="text-xs text-red-500 font-medium ml-7">
            Devam etmek için sözleşmeleri onaylamanız gerekmektedir.
          </p>
        )}
      </div>

      {/* Shipping address display */}
      <div className="flex items-center justify-between text-sm text-slate-500 px-1">
        <span>
          {addressData.firstName} {addressData.lastName},{' '}
          {addressData.district}/{addressData.city}
        </span>
        <button
          onClick={onBack}
          className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
        >
          Düzenle
        </button>
      </div>

      {/* Submit Button */}
      {paymentMethod === 'credit_card' ? (
        <button
          type="submit"
          form="credit-card-form"
          disabled={isSubmitting}
          className={`w-full py-4 font-bold rounded-xl uppercase tracking-wide transition-colors active:scale-[0.99] shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 ${
            isSubmitting
              ? 'bg-indigo-400 cursor-not-allowed text-white'
              : 'bg-indigo-700 text-white hover:bg-indigo-800'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              İşleniyor...
            </>
          ) : (
            'Siparişi Tamamla'
          )}
        </button>
      ) : (
        <form onSubmit={handleNonCardSubmit}>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 font-bold rounded-xl uppercase tracking-wide transition-colors active:scale-[0.99] shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 ${
              isSubmitting
                ? 'bg-indigo-400 cursor-not-allowed text-white'
                : 'bg-indigo-700 text-white hover:bg-indigo-800'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                İşleniyor...
              </>
            ) : (
              'Siparişi Tamamla'
            )}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Ödemeler güvenli ve şifrelidir
      </p>
    </div>
  );
}
