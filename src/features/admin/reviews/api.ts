import apiClient from '@/lib/api-client';
import { AdminReview, ReviewModerationRequest } from './types';

export const fetchAdminReviews = async (status?: string): Promise<AdminReview[]> => {
  const params = status ? { status } : {};
  return apiClient.get('/v1/admin/reviews', { params });
};

export const moderateReview = async (
  reviewId: number,
  data: ReviewModerationRequest
): Promise<AdminReview> => {
  return apiClient.patch(`/v1/admin/reviews/${reviewId}`, data);
};

export const deleteReview = async (reviewId: number): Promise<void> => {
  return apiClient.delete(`/v1/admin/reviews/${reviewId}`);
};
