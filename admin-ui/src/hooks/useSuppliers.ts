import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierService } from '../services/supplier.service';
import type {
  SupplierFormData,
  SupplierListParams,
  SupplierProductFormData,
} from '../services/supplier.service';
import { showErrorToast, showSuccessToast } from '../utils/errorHandler';

// Query keys
export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  list: (params?: SupplierListParams) => [...supplierKeys.lists(), params] as const,
  details: () => [...supplierKeys.all, 'detail'] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const,
  products: (id: string) => [...supplierKeys.detail(id), 'products'] as const,
};

// Get all suppliers
export const useSuppliers = (params?: SupplierListParams) => {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => supplierService.getSuppliers(params),
  });
};

// Get supplier by ID
export const useSupplier = (id: string) => {
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => supplierService.getSupplierById(id),
    enabled: !!id,
  });
};

// Create supplier
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SupplierFormData) => supplierService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      showSuccessToast('Supplier created successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Update supplier
export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SupplierFormData> }) =>
      supplierService.updateSupplier(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(variables.id) });
      showSuccessToast('Supplier updated successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Delete supplier
export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => supplierService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      showSuccessToast('Supplier deleted successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Get supplier products
export const useSupplierProducts = (id: string) => {
  return useQuery({
    queryKey: supplierKeys.products(id),
    queryFn: () => supplierService.getSupplierProducts(id),
    enabled: !!id,
  });
};

// Add product to supplier
export const useAddSupplierProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ supplierId, data }: { supplierId: string; data: SupplierProductFormData }) =>
      supplierService.addSupplierProduct(supplierId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.products(variables.supplierId) });
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(variables.supplierId) });
      showSuccessToast('Product added to supplier successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Update supplier product
export const useUpdateSupplierProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      supplierId,
      productId,
      data,
    }: {
      supplierId: string;
      productId: string;
      data: Partial<SupplierProductFormData>;
    }) => supplierService.updateSupplierProduct(supplierId, productId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.products(variables.supplierId) });
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(variables.supplierId) });
      showSuccessToast('Supplier product updated successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Remove supplier product
export const useRemoveSupplierProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ supplierId, productId }: { supplierId: string; productId: string }) =>
      supplierService.removeSupplierProduct(supplierId, productId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.products(variables.supplierId) });
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(variables.supplierId) });
      showSuccessToast('Product removed from supplier successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};
