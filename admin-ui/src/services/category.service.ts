import { apiService } from './api.service';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentCategoryId: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  subcategories?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
  slug?: string;
  description?: string;
  parentCategoryId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export const categoryService = {
  // Get all categories (tree structure)
  getCategories: async (): Promise<Category[]> => {
    const response = await apiService.get<Category[]>('/categories');
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<Category> => {
    const response = await apiService.get<Category>(`/categories/${id}`);
    return response.data;
  },

  // Create category
  createCategory: async (data: CategoryFormData, image?: File): Promise<Category> => {
    const formData = new FormData();

    // Add required fields
    formData.append('name', data.name);

    // Add optional fields
    if (data.slug) formData.append('slug', data.slug);
    if (data.description) formData.append('description', data.description);

    // Only add parentCategoryId if it has a value (not null/empty)
    if (data.parentCategoryId && data.parentCategoryId !== '') {
      formData.append('parentCategoryId', data.parentCategoryId);
    }

    if (data.sortOrder !== undefined) formData.append('sortOrder', String(data.sortOrder));
    if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));

    // Add image if provided
    if (image) {
      formData.append('image', image);
    }

    console.log('[CategoryService] Creating category with data:', {
      name: data.name,
      fields: Array.from(formData.keys()),
      hasImage: !!image
    });

    const response = await apiService.post<Category>('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Update category
  updateCategory: async (id: string, data: Partial<CategoryFormData>, image?: File): Promise<Category> => {
    const formData = new FormData();

    // Add all fields (only if they exist)
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.slug !== undefined) formData.append('slug', data.slug);
    if (data.description !== undefined) formData.append('description', data.description);

    // Handle parentCategoryId - can be null for main categories
    if (data.parentCategoryId !== undefined) {
      if (data.parentCategoryId === null || data.parentCategoryId === '') {
        // Don't append anything for null/empty parent (main category)
      } else {
        formData.append('parentCategoryId', data.parentCategoryId);
      }
    }

    if (data.sortOrder !== undefined) formData.append('sortOrder', String(data.sortOrder));
    if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));

    // Add image if provided
    if (image) {
      formData.append('image', image);
    }

    console.log('[CategoryService] Updating category with data:', {
      id,
      fields: Array.from(formData.keys()),
      hasImage: !!image
    });

    const response = await apiService.put<Category>(`/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Delete category
  deleteCategory: async (id: string): Promise<void> => {
    await apiService.delete(`/categories/${id}`);
  },

  // Upload category image
  uploadCategoryImage: async (categoryId: string, file: File): Promise<Category> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiService.post<Category>(
      `/categories/${categoryId}/image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  // Delete category image
  deleteCategoryImage: async (categoryId: string): Promise<void> => {
    await apiService.delete(`/categories/${categoryId}/image`);
  },
};

export default categoryService;
