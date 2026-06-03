# Rate Limiting Implementation

## Overview

This document describes the rate limiting implementation for the Google Authentication feature in VNotes.

**Task**: 16.3 - Implement rate limiting and environment variables

**Requirements**: 10.10 (Security rate limiting), 13.8 (Environment variable configuration)

## Implementation Details

### Rate Limiting Middleware

**File**: `src/middlewares/rateLimiter.ts`

Rate limiting is implemented using the `express-rate-limit` middleware to protect authentication endpoints from brute-force attacks and DDoS attacks.

#### OAuth Endpoint Rate Limiter (`/auth/oauth`)

- **Limit**: 5 attempts per IP per 5 minutes
- **Window Size**: 300,000 milliseconds (5 minutes)
- **Max Requests**: 5
- **Response Status**: 429 Too Many Requests
- **Response Format**:
  ```json
  {
    "success": false,
    "message": "Too many OAuth attempts from this IP, please try again after 5 minutes",
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 300
  }
  ```

#### Logout Endpoint Rate Limiter (`/auth/logout`)

- **Limit**: 10 attempts per IP per hour
- **Window Size**: 3,600,000 milliseconds (1 hour)
- **Max Requests**: 10
- **Response Status**: 429 Too Many Requests
- **Response Format**:
  ```json
  {
    "success": false,
    "message": "Too many logout attempts from this IP, please try again after 1 hour",
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 3600
  }
  ```

### Rate Limiter Features

1. **Standard Headers**: Rate limiting information is included in response headers:
   - `RateLimit-Limit`: Maximum requests allowed
   - `RateLimit-Remaining`: Remaining requests in current window
   - `RateLimit-Reset`: Timestamp when rate limit resets

2. **IP-Based Tracking**: Rate limits are tracked per IP address to prevent attacks from multiple requests originating from the same source

3. **Logging**: Rate limit violations are logged with IP address and endpoint information for security monitoring

4. **Retry-After Header**: Responses include `retryAfter` field indicating seconds until the client can retry

### Routes with Rate Limiting Applied

**File**: `src/routes/authRoutes.ts`

```typescript
// OAuth endpoint with 5 attempts per 5 minutes limit
router.post('/oauth', oauthLimiter, async (req: Request, res: Response) => { ... });

// Logout endpoint with 10 attempts per hour limit
router.post('/logout', logoutLimiter, authMiddleware, async (req: Request, res: Response) => { ... });
```

Note: The `logoutLimiter` is applied **before** the `authMiddleware`. This provides rate limiting even for requests with invalid tokens, preventing attackers from using logout attempts as a way to consume resources.

## Environment Variables

**File**: `backend/.env.example`

The .env.example file has been updated with comprehensive documentation for all environment variables including:

### Rate Limiting Configuration Variables

```env
# RATE_LIMIT_OAUTH_WINDOW: Time window for OAuth rate limiting in milliseconds
# Default: 300000 (5 minutes)
RATE_LIMIT_OAUTH_WINDOW=300000

# RATE_LIMIT_OAUTH_MAX: Maximum OAuth attempts allowed per IP within the window
# Default: 5
RATE_LIMIT_OAUTH_MAX=5

# RATE_LIMIT_LOGOUT_WINDOW: Time window for logout rate limiting in milliseconds
# Default: 3600000 (1 hour)
RATE_LIMIT_LOGOUT_WINDOW=3600000

# RATE_LIMIT_LOGOUT_MAX: Maximum logout attempts allowed per IP within the window
# Default: 10
RATE_LIMIT_LOGOUT_MAX=10
```

### Other Environment Variables Documented

The .env.example file includes comprehensive documentation for:

