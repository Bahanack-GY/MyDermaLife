import { apiClient } from '../client';
import type { Doctor } from '../types';

export const doctorsApi = {
    // Note: The axios response interceptor already unwraps response.data,
    // and if it has a nested 'data' field, it returns response.data.data.
    // So apiClient.get() returns the final data directly.
    getAll: async (): Promise<Doctor[]> => {
        return apiClient.get('/doctors') as unknown as Promise<Doctor[]>;
    },

    getById: async (id: string): Promise<Doctor> => {
        return apiClient.get(`/doctors/${id}`) as unknown as Promise<Doctor>;
    },

    getBookedSlots: async (id: string, date: string): Promise<string[]> => {
        return apiClient.get(`/doctors/${id}/booked-slots`, {
            params: { date }
        }) as unknown as Promise<string[]>;
    }
};
