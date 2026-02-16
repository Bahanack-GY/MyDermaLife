import { apiService } from './api.service';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  notes: string | null;
  shippingAddress: ShippingAddress;
  trackingToken: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface OrderListResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateOrderStatusData {
  status: OrderStatus;
  cancellationReason?: string;
  notes?: string;
}

export const orderService = {
  // Get all orders
  getOrders: async (params?: OrderListParams): Promise<OrderListResponse> => {
    const response = await apiService.get<OrderListResponse>('/orders', { params });
    console.log('[OrderService] Orders list:', response.data);
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<Order> => {
    const response = await apiService.get<Order>(`/orders/${id}`);
    console.log('[OrderService] Order details:', response.data);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id: string, data: UpdateOrderStatusData): Promise<Order> => {
    const response = await apiService.put<Order>(`/orders/${id}/status`, data);
    console.log('[OrderService] Order status updated:', response.data);
    return response.data;
  },

  // Track order (public)
  trackOrder: async (trackingToken: string): Promise<Order> => {
    const response = await apiService.get<Order>(`/orders/track/${trackingToken}`);
    return response.data;
  },
};

export default orderService;
