import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consultationsApi } from '../api/features/consultations';
import { QUERY_KEYS } from '../api/config';
import type { Consultation } from '../api/types';

/**
 * Hook to fetch all consultations for the current user
 */
export const useConsultations = () => {
    return useQuery({
        queryKey: QUERY_KEYS.consultations,
        queryFn: () => consultationsApi.getAll(),
    });
};

/**
 * Hook to fetch a single consultation by ID
 */
export const useConsultation = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.consultation(id),
        queryFn: () => consultationsApi.getById(id),
        enabled: !!id,
    });
};

/**
 * Hook to create a new consultation
 */
export const useCreateConsultation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { doctorId: string; consultationType: string; scheduledDate: string; chiefComplaint?: string }) => consultationsApi.book(data),
        onSuccess: () => {
            // Invalidate consultations list to refetch
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.consultations });
        },
    });
};

/**
 * Hook to update a consultation
 */
/**
 * Hook to update a consultation
 */
export const useUpdateConsultation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Consultation> }) =>
            consultationsApi.update(id, data),
        onSuccess: (_, variables) => {
            // Invalidate both the list and the specific consultation
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.consultations });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.consultation(variables.id) });
        },
    });
};

/**
 * Hook to fetch my appointments
 */
export const useMyAppointments = () => {
    return useQuery({
        queryKey: QUERY_KEYS.myAppointments,
        queryFn: () => consultationsApi.getMyAppointments(),
    });
};

/**
 * Hook to accept a consultation
 */
export const useAcceptConsultation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => consultationsApi.accept(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myAppointments });
        },
    });
};

/**
 * Hook to reject a consultation
 */
export const useRejectConsultation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => consultationsApi.reject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myAppointments });
        },
    });
};
