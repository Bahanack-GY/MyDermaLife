import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/features/auth';
import { usersApi } from '../api/features/users';
import { QUERY_KEYS } from '../api/config';
import type { LoginCredentials } from '../api/features/auth';
import type { RegisterData } from '../api/types';

/**
 * Hook for user login
 */
export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
        onSuccess: (data) => {
            // Cache the user profile
            queryClient.setQueryData(QUERY_KEYS.profile, data.user);
        },
    });
};

/**
 * Hook for user registration
 */
export const useRegister = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RegisterData) => authApi.register(data),
        onSuccess: (data) => {
            // Cache the user profile
            queryClient.setQueryData(QUERY_KEYS.profile, data.user);
        },
    });
};

/**
 * Hook for user logout
 */
export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authApi.logout(),
        onSuccess: () => {
            // Clear all cached data
            queryClient.clear();
        },
    });
};

/**
 * Hook to get current user profile
 */
export const useProfile = () => {
    return useQuery({
        queryKey: QUERY_KEYS.profile,
        queryFn: () => authApi.getProfile(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Hook for updating profile photo
 */
export const useUpdateProfilePhoto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (profilePhoto: string) => usersApi.updateProfilePhoto(profilePhoto),
        onMutate: async (newPhoto) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.profile });

            // Snapshot the previous value
            const previousProfile = queryClient.getQueryData(QUERY_KEYS.profile);

            // Optimistically update to the new value
            queryClient.setQueryData(QUERY_KEYS.profile, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    profile: {
                        ...old.profile,
                        profilePhoto: newPhoto,
                    },
                };
            });

            // Return context with the previous value
            return { previousProfile };
        },
        onError: (_err, _newPhoto, context) => {
            // Rollback to the previous value on error
            if (context?.previousProfile) {
                queryClient.setQueryData(QUERY_KEYS.profile, context.previousProfile);
            }
        },
        onSuccess: (data) => {
            // Update with the server response
            queryClient.setQueryData(QUERY_KEYS.profile, data);
        },
    });
};

/**
 * Hook for updating medical record
 */
export const useUpdateMedicalRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<import('../api/types').MedicalRecord>) => usersApi.updateMedicalRecord(data),
        onSuccess: (data) => {
            queryClient.setQueryData(QUERY_KEYS.profile, data);
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
        },
    });
};

export const useSkinLogs = () => {
    return useQuery({
        queryKey: QUERY_KEYS.skinLogs,
        queryFn: () => usersApi.getSkinLogs(),
    });
};

export const useCreateSkinLog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<import('../api/types').SkinLog>) => usersApi.createSkinLog(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.skinLogs });
        },
    });
};

export const useDeleteSkinLog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => usersApi.deleteSkinLog(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.skinLogs });
        },
    });
};

/**
 * Hook to check authentication status
 */
export const useAuth = () => {
    const { data: profile, isLoading, isError } = useProfile();

    return {
        isAuthenticated: !isLoading && !isError && !!profile,
        isLoading,
        user: profile,
    };
};
