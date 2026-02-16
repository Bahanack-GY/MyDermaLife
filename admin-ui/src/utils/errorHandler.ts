import axios from 'axios';
import toast from 'react-hot-toast';

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

// Parse API error response
export const parseApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const response = error.response;

    if (response) {
      // Server responded with an error
      return {
        message: response.data?.message || response.data?.error || 'An error occurred',
        statusCode: response.status,
        errors: response.data?.errors,
      };
    }

    // Network error or no response
    if (error.request) {
      return {
        message: 'Network error. Please check your connection.',
        statusCode: 0,
      };
    }

    // Request setup error
    return {
      message: error.message || 'An unexpected error occurred',
    };
  }

  // Non-Axios error
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  // Unknown error
  return {
    message: 'An unexpected error occurred',
  };
};

// Show error toast
export const showErrorToast = (error: unknown) => {
  const apiError = parseApiError(error);

  toast.error(apiError.message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #fecaca',
    },
  });
};

// Show success toast
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#FDDDCB',
      color: '#9B563A',
      border: '1px solid #9B563A',
    },
  });
};

// Show info toast
export const showInfoToast = (message: string) => {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#e0f2fe',
      color: '#075985',
      border: '1px solid #bae6fd',
    },
  });
};

// Show warning toast
export const showWarningToast = (message: string) => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: '⚠️',
    style: {
      background: '#fef3c7',
      color: '#92400e',
      border: '1px solid #fde68a',
    },
  });
};
