import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type { LoginCredentials, LoginResponse } from '../services/auth.service';
import { showErrorToast, showSuccessToast } from '../utils/errorHandler';
import { useAuth } from '../contexts/AuthContext';

// Login mutation hook
export const useLogin = () => {
  const navigate = useNavigate();
  const { login: setAuthUser } = useAuth();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data: LoginResponse) => {
      console.log('[useLogin] Login successful:', {
        hasAccessToken: !!data.accessToken,
        hasUser: !!data.user,
        userRole: data.user?.role,
      });

      // Update auth context
      setAuthUser(data.accessToken, data.user);
      showSuccessToast('Login successful! Welcome back.');

      // Verify token was saved
      const savedToken = localStorage.getItem('auth_token');
      console.log('[useLogin] Token verification:', {
        tokenSaved: !!savedToken,
        tokenLength: savedToken?.length,
        tokenPreview: savedToken?.substring(0, 30) + '...',
      });

      // Navigate to dashboard on successful login
      navigate('/');
    },
    onError: (error: unknown) => {
      console.error('[useLogin] Login failed:', error);
      showErrorToast(error);
    },
  });
};

// Logout mutation hook
export const useLogout = () => {
  const navigate = useNavigate();
  const { logout: clearAuthUser } = useAuth();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear auth context
      clearAuthUser();
      showSuccessToast('Logged out successfully.');
      // Navigate to login page after logout
      navigate('/login');
    },
    onError: (error: unknown) => {
      // Clear auth context even on error
      clearAuthUser();
      showErrorToast(error);
      // Still navigate to login even if API call fails
      navigate('/login');
    },
  });
};
