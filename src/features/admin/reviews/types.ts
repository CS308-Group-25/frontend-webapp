export type ReviewApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface AdminReview {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  approval_status: ReviewApprovalStatus;
  created_at: string;
  product_name: string | null;
  customer_name: string | null;
  customer_email: string | null;
}

export interface ReviewModerationRequest {
  approval_status: 'approved' | 'rejected';
}
