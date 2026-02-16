import { useQuery } from '@tanstack/react-query';
import { productsService, categoriesService, collectionsService } from '../../api/services/products.service';
import { QUERY_KEYS } from '../../lib/query-client';
import type { ProductQueryParams } from '../../types/api.types';

// Get all products with filters and pagination
export const useProducts = (params?: ProductQueryParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS.LIST(params as unknown as Record<string, unknown>),
    queryFn: () => productsService.getProducts(params),
  });
};

// Get featured products
export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsService.getFeaturedProducts(),
  });
};

// Get new arrivals
export const useNewArrivals = () => {
  return useQuery({
    queryKey: ['products', 'new-arrivals'],
    queryFn: () => productsService.getNewArrivals(),
  });
};

// Get best sellers
export const useBestSellers = () => {
  return useQuery({
    queryKey: ['products', 'best-sellers'],
    queryFn: () => productsService.getBestSellers(),
  });
};

// Get single product by ID or slug
export const useProduct = (idOrSlug: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS.DETAIL(idOrSlug),
    queryFn: () => productsService.getProduct(idOrSlug),
    enabled: !!idOrSlug,
  });
};

// Get products by category
export const useProductsByCategory = (categoryId: string, params?: ProductQueryParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS.BY_CATEGORY(categoryId),
    queryFn: () => productsService.getProductsByCategory(categoryId, params),
    enabled: !!categoryId,
  });
};

// Search products
export const useSearchProducts = (query: string, params?: ProductQueryParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS.SEARCH(query),
    queryFn: () => productsService.searchProducts(query, params),
    enabled: query.length > 0,
  });
};

// Get all categories
export const useCategories = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES.LIST,
    queryFn: () => categoriesService.getCategories(),
  });
};

// Get single category
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES.DETAIL(id),
    queryFn: () => categoriesService.getCategory(id),
    enabled: !!id,
  });
};

// Get all collections
export const useCollections = () => {
  return useQuery({
    queryKey: QUERY_KEYS.COLLECTIONS.LIST,
    queryFn: () => collectionsService.getCollections(),
  });
};

// Get single collection
export const useCollection = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.COLLECTIONS.DETAIL(id),
    queryFn: () => collectionsService.getCollection(id),
    enabled: !!id,
  });
};
