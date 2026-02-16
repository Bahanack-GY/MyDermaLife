import { apiService } from './api.service';

export type DeliveryStatus = 'preparing' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';

export interface DeliveryAddress {
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
}

export interface DeliveryItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
}

export interface Delivery {
  id: string;
  orderId: string;
  orderNumber: string;
  status: DeliveryStatus;
  deliveryAddress: DeliveryAddress;
  items: DeliveryItem[];
  assignedToId: string | null;
  notes: string | null;
  proofOfDelivery: {
    imageUrl: string | null;
    signature: string | null;
    notes: string | null;
    deliveredAt: string | null;
  } | null;
  assignedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  order?: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    currency: string;
  };
}

export interface DeliveryListResponse {
  data: Delivery[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateDeliveryStatusData {
  status: DeliveryStatus;
  notes?: string;
}

export interface UploadProofData {
  image?: File;
  signature?: string;
  notes?: string;
}

// Admin Stats
export interface AdminDeliveryStats {
  overview: {
    totalShipments: number;
    activeDeliveries: number;
    unassigned: number;
    failedRate: number;
    avgDeliveryTimeHours: number;
  };
  byStatus: {
    preparing: number;
    in_transit: number;
    out_for_delivery: number;
    delivered: number;
    failed: number;
  };
  period: {
    todayNewShipments: number;
    todayDeliveries: number;
    weekDeliveries: number;
    monthDeliveries: number;
  };
  topDrivers: Array<{
    driver: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
    };
    deliveryCount: number;
  }>;
  recentDeliveries: Delivery[];
}

// Driver Stats
export interface DriverStats {
  totalAssigned: number;
  completed: number;
  active: number;
  failed: number;
  pendingPickups: number;
  successRate: number;
  avgDeliveryTimeHours: number;
  today: {
    completed: number;
  };
  month: {
    completed: number;
  };
}

export const deliveryService = {
  // Get admin stats
  getAdminStats: async (): Promise<AdminDeliveryStats> => {
    const response = await apiService.get<AdminDeliveryStats>('/deliveries/stats');
    console.log('[DeliveryService] Admin stats:', response.data);
    return response.data;
  },

  // Get driver stats
  getDriverStats: async (): Promise<DriverStats> => {
    const response = await apiService.get<DriverStats>('/deliveries/my-stats');
    console.log('[DeliveryService] Driver stats:', response.data);
    return response.data;
  },

  // Get my assigned deliveries
  getMyAssignments: async (params?: { page?: number; limit?: number; status?: DeliveryStatus }): Promise<DeliveryListResponse> => {
    const response = await apiService.get<DeliveryListResponse>('/deliveries/my-assignments', { params });
    console.log('[DeliveryService] My assignments:', response.data);
    return response.data;
  },

  // Get delivery by ID
  getDeliveryById: async (id: string): Promise<Delivery> => {
    const response = await apiService.get<Delivery>(`/deliveries/${id}`);
    console.log('[DeliveryService] Delivery details:', response.data);
    return response.data;
  },

  // Update delivery status
  updateDeliveryStatus: async (id: string, data: UpdateDeliveryStatusData): Promise<Delivery> => {
    const response = await apiService.put<Delivery>(`/deliveries/${id}/status`, data);
    console.log('[DeliveryService] Status updated:', response.data);
    return response.data;
  },

  // Upload proof of delivery
  uploadProof: async (id: string, data: UploadProofData): Promise<Delivery> => {
    const formData = new FormData();

    if (data.image) {
      formData.append('image', data.image);
    }
    if (data.signature) {
      formData.append('signature', data.signature);
    }
    if (data.notes) {
      formData.append('notes', data.notes);
    }

    const response = await apiService.put<Delivery>(`/deliveries/${id}/proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('[DeliveryService] Proof uploaded:', response.data);
    return response.data;
  },
};

export default deliveryService;
