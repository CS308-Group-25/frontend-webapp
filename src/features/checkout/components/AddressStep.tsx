'use client';

import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema, AddressFormValues } from '../schemas';
import { AddressFormData } from '../types';

const TURKISH_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya',
  'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik',
  'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum',
  'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir',
  'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis',
  'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa',
  'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize',
  'Sakarya', 'Samsun', 'Şanlıurfa', 'Şırnak', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ',
  'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
];

interface AddressStepProps {
  defaultValues?: Partial<AddressFormData>;
  onComplete: (data: AddressFormData) => void;
}

const inputClass = (hasError: boolean) =>
  `w-full text-slate-900 placeholder:text-slate-400 px-4 py-2.5 bg-slate-50 border rounded-xl outline-none transition-all focus:bg-white focus:ring-4 ${
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100 hover:border-slate-300'
  }`;

export default function AddressStep({ defaultValues, onComplete }: AddressStepProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    mode: 'onSubmit',
    defaultValues: {
      firstName: defaultValues?.firstName ?? '',
      lastName: defaultValues?.lastName ?? '',
      address: defaultValues?.address ?? '',
      apartment: defaultValues?.apartment ?? '',
      city: defaultValues?.city ?? '',
      district: defaultValues?.district ?? '',
      phone: defaultValues?.phone ?? '',
      saveAddress: defaultValues?.saveAddress ?? true,
      title: defaultValues?.title ?? '',
    },
  });

  const saveAddress = useWatch({ control, name: 'saveAddress' });

  const onSubmit = (data: AddressFormValues) => {
    onComplete(data as AddressFormData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-6 h-6 rounded-full bg-indigo-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
            ✓
          </div>
          <h3 className="font-bold text-slate-800">Yeni Adres</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* First Name */}
          <div>
            <input
              {...register('firstName')}
              placeholder="Ad"
              className={inputClass(!!errors.firstName)}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <input
              {...register('lastName')}
              placeholder="Soyad"
              className={inputClass(!!errors.lastName)}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="mt-3">
          <input
            {...register('address')}
            placeholder="Adres"
            className={inputClass(!!errors.address)}
          />
          {errors.address && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.address.message}</p>
          )}
        </div>

        {/* Apartment */}
        <div className="mt-3">
          <input
            {...register('apartment')}
            placeholder="Apartman, daire, vb."
            className={inputClass(false)}
          />
        </div>

        {/* City + District */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <select
              {...register('city')}
              className={inputClass(!!errors.city)}
            >
              <option value="">İl</option>
              {TURKISH_CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.city && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.city.message}</p>
            )}
          </div>
          <div>
            <input
              {...register('district')}
              placeholder="İlçe"
              className={inputClass(!!errors.district)}
            />
            {errors.district && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.district.message}</p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="mt-3">
          <div className={`flex items-center border rounded-xl overflow-hidden transition-all ${errors.phone ? 'border-red-300' : 'border-slate-200 hover:border-slate-300'} bg-slate-50 focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100`}>
            <div className="flex items-center gap-1.5 px-3 py-2.5 border-r border-slate-200 shrink-0">
              <span className="text-base">🇹🇷</span>
              <span className="text-sm font-semibold text-slate-600">+90</span>
            </div>
            <input
              {...register('phone')}
              type="tel"
              placeholder="Telefon"
              className="flex-1 px-3 py-2.5 bg-transparent text-slate-900 placeholder:text-slate-400 outline-none text-sm"
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone.message}</p>
          )}
        </div>

        {/* Save Address Checkbox */}
        <label className="flex items-center gap-3 mt-4 cursor-pointer">
          <input
            type="checkbox"
            {...register('saveAddress')}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 accent-indigo-600"
          />
          <span className="text-sm text-slate-600">Bir sonraki işlem için bu adresi kaydet</span>
        </label>

        {/* Address Title (only if saveAddress) */}
        {saveAddress && (
          <div className="mt-3">
            <input
              {...register('title')}
              placeholder="Adres Başlığı (ör: Ev, İş)"
              className={inputClass(false)}
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-indigo-700 text-white font-bold rounded-xl uppercase tracking-wide hover:bg-indigo-800 transition-colors active:scale-[0.99] shadow-lg shadow-indigo-200"
      >
        Kargo ile Devam Et
      </button>
    </form>
  );
}
