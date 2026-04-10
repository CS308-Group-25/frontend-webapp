import { create } from 'zustand';
import type { Review } from '../types/review.types';

interface ReviewState {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  updateReview: (id: string, data: Partial<Omit<Review, 'id' | 'createdAt'>>) => void;
  deleteReview: (id: string) => void;
  getReview: (orderId: string, productId: string) => Review | undefined;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  
  addReview: (reviewData) => {
    const newReview: Review = {
      ...reviewData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({ reviews: [...state.reviews, newReview] }));
  },

  updateReview: (id, data) => {
    set((state) => ({
      reviews: state.reviews.map((rev) =>
        rev.id === id ? { ...rev, ...data } : rev
      ),
    }));
  },

  deleteReview: (id) => {
    set((state) => ({
      reviews: state.reviews.filter((rev) => rev.id !== id),
    }));
  },

  getReview: (orderId: string, productId: string) => {
    return get().reviews.find(
      (review) => review.orderId === orderId && review.productId === productId
    );
  },
}));
