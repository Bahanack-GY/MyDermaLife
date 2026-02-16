/**
 * Consultations API
 * Handles active consultation management, notes, and photos
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import { API_ENDPOINTS, QUERY_KEYS } from '../config';
import type { Consultation, PaginationParams, PaginatedResponse } from '../types';

// Request types
export interface CreateConsultationRequest {
    patientId: string;
    appointmentId?: string;
    chiefComplaint: string;
}

export interface UpdateConsultationRequest {
    chiefComplaint?: string;
    observations?: string;
    diagnosis?: string;
    treatment?: string;
    notes?: string;
}

export interface CompleteConsultationRequest {
    summary: string;
    followUpRequired: boolean;
    followUpDate?: string;
}

// API functions
export const consultationsApi = {
    /**
     * Get list of consultation history
     */
    getConsultations: async (params?: PaginationParams): Promise<PaginatedResponse<Consultation>> => {
        const response = await apiClient.get<PaginatedResponse<Consultation>>(
            API_ENDPOINTS.consultations.list,
            { params }
        );
        return response.data;
    },

    /**
     * Get consultation details
     */
    getConsultation: async (id: string): Promise<Consultation> => {
        const response = await apiClient.get<Consultation>(
            API_ENDPOINTS.consultations.detail(id)
        );
        return response.data;
    },

    /**
     * Create a new consultation (Start consultation)
     */
    createConsultation: async (data: CreateConsultationRequest): Promise<Consultation> => {
        const response = await apiClient.post<Consultation>(
            API_ENDPOINTS.consultations.create,
            data
        );
        return response.data;
    },

    /**
     * Update consultation notes/data during session
     */
    updateConsultation: async (id: string, data: UpdateConsultationRequest): Promise<Consultation> => {
        const response = await apiClient.patch<Consultation>(
            API_ENDPOINTS.consultations.update(id),
            data
        );
        return response.data;
    },

    /**
     * Complete/End consultation
     */
    completeConsultation: async (id: string, data?: CompleteConsultationRequest): Promise<Consultation> => {
        const response = await apiClient.post<Consultation>(
            API_ENDPOINTS.consultations.complete(id),
            data
        );
        return response.data;
    },

    /**
     * Get AI diagnosis suggestions
     */
    getAiDiagnosis: async (id: string): Promise<{ diagnosis: string; confidence: number; reasoning: string }[]> => {
        const response = await apiClient.get(API_ENDPOINTS.consultations.diagnosis(id));
        return response.data;
    },

    /**
     * Upload consultation audio recording
     */
    uploadRecording: async (id: string, blob: Blob): Promise<void> => {
        const formData = new FormData();
        formData.append('file', blob, `recording-${id}.webm`);
        await apiClient.post(API_ENDPOINTS.consultations.recording(id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 300000, // 5 min timeout for large files
        });
    },
};

// React Query hooks

/**
 * Hook to get consultation list
 */
export const useConsultations = (params?: PaginationParams) => {
    return useQuery({
        queryKey: [...QUERY_KEYS.consultations, params],
        queryFn: () => consultationsApi.getConsultations(params),
    });
};

/**
 * Hook to get consultation details
 */
export const useConsultation = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.consultation(id),
        queryFn: () => consultationsApi.getConsultation(id),
        enabled: !!id,
    });
};

/**
 * Hook to start a new consultation
 */
export const useCreateConsultation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: consultationsApi.createConsultation,
        onSuccess: (data) => {
            queryClient.setQueryData(QUERY_KEYS.consultation(data.id), data);
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.consultations });
            // If it originated from an appointment, invalidate appointments too
            if (data.appointmentId) {
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
            }
        },
    });
};

/**
 * Hook to update consultation
 */
export const useUpdateConsultation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateConsultationRequest }) =>
            consultationsApi.updateConsultation(id, data),
        onSuccess: (data) => {
            queryClient.setQueryData(QUERY_KEYS.consultation(data.id), data);
        },
    });
};

/**
 * Hook to complete consultation
 */
export const useCompleteConsultation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data?: CompleteConsultationRequest }) =>
            consultationsApi.completeConsultation(id, data),
        onSuccess: (data) => {
            queryClient.setQueryData(QUERY_KEYS.consultation(data.id), data);
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            // Invalidate patients list to update last visit
            queryClient.invalidateQueries({ queryKey: ['patients'] });
        },
    });
};

/**
 * Hook to get AI diagnosis
 */
export const useAiDiagnosis = (consultationId: string) => {
    return useQuery({
        queryKey: ['consultations', consultationId, 'aiDiagnosis'],
        queryFn: () => consultationsApi.getAiDiagnosis(consultationId),
        enabled: !!consultationId,
        staleTime: Infinity, // Diagnosis suggestions unlikely to change for same consult unless new data added
    });
};

export default consultationsApi;
