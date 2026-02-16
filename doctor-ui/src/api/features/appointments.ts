/**
 * Appointments API
 * Handles agenda, scheduling, and appointment management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import { API_ENDPOINTS, QUERY_KEYS } from '../config';
import type { Appointment } from '../types';

// Request types
export interface CreateAppointmentRequest {
    patientId: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    type: 'FirstConsultation' | 'FollowUp' | 'Dermatoscopy' | 'LaserTreatment' | 'Telemedicine';
    notes?: string;
}

export interface RescheduleAppointmentRequest {
    date: string;
    startTime: string;
}

// API functions
export const appointmentsApi = {
    /**
     * Get appointments for a specific date
     */
    getAppointmentsByDate: async (date: string): Promise<Appointment[]> => {
        const response = await apiClient.get<Appointment[]>(
            API_ENDPOINTS.appointments.byDate(date)
        );
        return response.data;
    },

    /**
     * Get upcoming appointments
     */
    getUpcomingAppointments: async (limit: number = 20): Promise<Appointment[]> => {
        const response = await apiClient.get<Appointment[]>(
            API_ENDPOINTS.appointments.upcoming,
            { params: { limit } }
        );
        return response.data;
    },

    /**
     * Get appointment details
     */
    getAppointment: async (id: string): Promise<Appointment> => {
        const response = await apiClient.get<Appointment>(
            API_ENDPOINTS.appointments.detail(id)
        );
        return response.data;
    },

    /**
     * Create a new appointment
     */
    createAppointment: async (data: CreateAppointmentRequest): Promise<Appointment> => {
        const response = await apiClient.post<Appointment>(
            API_ENDPOINTS.appointments.create,
            data
        );
        return response.data;
    },

    /**
     * Cancel an appointment
     */
    cancelAppointment: async (id: string, reason?: string): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.appointments.cancel(id), { reason });
    },

    /**
     * Reschedule an appointment
     */
    rescheduleAppointment: async (id: string, data: RescheduleAppointmentRequest): Promise<Appointment> => {
        const response = await apiClient.post<Appointment>(
            API_ENDPOINTS.appointments.reschedule(id),
            data
        );
        return response.data;
    },
};

// React Query hooks

/**
 * Hook to get appointments for a specific date
 */
export const useAppointmentsByDate = (date: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.appointmentsByDate(date),
        queryFn: () => appointmentsApi.getAppointmentsByDate(date),
        enabled: !!date,
    });
};

/**
 * Hook to get upcoming appointments
 */
export const useUpcomingAppointments = (limit: number = 20) => {
    return useQuery({
        queryKey: ['appointments', 'upcoming', limit],
        queryFn: () => appointmentsApi.getUpcomingAppointments(limit),
    });
};

/**
 * Hook to get appointment details
 */
export const useAppointment = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.appointment(id),
        queryFn: () => appointmentsApi.getAppointment(id),
        enabled: !!id,
    });
};

/**
 * Hook to create a new appointment
 */
export const useCreateAppointment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: appointmentsApi.createAppointment,
        onSuccess: (data) => {
            // Invalidate queries for the specific date
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.appointmentsByDate(data.date)
            });
            queryClient.invalidateQueries({
                queryKey: ['appointments', 'upcoming']
            });
            // Also invalidate dashboard stats and upcoming
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

/**
 * Hook to cancel an appointment
 */
export const useCancelAppointment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            appointmentsApi.cancelAppointment(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

/**
 * Hook to reschedule an appointment
 */
export const useRescheduleAppointment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: RescheduleAppointmentRequest }) =>
            appointmentsApi.rescheduleAppointment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
        },
    });
};

export default appointmentsApi;
