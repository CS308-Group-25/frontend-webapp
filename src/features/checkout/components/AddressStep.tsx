'use client';

import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { MapPin, ChevronRight } from 'lucide-react';
import { addressSchema, AddressFormValues } from '../schemas';
import { AddressFormData } from '../types';
import { getAddresses, SavedAddress } from '../addressApi';

const TURKISH_CITIES = [
  'Adana',
  'Adıyaman',
  'Afyonkarahisar',
  'Ağrı',
  'Aksaray',
  'Amasya',
  'Ankara',
  'Antalya',
  'Ardahan',
  'Artvin',
  'Aydın',
  'Balıkesir',
  'Bartın',
  'Batman',
  'Bayburt',
  'Bilecik',
  'Bingöl',
  'Bitlis',
  'Bolu',
  'Burdur',
  'Bursa',
  'Çanakkale',
  'Çankırı',
  'Çorum',
  'Denizli',
  'Diyarbakır',
  'Düzce',
  'Edirne',
  'Elazığ',
  'Erzincan',
  'Erzurum',
  'Eskişehir',
  'Gaziantep',
  'Giresun',
  'Gümüşhane',
  'Hakkari',
  'Hatay',
  'Iğdır',
  'Isparta',
  'İstanbul',
  'İzmir',
  'Kahramanmaraş',
  'Karabük',
  'Karaman',
  'Kars',
  'Kastamonu',
  'Kayseri',
  'Kilis',
  'Kırıkkale',
  'Kırklareli',
  'Kırşehir',
  'Kocaeli',
  'Konya',
  'Kütahya',
  'Malatya',
  'Manisa',
  'Mardin',
  'Mersin',
  'Muğla',
  'Muş',
  'Nevşehir',
  'Niğde',
  'Ordu',
  'Osmaniye',
  'Rize',
  'Sakarya',
  'Samsun',
  'Şanlıurfa',
  'Şırnak',
  'Siirt',
  'Sinop',
  'Sivas',
  'Tekirdağ',
  'Tokat',
  'Trabzon',
  'Tunceli',
  'Uşak',
  'Van',
  'Yalova',
  'Yozgat',
  'Zonguldak',
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

export default function AddressStep({
  defaultValues,
  onComplete,
}: AddressStepProps) {
  const { data: savedAddresses } = useQuery<SavedAddress[]>({
    queryKey: ['addresses'],
    queryFn: getAddresses,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
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

  const fillFromSaved = (saved: SavedAddress) => {
    reset({
      firstName: saved.first_name,
      lastName: saved.last_name,
      address: saved.address,
      apartment: saved.apartment ?? '',
      city: saved.city,
      district: saved.district,
      phone: saved.phone,
      saveAddress: false,
      title: saved.title,
    });
  };

  const onSubmit = (data: AddressFormValues) => {
    onComplete(data as AddressFormData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {savedAddresses && savedAddresses.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-3 font-bold text-slate-800">Kayıtlı Adreslerim</h3>
          <div className="flex flex-col gap-2">
            {savedAddresses.map((addr) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => fillFromSaved(addr)}
                className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50"
              >
                <MapPin className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-indigo-500" />
                <div className="min-w-0 flex-1">
                  {addr.title && (
                    <p className="text-xs font-semibold text-indigo-600">
                      {addr.title}
                    </p>
                  )}
                  <p className="truncate text-sm font-medium text-slate-800">
                    {addr.first_name} {addr.last_name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {addr.address}
                    {addr.apartment ? `, ${addr.apartment}` : ''},{' '}
                    {addr.district}/{addr.city}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-indigo-400" />
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Bir adrese tıklayarak formu otomatik doldurun ya da aşağıya yeni
            adres girin.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-700 text-xs font-bold text-white">
            ✓
          </div>
          <h3 className="font-bold text-slate-800">
            {savedAddresses && savedAddresses.length > 0
              ? 'Yeni Adres'
              : 'Teslimat Adresi'}
          </h3>
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
              <p className="mt-1 text-xs font-medium text-red-500">
                {errors.firstName.message}
              </p>
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
              <p className="mt-1 text-xs font-medium text-red-500">
                {errors.lastName.message}
              </p>
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
            <p className="mt-1 text-xs font-medium text-red-500">
              {errors.address.message}
            </p>
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
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <select {...register('city')} className={inputClass(!!errors.city)}>
              <option value="">İl</option>
              {TURKISH_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="mt-1 text-xs font-medium text-red-500">
                {errors.city.message}
              </p>
            )}
          </div>
          <div>
            <input
              {...register('district')}
              placeholder="İlçe"
              className={inputClass(!!errors.district)}
            />
            {errors.district && (
              <p className="mt-1 text-xs font-medium text-red-500">
                {errors.district.message}
              </p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="mt-3">
          <div
            className={`flex items-center overflow-hidden rounded-xl border transition-all ${errors.phone ? 'border-red-300' : 'border-slate-200 hover:border-slate-300'} bg-slate-50 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100`}
          >
            <div className="flex shrink-0 items-center gap-1.5 border-r border-slate-200 px-3 py-2.5">
              <span className="text-base">🇹🇷</span>
              <span className="text-sm font-semibold text-slate-600">+90</span>
            </div>
            <input
              {...register('phone')}
              type="tel"
              placeholder="Telefon"
              className="flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-xs font-medium text-red-500">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Save Address Checkbox */}
        <label className="mt-4 flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            {...register('saveAddress')}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 accent-indigo-600"
          />
          <span className="text-sm text-slate-600">
            Bir sonraki işlem için bu adresi kaydet
          </span>
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
        className="w-full rounded-xl bg-indigo-700 py-4 font-bold tracking-wide text-white uppercase shadow-lg shadow-indigo-200 transition-colors hover:bg-indigo-800 active:scale-[0.99]"
      >
        Kargo ile Devam Et
      </button>
    </form>
  );
}
