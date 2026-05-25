export interface AdminInvoiceListItem {
  id: number;
  order_id?: number;
  invoice_number: string;
  customer_name: string;
  customer_email?: string;
  delivery_address?: string;
  payment_method?: string;
  total: number | string;
  created_at: string;
  items?: {
    product_id: number;
    name: string;
    quantity: number;
    unit_price?: number | string;
    total_price?: number | string;
  }[];
  subtotal?: number | string;
  tax_amount?: number | string;
  total_amount?: number | string;
}

export interface PaginatedInvoiceResponse {
  items: AdminInvoiceListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface FetchAdminInvoicesParams {
  from?: string;
  to?: string;
  page?: number;
  page_size?: number;
}
