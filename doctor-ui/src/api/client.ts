/**
 * Axios Client Configuration
 * Pre-configured Axios instance with interceptors for authentication and error handling
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { API_BASE_URL } from './config';
import i18n from '../i18n';

// Token storage keys
const ACCESS_TOKEN_KEY = 'doctor_access_token';
const REFRESH_TOKEN_KEY = 'doctor_refresh_token';
const DOCTOR_PROFILE_KEY = 'doctor_profile_data';

// Create axios instance with default config
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token management utilities
export const tokenManager = {
    getAccessToken: (): string | null => {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    getRefreshToken: (): string | null => {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    setTokens: (accessToken: string, refreshToken?: string): void => {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        if (refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
    },

    clearTokens: (): void => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    setProfile: (profile: any): void => {
        localStorage.setItem(DOCTOR_PROFILE_KEY, JSON.stringify(profile));
    },

    getProfile: (): any | null => {
        const profile = localStorage.getItem(DOCTOR_PROFILE_KEY);
        try {
            return profile ? JSON.parse(profile) : null;
        } catch (e) {
            return null;
        }
    },

    clearProfile: (): void => {
        localStorage.removeItem(DOCTOR_PROFILE_KEY);
    },
};

// Request interceptor - adds auth token to requests
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenManager.getAccessToken();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handles token refresh and errors
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = tokenManager.getRefreshToken();

                if (refreshToken) {
                    // Attempt to refresh the token
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { accessToken, refreshToken: newRefreshToken } = response.data;
                    tokenManager.setTokens(accessToken, newRefreshToken);

                    // Retry the original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    }

                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - clear tokens and redirect to login
                tokenManager.clearTokens();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        return Promise.reject(error);
    }
);

// API Error type for consistent error handling
export interface ApiError {
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
}

// Helper to extract error message from API response
export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        // Network Error
        if (error.code === 'ERR_NETWORK') {
            return i18n.t('errors.networkError');
        }

        const status = error.response?.status;

        // 401 Unauthorized
        if (status === 401) {
            return i18n.t('errors.unauthorized');
        }

        // 404 Not Found
        if (status === 404) {
            return i18n.t('errors.notFound');
        }

        // 500+ Server Errors
        if (status && status >= 500) {
            return i18n.t('errors.serverError');
        }
    }

    // Default generic error
    return i18n.t('errors.generic');
};

export default apiClient;
