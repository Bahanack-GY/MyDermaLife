// API Endpoints
export const ENDPOINTS = {
  // Products
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    BY_CATEGORY: (categoryId: string) => `/products/category/${categoryId}`,
    BY_COLLECTION: (collectionId: string) => `/products/collection/${collectionId}`,
    SEARCH: '/products/search',
  },

  // Reviews
  REVIEWS: {
    LIST: (productId: string) => `/products/${productId}/reviews`,
    SUMMARY: (productId: string) => `/products/${productId}/reviews/summary`,
    DETAIL: (productId: string, reviewId: string) => `/products/${productId}/reviews/${reviewId}`,
    CREATE: (productId: string) => `/products/${productId}/reviews`,
    UPDATE: (reviewId: string) => `/products/reviews/${reviewId}`,
    DELETE: (reviewId: string) => `/products/reviews/${reviewId}`,
    MY_REVIEWS: '/products/reviews/my-reviews',
    ADMIN_LIST: '/products/reviews/admin',
    MODERATE: (reviewId: string) => `/products/reviews/${reviewId}/moderate`,
    ADMIN_DELETE: (reviewId: string) => `/products/reviews/${reviewId}/admin`,
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id: string) => `/categories/${id}`,
  },

  // Collections
  COLLECTIONS: {
    LIST: '/collections',
    DETAIL: (id: string) => `/collections/${id}`,
  },

  // Cart
  CART: {
    GET: '/cart',
    ADD: '/cart/items',
    UPDATE: (itemId: string) => `/cart/items/${itemId}`,
    REMOVE: (itemId: string) => `/cart/items/${itemId}`,
    CLEAR: '/cart',
    MERGE: '/cart/merge',
    SHARE: '/cart/share',
    SHARED: (shareToken: string) => `/cart/shared/${shareToken}`,
    COPY_SHARED: (shareToken: string) => `/cart/shared/${shareToken}/copy`,
    CHECKOUT: '/cart/checkout',
    CHECKOUT_SHARED: (shareToken: string) => `/cart/shared/${shareToken}/checkout`,
  },

  // Orders
  ORDERS: {
    CREATE: '/orders',
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    MY_ORDERS: '/orders/my-orders',
    MY_ORDER_DETAIL: (id: string) => `/orders/my-orders/${id}`,
    TRACK: (token: string) => `/orders/track/${token}`,
  },

  // Doctors (for future use)
  DOCTORS: {
    LIST: '/doctors',
    DETAIL: (id: string) => `/doctors/${id}`,
    SEARCH: '/doctors/search',
  },

  // Booking (for future use)
  BOOKING: {
    CREATE: '/bookings',
    LIST: '/bookings',
    DETAIL: (id: string) => `/bookings/${id}`,
  },

  // User (for future use when auth is implemented)
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/profile',
    ORDERS: '/user/orders',
    APPOINTMENTS: '/user/appointments',
  },
} as const;
