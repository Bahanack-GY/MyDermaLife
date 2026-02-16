# Cart Integration - Complete Implementation

## Overview

Full implementation of cart API integration with guest carts, session token management, and cart sharing functionality.

**Base URL**: `https://api.myderma.evols.online/api/v1`

---

## Authentication

All cart endpoints are public — no login required. Users are identified by:

- **Logged-in user**: `Authorization: Bearer <jwt>` header
- **Guest**: `x-session-token` header (stored in localStorage)
- **New guest**: No headers. Backend creates cart and returns session token in response header

### Session Token Management

The session token is automatically managed by the API client:

```typescript
// Request interceptor - adds session token
apiClient.interceptors.request.use((config) => {
  const sessionToken = sessionManager.getToken();
  if (sessionToken) {
    config.headers['x-session-token'] = sessionToken;
  }
  return config;
});

// Response interceptor - saves session token
apiClient.interceptors.response.use((response) => {
  const sessionToken = sessionManager.extractFromHeaders(response.headers);
  if (sessionToken) {
    sessionManager.setToken(sessionToken);
  }
  return response.data;
});
```

---

## TypeScript Types

### Cart Types

```typescript
interface CartItem {
  id: string;
  productId: string;
  productName: string | null;
  productSlug: string | null;
  productImage: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

interface Cart {
  id: string;
  itemCount: number;
  totalPrice: number;
  items: CartItem[];
}
```

### Request Payloads

```typescript
interface AddToCartPayload {
  productId: string;
  quantity: number;
}

interface UpdateCartItemPayload {
  quantity: number;
}

interface CheckoutSharedCartPayload {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
}

type PaymentMethod = 'card' | 'mobile_money' | 'bank_transfer' | 'cash';
```

---

## API Endpoints

### 1. Get Cart

```typescript
GET /api/v1/cart

// Usage
const { data: cart, isLoading } = useCart();
```

**Response:**
```json
{
  "id": "cart-uuid",
  "itemCount": 3,
  "totalPrice": 45000,
  "items": [
    {
      "id": "cart-item-uuid",
      "productId": "product-uuid",
      "productName": "Hydrating Face Cream",
      "productSlug": "hydrating-face-cream",
      "productImage": "/uploads/products/img.jpeg",
      "unitPrice": 15000,
      "quantity": 2,
      "subtotal": 30000
    }
  ]
}
```

---

### 2. Add Item to Cart

```typescript
POST /api/v1/cart/items

// Usage
const addToCart = useAddToCart();
await addToCart.mutateAsync({
  productId: 'product-uuid',
  quantity: 1
});
```

**Payload:**
```json
{
  "productId": "product-uuid",
  "quantity": 1
}
```

**Behavior:** If product already exists in cart, quantity is added (not replaced).

**Response:** Full cart object

---

### 3. Update Cart Item Quantity

```typescript
PUT /api/v1/cart/items/:itemId

// Usage
const updateCartItem = useUpdateCartItem();
await updateCartItem.mutateAsync({
  itemId: 'cart-item-uuid',
  payload: { quantity: 3 }
});
```

**Payload:**
```json
{
  "quantity": 3
}
```

**Behavior:** Replaces the quantity (does not add).

**Response:** Full cart object

---

### 4. Remove Cart Item

```typescript
DELETE /api/v1/cart/items/:itemId

// Usage
const removeFromCart = useRemoveFromCart();
await removeFromCart.mutateAsync('cart-item-uuid');
```

**Response:** Full cart object (without the removed item)

---

### 5. Clear Entire Cart

```typescript
DELETE /api/v1/cart

// Usage
const clearCart = useClearCart();
await clearCart.mutateAsync();
```

**Response:** Full cart object (with empty items array)

---

### 6. Merge Guest Cart After Login

```typescript
POST /api/v1/cart/merge

// Usage (call immediately after login)
const mergeCart = useMergeCart();
await mergeCart.mutateAsync();
```

**Headers Required:**
- `Authorization: Bearer <jwt>`
- `x-session-token: <guest-session-token>`

**Behavior:** Copies guest cart items into user's cart. Quantities are summed for duplicates. Guest cart is deleted.

**Response:** Full cart object or `{ "message": "No guest cart to merge" }`

---

## Cart Sharing Endpoints

### 7. Get/Generate Share Token

```typescript
GET /api/v1/cart/share

// Usage
const getShareToken = useGetShareToken();
const { data } = await getShareToken.mutateAsync();
const shareUrl = `https://mydermalife.com/cart/shared/${data.shareToken}`;
```

**Response:**
```json
{
  "shareToken": "aB3xK9mP2qR1"
}
```

---

### 8. View Shared Cart (Public)

```typescript
GET /api/v1/cart/shared/:shareToken

// Usage
const { data: sharedCart } = useSharedCart(shareToken);
```

**No headers required.** Completely public.

**Response:** Full cart object

---

### 9. Copy Shared Cart to Own Cart

```typescript
POST /api/v1/cart/shared/:shareToken/copy

