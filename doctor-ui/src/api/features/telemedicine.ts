/**
 * Telemedicine API
 * Handles video sessions, signaling, and call management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import { API_ENDPOINTS, QUERY_KEYS } from '../config';
import type { TelemedicineSession } from '../types';

// Response types
export interface SessionTokenResponse {
    token: string;
    identity: string;
    roomName: string;
}

// API functions
export const telemedicineApi = {
    /**
     * Get active/upcoming telemedicine sessions
     */
    getSessions: async (): Promise<TelemedicineSession[]> => {
        const response = await apiClient.get<TelemedicineSession[]>(
            API_ENDPOINTS.telemedicine.sessions
        );
        return response.data;
    },

    /**
     * Get session details
     */
    getSession: async (id: string): Promise<TelemedicineSession> => {
        const response = await apiClient.get<TelemedicineSession>(
            API_ENDPOINTS.telemedicine.sessionDetail(id)
        );
        return response.data;
    },

    /**
     * Get video token for a session
     */
    getSessionToken: async (sessionId: string): Promise<SessionTokenResponse> => {
        const response = await apiClient.get<SessionTokenResponse>(
            API_ENDPOINTS.telemedicine.getToken(sessionId)
        );
        return response.data;
    },

    /**
     * Start a telemedicine session
     */
    startSession: async (appointmentId: string): Promise<TelemedicineSession> => {
        const response = await apiClient.post<TelemedicineSession>(
            API_ENDPOINTS.telemedicine.startSession,
            { appointmentId }
        );
        return response.data;
    },

    /**
     * End a session
     */
    endSession: async (sessionId: string): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.telemedicine.endSession(sessionId));
    },

    /**
     * Send reminder to patient to join
     */
    sendReminder: async (sessionId: string): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.telemedicine.sendReminder(sessionId));
    },
};

// React Query hooks

/**
 * Hook to get telemedicine sessions
 */
export const useTelemedicineSessions = () => {
    return useQuery({
        queryKey: QUERY_KEYS.telemedicineSessions,
        queryFn: telemedicineApi.getSessions,
        refetchInterval: 30000, // Refresh every 30s to check for new active sessions
    });
};

/**
 * Hook to get session token
 */
export const useSessionToken = (sessionId: string) => {
    return useQuery({
        queryKey: ['telemedicine', 'token', sessionId],
        queryFn: () => telemedicineApi.getSessionToken(sessionId),
        enabled: !!sessionId,
        staleTime: 5 * 60 * 1000, // Token valid for 5 mins usually before refresh needed
    });
};

/**
 * Hook to start a session
 */
export const useStartSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: telemedicineApi.startSession,
        onSuccess: (data) => {
            queryClient.setQueryData(QUERY_KEYS.telemedicineSession(data.id), data);
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.telemedicineSessions });
        },
    });
};

/**
 * Hook to end a session
 */
export const useEndSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: telemedicineApi.endSession,
        onSuccess: (_, sessionId) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.telemedicineSessions });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.telemedicineSession(sessionId) });
        },
    });
};

/**
 * Hook to send reminder
 */
export const useSendSessionReminder = () => {
    return useMutation({
        mutationFn: telemedicineApi.sendReminder,
    });
};

export default telemedicineApi;
