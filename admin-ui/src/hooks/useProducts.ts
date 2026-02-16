import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import type { ProductFormData, ProductListParams } from '../services/product.service';
import { showErrorToast, showSuccessToast } from '../utils/errorHandler';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: ProductListParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  newArrivals: () => [...productKeys.all, 'new-arrivals'] as const,
  bestSellers: () => [...productKeys.all, 'best-sellers'] as const,
};

// Get all products
export const useProducts = (params?: ProductListParams) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productService.getProducts(params),
  });
};

// Get product by ID
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });
};

// Get featured products
export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: () => productService.getFeaturedProducts(),
  });
};

// Get new arrivals
export const useNewArrivals = () => {
  return useQuery({
    queryKey: productKeys.newArrivals(),
    queryFn: () => productService.getNewArrivals(),
  });
};

// Get best sellers
export const useBestSellers = () => {
  return useQuery({
    queryKey: productKeys.bestSellers(),
    queryFn: () => productService.getBestSellers(),
  });
};

// Create product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, images }: { data: ProductFormData; images?: File[] }) =>
      productService.createProduct(data, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      showSuccessToast('Product created successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Update product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, images }: { id: string; data: Partial<ProductFormData>; images?: File[] }) =>
      productService.updateProduct(id, data, images),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      showSuccessToast('Product updated successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Delete product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      showSuccessToast('Product deleted successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Upload product image
export const useUploadProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, file, options }: {
      productId: string;
      file: File;
      options?: { altText?: string; isPrimary?: boolean; sortOrder?: number };
    }) => productService.uploadProductImage(productId, file, options),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      showSuccessToast('Image uploaded successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Delete product image
export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) =>
      productService.deleteProductImage(productId, imageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      showSuccessToast('Image deleted successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};
