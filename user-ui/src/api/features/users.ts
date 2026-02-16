import apiClient from '../client';
import { API_ENDPOINTS } from '../config';
import type { User } from '../types';

// Note: The axios response interceptor already unwraps response.data
// (and response.data.data if nested), so apiClient calls return the final data directly.
export const usersApi = {
    updateProfilePhoto: async (profilePhoto: string): Promise<User> => {
        return apiClient.patch(API_ENDPOINTS.users.profilePhoto, {
            profilePhoto,
        }) as unknown as Promise<User>;
    },

    updateMedicalRecord: async (data: Partial<import('../types').MedicalRecord>): Promise<User> => {
        return apiClient.patch(API_ENDPOINTS.users.medicalRecord, data) as unknown as Promise<User>;
    },

    getSkinLogs: async (): Promise<import('../types').SkinLog[]> => {
        return apiClient.get(API_ENDPOINTS.users.skinLogs) as unknown as Promise<import('../types').SkinLog[]>;
    },

    createSkinLog: async (data: Partial<import('../types').SkinLog>): Promise<import('../types').SkinLog> => {
        return apiClient.post(API_ENDPOINTS.users.skinLogs, data) as unknown as Promise<import('../types').SkinLog>;
    },

    deleteSkinLog: async (id: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.users.skinLog(id));
    },
};
