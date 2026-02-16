import { apiService } from './api.service';
import type { Product } from './product.service';

export interface Supplier {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  contactPerson?: string;
  website?: string;
  paymentTerms?: string;
  leadTimeDays?: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  products?: SupplierProduct[];
}

export interface SupplierProduct {
  id: string;
  supplierId: string;
  productId: string;
  supplierSku?: string;
  costPrice?: number;
  leadTimeDays?: number;
  minOrderQuantity?: number;
  isPreferred: boolean;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

export interface SupplierListParams {
  search?: string;
  country?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface SupplierListResponse {
  data: Supplier[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SupplierFormData {
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  contactPerson?: string;
  website?: string;
  paymentTerms?: string;
  leadTimeDays?: number;
  isActive?: boolean;
  notes?: string;
}

export interface SupplierProductFormData {
  productId: string;
  supplierSku?: string;
  costPrice?: number;
  leadTimeDays?: number;
  minOrderQuantity?: number;
  isPreferred?: boolean;
}

export const supplierService = {
  // Get all suppliers
  getSuppliers: async (params?: SupplierListParams): Promise<SupplierListResponse> => {
    const response = await apiService.get<SupplierListResponse>('/suppliers', { params });
    return response.data;
  },

  // Get supplier by ID
  getSupplierById: async (id: string): Promise<Supplier> => {
    const response = await apiService.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  },

  // Create supplier
  createSupplier: async (data: SupplierFormData): Promise<Supplier> => {
    const response = await apiService.post<Supplier>('/suppliers', data);
    return response.data;
  },

  // Update supplier
  updateSupplier: async (id: string, data: Partial<SupplierFormData>): Promise<Supplier> => {
    const response = await apiService.put<Supplier>(`/suppliers/${id}`, data);
    return response.data;
  },

  // Delete supplier
  deleteSupplier: async (id: string): Promise<void> => {
    await apiService.delete(`/suppliers/${id}`);
  },

  // Get supplier products
  getSupplierProducts: async (id: string): Promise<SupplierProduct[]> => {
    const response = await apiService.get<SupplierProduct[]>(`/suppliers/${id}/products`);
    return response.data;
  },

  // Add product to supplier
  addSupplierProduct: async (id: string, data: SupplierProductFormData): Promise<SupplierProduct> => {
    const response = await apiService.post<SupplierProduct>(`/suppliers/${id}/products`, data);
    return response.data;
  },

  // Update supplier product
  updateSupplierProduct: async (
    id: string,
    productId: string,
    data: Partial<SupplierProductFormData>
  ): Promise<SupplierProduct> => {
    const response = await apiService.put<SupplierProduct>(`/suppliers/${id}/products/${productId}`, data);
    return response.data;
  },

  // Remove supplier product
  removeSupplierProduct: async (id: string, productId: string): Promise<void> => {
    await apiService.delete(`/suppliers/${id}/products/${productId}`);
  },
};

export default supplierService;
