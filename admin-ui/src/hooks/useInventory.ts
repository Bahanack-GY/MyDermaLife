import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/inventory.service';
import type {
  StockListParams,
  StockAdjustmentData,
  StockTransferData,
  StockMovementParams,
} from '../services/inventory.service';
import { showErrorToast, showSuccessToast } from '../utils/errorHandler';

// Query keys
export const inventoryKeys = {
  all: ['inventory'] as const,
  stock: () => [...inventoryKeys.all, 'stock'] as const,
  stockList: (params?: StockListParams) => [...inventoryKeys.stock(), 'list', params] as const,
  stockDetail: (warehouseId: string, productId: string) =>
    [...inventoryKeys.stock(), 'detail', warehouseId, productId] as const,
  movements: () => [...inventoryKeys.all, 'movements'] as const,
  movementsList: (params?: StockMovementParams) => [...inventoryKeys.movements(), 'list', params] as const,
  alerts: () => [...inventoryKeys.all, 'alerts'] as const,
};

// Get stock levels
export const useStock = (params?: StockListParams) => {
  return useQuery({
    queryKey: inventoryKeys.stockList(params),
    queryFn: () => inventoryService.getStock(params),
  });
};

// Get stock detail for specific product in warehouse
export const useStockDetail = (warehouseId: string, productId: string) => {
  return useQuery({
    queryKey: inventoryKeys.stockDetail(warehouseId, productId),
    queryFn: () => inventoryService.getStockDetail(warehouseId, productId),
    enabled: !!warehouseId && !!productId,
  });
};

// Adjust stock
export const useAdjustStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StockAdjustmentData) => inventoryService.adjustStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stock() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.movements() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.alerts() });
      showSuccessToast('Stock adjusted successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Transfer stock
export const useTransferStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StockTransferData) => inventoryService.transferStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stock() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.movements() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.alerts() });
      showSuccessToast('Stock transferred successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Get stock movements
export const useStockMovements = (params?: StockMovementParams) => {
  return useQuery({
    queryKey: inventoryKeys.movementsList(params),
    queryFn: () => inventoryService.getMovements(params),
  });
};

// Get stock alerts
export const useStockAlerts = () => {
  return useQuery({
    queryKey: inventoryKeys.alerts(),
    queryFn: () => inventoryService.getAlerts(),
  });
};
