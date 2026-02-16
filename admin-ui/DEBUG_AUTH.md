# Authentication Debug Guide

## Issue: 401 Unauthorized on Warehouse Endpoints

The warehouse API is returning 401, which means the token is either missing, expired, or doesn't have proper permissions.

## Debug Steps

### 1. Check if Token Exists
Open browser console and run:
```javascript
localStorage.getItem('auth_token')
```

**Expected**: Should return a JWT token string
**If null**: User needs to log in again

### 2. Check Token in Request Headers
In the Network tab:
1. Go to `/warehouses` page
2. Look for the failed request to `https://api.myderma.evols.online/api/v1/warehouses`
3. Check the Request Headers
4. Look for: `Authorization: Bearer <token>`

**If missing**: Token interceptor isn't working
**If present**: Token is invalid or expired

### 3. Decode the JWT Token
Use https://jwt.io to decode your token and check:
- `exp` field (expiration timestamp)
- `role` field (should be `admin` or `super_admin`)

### 4. Test with Curl
```bash
# Get your token from localStorage
TOKEN="your_token_here"

# Test the endpoint
curl -H "Authorization: Bearer $TOKEN" \
  https://api.myderma.evols.online/api/v1/warehouses
```

## Common Solutions

### Solution 1: Login Again
If token is expired or missing:
1. Go to `/login`
2. Enter credentials
3. Token will be saved to localStorage
4. Try accessing warehouses again

### Solution 2: Check User Role
The API requires `admin` or `super_admin` role. Regular users cannot access warehouse endpoints.

### Solution 3: Backend API Issue
If token is valid but still getting 401, the backend might:
- Not recognize the token
- Have CORS issues
- Require different authentication format

## Testing with a Valid Token

If you have a valid admin token, you can manually test:

```javascript
// In browser console
localStorage.setItem('auth_token', 'your_valid_token_here');
localStorage.setItem('user', JSON.stringify({
  id: 'user_id',
  email: 'admin@example.com',
  role: 'admin',
  name: 'Admin User'
}));

// Then refresh the page
location.reload();
```

## Check API Response

The 401 response might include details. Check the response body in Network tab:
```json
{
  "error": "Token expired",
  "message": "Please login again"
}
```

or

```json
{
  "error": "Insufficient permissions",
  "message": "Admin role required"
}
```
