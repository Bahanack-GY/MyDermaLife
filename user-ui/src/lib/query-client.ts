import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    },
    mutations: {
      retry: false,
    },
  },
});

// Query keys for organization
export const QUERY_KEYS = {
  PRODUCTS: {
    ALL: ['products'] as const,
    LIST: (params?: Record<string, unknown>) => ['products', 'list', params] as const,
    DETAIL: (id: string) => ['products', 'detail', id] as const,
    BY_CATEGORY: (categoryId: string) => ['products', 'category', categoryId] as const,
    BY_COLLECTION: (collectionId: string) => ['products', 'collection', collectionId] as const,
    SEARCH: (query: string) => ['products', 'search', query] as const,
  },
  CATEGORIES: {
    ALL: ['categories'] as const,
    LIST: ['categories', 'list'] as const,
    DETAIL: (id: string) => ['categories', 'detail', id] as const,
  },
  COLLECTIONS: {
    ALL: ['collections'] as const,
    LIST: ['collections', 'list'] as const,
    DETAIL: (id: string) => ['collections', 'detail', id] as const,
  },
  CART: {
    GET: ['cart'] as const,
  },
  ORDERS: {
    ALL: ['orders'] as const,
    LIST: ['orders', 'list'] as const,
    DETAIL: (id: string) => ['orders', 'detail', id] as const,
    MY_ORDERS: ['orders', 'my-orders'] as const,
    MY_ORDER_DETAIL: (id: string) => ['orders', 'my-orders', id] as const,
    TRACK: (token: string) => ['orders', 'track', token] as const,
  },
  DOCTORS: {
    ALL: ['doctors'] as const,
    LIST: (params?: Record<string, unknown>) => ['doctors', 'list', params] as const,
    DETAIL: (id: string) => ['doctors', 'detail', id] as const,
  },
} as const;
