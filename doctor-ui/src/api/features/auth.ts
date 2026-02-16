/**
 * Authentication API
 * Handles login, logout, token refresh, and profile management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient, { tokenManager } from '../client';
import { API_ENDPOINTS, QUERY_KEYS } from '../config';
import type { Doctor } from '../types';

// Request/Response types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    doctor: Doctor;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
    confirmPassword: string;
}

// API functions
export const authApi = {
    /**
     * Doctor login
     */
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>(
            API_ENDPOINTS.auth.login,
            credentials
        );

        // Store tokens on successful login
        tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
        tokenManager.setProfile(response.data.doctor);

        return response.data;
    },

    /**
     * Logout and clear tokens
     */
    logout: async (): Promise<void> => {
        try {
            await apiClient.post(API_ENDPOINTS.auth.logout);
        } finally {
            tokenManager.clearTokens();
            tokenManager.clearProfile();
        }
    },

    /**
     * Get current doctor profile
     */
    getProfile: async (): Promise<Doctor> => {
        const response = await apiClient.get<Doctor>(API_ENDPOINTS.auth.profile);
        // Update stored profile with fresh data
        tokenManager.setProfile(response.data);
        return response.data;
    },

    /**
     * Request password reset
     */
    forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.auth.forgotPassword, data);
    },

    /**
     * Reset password with token
     */
    resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.auth.resetPassword, data);
    },

    /**
     * Update profile photo
     */
    updateProfilePhoto: async (base64Image: string): Promise<any> => {
        const response = await apiClient.patch(API_ENDPOINTS.auth.updateProfilePhoto, {
            profilePhoto: base64Image
        });
        return response.data;
    },
};

// React Query hooks

/**
 * Hook to get current doctor profile
 */
export const useProfile = () => {
    return useQuery({
        queryKey: QUERY_KEYS.profile,
        queryFn: authApi.getProfile,
        enabled: tokenManager.isAuthenticated(),
        staleTime: Infinity,
        gcTime: Infinity,
        initialData: tokenManager.getProfile() || undefined,
    });
};

/**
 * Hook for login mutation
 */
export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            // Cache the doctor profile data
            queryClient.setQueryData(QUERY_KEYS.profile, data.doctor);
        },
    });
};

/**
 * Hook for logout mutation
 */
export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            // Clear all cached data on logout
            queryClient.clear();
        },
    });
};

/**
 * Hook for forgot password mutation
 */
export const useForgotPassword = () => {
    return useMutation({
        mutationFn: authApi.forgotPassword,
    });
};

/**
 * Hook for reset password mutation
 */
export const useResetPassword = () => {
    return useMutation({
        mutationFn: authApi.resetPassword,
    });
};

/**
 * Hook for updating profile photo
 */
export const useUpdateProfilePhoto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: authApi.updateProfilePhoto,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
        },
    });
};

export default authApi;
