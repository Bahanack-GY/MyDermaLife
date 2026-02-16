import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewsService } from '../../api/services/reviews.service';
import { toast } from 'sonner';
import type { CreateReviewPayload, UpdateReviewPayload, ReviewQueryParams } from '../../types/api.types';

// Query keys
const REVIEW_KEYS = {
  product: (productId: string) => ['reviews', 'product', productId] as const,
  detail: (productId: string, reviewId: string) => ['reviews', 'product', productId, reviewId] as const,
};

// Get reviews for a product (public)
export const useProductReviews = (productId: string, params?: ReviewQueryParams) => {
  return useQuery({
    queryKey: [...REVIEW_KEYS.product(productId), params],
    queryFn: () => reviewsService.getProductReviews(productId, params),
    enabled: !!productId,
  });
};

// Get single review
export const useReview = (productId: string, reviewId: string) => {
  return useQuery({
    queryKey: REVIEW_KEYS.detail(productId, reviewId),
    queryFn: () => reviewsService.getReview(productId, reviewId),
    enabled: !!productId && !!reviewId,
  });
};

// Create review
export const useCreateReview = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewsService.createReview(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.product(productId) });
      toast.success('Review submitted! It will be visible after approval.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to submit review');
    },
  });
};

// Update review
export const useUpdateReview = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: UpdateReviewPayload }) =>
      reviewsService.updateReview(reviewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.product(productId) });
      toast.success('Review updated successfully');
    },
    onError: () => {
      toast.error('Failed to update review');
    },
  });
};

// Delete review
export const useDeleteReview = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewsService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.product(productId) });
      toast.success('Review deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete review');
    },
  });
};
