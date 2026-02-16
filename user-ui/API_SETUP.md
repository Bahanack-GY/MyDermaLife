# API Setup Documentation

## Overview

The backend connection is set up using **TanStack Query (React Query)** for data fetching and **Axios** for HTTP requests.

**Base URL:** `https://api.myderma.evols.online/api/v1`

---

## Project Structure

```
src/
├── api/
│   ├── client.ts                    # Axios instance with interceptors
│   ├── endpoints.ts                 # All API endpoints
│   └── services/
│       ├── products.service.ts      # Product API functions
│       ├── cart.service.ts          # Cart API functions
│       └── orders.service.ts        # Orders API functions
├── hooks/
│   └── queries/
│       ├── useProducts.ts           # Product queries & hooks
│       ├── useCart.ts               # Cart queries & mutations
│       └── useOrders.ts             # Order queries & mutations
├── types/
│   └── api.types.ts                 # TypeScript types for API
└── lib/
    └── query-client.ts              # React Query configuration
```

---

## Usage Examples

### 1. Fetching Products

```tsx
import { useProducts } from '../hooks/queries/useProducts';

function ProductsPage() {
  const { data, isLoading, error } = useProducts({
    page: 1,
    limit: 20,
    category: 'skincare',
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  return (
    <div>
      {data?.data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 2. Get Single Product

```tsx
import { useProduct } from '../hooks/queries/useProducts';
import { useParams } from 'react-router-dom';

function ProductDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useProduct(id!);

  if (isLoading) return <div>Loading...</div>;

  return <div>{data?.data.name}</div>;
}
```

### 3. Add to Cart

```tsx
import { useAddToCart } from '../hooks/queries/useCart';

function ProductCard({ product }) {
  const addToCart = useAddToCart();

  const handleAddToCart = () => {
    addToCart.mutate({
      productId: product.id,
      quantity: 1,
    });
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={addToCart.isPending}
    >
      {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
```

### 4. Get Cart

```tsx
import { useCart } from '../hooks/queries/useCart';

function CartPage() {
  const { data: cart, isLoading } = useCart();

  if (isLoading) return <div>Loading cart...</div>;

  return (
    <div>
      <h1>Cart ({cart?.data.itemCount} items)</h1>
      <p>Total: ${cart?.data.total}</p>
      {cart?.data.items.map((item) => (
        <CartItem key={item.id} item={item} />
      ))}
    </div>
  );
}
```

### 5. Create Order

```tsx
import { useCreateOrder } from '../hooks/queries/useOrders';
import { useNavigate } from 'react-router-dom';

function CheckoutPage() {
  const createOrder = useCreateOrder();
  const navigate = useNavigate();

  const handleCheckout = async (formData) => {
    try {
      const order = await createOrder.mutateAsync({
        shippingAddress: formData.address,
        paymentMethod: formData.paymentMethod,
        paymentDetails: formData.paymentDetails,
      });

      // Redirect to success page
      navigate(`/order-success/${order.data.id}`);
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  return (
    <form onSubmit={handleCheckout}>
      {/* Checkout form */}
    </form>
  );
}
```

---

## Available Hooks

### Products
- `useProducts(params?)` - Get all products with filters
- `useProduct(id)` - Get single product
- `useProductsByCategory(categoryId, params?)` - Get products by category
- `useProductsByCollection(collectionId, params?)` - Get products by collection
- `useSearchProducts(query, params?)` - Search products
- `useCategories()` - Get all categories
- `useCategory(id)` - Get single category
- `useCollections()` - Get all collections
- `useCollection(id)` - Get single collection

### Cart
- `useCart()` - Get current cart
- `useAddToCart()` - Add product to cart (mutation)
- `useUpdateCartItem()` - Update cart item quantity (mutation)
- `useRemoveFromCart()` - Remove item from cart (mutation)
- `useClearCart()` - Clear entire cart (mutation)

### Orders
- `useOrders()` - Get all orders
- `useOrder(id)` - Get single order
- `useCreateOrder()` - Create new order (mutation)

---

## Query Parameters

### ProductQueryParams
```typescript
{
  page?: number;              // Page number (default: 1)
  limit?: number;             // Items per page (default: 20)
  category?: string;          // Filter by category
  collection?: string;        // Filter by collection
  search?: string;            // Search query
  minPrice?: number;          // Minimum price
  maxPrice?: number;          // Maximum price
  inStock?: boolean;          // Only in-stock products
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest';
}
```

---

## Error Handling

Errors are automatically handled by the API client and displayed via toast notifications. You can also handle errors manually:

```tsx
const { data, error, isError } = useProducts();

if (isError) {
  console.error('Failed to load products:', error);
  return <ErrorComponent message={error.message} />;
}
```

---

## Environment Variables

The base URL is stored in `.env`:

```env
VITE_API_BASE_URL=https://api.myderma.evols.online/api/v1
```

To change the API URL, update this file.

---

## Adding Authentication (Future)

When you're ready to add authentication, update `src/api/client.ts`:

```typescript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## TanStack Query DevTools (Optional)

To debug queries, install the devtools:

```bash
npm install @tanstack/react-query-devtools
```

Then add to `App.tsx`:

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## Summary of Tools Used

1. **@tanstack/react-query** - Data fetching, caching, and state management
2. **axios** - HTTP client for API requests
3. **TypeScript** - Type safety for API responses
4. **sonner** - Toast notifications (already in your project)
5. **.env** - Environment variables for configuration

All set up and ready to connect to your backend! 🚀
