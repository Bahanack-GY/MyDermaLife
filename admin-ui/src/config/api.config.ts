// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://api.myderma.evols.online',
  VERSION: 'api/v1',
  TIMEOUT: 30000, // 30 seconds
};

// export const API_CONFIG = {
//   BASE_URL: 'https://192.168.1.185:3070',
//   VERSION: 'api/v1',
//   TIMEOUT: 30000, // 30 seconds
// };

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    GET: (id: string) => `/users/${id}`,
  },
  PATIENTS: {
    LIST: '/patients',
    CREATE: '/patients',
    UPDATE: (id: string) => `/patients/${id}`,
    DELETE: (id: string) => `/patients/${id}`,
    GET: (id: string) => `/patients/${id}`,
  },
  DOCTORS: {
    LIST: '/doctors',
    CREATE: '/doctors',
    UPDATE: (id: string) => `/doctors/${id}`,
    DELETE: (id: string) => `/doctors/${id}`,
    GET: (id: string) => `/doctors/${id}`,
  },
  WAREHOUSES: {
    LIST: '/warehouses',
    CREATE: '/warehouses',
    UPDATE: (id: string) => `/warehouses/${id}`,
    DELETE: (id: string) => `/warehouses/${id}`,
    GET: (id: string) => `/warehouses/${id}`,
  },
  INVENTORY: {
    STOCK: '/inventory/stock',
    STOCK_DETAIL: (warehouseId: string, productId: string) => `/inventory/stock/${warehouseId}/${productId}`,
    ADJUST: '/inventory/stock/adjust',
    TRANSFER: '/inventory/stock/transfer',
    MOVEMENTS: '/inventory/movements',
    ALERTS: '/inventory/alerts',
  },
  SUPPLIERS: {
    LIST: '/suppliers',
    CREATE: '/suppliers',
    UPDATE: (id: string) => `/suppliers/${id}`,
    DELETE: (id: string) => `/suppliers/${id}`,
    GET: (id: string) => `/suppliers/${id}`,
    PRODUCTS: (id: string) => `/suppliers/${id}/products`,
    ADD_PRODUCT: (id: string) => `/suppliers/${id}/products`,
    UPDATE_PRODUCT: (id: string, productId: string) => `/suppliers/${id}/products/${productId}`,
    DELETE_PRODUCT: (id: string, productId: string) => `/suppliers/${id}/products/${productId}`,
  },
  PURCHASE_ORDERS: {
    LIST: '/purchase-orders',
    CREATE: '/purchase-orders',
    UPDATE: (id: string) => `/purchase-orders/${id}`,
    GET: (id: string) => `/purchase-orders/${id}`,
    SUBMIT: (id: string) => `/purchase-orders/${id}/submit`,
    CONFIRM: (id: string) => `/purchase-orders/${id}/confirm`,
    RECEIVE: (id: string) => `/purchase-orders/${id}/receive`,
    CANCEL: (id: string) => `/purchase-orders/${id}/cancel`,
  },
};

// Build full API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}${endpoint}`;
};
