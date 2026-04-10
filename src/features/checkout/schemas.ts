import { z } from 'zod';

export const addressSchema = z.object({
  firstName: z.string().min(2, { message: 'Ad en az 2 karakter olmalıdır' }),
  lastName: z.string().min(2, { message: 'Soyad en az 2 karakter olmalıdır' }),
  address: z.string().min(5, { message: 'Adres en az 5 karakter olmalıdır' }),
  apartment: z.string(),
  city: z.string().min(1, { message: 'Şehir seçiniz' }),
  district: z.string().min(2, { message: 'İlçe giriniz' }),
  phone: z
    .string()
    .min(10, { message: 'Geçerli bir telefon numarası giriniz' })
    .max(11, { message: 'Geçerli bir telefon numarası giriniz' })
    .regex(/^\d+$/, { message: 'Yalnızca rakam giriniz' }),
  saveAddress: z.boolean(),
  title: z.string(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export const creditCardSchema = z.object({
  cardNumber: z
    .string()
    .min(19, { message: 'Kart numarasını eksiksiz giriniz' })
    .max(19, { message: 'Kart numarası 16 haneli olmalıdır' }),
  cardHolder: z.string().min(3, { message: 'Kart üzerindeki ismi giriniz' }),
  expiry: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, { message: 'AA/YY formatında giriniz' }),
  cvv: z
    .string()
    .min(3, { message: 'CVC kodunu giriniz' })
    .max(4, { message: 'CVC kodu 3-4 haneli olmalıdır' }),
});

export type CreditCardFormValues = z.infer<typeof creditCardSchema>;
