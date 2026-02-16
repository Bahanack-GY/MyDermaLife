/**
 * API Configuration
 * Central configuration file for all API-related settings
 */

// Base URL for the API - reads from environment variable with fallback to production
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.myderma.evols.online/api/v1';

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.myderma.evols.online/api/v1',
  BASE_IMAGE_URL: 'https://api.myderma.evols.online',
} as const;

// Utility function to build full image URLs
export const buildImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;

  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Build full URL from API base + path
  return `${API_CONFIG.BASE_IMAGE_URL}${imagePath}`;
};

// Utility to get image URL with fallback
export const getImageUrl = (
  imagePath: string | null | undefined,
  fallback: string = 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=400&h=500'
): string => {
  return buildImageUrl(imagePath) || fallback;
};

// API endpoints grouped by feature
export const API_ENDPOINTS = {
    // Auth endpoints
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        refresh: '/auth/refresh',
        profile: '/auth/profile',
        logout: '/auth/logout',
    },

    // Consultations endpoints
    consultations: {
        list: '/patient/consultations',
        detail: (id: string) => `/patient/consultations/${id}`,
        create: '/patient/consultations',
        update: (id: string) => `/patient/consultations/${id}`,
    },

    // Users endpoints
    users: {
        profilePhoto: '/users/profile/photo',
        medicalRecord: '/users/profile/medical-record',
        skinLogs: '/users/profile/skin-logs',
        skinLog: (id: string) => `/users/profile/skin-logs/${id}`,
    },
    prescriptions: {
        my: '/prescriptions/my',
        verify: (id: string) => `/prescriptions/verify/${id}`,
        download: (id: string) => `/prescriptions/download/${id}/public`,
    },
    patientConsultations: {
        my: '/patient-consultations/my',
        book: '/patient-consultations/book',
        accept: (id: string) => `/patient-consultations/${id}/accept`,
        reject: (id: string) => `/patient-consultations/${id}/reject`,
        join: (id: string) => `/patient-consultations/${id}/join`,
        leave: (id: string) => `/patient-consultations/${id}/leave`,
        detail: (id: string) => `/patient-consultations/${id}`,
        finish: (id: string) => `/patient-consultations/${id}/finish`,
    }
} as const;

// Query keys for TanStack Query caching
export const QUERY_KEYS = {
    // Auth
    profile: ['auth', 'profile'],
    skinLogs: ['users', 'skin-logs'],
    prescriptions: ['prescriptions', 'list'],
    myAppointments: ['consultations', 'my-appointments'],

    // Consultations
    consultations: ['consultations'],
    consultation: (id: string) => ['consultations', id],
    doctors: ['doctors'],
} as const;
