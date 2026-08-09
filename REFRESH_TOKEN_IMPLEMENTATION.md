# Refresh Token Implementation

This document describes the refresh token authentication system implemented in the NestJS Business API.

## Overview

The refresh token system provides enhanced security through:
- **Short-lived access tokens** (15 minutes by default)
- **Long-lived refresh tokens** (7 days by default)
- **Token rotation** - refresh tokens are single-use only
- **Database storage** - all refresh tokens are tracked
- **Automatic cleanup** - expired tokens are removed
- **Revocation support** - tokens can be invalidated

## Architecture

### Database Schema

A new `refresh_tokens` table stores all issued refresh tokens:

```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
  revokedAt DateTime?
}
```

### Configuration

New environment variables in `.env`:

```env
# JWT - Access Token (short-lived)
JWT_SECRET=your-super-secret-jwt-key-change-me-in-production
JWT_EXPIRES_IN=15m

# JWT - Refresh Token (long-lived)
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-me-in-production
JWT_REFRESH_EXPIRES_IN=7d
```

## API Endpoints

### 1. Login - `POST /api/v1/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "fullName": "John Doe",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### 2. Refresh Token - `POST /api/v1/auth/refresh`

Exchange an expired access token for a new pair of tokens.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "fullName": "John Doe",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Notes:**
- The old refresh token is automatically revoked
- A new refresh token is issued (token rotation)
- Both access and refresh tokens are returned

### 3. Logout - `POST /api/v1/auth/logout`

Revoke refresh tokens to invalidate sessions.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request (optional):**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Notes:**
- If `refreshToken` is provided, only that token is revoked
- If no `refreshToken` is provided, ALL user's refresh tokens are revoked (logout from all devices)

### 4. Get Current User - `GET /api/v1/auth/me`

Returns the current authenticated user's information.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "user",
    "fullName": "John Doe"
  }
}
```

## Client Implementation Guide

### Storing Tokens

```typescript
// Store tokens securely
localStorage.setItem('accessToken', response.accessToken);
localStorage.setItem('refreshToken', response.refreshToken);
```

### Making Authenticated Requests

```typescript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Handling Token Expiration

```typescript
async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  let accessToken = localStorage.getItem('accessToken');
  
  // Add token to request
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`
  };
  
  let response = await fetch(url, options);
  
  // If token expired, refresh and retry
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    
    const refreshResponse = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      
      // Store new tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // Retry original request with new token
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${data.accessToken}`
      };
      
      response = await fetch(url, options);
    } else {
      // Refresh token expired, redirect to login
      window.location.href = '/login';
    }
  }
  
  return response;
}
```

### Logout

```typescript
async function logout() {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  await fetch('/api/v1/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refreshToken })
  });
  
  // Clear stored tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // Redirect to login
  window.location.href = '/login';
}
```

## Security Features

### 1. Token Rotation
Every time a refresh token is used, it's revoked and a new one is issued. This prevents replay attacks.

### 2. Separate Secrets
Access tokens and refresh tokens use different secrets, limiting the impact of a compromised secret.

### 3. Short-lived Access Tokens
Access tokens expire quickly (15 minutes), reducing the window of opportunity for token theft.

### 4. Database Tracking
All refresh tokens are stored in the database, allowing for:
- Audit trails
- Manual revocation
- Session management

### 5. Automatic Cleanup
Expired tokens are automatically deleted from the database.

### 6. Cascade Deletion
If a user is deleted, all their refresh tokens are automatically removed.

## Testing in Swagger

1. **Login:**
   - Navigate to `http://localhost:3001/api`
   - Use `POST /api/v1/auth/login` with valid credentials
   - Copy both `accessToken` and `refreshToken` from response

2. **Authorize Swagger:**
   - Click "Authorize" button in Swagger UI
   - Paste the `accessToken` (without "Bearer" prefix)
   - Click "Authorize"

3. **Test Protected Endpoint:**
   - Try `GET /api/v1/auth/me`
   - Should return your user information

4. **Test Refresh:**
   - Use `POST /api/v1/auth/refresh`
   - Paste the `refreshToken` in the request body
   - Should receive new access and refresh tokens

5. **Test Logout:**
   - Use `POST /api/v1/auth/logout`
   - Optionally provide the refresh token in the body
   - Tokens should be revoked

## Monitoring and Maintenance

### Database Queries

**View all active refresh tokens:**
```sql
SELECT * FROM refresh_tokens WHERE "revokedAt" IS NULL;
```

**View tokens for a specific user:**
```sql
SELECT * FROM refresh_tokens WHERE "userId" = 'user-id-here';
```

**Clean up expired tokens:**
```sql
DELETE FROM refresh_tokens WHERE "expiresAt" < NOW();
```

**Revoke all tokens for a user:**
```sql
UPDATE refresh_tokens 
SET "revokedAt" = NOW() 
WHERE "userId" = 'user-id-here' AND "revokedAt" IS NULL;
```

## Migration

The database migration has been automatically created and applied:
- Migration file: `prisma/migrations/20260809131907_add_refresh_tokens/migration.sql`
- Table created: `refresh_tokens`
- Indexes added for performance

## Troubleshooting

### "Invalid refresh token"
- Token may have expired
- Token may have been revoked
- Token may not exist in database

### "Refresh token expired"
- Token has passed its expiration date
- User needs to log in again

### "User account is inactive"
- User account has been deactivated
- User needs to contact admin

### Build Issues
If you encounter file lock errors with Prisma, try:
1. Close all running instances of the app
2. Run `npx prisma generate` again
3. Or restart your development environment

## Best Practices

1. **Store refresh tokens securely** - Use httpOnly cookies in production
2. **Use HTTPS** - Always transmit tokens over secure connections
3. **Set appropriate expiry times** - Balance security and user experience
4. **Monitor token usage** - Watch for suspicious patterns
5. **Implement rate limiting** - Prevent brute force attacks on refresh endpoint
6. **Log security events** - Track login, logout, and refresh actions
7. **Regular cleanup** - Schedule jobs to remove expired tokens

## Future Enhancements

Consider implementing:
- Device fingerprinting
- IP address tracking
- Suspicious activity detection
- Email notifications for new logins
- Session management UI
- Maximum concurrent sessions per user
