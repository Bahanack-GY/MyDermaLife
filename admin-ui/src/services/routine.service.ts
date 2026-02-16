import { apiService } from './api.service';

export interface RoutineProduct {
  stepOrder: number;
  stepLabel: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    primaryImage: string | null;
  };
}

export interface Routine {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  products?: RoutineProduct[];
  createdAt: string;
  updatedAt: string;
}

export interface RoutineListParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface RoutineListResponse {
  data: Routine[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RoutineProductItem {
  productId: string;
  stepOrder: number;
  stepLabel: string;
}

export interface CreateRoutineDto {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  items?: RoutineProductItem[];
}

export interface UpdateRoutineDto {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  items?: RoutineProductItem[];
}

export interface ReplaceProductsDto {
  items: RoutineProductItem[];
}

export interface AddProductDto {
  productId: string;
  stepOrder: number;
  stepLabel: string;
}

export const routineService = {
  // Public: Get all routines with filters
  getRoutines: async (params?: RoutineListParams): Promise<RoutineListResponse> => {
    const response = await apiService.get<RoutineListResponse>('/routines', { params });
    return response.data;
  },

  // Public: Get single routine by ID or slug
  getRoutineById: async (idOrSlug: string): Promise<Routine> => {
    const response = await apiService.get<Routine>(`/routines/${idOrSlug}`);
    return response.data;
  },

  // Admin: Create routine (JSON or with image as multipart)
  createRoutine: async (data: CreateRoutineDto, image?: File): Promise<Routine> => {
    if (image) {
      // Create with image using multipart/form-data
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.slug) formData.append('slug', data.slug);
      if (data.description) formData.append('description', data.description);
      if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
      if (data.items && data.items.length > 0) {
        formData.append('items', JSON.stringify(data.items));
      }
      formData.append('image', image);

      const response = await apiService.post<Routine>('/routines', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } else {
      // Create without image using JSON
      const response = await apiService.post<Routine>('/routines', data);
      return response.data;
    }
  },

  // Admin: Update routine
  updateRoutine: async (id: string, data: UpdateRoutineDto, image?: File): Promise<Routine> => {
    if (image) {
      // Update with image using multipart/form-data
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.slug) formData.append('slug', data.slug);
      if (data.description !== undefined) formData.append('description', data.description);
      if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
      if (data.items !== undefined) {
        formData.append('items', JSON.stringify(data.items));
      }
      formData.append('image', image);

      const response = await apiService.put<Routine>(`/routines/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } else {
      // Update without image using JSON
      const response = await apiService.put<Routine>(`/routines/${id}`, data);
      return response.data;
    }
  },

  // Admin: Delete routine (soft delete)
  deleteRoutine: async (id: string): Promise<void> => {
    await apiService.delete(`/routines/${id}`);
  },

  // Admin: Replace all products in routine
  replaceProducts: async (routineId: string, data: ReplaceProductsDto): Promise<Routine> => {
    const response = await apiService.put<Routine>(`/routines/${routineId}/products`, data);
    return response.data;
  },

  // Admin: Add one product to routine
  addProduct: async (routineId: string, data: AddProductDto): Promise<Routine> => {
    const response = await apiService.post<Routine>(`/routines/${routineId}/products`, data);
    return response.data;
  },

  // Admin: Remove one product from routine
  removeProduct: async (routineId: string, productId: string): Promise<Routine> => {
    const response = await apiService.delete<Routine>(`/routines/${routineId}/products/${productId}`);
    return response.data;
  },

  // Admin: Upload image for routine
  uploadImage: async (routineId: string, image: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', image);

    const response = await apiService.post<{ imageUrl: string }>(
      `/routines/${routineId}/image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  // Admin: Delete image from routine
  deleteImage: async (routineId: string): Promise<void> => {
    await apiService.delete(`/routines/${routineId}/image`);
  },
};

export default routineService;
