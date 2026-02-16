import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryService, type DeliveryStatus, type UpdateDeliveryStatusData, type UploadProofData } from '../services/delivery.service';
import { showSuccessToast } from '../utils/errorHandler';

export const useAdminDeliveryStats = () => {
  return useQuery({
    queryKey: ['adminDeliveryStats'],
    queryFn: () => deliveryService.getAdminStats(),
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useDriverStats = () => {
  return useQuery({
    queryKey: ['driverStats'],
    queryFn: () => deliveryService.getDriverStats(),
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useMyDeliveries = (params?: { page?: number; limit?: number; status?: DeliveryStatus }) => {
  return useQuery({
    queryKey: ['myDeliveries', params],
    queryFn: () => deliveryService.getMyAssignments(params),
    staleTime: 1000 * 30, // 30 seconds - refresh frequently for delivery updates
  });
};

export const useDelivery = (id: string) => {
  return useQuery({
    queryKey: ['delivery', id],
    queryFn: () => deliveryService.getDeliveryById(id),
    enabled: !!id,
  });
};

export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeliveryStatusData }) =>
      deliveryService.updateDeliveryStatus(id, data),
    onSuccess: (updatedDelivery) => {
      queryClient.invalidateQueries({ queryKey: ['myDeliveries'] });
      queryClient.invalidateQueries({ queryKey: ['delivery', updatedDelivery.id] });
      showSuccessToast('Delivery status updated successfully');
    },
  });
};

export const useUploadProof = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UploadProofData }) =>
      deliveryService.uploadProof(id, data),
    onSuccess: (updatedDelivery) => {
      queryClient.invalidateQueries({ queryKey: ['myDeliveries'] });
      queryClient.invalidateQueries({ queryKey: ['delivery', updatedDelivery.id] });
      showSuccessToast('Proof of delivery uploaded successfully');
    },
  });
};
