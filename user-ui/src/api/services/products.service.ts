import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  Product,
  Category,
  Collection,
  PaginatedProducts,
  ProductQueryParams,
} from '../../types/api.types';

// Products
export const productsService = {
  // Get all products with optional filters and pagination
  getProducts: async (params?: ProductQueryParams): Promise<PaginatedProducts> => {
    console.log('📡 API Request - getProducts:', JSON.stringify(params, null, 2));
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.LIST, { params });
    console.log('📡 API Response - getProducts:');
    console.log('  - type:', typeof response);
    console.log('  - isArray:', Array.isArray(response));
    console.log('  - keys:', response ? Object.keys(response) : 'null');
    console.log('  - full response:', response);
    console.log('  - JSON:', JSON.stringify(response, null, 2));
    return response as unknown as PaginatedProducts;
  },

  // Get featured products
  getFeaturedProducts: async (): Promise<Product[]> => {
    return apiClient.get('/products/featured');
  },

  // Get new arrivals
  getNewArrivals: async (): Promise<Product[]> => {
    return apiClient.get('/products/new-arrivals');
  },

  // Get best sellers
  getBestSellers: async (): Promise<Product[]> => {
    return apiClient.get('/products/best-sellers');
  },

  // Get single product by ID or slug
  getProduct: async (idOrSlug: string): Promise<Product> => {
    return apiClient.get(`/products/${idOrSlug}`);
  },

  // Get products by category (using query param)
  getProductsByCategory: async (categoryId: string, params?: ProductQueryParams): Promise<PaginatedProducts> => {
    return apiClient.get(ENDPOINTS.PRODUCTS.LIST, {
      params: { ...params, categoryId }
    });
  },

  // Search products
  searchProducts: async (query: string, params?: ProductQueryParams): Promise<PaginatedProducts> => {
    return apiClient.get(ENDPOINTS.PRODUCTS.LIST, {
      params: { ...params, search: query }
    });
  },
};

// Categories
export const categoriesService = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    return apiClient.get(ENDPOINTS.CATEGORIES.LIST);
  },

  // Get single category
  getCategory: async (id: string): Promise<Category> => {
    return apiClient.get(ENDPOINTS.CATEGORIES.DETAIL(id));
  },
};

// Collections
export const collectionsService = {
  // Get all collections
  getCollections: async (): Promise<Collection[]> => {
    return apiClient.get(ENDPOINTS.COLLECTIONS.LIST);
  },

  // Get single collection
  getCollection: async (id: string): Promise<Collection> => {
    return apiClient.get(ENDPOINTS.COLLECTIONS.DETAIL(id));
  },
};
