import apiClient, { tokenManager } from '../client';
import { API_ENDPOINTS } from '../config';
import type { LoginResponse, User, RegisterData } from '../types';

export interface LoginCredentials {
    email: string;
    password: string;
}

// Note: The axios response interceptor already unwraps response.data
// (and response.data.data if nested), so apiClient calls return the final data directly.
export const authApi = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const result = await apiClient.post(API_ENDPOINTS.auth.login, credentials) as unknown as LoginResponse;
        const { accessToken, refreshToken, user } = result;

        // Validate that the user is a patient (not a doctor)
        if (user.role === 'doctor') {
            throw new Error('Doctors cannot login to the patient interface. Please use the doctor portal.');
        }

        tokenManager.setTokens(accessToken, refreshToken);
        tokenManager.setProfile(user);
        return result;
    },

    register: async (data: RegisterData): Promise<LoginResponse> => {
        const result = await apiClient.post(API_ENDPOINTS.auth.register, data) as unknown as LoginResponse;
        const { accessToken, refreshToken, user } = result;
        tokenManager.setTokens(accessToken, refreshToken);
        tokenManager.setProfile(user);
        return result;
    },

    logout: async () => {
        try {
            await apiClient.post(API_ENDPOINTS.auth.logout);
        } finally {
            tokenManager.clearTokens();
            tokenManager.clearProfile();
        }
    },

    getProfile: async (): Promise<User> => {
        return apiClient.get(API_ENDPOINTS.auth.profile) as unknown as Promise<User>;
    },
};
