import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '../config/api.config';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}`,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add security headers and auth token
apiClient.interceptors.request.use(
  (config) => {
    // Add security headers
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    config.headers['X-Frame-Options'] = 'DENY';
    config.headers['X-Content-Type-Options'] = 'nosniff';
    config.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';

    // Add authentication token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('[API] Request with token:', {
        url: config.url,
        method: config.method,
        hasToken: true,
        tokenPrefix: token.substring(0, 20) + '...'
      });
    } else {
      console.warn('[API] Request without token:', {
        url: config.url,
        method: config.method,
        hasToken: false
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 400 Bad Request
    if (error.response?.status === 400) {
      console.error('[API] 400 Bad Request:', {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        response: error.response?.data
      });
    }

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      console.error('[API] 401 Unauthorized:', {
        url: error.config?.url,
        method: error.config?.method,
        response: error.response?.data
      });

      // Only redirect if we're not already on the login page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        console.log('[API] Redirecting to login - clearing auth data');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      // If already on login page, just let the error pass through
      // so the form can handle it with toast notification
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('[API] 403 Forbidden:', {
        url: error.config?.url,
        message: error.response?.data
      });
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('[API] 500 Server Error:', {
        url: error.config?.url,
        message: error.response?.data
      });
    }

    return Promise.reject(error);
  }
);

// API Service
export const apiService = {
  // GET request
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.get<T>(url, config);
  },

  // POST request
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.post<T>(url, data, config);
  },

  // PUT request
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.put<T>(url, data, config);
  },

  // PATCH request
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.patch<T>(url, data, config);
  },

  // DELETE request
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.delete<T>(url, config);
  },
};

export default apiService;
