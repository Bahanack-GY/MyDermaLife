import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { routineService } from '../services/routine.service';
import type {
  RoutineListParams,
  CreateRoutineDto,
  UpdateRoutineDto,
  ReplaceProductsDto,
  AddProductDto,
} from '../services/routine.service';

// Get all routines with filters
export function useRoutines(params?: RoutineListParams) {
  return useQuery({
    queryKey: ['routines', params],
    queryFn: () => routineService.getRoutines(params),
  });
}

// Get single routine by ID
export function useRoutine(id: string | undefined) {
  return useQuery({
    queryKey: ['routine', id],
    queryFn: () => routineService.getRoutineById(id!),
    enabled: !!id,
  });
}

// Create routine
export function useCreateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, image }: { data: CreateRoutineDto; image?: File }) =>
      routineService.createRoutine(data, image),
    onSuccess: () => {
      message.success('Routine created successfully');
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to create routine');
    },
  });
}

// Update routine
export function useUpdateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, image }: { id: string; data: UpdateRoutineDto; image?: File }) =>
      routineService.updateRoutine(id, data, image),
    onSuccess: (_, variables) => {
      message.success('Routine updated successfully');
      queryClient.invalidateQueries({ queryKey: ['routine', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update routine');
    },
  });
}

// Delete routine
export function useDeleteRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => routineService.deleteRoutine(id),
    onSuccess: () => {
      message.success('Routine deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to delete routine');
    },
  });
}

// Replace all products in routine
export function useReplaceProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ routineId, data }: { routineId: string; data: ReplaceProductsDto }) =>
      routineService.replaceProducts(routineId, data),
    onSuccess: (_, variables) => {
      message.success('Products updated successfully');
      queryClient.invalidateQueries({ queryKey: ['routine', variables.routineId] });
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update products');
    },
  });
}

// Add product to routine
export function useAddProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ routineId, data }: { routineId: string; data: AddProductDto }) =>
      routineService.addProduct(routineId, data),
    onSuccess: (_, variables) => {
      message.success('Product added to routine');
      queryClient.invalidateQueries({ queryKey: ['routine', variables.routineId] });
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to add product');
    },
  });
}

// Remove product from routine
export function useRemoveProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ routineId, productId }: { routineId: string; productId: string }) =>
      routineService.removeProduct(routineId, productId),
    onSuccess: (_, variables) => {
      message.success('Product removed from routine');
      queryClient.invalidateQueries({ queryKey: ['routine', variables.routineId] });
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to remove product');
    },
  });
}

// Upload routine image
export function useUploadRoutineImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ routineId, image }: { routineId: string; image: File }) =>
      routineService.uploadImage(routineId, image),
    onSuccess: (_, variables) => {
      message.success('Image uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['routine', variables.routineId] });
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to upload image');
    },
  });
}

// Delete routine image
export function useDeleteRoutineImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routineId: string) => routineService.deleteImage(routineId),
    onSuccess: (_, routineId) => {
      message.success('Image deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['routine', routineId] });
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to delete image');
    },
  });
}
