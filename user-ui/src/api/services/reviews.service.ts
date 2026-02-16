import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  Review,
  PaginatedReviews,
  ReviewSummary,
  CreateReviewPayload,
  UpdateReviewPayload,
  ModerateReviewPayload,
  ReviewQueryParams,
  AdminReviewQueryParams,
} from '../../types/api.types';

export const reviewsService = {
  // Get reviews for a product (public - only approved)
  getProductReviews: async (productId: string, params?: ReviewQueryParams): Promise<PaginatedReviews> => {
    return apiClient.get(ENDPOINTS.REVIEWS.LIST(productId), { params });
  },

  // Get rating summary/breakdown for a product (public)
  getReviewSummary: async (productId: string): Promise<ReviewSummary> => {
    return apiClient.get(ENDPOINTS.REVIEWS.SUMMARY(productId));
  },

  // Get single review detail
  getReview: async (productId: string, reviewId: string): Promise<Review> => {
    return apiClient.get(ENDPOINTS.REVIEWS.DETAIL(productId, reviewId));
  },

  // Get current user's reviews (authenticated)
  getMyReviews: async (params?: ReviewQueryParams): Promise<PaginatedReviews> => {
    return apiClient.get(ENDPOINTS.REVIEWS.MY_REVIEWS, { params });
  },

  // Create a review (authenticated)
  createReview: async (productId: string, payload: CreateReviewPayload): Promise<Review> => {
    return apiClient.post(ENDPOINTS.REVIEWS.CREATE(productId), payload);
  },

  // Update own review (authenticated, only while pending)
  updateReview: async (reviewId: string, payload: UpdateReviewPayload): Promise<Review> => {
    return apiClient.put(ENDPOINTS.REVIEWS.UPDATE(reviewId), payload);
  },

  // Delete own review (authenticated)
  deleteReview: async (reviewId: string): Promise<void> => {
    return apiClient.delete(ENDPOINTS.REVIEWS.DELETE(reviewId));
  },

  // Admin: Get all reviews with filters
  getAdminReviews: async (params?: AdminReviewQueryParams): Promise<PaginatedReviews> => {
    return apiClient.get(ENDPOINTS.REVIEWS.ADMIN_LIST, { params });
  },

  // Admin: Moderate review (approve/reject)
  moderateReview: async (reviewId: string, payload: ModerateReviewPayload): Promise<Review> => {
    return apiClient.put(ENDPOINTS.REVIEWS.MODERATE(reviewId), payload);
  },

  // Admin: Force delete any review
  adminDeleteReview: async (reviewId: string): Promise<void> => {
    return apiClient.delete(ENDPOINTS.REVIEWS.ADMIN_DELETE(reviewId));
  },
};
