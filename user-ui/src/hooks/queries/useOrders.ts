import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '../../api/services/orders.service';
import { QUERY_KEYS } from '../../lib/query-client';
import { toast } from 'sonner';
import type { ShippingAddress } from '../../types/api.types';

interface CreateOrderData {
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentDetails?: Record<string, unknown>;
}

// Get all orders
export const useOrders = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ORDERS.LIST,
    queryFn: () => ordersService.getOrders(),
  });
};

// Get single order
export const useOrder = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.ORDERS.DETAIL(id),
    queryFn: () => ordersService.getOrder(id),
    enabled: !!id,
  });
};

// Get current user's orders
export const useMyOrders = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ORDERS.MY_ORDERS,
    queryFn: () => ordersService.getMyOrders(),
  });
};

// Get single order for current user
export const useMyOrder = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.ORDERS.MY_ORDER_DETAIL(id),
    queryFn: () => ordersService.getMyOrder(id),
    enabled: !!id,
  });
};

// Track order by token
export const useTrackOrder = (token: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.ORDERS.TRACK(token),
    queryFn: () => ordersService.trackOrder(token),
    enabled: !!token,
  });
};

// Create order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderData) => ordersService.createOrder(data),
    onSuccess: () => {
      // Invalidate cart and orders queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART.GET });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS.LIST });
      toast.success('Order created successfully');
    },
    onError: () => {
      toast.error('Failed to create order');
    },
  });
};
