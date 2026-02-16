import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../../api/services/cart.service';
import { QUERY_KEYS } from '../../lib/query-client';
import { toast } from 'sonner';
import type { AddToCartPayload, UpdateCartItemPayload, CheckoutPayload, CheckoutSharedCartPayload } from '../../types/api.types';

// Get cart
export const useCart = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CART.GET,
    queryFn: () => cartService.getCart(),
  });
};

// Add to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddToCartPayload) => cartService.addToCart(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART.GET });
      // Toast notification handled by components for proper translation
    },
    onError: () => {
      toast.error('Failed to add product to cart');
    },
  });
};

// Update cart item
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: UpdateCartItemPayload }) =>
      cartService.updateCartItem(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART.GET });
    },
    onError: () => {
      toast.error('Failed to update cart item');
    },
  });
};

// Remove from cart
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartService.removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART.GET });
      toast.success('Product removed from cart');
    },
    onError: () => {
      toast.error('Failed to remove product from cart');
    },
  });
};

// Clear cart
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART.GET });
      toast.success('Cart cleared');
    },
    onError: () => {
      toast.error('Failed to clear cart');
    },
  });
};

// Get/Generate share token for cart
export const useGetShareToken = () => {
  return useMutation({
    mutationFn: () => cartService.getShareToken(),
    onSuccess: () => {
      toast.success('Share link generated');
    },
    onError: () => {
      toast.error('Failed to generate share link');
    },
  });
};

// Get shared cart (public)
export const useSharedCart = (shareToken: string) => {
  return useQuery({
    queryKey: ['sharedCart', shareToken],
    queryFn: () => cartService.getSharedCart(shareToken),
    enabled: !!shareToken,
  });
};

// Copy shared cart to own cart
export const useCopySharedCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shareToken: string) => cartService.copySharedCart(shareToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART.GET });
      toast.success('Cart items copied successfully');
    },
    onError: () => {
      toast.error('Failed to copy cart items');
    },
  });
};

// Checkout own cart
export const useCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CheckoutPayload) => cartService.checkout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART.GET });
      toast.success('Order created successfully');
    },
    onError: () => {
      toast.error('Failed to create order');
    },
  });
};

// Direct checkout from shared cart
export const useCheckoutSharedCart = () => {
  return useMutation({
    mutationFn: ({
      shareToken,
      payload,
    }: {
      shareToken: string;
      payload: CheckoutSharedCartPayload;
    }) => cartService.checkoutSharedCart(shareToken, payload),
    onSuccess: () => {
      toast.success('Order created successfully');
    },
    onError: () => {
      toast.error('Failed to create order');
    },
  });
};

// Merge guest cart after login
export const useMergeCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.mergeCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART.GET });
      toast.success('Cart merged successfully');
    },
    onError: () => {
      toast.error('Failed to merge cart');
    },
  });
};

// Alias for useGetShareToken (better semantics)
export const useShareCart = useGetShareToken;