- **Server Configuration**: PORT, NODE_ENV
- **CORS Configuration**: CORS_ORIGIN
- **File Upload Configuration**: UPLOADS_DIR, MAX_FILE_SIZE
- **Google OAuth Configuration**: GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_CALLBACK_URI
- **JWT Configuration**: JWT_SECRET, JWT_EXPIRATION
- **Rate Limiting Configuration**: RATE_LIMIT_OAUTH_WINDOW, RATE_LIMIT_OAUTH_MAX, RATE_LIMIT_LOGOUT_WINDOW, RATE_LIMIT_LOGOUT_MAX
- **Supabase Configuration**: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- **External Services**: ELEVENLABS_API_KEY

Each variable includes:
- Clear description of purpose
- Default values
- Examples and common values
- Security notes and warnings
- Instructions for obtaining values
- Formula and computation help

## Testing

**File**: `tests/rateLimiter.test.ts`

Comprehensive test suite for rate limiting middleware including:

### OAuth Rate Limiter Tests
- Allows 5 requests within limit
- Returns 429 when limit exceeded
- Includes `retryAfter` in response
- Includes `RateLimit-*` headers in response

### Logout Rate Limiter Tests
- Allows 10 requests within limit
- Returns 429 when limit exceeded
- Returns appropriate message for logout
- Includes `retryAfter` in response

### Configuration Tests
- Verifies OAuth limiter max is 5
- Verifies logout limiter max is 10

## Dependencies

The following packages were added to support rate limiting:

```json
{
  "dependencies": {
    "express-rate-limit": "^7.0.0"
  },
  "devDependencies": {
    "@types/express-rate-limit": "^6.0.0",
    "supertest": "^6.3.3",
    "@types/supertest": "^2.0.12"
  }
}
```

## Security Considerations

1. **IP-Based Rate Limiting**: Rate limits are applied per IP address, which prevents brute-force attacks from a single source

2. **Different Limits for Different Endpoints**:
   - OAuth (5 per 5 min): Prevents brute-force authentication attempts
   - Logout (10 per 1 hour): Prevents abuse of logout functionality

3. **Immediate Response**: Rate limit violations return 429 status code with appropriate headers, allowing clients to implement exponential backoff

4. **Logging**: All rate limit violations are logged for security monitoring and attack detection

5. **Response Headers**: Standard rate limit headers enable client-side rate limit handling

## Production Deployment

For production deployment, consider:

1. **Behind a Proxy**: If deployed behind a reverse proxy (nginx, AWS ELB), ensure proxy forwards correct client IP in `X-Forwarded-For` header

2. **Distributed Systems**: For multi-server deployments, consider using Redis-backed rate limiting store instead of in-memory

3. **Monitoring**: Set up alerts for high rate of 429 responses, which may indicate attack attempts

4. **Tuning**: Monitor actual usage patterns and adjust `max` and `windowMs` values as needed

## Files Modified

1. **Created**: `src/middlewares/rateLimiter.ts` - Rate limiting middleware implementations
2. **Updated**: `src/routes/authRoutes.ts` - Applied rate limiters to OAuth and logout endpoints
3. **Updated**: `backend/.env.example` - Added comprehensive environment variable documentation
4. **Created**: `tests/rateLimiter.test.ts` - Test suite for rate limiting middleware

## Verification

To verify the implementation:

1. **Build Check**: Run `npm run build` - should compile without errors
2. **Type Check**: Rate limiting middleware uses proper TypeScript types
3. **Integration**: Rate limiters are properly applied to endpoints
4. **Documentation**: All environment variables documented with examples
5. **Tests**: Comprehensive test suite validates rate limiting behavior

## Future Enhancements

Potential improvements for future versions:

1. **Redis-backed Rate Limiting**: For distributed deployments, use Redis to share rate limit state across servers
2. **Configurable Limits**: Allow dynamic configuration of rate limits without server restart
3. **Per-User Rate Limiting**: Additional rate limiting based on user ID (after authentication)
4. **Graduated Limits**: Increase limits for trusted users or API keys
5. **Analytics**: Track and analyze rate limit violations for security insights

## Compliance

✓ Requirement 10.10: OAuth and logout endpoints are rate-limited to prevent brute-force and DDoS attacks
✓ Requirement 13.8: All environment variables documented with comprehensive comments and examples
