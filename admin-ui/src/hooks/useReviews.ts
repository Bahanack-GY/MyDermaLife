import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService, type AdminReviewListParams, type ModerateReviewData } from '../services/review.service';
import { showSuccessToast } from '../utils/errorHandler';

export const useAdminReviews = (params?: AdminReviewListParams) => {
  return useQuery({
    queryKey: ['adminReviews', params],
    queryFn: () => reviewService.getAdminReviews(params),
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useModerateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ModerateReviewData }) =>
      reviewService.moderateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showSuccessToast('Review moderated successfully');
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showSuccessToast('Review deleted successfully');
    },
  });
};

export const useProductReviews = (productId: string, params?: { page?: number; limit?: number; rating?: number }) => {
  return useQuery({
    queryKey: ['productReviews', productId, params],
    queryFn: () => reviewService.getProductReviews(productId, params),
    enabled: !!productId,
  });
};

export const useReviewsSummary = (productId: string) => {
  return useQuery({
    queryKey: ['reviewsSummary', productId],
    queryFn: () => reviewService.getReviewsSummary(productId),
    enabled: !!productId,
  });
};
