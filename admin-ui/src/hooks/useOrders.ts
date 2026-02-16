import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService, type OrderListParams, type UpdateOrderStatusData } from '../services/order.service';
import { showSuccessToast } from '../utils/errorHandler';

export const useOrders = (params?: OrderListParams) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderService.getOrders(params),
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id),
    enabled: !!id,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusData }) =>
      orderService.updateOrderStatus(id, data),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', updatedOrder.id] });
      showSuccessToast('Order status updated successfully');
    },
  });
};
