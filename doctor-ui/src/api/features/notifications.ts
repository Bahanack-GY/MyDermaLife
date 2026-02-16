/**
 * Notifications API
 * Handles system notifications and alerts
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import { API_ENDPOINTS, QUERY_KEYS } from '../config';
import type { Notification, PaginatedResponse, PaginationParams } from '../types';

// API functions
export const notificationsApi = {
    /**
     * Get paginated notifications
     */
    getNotifications: async (params?: PaginationParams): Promise<PaginatedResponse<Notification>> => {
        const response = await apiClient.get<PaginatedResponse<Notification>>(
            API_ENDPOINTS.notifications.list,
            { params }
        );
        return response.data;
    },

    /**
     * Get unread count
     */
    getUnreadCount: async (): Promise<number> => {
        const response = await apiClient.get<{ count: number }>(
            API_ENDPOINTS.notifications.unreadCount
        );
        return response.data.count;
    },

    /**
     * Mark notification as read
     */
    markRead: async (id: string): Promise<void> => {
        await apiClient.put(API_ENDPOINTS.notifications.markRead(id));
    },

    /**
     * Mark all notifications as read
     */
    markAllRead: async (): Promise<void> => {
        await apiClient.put(API_ENDPOINTS.notifications.markAllRead);
    },
};

// React Query hooks

/**
 * Hook to get notifications list
 */
export const useNotifications = (params?: PaginationParams) => {
    return useQuery({
        queryKey: [...QUERY_KEYS.notifications, params],
        queryFn: () => notificationsApi.getNotifications(params),
        // Poll for new notifications every minute
        refetchInterval: 60 * 1000,
    });
};

/**
 * Hook to get unread count
 */
export const useUnreadNotificationsCount = () => {
    return useQuery({
        queryKey: QUERY_KEYS.unreadNotificationsCount,
        queryFn: notificationsApi.getUnreadCount,
        // Poll more frequently for badge count
        refetchInterval: 30 * 1000,
    });
};

/**
 * Hook to mark filtered notification as read
 */
export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationsApi.markRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.unreadNotificationsCount });
        },
    });
};

/**
 * Hook to mark all as read
 */
export const useMarkAllNotificationsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationsApi.markAllRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.unreadNotificationsCount });
        },
    });
};

export default notificationsApi;
