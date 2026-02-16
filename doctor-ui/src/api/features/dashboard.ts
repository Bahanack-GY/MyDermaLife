import { useQuery } from '@tanstack/react-query';
import apiClient from '../client';
import { API_ENDPOINTS, QUERY_KEYS } from '../config';

export interface DashboardStats {
    todaysAppointments: number;
    totalPatients: number;
    totalConsultations: number;
    totalRevenue: number;
    patientsChange: number;
    appointmentsChange: number;
    revenueChange: number;
    consultationsChange: number;
}

// Types
export interface VisitStat {
    name: string;
    patients: number;
}

export interface UpcomingAppointment {
    id: string;
    time: string;
    patient: string;
    type: string;
    status: string;
}

export interface PathologyStat {
    name: string;
    value: number;
}

export interface RevenueStat {
    name: string;
    amount: number;
}

export const dashboardApi = {
    getStats: async (dateRange?: { startDate: string, endDate: string }): Promise<DashboardStats> => {
        const params = dateRange ? { startDate: dateRange.startDate, endDate: dateRange.endDate } : undefined;
        const response = await apiClient.get<DashboardStats>(API_ENDPOINTS.dashboard.stats, { params });
        return response.data;
    },
    // ... other methods unchanged
    getVisits: async (dateRange?: { startDate: string, endDate: string }): Promise<VisitStat[]> => {
        const params = dateRange ? { startDate: dateRange.startDate, endDate: dateRange.endDate } : undefined;
        const response = await apiClient.get<VisitStat[]>('/doctor/dashboard/visits', { params });
        return response.data;
    },
    getUpcoming: async (): Promise<UpcomingAppointment[]> => {
        const response = await apiClient.get<UpcomingAppointment[]>('/doctor/dashboard/upcoming');
        return response.data;
    },
    getPathologies: async (): Promise<PathologyStat[]> => {
        const response = await apiClient.get<PathologyStat[]>('/doctor/dashboard/pathologies');
        return response.data;
    },
    getRevenue: async (): Promise<RevenueStat[]> => {
        const response = await apiClient.get<RevenueStat[]>('/doctor/dashboard/revenue');
        return response.data;
    },
};

export const useDashboardStats = (dateRange?: { startDate: string, endDate: string }) => {
    return useQuery({
        queryKey: [...QUERY_KEYS.dashboardStats, dateRange],
        queryFn: () => dashboardApi.getStats(dateRange),
    });
};

export const useDashboardVisits = (dateRange?: { startDate: string, endDate: string }) => {
    return useQuery({
        queryKey: ['dashboard', 'visits', dateRange],
        queryFn: () => dashboardApi.getVisits(dateRange),
    });
};

export const useDashboardUpcoming = () => {
    return useQuery({
        queryKey: ['dashboard', 'upcoming'],
        queryFn: dashboardApi.getUpcoming,
    });
};

export const useDashboardPathologies = () => {
    return useQuery({
        queryKey: ['dashboard', 'pathologies'],
        queryFn: dashboardApi.getPathologies,
    });
};

export const useDashboardRevenue = () => {
    return useQuery({
        queryKey: ['dashboard', 'revenue'],
        queryFn: dashboardApi.getRevenue,
    });
};
