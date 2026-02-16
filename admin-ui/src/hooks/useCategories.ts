import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/category.service';
import type { CategoryFormData } from '../services/category.service';
import { showErrorToast, showSuccessToast } from '../utils/errorHandler';

// Query keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: () => [...categoryKeys.lists()] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// Get all categories
export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => categoryService.getCategories(),
  });
};

// Get category by ID
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryService.getCategoryById(id),
    enabled: !!id,
  });
};

// Create category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, image }: { data: CategoryFormData; image?: File }) =>
      categoryService.createCategory(data, image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      showSuccessToast('Category created successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Update category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, image }: { id: string; data: Partial<CategoryFormData>; image?: File }) =>
      categoryService.updateCategory(id, data, image),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
      showSuccessToast('Category updated successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Delete category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      showSuccessToast('Category deleted successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Upload category image
export const useUploadCategoryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, file }: { categoryId: string; file: File }) =>
      categoryService.uploadCategoryImage(categoryId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.categoryId) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      showSuccessToast('Image uploaded successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Delete category image
export const useDeleteCategoryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => categoryService.deleteCategoryImage(categoryId),
    onSuccess: (_, categoryId) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(categoryId) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      showSuccessToast('Image deleted successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};
