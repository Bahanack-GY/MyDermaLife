import { apiService } from './api.service';
import type { Category } from './category.service';

export interface ProductImage {
  id: string;
  imageUrl: string;  // Backend returns 'imageUrl', not 'url'
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string | null;
  longDescription: string | null;
  categoryId: string;
  price: number;
  compareAtPrice: number | null;
  brandName: string | null;
  requiresPrescription: boolean;
  ingredients: string[];
  usageInstructions: string | null;
  warnings: string | null;
  benefits: string[];
  skinTypes: string[];
  conditionsTreated: string[];
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  rating: number;
  totalReviews: number;
  totalSales: number;
  weightGrams: number | null;
  dimensions: { length: number; width: number; height: number } | null;
  tags: string[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category & { parentCategory?: { id: string; name: string; slug: string } };
  images: ProductImage[];
}

export interface ProductListParams {
  categoryId?: string;
  skinType?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  requiresPrescription?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ProductListResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductFormData {
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string;
  longDescription?: string;
  categoryId: string;
  price: number;
  compareAtPrice?: number;
  brandName?: string;
  requiresPrescription?: boolean;
  ingredients?: string[];
  usageInstructions?: string;
  warnings?: string;
  benefits?: string[];
  skinTypes?: string[];
  conditionsTreated?: string[];
  stockQuantity: number;
  lowStockThreshold?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  weightGrams?: number;
  dimensions?: { length: number; width: number; height: number };
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

export const productService = {
  // Get all products with filters
  getProducts: async (params?: ProductListParams): Promise<ProductListResponse> => {
    const response = await apiService.get<ProductListResponse>('/products', { params });
    return response.data;
  },

  // Get product by ID or slug
  getProductById: async (id: string): Promise<Product> => {
    const response = await apiService.get<Product>(`/products/${id}`);
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await apiService.get<Product[]>('/products/featured');
    return response.data;
  },

  // Get new arrivals
  getNewArrivals: async (): Promise<Product[]> => {
    const response = await apiService.get<Product[]>('/products/new-arrivals');
    return response.data;
  },

  // Get best sellers
  getBestSellers: async (): Promise<Product[]> => {
    const response = await apiService.get<Product[]>('/products/best-sellers');
    return response.data;
  },

  // Create product
  createProduct: async (data: ProductFormData, images?: File[]): Promise<Product> => {
    const formData = new FormData();

    // Add all fields as strings (multipart/form-data format)
    formData.append('sku', data.sku);
    formData.append('name', data.name);
    formData.append('slug', data.slug);
    formData.append('price', String(data.price));

    // Optional fields
    if (data.categoryId) formData.append('categoryId', data.categoryId);
    if (data.shortDescription) formData.append('shortDescription', data.shortDescription);
    if (data.longDescription) formData.append('longDescription', data.longDescription);
    if (data.compareAtPrice) formData.append('compareAtPrice', String(data.compareAtPrice));
    if (data.usageInstructions) formData.append('usageInstructions', data.usageInstructions);
    if (data.warnings) formData.append('warnings', data.warnings);
    if (data.stockQuantity !== undefined) formData.append('stockQuantity', String(data.stockQuantity));
    if (data.lowStockThreshold) formData.append('lowStockThreshold', String(data.lowStockThreshold));
    if (data.weightGrams) formData.append('weightGrams', String(data.weightGrams));
    if (data.metaTitle) formData.append('metaTitle', data.metaTitle);
    if (data.metaDescription) formData.append('metaDescription', data.metaDescription);

    // Booleans as strings
    if (data.requiresPrescription !== undefined) formData.append('requiresPrescription', String(data.requiresPrescription));
    if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
    if (data.isFeatured !== undefined) formData.append('isFeatured', String(data.isFeatured));
    if (data.isNew !== undefined) formData.append('isNew', String(data.isNew));
    if (data.isBestSeller !== undefined) formData.append('isBestSeller', String(data.isBestSeller));

    // Arrays as JSON strings
    if (data.ingredients && data.ingredients.length > 0) {
      formData.append('ingredients', JSON.stringify(data.ingredients));
    }
    if (data.skinTypes && data.skinTypes.length > 0) {
      formData.append('skinTypes', JSON.stringify(data.skinTypes));
    }
    if (data.conditionsTreated && data.conditionsTreated.length > 0) {
      formData.append('conditionsTreated', JSON.stringify(data.conditionsTreated));
    }
    if (data.benefits && data.benefits.length > 0) {
      formData.append('benefits', JSON.stringify(data.benefits));
    }
    if (data.tags && data.tags.length > 0) {
      formData.append('tags', JSON.stringify(data.tags));
    }

    // Dimensions as JSON string
    if (data.dimensions) {
      formData.append('dimensions', JSON.stringify(data.dimensions));
    }

    // Add images (up to 10)
    if (images && images.length > 0) {
      images.slice(0, 10).forEach(image => {
        formData.append('images', image);
      });
    }

    const response = await apiService.post<Product>('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Update product
  updateProduct: async (id: string, data: Partial<ProductFormData>, images?: File[]): Promise<Product> => {
    const formData = new FormData();

    // Only add fields that are actually defined (not undefined)
    // Use strict checks to allow empty strings, 0, false, null, etc. but not undefined
    if (data.sku !== undefined) formData.append('sku', data.sku);
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.slug !== undefined) formData.append('slug', data.slug);
    if (data.price !== undefined) formData.append('price', String(data.price));
    if (data.categoryId !== undefined) formData.append('categoryId', data.categoryId);
    if (data.shortDescription !== undefined) formData.append('shortDescription', data.shortDescription || '');
    if (data.longDescription !== undefined) formData.append('longDescription', data.longDescription || '');
    if (data.compareAtPrice !== undefined) formData.append('compareAtPrice', String(data.compareAtPrice));
    if (data.brandName !== undefined) formData.append('brandName', data.brandName || '');
    if (data.usageInstructions !== undefined) formData.append('usageInstructions', data.usageInstructions || '');
    if (data.warnings !== undefined) formData.append('warnings', data.warnings || '');
    if (data.stockQuantity !== undefined) formData.append('stockQuantity', String(data.stockQuantity));
    if (data.lowStockThreshold !== undefined) formData.append('lowStockThreshold', String(data.lowStockThreshold));
    if (data.weightGrams !== undefined) formData.append('weightGrams', String(data.weightGrams));
    if (data.metaTitle !== undefined) formData.append('metaTitle', data.metaTitle || '');
    if (data.metaDescription !== undefined) formData.append('metaDescription', data.metaDescription || '');

    // Booleans as strings (only if defined)
    if (data.requiresPrescription !== undefined) formData.append('requiresPrescription', String(data.requiresPrescription));
    if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
    if (data.isFeatured !== undefined) formData.append('isFeatured', String(data.isFeatured));
    if (data.isNew !== undefined) formData.append('isNew', String(data.isNew));
    if (data.isBestSeller !== undefined) formData.append('isBestSeller', String(data.isBestSeller));

    // Arrays as JSON strings (only if defined)
    if (data.ingredients !== undefined) formData.append('ingredients', JSON.stringify(data.ingredients || []));
    if (data.skinTypes !== undefined) formData.append('skinTypes', JSON.stringify(data.skinTypes || []));
    if (data.conditionsTreated !== undefined) formData.append('conditionsTreated', JSON.stringify(data.conditionsTreated || []));
    if (data.benefits !== undefined) formData.append('benefits', JSON.stringify(data.benefits || []));
    if (data.tags !== undefined) formData.append('tags', JSON.stringify(data.tags || []));
    if (data.dimensions !== undefined) formData.append('dimensions', JSON.stringify(data.dimensions));

    // Add new images (appended to existing ones)
    if (images && images.length > 0) {
      images.slice(0, 10).forEach(image => {
        formData.append('images', image);
      });
    }

    const response = await apiService.put<Product>(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data;
  },

  // Delete product
  deleteProduct: async (id: string): Promise<void> => {
    await apiService.delete(`/products/${id}`);
  },

  // Upload product image
  uploadProductImage: async (
    productId: string,
    file: File,
    options?: { altText?: string; isPrimary?: boolean; sortOrder?: number }
  ): Promise<ProductImage> => {
    const formData = new FormData();
    formData.append('image', file);
    if (options?.altText) formData.append('altText', options.altText);
    if (options?.isPrimary !== undefined) formData.append('isPrimary', String(options.isPrimary));
    if (options?.sortOrder !== undefined) formData.append('sortOrder', String(options.sortOrder));

    const response = await apiService.post<ProductImage>(
      `/products/${productId}/images`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  // Delete product image
  deleteProductImage: async (productId: string, imageId: string): Promise<void> => {
    await apiService.delete(`/products/${productId}/images/${imageId}`);
  },
};

export default productService;
