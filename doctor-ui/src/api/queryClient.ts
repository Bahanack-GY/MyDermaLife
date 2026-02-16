/**
 * TanStack Query Client Configuration
 * Centralized query client with default options
 */

import { QueryClient } from '@tanstack/react-query';

// Create query client with optimized defaults
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data is considered fresh for 5 minutes
            staleTime: 5 * 60 * 1000,

            // Cache data for 30 minutes
            gcTime: 30 * 60 * 1000,

            // Retry failed requests up to 3 times
            retry: 3,

            // Exponential backoff for retries
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Refetch on window focus for fresh data
            refetchOnWindowFocus: true,

            // Don't refetch on mount if data is fresh
            refetchOnMount: true,

            // Refetch on reconnect
            refetchOnReconnect: true,
        },
        mutations: {
            // Retry mutations once on failure
            retry: 1,
        },
    },
});

export default queryClient;
