import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type { Prescription } from '../types';

// Note: The axios response interceptor already unwraps response.data
// (and response.data.data if nested), so apiClient calls return the final data directly.
export const prescriptionsApi = {
    getMyPrescriptions: async (): Promise<Prescription[]> => {
        return apiClient.get(API_ENDPOINTS.prescriptions.my) as unknown as Promise<Prescription[]>;
    },
};
