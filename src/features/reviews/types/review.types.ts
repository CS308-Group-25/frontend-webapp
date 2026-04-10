export interface Review {
  id: string;
  orderId: string;
  productId: string;
  userId: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}
