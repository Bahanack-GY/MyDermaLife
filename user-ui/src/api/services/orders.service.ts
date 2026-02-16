import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { Order, ShippingAddress, ApiResponse, PaginatedResponse } from '../../types/api.types';

interface CreateOrderData {
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentDetails?: Record<string, unknown>;
}

export const ordersService = {
  // Create new order
  createOrder: async (data: CreateOrderData): Promise<ApiResponse<Order>> => {
    return apiClient.post(ENDPOINTS.ORDERS.CREATE, data);
  },

  // Get all orders for current user
  getOrders: async (): Promise<PaginatedResponse<Order>> => {
    return apiClient.get(ENDPOINTS.ORDERS.LIST);
  },

  // Get single order by ID
  getOrder: async (id: string): Promise<ApiResponse<Order>> => {
    return apiClient.get(ENDPOINTS.ORDERS.DETAIL(id));
  },

  // Get current user's orders
  getMyOrders: async (): Promise<PaginatedResponse<Order>> => {
    return apiClient.get(ENDPOINTS.ORDERS.MY_ORDERS);
  },

  // Get single order for current user
  getMyOrder: async (id: string): Promise<ApiResponse<Order>> => {
    return apiClient.get(ENDPOINTS.ORDERS.MY_ORDER_DETAIL(id));
  },

  // Track order by token
  trackOrder: async (token: string): Promise<ApiResponse<Order>> => {
    return apiClient.get(ENDPOINTS.ORDERS.TRACK(token));
  },
};
