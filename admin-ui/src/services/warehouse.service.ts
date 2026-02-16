import { apiService } from './api.service';

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  country: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  stockSummary?: {
    totalProducts: number;
    totalQuantity: number;
    lowStockCount: number;
  };
}

export interface WarehouseListParams {
  country?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface WarehouseListResponse {
  data: Warehouse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface WarehouseFormData {
  name: string;
  code: string;
  country: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export const warehouseService = {
  // Get all warehouses
  getWarehouses: async (params?: WarehouseListParams): Promise<WarehouseListResponse> => {
    const response = await apiService.get<WarehouseListResponse>('/warehouses', { params });
    return response.data;
  },

  // Get warehouse by ID
  getWarehouseById: async (id: string): Promise<Warehouse> => {
    const response = await apiService.get<Warehouse>(`/warehouses/${id}`);
    return response.data;
  },

  // Create warehouse
  createWarehouse: async (data: WarehouseFormData): Promise<Warehouse> => {
    const response = await apiService.post<Warehouse>('/warehouses', data);
    return response.data;
  },

  // Update warehouse
  updateWarehouse: async (id: string, data: Partial<WarehouseFormData>): Promise<Warehouse> => {
    const response = await apiService.put<Warehouse>(`/warehouses/${id}`, data);
    return response.data;
  },

  // Delete warehouse
  deleteWarehouse: async (id: string): Promise<void> => {
    await apiService.delete(`/warehouses/${id}`);
  },
};

export default warehouseService;
