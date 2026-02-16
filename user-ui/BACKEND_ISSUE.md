# 🚨 Backend Session Token Issue

## Problem Summary

The cart functionality is not working because the backend is not sending session tokens in API responses.

---

## What's Happening

### Current Flow (BROKEN):

1. ✅ Frontend calls `POST /cart/items` with product
2. ✅ Backend creates cart and adds item
3. ❌ Backend does NOT send `x-session-token` header in response
4. ❌ Frontend has no session token to send in next request 
5. ❌ Frontend calls `GET /cart` without valid session token
6. ❌ Backend creates NEW empty cart instead of returning the cart with items

### Evidence from Console Logs:

```
📡 API: Add to cart response: {id: 'cart-A', itemCount: 1, items: [product]}
⚠️ No session token in response headers

📡 API: Fetching cart...
📡 API: Cart data received: {id: 'cart-B', itemCount: 0, items: []}
```

Notice: Different cart IDs! (cart-A vs cart-B)

---

## Root Cause

The backend is missing one or both of these:

### 1. Session Token Not Generated/Sent

**Backend should send:**
```http
HTTP/1.1 201 Created
x-session-token: abc123def456...
Content-Type: application/json

{
  "id": "cart-uuid",
  "itemCount": 1,
  ...
}
```

**Backend is currently sending:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "cart-uuid",
  "itemCount": 1,
  ...
}
```

### 2. CORS Not Exposing Header

Even if the backend sends the header, the browser might block it due to CORS:

**Backend needs:**
```javascript
// Allow frontend to read the header
response.setHeader('Access-Control-Expose-Headers', 'x-session-token');
```

---

## Required Backend Changes

### Backend Team: Please verify and fix:

#### ✅ 1. Generate Session Token
When a guest creates/updates a cart:
```javascript
const sessionToken = generateSessionToken(); // UUID or similar
// Store mapping: sessionToken -> cartId in database/redis
```

#### ✅ 2. Send in Response Header
```javascript
response.setHeader('x-session-token', sessionToken);
```

#### ✅ 3. Configure CORS
```javascript
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  exposedHeaders: ['x-session-token'], // Allow frontend to read this header
  credentials: true
}));
```

#### ✅ 4. Accept in Future Requests
```javascript
const sessionToken = request.headers['x-session-token'];
const cart = findCartBySessionToken(sessionToken);
```

---

## Testing the Fix

### Backend Test:

```bash
# 1. Add to cart
curl -X POST http://localhost:3000/api/v1/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId": "test-uuid", "quantity": 1}' \
  -v

# Should see in response:
# < x-session-token: abc123...

# 2. Get cart with token
curl -X GET http://localhost:3000/api/v1/cart \
  -H "x-session-token: abc123..." \
  -v

# Should return cart with 1 item
```

### Frontend Test:

Once backend is fixed, clear localStorage and test:
```javascript
localStorage.clear();
// Refresh page
// Add product to cart
// FAB should appear with correct count
```

---

## Alternative Solutions (If Session Tokens Can't Be Implemented Now)

### Option A: Use Cookies Instead

Backend sets a cookie:
```javascript
response.cookie('sessionToken', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax'
});
```

Frontend doesn't need to do anything (cookies sent automatically).

### Option B: Return Token in Response Body

```json
{
  "cart": {
    "id": "cart-uuid",
    "itemCount": 1,
    "items": [...]
  },
  "sessionToken": "abc123..."
}
```

Frontend extracts from body instead of headers.

### Option C: Client-Side Cart (Temporary)

Store cart in localStorage until backend is ready:
- Not recommended (can't sync across devices)
- No server-side validation
- But would unblock frontend development

---

## Status

**Current:** ❌ Not working - backend not sending session tokens
**Blocker:** Backend team needs to implement session token system
**Priority:** HIGH - blocks entire cart/checkout flow

---

## Contact

Frontend implemented according to API spec with session token support.
Waiting on backend team to verify/fix session token implementation.

**Frontend Ready:** ✅
**Backend Ready:** ❌ (needs session token implementation)
