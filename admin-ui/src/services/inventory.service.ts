import { apiService } from './api.service';
import type { Product } from './product.service';
import type { Warehouse } from './warehouse.service';

export interface Stock {
  id: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  lastRestockedAt?: string;
  createdAt: string;
  updatedAt: string;
  warehouse?: Warehouse;
  product?: Product;
}

export interface StockListParams {
  warehouseId?: string;
  productId?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  page?: number;
  limit?: number;
}

export interface StockListResponse {
  data: Stock[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StockAdjustmentData {
  warehouseId: string;
  productId: string;
  quantity: number;
  reason: string;
  notes?: string;
}

export interface StockTransferData {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  productId: string;
  quantity: number;
  reason: string;
  notes?: string;
}

export interface StockMovement {
  id: string;
  warehouseId: string;
  productId: string;
  movementType: 'purchase_order_received' | 'sale' | 'return' | 'adjustment' | 'transfer_in' | 'transfer_out';
  quantity: number;
  referenceType: 'purchase_order' | 'order' | 'transfer' | 'adjustment' | 'return';
  referenceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  warehouse?: Warehouse;
  product?: Product;
}

export interface StockMovementParams {
  warehouseId?: string;
  productId?: string;
  movementType?: string;
  referenceType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface StockMovementListResponse {
  data: StockMovement[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StockAlert {
  warehouse: Warehouse;
  lowStockProducts: Array<{
    product: Product;
    stock: Stock;
  }>;
  outOfStockProducts: Array<{
    product: Product;
  }>;
}

export const inventoryService = {
  // Get stock levels
  getStock: async (params?: StockListParams): Promise<StockListResponse> => {
    const response = await apiService.get<StockListResponse>('/inventory/stock', { params });
    return response.data;
  },

  // Get stock for specific product in warehouse
  getStockDetail: async (warehouseId: string, productId: string): Promise<Stock> => {
    const response = await apiService.get<Stock>(`/inventory/stock/${warehouseId}/${productId}`);
    return response.data;
  },

  // Adjust stock
  adjustStock: async (data: StockAdjustmentData): Promise<Stock> => {
    const response = await apiService.post<Stock>('/inventory/stock/adjust', data);
    return response.data;
  },

  // Transfer stock
  transferStock: async (data: StockTransferData): Promise<void> => {
    await apiService.post('/inventory/stock/transfer', data);
  },

  // Get stock movements
  getMovements: async (params?: StockMovementParams): Promise<StockMovementListResponse> => {
    const response = await apiService.get<StockMovementListResponse>('/inventory/movements', { params });
    return response.data;
  },

  // Get stock alerts
  getAlerts: async (): Promise<StockAlert[]> => {
    const response = await apiService.get<StockAlert[]>('/inventory/alerts');
    return response.data;
  },
};

export default inventoryService;
