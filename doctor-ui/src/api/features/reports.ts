/**
 * Reports API
 * Handles report generation, viewing, and management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import { API_ENDPOINTS, QUERY_KEYS } from '../config';
import type { Report, PaginatedResponse, PaginationParams, DateRangeFilter } from '../types';

// Request types
export interface GenerateReportRequest {
    patientId: string;
    consultationId?: string;
    type: string;
    includeImages: boolean;
    notes?: string;
}

export interface ReportsFilter extends PaginationParams, DateRangeFilter {
    status?: 'Finalized' | 'PendingReview' | 'Archived';
    patientId?: string;
}

// API functions
export const reportsApi = {
    /**
     * Get list of reports
     */
    getReports: async (filters?: ReportsFilter): Promise<PaginatedResponse<Report>> => {
        const response = await apiClient.get<PaginatedResponse<Report>>(
            API_ENDPOINTS.reports.list,
            { params: filters }
        );
        return response.data;
    },

    /**
     * Get report details
     */
    getReport: async (id: string): Promise<Report> => {
        const response = await apiClient.get<Report>(API_ENDPOINTS.reports.detail(id));
        return response.data;
    },

    /**
     * Generate a new report
     */
    generateReport: async (data: GenerateReportRequest): Promise<Report> => {
        const response = await apiClient.post<Report>(
            API_ENDPOINTS.reports.generate,
            data
        );
        return response.data;
    },

    /**
     * Update report status/content
     */
    updateReport: async (id: string, data: Partial<Report>): Promise<Report> => {
        const response = await apiClient.patch<Report>(
            API_ENDPOINTS.reports.update(id),
            data
        );
        return response.data;
    },

    /**
     * Delete a report
     */
    deleteReport: async (id: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.reports.delete(id));
    },

    /**
     * Download report PDF
     */
    downloadReport: async (id: string): Promise<Blob> => {
        const response = await apiClient.get(
            API_ENDPOINTS.reports.download(id),
            { responseType: 'blob' }
        );
        return response.data;
    },
};

// React Query hooks

/**
 * Hook to get paginated reports
 */
export const useReports = (filters?: ReportsFilter) => {
    return useQuery({
        queryKey: [...QUERY_KEYS.reports, filters],
        queryFn: () => reportsApi.getReports(filters),
    });
};

/**
 * Hook to get single report
 */
export const useReport = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.report(id),
        queryFn: () => reportsApi.getReport(id),
        enabled: !!id,
    });
};

/**
 * Hook to generate report
 */
export const useGenerateReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: reportsApi.generateReport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reports });
            // Invalidate dashboard recent reports
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'recentReports'] });
        },
    });
};

/**
 * Hook to update report
 */
export const useUpdateReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Report> }) =>
            reportsApi.updateReport(id, data),
        onSuccess: (data) => {
            queryClient.setQueryData(QUERY_KEYS.report(data.id), data);
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reports });
        },
    });
};

/**
 * Hook to delete report
 */
export const useDeleteReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: reportsApi.deleteReport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reports });
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'recentReports'] });
        },
    });
};

export default reportsApi;
