import { apiService } from './api.service';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  orderId: string | null;
  rating: number;
  title: string;
  reviewText: string | null;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  status: ReviewStatus;
  moderatedBy: string | null;
  moderatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface AdminReviewListParams {
  page?: number;
  limit?: number;
  status?: ReviewStatus;
  rating?: number;
  productId?: string;
  userId?: string;
}

export interface ReviewListResponse {
  data: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ModerateReviewData {
  status: 'approved' | 'rejected';
}

export const reviewService = {
  // Get all reviews (admin)
  getAdminReviews: async (params?: AdminReviewListParams): Promise<ReviewListResponse> => {
    const response = await apiService.get<ReviewListResponse>('/products/reviews/admin', { params });
    console.log('[ReviewService] Admin reviews list:', response.data);
    return response.data;
  },

  // Moderate review (approve/reject)
  moderateReview: async (id: string, data: ModerateReviewData): Promise<Review> => {
    const response = await apiService.put<Review>(`/products/reviews/${id}/moderate`, data);
    console.log('[ReviewService] Review moderated:', response.data);
    return response.data;
  },

  // Delete review (admin)
  deleteReview: async (id: string): Promise<void> => {
    await apiService.delete(`/products/reviews/${id}/admin`);
    console.log('[ReviewService] Review deleted:', id);
  },

  // Get product reviews (public)
  getProductReviews: async (productId: string, params?: { page?: number; limit?: number; rating?: number }): Promise<ReviewListResponse> => {
    const response = await apiService.get<ReviewListResponse>(`/products/${productId}/reviews`, { params });
    return response.data;
  },

  // Get reviews summary (public)
  getReviewsSummary: async (productId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    breakdown: Record<string, number>;
  }> => {
    const response = await apiService.get(`/products/${productId}/reviews/summary`);
    return response.data;
  },
};

export default reviewService;
