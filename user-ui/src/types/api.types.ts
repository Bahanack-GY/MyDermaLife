// Product Types
export interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface RoutineItem {
  stepOrder: number;
  stepLabel: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    primaryImage: string | null;
  } | null;
}

export interface Routine {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  products: RoutineItem[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brandName: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    parentCategory?: {
      id: string;
      name: string;
      slug: string;
    };
  };
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  requiresPrescription: boolean;
  isPrescriptionOnly: boolean;
  ingredients: string[] | null;
  usageInstructions: string | null;
  warnings: string | null;
  benefits: string[] | null;
  skinTypes: string[] | null;
  conditionsTreated: string[] | null;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  rating: number;
  totalReviews: number;
  totalSales: number;
  weightGrams: number | null;
  dimensions: { length?: number; width?: number; height?: number } | null;
  tags: string[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  images: ProductImage[];
  routines: Routine[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Category Types
export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentCategoryId: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  subcategories: Subcategory[];
  createdAt: string;
  updatedAt: string;
}

// Collection Types
export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  productName: string | null;
  productSlug: string | null;
  productImage: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  itemCount: number;
  totalPrice: number;
  items: CartItem[];
}

// Shipping Address Types
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
}

// Payment Method Type
export type PaymentMethod = 'card' | 'mobile_money' | 'bank_transfer' | 'cash';

// Order Types
export interface OrderItem {
  id: string;
  productId: string;
  productName: string | null;
  productSlug: string | null;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  buyedFor?: {
    cartId: string;
    cartOwnerId: string | null;
  };
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  shippingAddress: ShippingAddress;
  trackingToken?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

// Cart Request Payloads
export interface AddToCartPayload {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

export interface ShareTokenResponse {
  shareToken: string;
}

// Regular checkout payload (for own cart)
export interface CheckoutPayload {
  email?: string; // Required for guests, optional for logged-in users
  firstName: string;
  lastName: string;
  phone: string;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
}

// Shared cart checkout payload (always requires email)
export interface CheckoutSharedCartPayload {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Review Types
export interface Review {
  id: string;
  productId: string;
  userId: string;
  orderId: string | null;
  rating: number;
  title: string | null;
  reviewText: string | null;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  status: 'pending' | 'approved' | 'rejected';
  moderatedBy: string | null;
  moderatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface PaginatedReviews {
  data: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  breakdown: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
}

export interface CreateReviewPayload {
  rating: number;
  title?: string;
  reviewText?: string;
  orderId?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  title?: string;
  reviewText?: string;
}

export interface ModerateReviewPayload {
  status: 'approved' | 'rejected';
}

// Query Params
export interface ProductQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'createdAt' | 'rating' | 'totalSales';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  skinType?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  requiresPrescription?: boolean;
  isActive?: boolean;
}

export interface ReviewQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating';
  sortOrder?: 'ASC' | 'DESC';
  rating?: number; // Filter by rating (1-5)
}

export interface AdminReviewQueryParams extends ReviewQueryParams {
  status?: 'pending' | 'approved' | 'rejected';
  productId?: string;
  userId?: string;
}
