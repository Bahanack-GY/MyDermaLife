/**
 * Prescriptions API
 * Handles prescription creation and management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import { API_ENDPOINTS, QUERY_KEYS } from '../config';
import type { Prescription, PrescriptionMedicine, PaginatedResponse, PaginationParams } from '../types';

// Request types
export interface CreatePrescriptionRequest {
    patientId: string;
    consultationId?: string;
    diagnosis: string;
    medications: Omit<PrescriptionMedicine, 'id'>[];
    notes?: string;
}

// API functions
export const prescriptionsApi = {
    /**
     * Get list of prescriptions
     */
    getPrescriptions: async (params?: PaginationParams & { patientId?: string }): Promise<PaginatedResponse<Prescription>> => {
        const response = await apiClient.get<PaginatedResponse<Prescription>>(
            API_ENDPOINTS.prescriptions.list,
            { params }
        );
        return response.data;
    },

    /**
     * Get prescription details
     */
    getPrescription: async (id: string): Promise<Prescription> => {
        const response = await apiClient.get<Prescription>(
            API_ENDPOINTS.prescriptions.detail(id)
        );
        return response.data;
    },

    /**
     * Create a new prescription
     */
    createPrescription: async (data: CreatePrescriptionRequest): Promise<Prescription> => {
        const response = await apiClient.post<Prescription>(
            API_ENDPOINTS.prescriptions.create,
            data
        );
        return response.data;
    },

    /**
     * Send prescription to patient (email/app)
     */
    sendPrescription: async (id: string): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.prescriptions.send(id));
    },

    /**
     * Download prescription PDF
     */
    downloadPrescription: async (id: string): Promise<Blob> => {
        const response = await apiClient.get(
            API_ENDPOINTS.prescriptions.download(id),
            { responseType: 'blob' }
        );
        return response.data;
    },
};

// React Query hooks

/**
 * Hook to get prescriptions list
 */
export const usePrescriptions = (params?: PaginationParams & { patientId?: string }) => {
    return useQuery({
        queryKey: [...QUERY_KEYS.prescriptions, params],
        queryFn: () => prescriptionsApi.getPrescriptions(params),
    });
};

/**
 * Hook to get prescription details
 */
export const usePrescription = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.prescription(id),
        queryFn: () => prescriptionsApi.getPrescription(id),
        enabled: !!id,
    });
};

/**
 * Hook to create prescription
 */
export const useCreatePrescription = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: prescriptionsApi.createPrescription,
        onSuccess: (data) => {
            queryClient.setQueryData(QUERY_KEYS.prescription(data.id), data);
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.prescriptions });
            // Invalidate dashboard activity
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'recentActivity'] });
        },
    });
};

/**
 * Hook to send prescription
 */
export const useSendPrescription = () => {
    return useMutation({
        mutationFn: prescriptionsApi.sendPrescription,
    });
};

export default prescriptionsApi;