// Usage
const copySharedCart = useCopySharedCart();
await copySharedCart.mutateAsync(shareToken);
```

**Behavior:** Copies all items from shared cart into caller's cart. Quantities are summed for duplicates.

**Response:** Full cart object (caller's cart with copied items)

---

### 10. Checkout Shared Cart (Buy for Someone)

```typescript
POST /api/v1/cart/shared/:shareToken/checkout

// Usage
const checkoutSharedCart = useCheckoutSharedCart();
const order = await checkoutSharedCart.mutateAsync({
  shareToken: 'aB3xK9mP2qR1',
  payload: {
    email: 'buyer@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+237600000000',
    shippingAddress: {
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+237600000000',
      addressLine1: '123 Main Street',
      city: 'Douala',
      country: 'Cameroon'
    },
    paymentMethod: 'mobile_money',
    notes: 'Please gift wrap'
  }
});
```

**Response:**
```json
{
  "id": "order-uuid",
  "orderNumber": "ORD-20260201-XXXX",
  "status": "pending",
  "paymentStatus": "pending",
  "buyedFor": {
    "cartId": "cart-uuid",
    "cartOwnerId": "user-uuid-or-null"
  },
  "subtotal": 45000,
  "shippingCost": 0,
  "taxAmount": 0,
  "totalAmount": 45000,
  "currency": "XAF",
  "shippingAddress": { ... },
  "trackingToken": "guest-tracking-token",
  "items": [ ... ],
  "createdAt": "2026-02-01T10:00:00.000Z"
}
```

---

## React Query Hooks

All cart hooks are available from `hooks/queries/useCart.ts`:

```typescript
import {
  useCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
  useMergeCart,
  useGetShareToken,
  useSharedCart,
  useCopySharedCart,
  useCheckoutSharedCart,
} from '../hooks/queries/useCart';
```

---

## Usage Examples

### Display Cart

```tsx
function CartPage() {
  const { data: cart, isLoading } = useCart();

  if (isLoading) return <div>Loading cart...</div>;

  return (
    <div>
      <h1>Cart ({cart?.itemCount} items)</h1>
      <p>Total: {cart?.totalPrice.toLocaleString()} FCFA</p>

      {cart?.items.map(item => (
        <div key={item.id}>
          <img src={getImageUrl(item.productImage)} alt={item.productName} />
          <h3>{item.productName}</h3>
          <p>Qty: {item.quantity}</p>
          <p>{item.subtotal.toLocaleString()} FCFA</p>
        </div>
      ))}
    </div>
  );
}
```

### Add to Cart from Product Page

```tsx
function ProductPage() {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useAddToCart();

  const handleAddToCart = async () => {
    await addToCart.mutateAsync({
      productId: product.id,
      quantity: quantity,
    });
  };

  return (
    <button onClick={handleAddToCart}>
      Add to Cart - {(product.price * quantity).toLocaleString()} FCFA
    </button>
  );
}
```

### Update Item Quantity

```tsx
function CartItem({ item }) {
  const updateCartItem = useUpdateCartItem();

  const handleUpdateQuantity = async (newQuantity: number) => {
    await updateCartItem.mutateAsync({
      itemId: item.id,
      payload: { quantity: newQuantity }
    });
  };

  return (
    <div>
      <button onClick={() => handleUpdateQuantity(item.quantity - 1)}>-</button>
      <span>{item.quantity}</span>
      <button onClick={() => handleUpdateQuantity(item.quantity + 1)}>+</button>
    </div>
  );
}
```

### Share Cart

```tsx
function ShareCartButton() {
  const getShareToken = useGetShareToken();

  const handleShare = async () => {
    const { shareToken } = await getShareToken.mutateAsync();
    const shareUrl = `${window.location.origin}/cart/shared/${shareToken}`;

    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied!');
  };

  return <button onClick={handleShare}>Share Cart</button>;
}
```

### View Shared Cart

```tsx
function SharedCartPage() {
  const { shareToken } = useParams();
  const { data: cart } = useSharedCart(shareToken!);
  const copySharedCart = useCopySharedCart();

  const handleCopyToMyCart = async () => {
    await copySharedCart.mutateAsync(shareToken!);
    navigate('/cart');
  };

  return (
    <div>
      <h1>Shared Cart</h1>
      {/* Display cart items */}
      <button onClick={handleCopyToMyCart}>Copy to My Cart</button>
    </div>
  );
}
```

---

## Summary

✅ **Complete cart types** matching API response
✅ **Session token management** automatic via interceptors
✅ **All cart endpoints** implemented
✅ **Guest cart support** with session tokens
✅ **Cart sharing** with public links
✅ **Gift checkout** from shared carts
✅ **Cart merging** after login
✅ **React Query hooks** for all operations
✅ **Type-safe** with full TypeScript support

Everything is configured and ready to use! 🎉
