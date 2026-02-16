import { apiService } from './api.service';
import type { Product } from './product.service';
import type { Supplier } from './supplier.service';
import type { Warehouse } from './warehouse.service';

export type PurchaseOrderStatus =
  | 'draft'
  | 'submitted'
  | 'confirmed'
  | 'partially_received'
  | 'received'
  | 'cancelled';

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  warehouseId: string;
  status: PurchaseOrderStatus;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  currency: string;
  expectedDeliveryDate?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  supplier?: Supplier;
  warehouse?: Warehouse;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderListParams {
  supplierId?: string;
  warehouseId?: string;
  status?: PurchaseOrderStatus;
  page?: number;
  limit?: number;
}

export interface PurchaseOrderListResponse {
  data: PurchaseOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PurchaseOrderItemInput {
  productId: string;
  quantityOrdered: number;
  unitCost: number;
}

export interface PurchaseOrderFormData {
  supplierId: string;
  warehouseId: string;
  expectedDeliveryDate?: string;
  taxAmount?: number;
  shippingCost?: number;
  currency?: string;
  notes?: string;
  items: PurchaseOrderItemInput[];
}

export interface PurchaseOrderUpdateData {
  expectedDeliveryDate?: string;
  taxAmount?: number;
  shippingCost?: number;
  currency?: string;
  notes?: string;
}

export interface ReceiveItemData {
  purchaseOrderItemId: string;
  quantityReceived: number;
}

export interface ReceivePurchaseOrderData {
  items: ReceiveItemData[];
}

export const purchaseOrderService = {
  // Get all purchase orders
  getPurchaseOrders: async (params?: PurchaseOrderListParams): Promise<PurchaseOrderListResponse> => {
    const response = await apiService.get<PurchaseOrderListResponse>('/purchase-orders', { params });
    return response.data;
  },

  // Get purchase order by ID
  getPurchaseOrderById: async (id: string): Promise<PurchaseOrder> => {
    const response = await apiService.get<PurchaseOrder>(`/purchase-orders/${id}`);
    return response.data;
  },

  // Create purchase order
  createPurchaseOrder: async (data: PurchaseOrderFormData): Promise<PurchaseOrder> => {
    const response = await apiService.post<PurchaseOrder>('/purchase-orders', data);
    return response.data;
  },

  // Update purchase order
  updatePurchaseOrder: async (id: string, data: PurchaseOrderUpdateData): Promise<PurchaseOrder> => {
    const response = await apiService.put<PurchaseOrder>(`/purchase-orders/${id}`, data);
    return response.data;
  },

  // Submit purchase order
  submitPurchaseOrder: async (id: string): Promise<PurchaseOrder> => {
    const response = await apiService.post<PurchaseOrder>(`/purchase-orders/${id}/submit`);
    return response.data;
  },

  // Confirm purchase order
  confirmPurchaseOrder: async (id: string): Promise<PurchaseOrder> => {
    const response = await apiService.post<PurchaseOrder>(`/purchase-orders/${id}/confirm`);
    return response.data;
  },

  // Receive purchase order items
  receivePurchaseOrder: async (id: string, data: ReceivePurchaseOrderData): Promise<PurchaseOrder> => {
    const response = await apiService.post<PurchaseOrder>(`/purchase-orders/${id}/receive`, data);
    return response.data;
  },

  // Cancel purchase order
  cancelPurchaseOrder: async (id: string): Promise<PurchaseOrder> => {
    const response = await apiService.post<PurchaseOrder>(`/purchase-orders/${id}/cancel`);
    return response.data;
  },
};

export default purchaseOrderService;
