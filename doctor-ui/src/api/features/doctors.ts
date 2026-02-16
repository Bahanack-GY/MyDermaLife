// Doctors API feature
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import { tokenManager } from '../client';
import { API_ENDPOINTS } from '../config';

// Types
export interface AvailabilitySlot {
    id?: string;
    dayOfWeek: number; // 0-6
    date?: string; // YYYY-MM-DD for specific date exceptions
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    isAvailable?: boolean;
}

export interface UpdateAvailabilityDto {
    slots: AvailabilitySlot[];
}

export interface UpdateDoctorProfileDto {
    licenseNumber?: string;
    specialization?: string;
    yearsOfExperience?: number;
    bio?: string;
    languagesSpoken?: string[];
    consultationFee?: number;
    videoConsultationFee?: number;
    signature?: string;
}

export const doctorsApi = {
    getMyAvailability: async () => {
        const response = await apiClient.get<AvailabilitySlot[]>('/doctors/me/availability');
        return response.data;
    },

    updateMyAvailability: async (data: UpdateAvailabilityDto) => {
        const response = await apiClient.put<AvailabilitySlot[]>('/doctors/me/availability', data);
        return response.data;
    },

    deleteMyAvailabilitySlot: async (slotId: string) => {
        const response = await apiClient.delete(`/doctors/me/availability/${slotId}`);
        return response.data;
    },

    updateMyProfile: async (data: UpdateDoctorProfileDto) => {
        const response = await apiClient.put('/doctors/me', data);
        return response.data;
    },

    syncStats: async () => {
        const response = await apiClient.post(API_ENDPOINTS.consultations.syncStats);
        return response.data;
    },
};

export const useMyAvailability = () => {
    return useQuery({
        queryKey: ['my-availability'],
        queryFn: doctorsApi.getMyAvailability,
        enabled: tokenManager.isAuthenticated(),
    });
};

export const useUpdateMyAvailability = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: doctorsApi.updateMyAvailability,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-availability'] });
        },
    });
};

export const useDeleteMyAvailabilitySlot = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: doctorsApi.deleteMyAvailabilitySlot,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-availability'] });
        },
    });
};

export const useUpdateDoctorProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: doctorsApi.updateMyProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
        },
    });
};

export const useSyncStats = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: doctorsApi.syncStats,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
        },
    });
};
