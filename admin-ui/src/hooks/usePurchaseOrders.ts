import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrderService } from '../services/purchaseOrder.service';
import type {
  PurchaseOrderFormData,
  PurchaseOrderListParams,
  PurchaseOrderUpdateData,
  ReceivePurchaseOrderData,
} from '../services/purchaseOrder.service';
import { showErrorToast, showSuccessToast } from '../utils/errorHandler';
import { inventoryKeys } from './useInventory';

// Query keys
export const purchaseOrderKeys = {
  all: ['purchaseOrders'] as const,
  lists: () => [...purchaseOrderKeys.all, 'list'] as const,
  list: (params?: PurchaseOrderListParams) => [...purchaseOrderKeys.lists(), params] as const,
  details: () => [...purchaseOrderKeys.all, 'detail'] as const,
  detail: (id: string) => [...purchaseOrderKeys.details(), id] as const,
};

// Get all purchase orders
export const usePurchaseOrders = (params?: PurchaseOrderListParams) => {
  return useQuery({
    queryKey: purchaseOrderKeys.list(params),
    queryFn: () => purchaseOrderService.getPurchaseOrders(params),
  });
};

// Get purchase order by ID
export const usePurchaseOrder = (id: string) => {
  return useQuery({
    queryKey: purchaseOrderKeys.detail(id),
    queryFn: () => purchaseOrderService.getPurchaseOrderById(id),
    enabled: !!id,
  });
};

// Create purchase order
export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PurchaseOrderFormData) => purchaseOrderService.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      showSuccessToast('Purchase order created successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Update purchase order
export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PurchaseOrderUpdateData }) =>
      purchaseOrderService.updatePurchaseOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(variables.id) });
      showSuccessToast('Purchase order updated successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Submit purchase order
export const useSubmitPurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrderService.submitPurchaseOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(id) });
      showSuccessToast('Purchase order submitted successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Confirm purchase order
export const useConfirmPurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrderService.confirmPurchaseOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(id) });
      showSuccessToast('Purchase order confirmed successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Receive purchase order
export const useReceivePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReceivePurchaseOrderData }) =>
      purchaseOrderService.receivePurchaseOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stock() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.movements() });
      showSuccessToast('Purchase order items received successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Cancel purchase order
export const useCancelPurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrderService.cancelPurchaseOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(id) });
      showSuccessToast('Purchase order cancelled successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};
