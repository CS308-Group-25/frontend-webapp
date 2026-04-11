export type PaymentMethod = 'credit_card' | 'cod_cash' | 'cod_card';
export type CheckoutStep = 1 | 2 | 3;

export interface AddressFormData {
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  district: string;
  phone: string;
  saveAddress: boolean;
  title: string;
}

export interface CartItemDetail {
  productId: string;
  quantity: number;
  variantId?: string;
  productName: string;
  productPrice: number;
  originalPrice?: number;
  productImage: string;
}
