import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  Cart,
  AddToCartPayload,
  UpdateCartItemPayload,
  ShareTokenResponse,
  CheckoutPayload,
  CheckoutSharedCartPayload,
  Order
} from '../../types/api.types';

export const cartService = {
  // Get current cart
  getCart: async (): Promise<Cart> => {
    return apiClient.get(ENDPOINTS.CART.GET);
  },

  // Add item to cart
  addToCart: async (payload: AddToCartPayload): Promise<Cart> => {
    return apiClient.post(ENDPOINTS.CART.ADD, payload);
  },

  // Update cart item quantity
  updateCartItem: async (itemId: string, payload: UpdateCartItemPayload): Promise<Cart> => {
    return apiClient.put(ENDPOINTS.CART.UPDATE(itemId), payload);
  },

  // Remove item from cart
  removeFromCart: async (itemId: string): Promise<Cart> => {
    return apiClient.delete(ENDPOINTS.CART.REMOVE(itemId));
  },

  // Clear entire cart
  clearCart: async (): Promise<Cart> => {
    return apiClient.delete(ENDPOINTS.CART.CLEAR);
  },

  // Merge guest cart after login
  mergeCart: async (): Promise<Cart> => {
    return apiClient.post(ENDPOINTS.CART.MERGE);
  },

  // Get/Generate share token for cart
  getShareToken: async (): Promise<ShareTokenResponse> => {
    return apiClient.get(ENDPOINTS.CART.SHARE);
  },

  // View shared cart (public - no auth required)
  getSharedCart: async (shareToken: string): Promise<Cart> => {
    return apiClient.get(ENDPOINTS.CART.SHARED(shareToken));
  },

  // Copy shared cart to own cart
  copySharedCart: async (shareToken: string): Promise<Cart> => {
    return apiClient.post(ENDPOINTS.CART.COPY_SHARED(shareToken));
  },

  // Checkout own cart
  checkout: async (payload: CheckoutPayload): Promise<Order> => {
    return apiClient.post(ENDPOINTS.CART.CHECKOUT, payload);
  },

  // Direct checkout from shared cart (gift purchase)
  checkoutSharedCart: async (shareToken: string, payload: CheckoutSharedCartPayload): Promise<Order> => {
    return apiClient.post(ENDPOINTS.CART.CHECKOUT_SHARED(shareToken), payload);
  },
};
