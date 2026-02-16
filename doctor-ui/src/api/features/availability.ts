/**
 * Availability API
 * Handles doctor's schedule availability management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import { API_ENDPOINTS, QUERY_KEYS } from '../config';
import type { AvailabilitySlot, DayAvailability } from '../types';

// Request types
export interface UpdateAvailabilityRequest {
    date: string;
    slots: { start: string; end: string }[];
}

export interface UpdateGlobalSettingsRequest {
    workingHours: {
        start: string;
        end: string;
    };
    details: {
        slotDuration: number;
        daysOfWeek: number[]; // 0-6 (Sun-Sat)
    };
}

// API functions
export const availabilityApi = {
    /**
     * Get availability slots for a specific date
     */
    getAvailabilityByDate: async (date: string): Promise<DayAvailability> => {
        const response = await apiClient.get<DayAvailability>(
            API_ENDPOINTS.availability.byDate(date)
        );
        return response.data;
    },

    /**
     * Get free slots for a specific date (publicly available slots)
     */
    getSlots: async (date: string): Promise<AvailabilitySlot[]> => {
        const response = await apiClient.get<AvailabilitySlot[]>(
            API_ENDPOINTS.availability.slots(date)
        );
        return response.data;
    },

    /**
     * Update availability for a specific date
     */
    updateAvailability: async (data: UpdateAvailabilityRequest): Promise<DayAvailability> => {
        const response = await apiClient.post<DayAvailability>(
            API_ENDPOINTS.availability.update,
            data
        );
        return response.data;
    },

    /**
     * Update global availability settings
     */
    updateGlobalSettings: async (data: UpdateGlobalSettingsRequest): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.availability.globalSettings, data);
    },
};

// React Query hooks

/**
 * Hook to get availability for a specific date (Doctor view)
 */
export const useAvailabilityByDate = (date: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.availabilityByDate(date),
        queryFn: () => availabilityApi.getAvailabilityByDate(date),
        enabled: !!date,
    });
};

/**
 * Hook to get free slots for a specific date
 */
export const useAvailabilitySlots = (date: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.availabilitySlots(date),
        queryFn: () => availabilityApi.getSlots(date),
        enabled: !!date,
    });
};

/**
 * Hook to update availability for a date
 */
export const useUpdateAvailability = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: availabilityApi.updateAvailability,
        onSuccess: (data) => {
            queryClient.setQueryData(QUERY_KEYS.availabilityByDate(data.date), data);
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.availabilitySlots(data.date)
            });
        },
    });
};

/**
 * Hook to update global availability settings
 */
export const useUpdateGlobalSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: availabilityApi.updateGlobalSettings,
        onSuccess: () => {
            // Invalidate all availability queries as global settings affect everything
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.availability });
        },
    });
};

export default availabilityApi;
