/**
 * Authentication Middleware
 * 
 * Express middleware for validating session tokens on protected routes.
 * - Extracts Bearer token from Authorization header
 * - Validates token signature and expiration
 * - Checks token revocation status
 * - Attaches user information to request context
 */

import { Request, Response, NextFunction } from 'express';
import { validateSessionToken, extractUserId, extractEmail, extractGoogleId, JWTValidationError } from '../services/authService';
import { isSessionRevoked } from '../utils/sessionStore';
import { logger } from '../utils/logger';

/**
 * Extended Express Request interface with auth context
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      email?: string;
      googleId?: string;
    }
  }
}

/**
 * Extract Bearer token from Authorization header
 * 
 * @param authHeader - Authorization header value
 * @returns Token string or null if not found or malformed
 */
function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2) {
    return null;
  }

  const [scheme, token] = parts;

  if (scheme !== 'Bearer' && scheme !== 'bearer') {
    return null;
  }

  return token;
}

/**
 * Main authentication middleware
 * 
 * Usage: app.use(authMiddleware) for global protection or
 *        app.get('/protected', authMiddleware, handler) for specific routes
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    // Check if header exists and is not just whitespace
    if (!authHeader || (typeof authHeader === 'string' && !authHeader.trim())) {
      logger.warn('Missing Authorization header', {
        path: req.path,
        method: req.method,
      });
      res.status(401).json({
        success: false,
        message: 'Missing Authorization header',
        code: 'MISSING_AUTH_HEADER',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Extract Bearer token
    const token = extractBearerToken(authHeader);

    if (!token) {
      logger.warn('Malformed Authorization header', {
        path: req.path,
        method: req.method,
        header: authHeader?.substring(0, 10) + '...',
      });
      res.status(400).json({
        success: false,
        message: 'Malformed Authorization header. Expected: Bearer <token>',
        code: 'MALFORMED_AUTH_HEADER',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Check if token is revoked (perform quick check before expensive validation)
    if (isSessionRevoked(token)) {
      logger.warn('Revoked token used', {
        path: req.path,
        method: req.method,
        tokenPrefix: token.substring(0, 10),
      });
      res.status(401).json({
        success: false,
        message: 'Session has been revoked',
        code: 'TOKEN_REVOKED',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Validate token signature and expiration
    const payload = validateSessionToken(token);

    // Extract user information from token
    const userId = extractUserId(payload);
    const email = extractEmail(payload);
    const googleId = extractGoogleId(payload);

    // Attach to request context for use in route handlers
    req.userId = userId;
    req.email = email;
    req.googleId = googleId;

    logger.debug('Token validated successfully', {
      userId,
      email,
      path: req.path,
    });

    // Pass to next middleware/handler
    next();
  } catch (error) {
    // Handle JWTValidationError specifically
    if (error instanceof JWTValidationError) {
      const statusCode = error.getHttpStatus();
      const errorCode = `JWT_${error.type}`;

      logger.warn('JWT validation failed', {
        type: error.type,
        message: error.message,
        path: req.path,
        method: req.method,
      });

      res.status(statusCode).json({
        success: false,
        message: 'Session validation failed. Please log in again.',
        code: errorCode,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error('Unexpected error during token validation', {
      error: errorMessage,
      path: req.path,
      method: req.method,
    });

    res.status(401).json({
      success: false,
      message: 'Session validation failed. Please log in again.',
      code: 'TOKEN_VALIDATION_FAILED',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Optional: Middleware for routes that allow both authenticated and unauthenticated requests
 * Attaches user info if token is valid, but doesn't require authentication
 */
export function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // No token provided, continue without auth
      return next();
    }

    const token = extractBearerToken(authHeader);

    if (!token) {
      // Malformed header, but don't require auth, just skip
      return next();
    }

    // Check if token is revoked
    if (isSessionRevoked(token)) {
      // Token is revoked, treat as unauthenticated
      return next();
    }

    // Try to validate token
    const payload = validateSessionToken(token);
    req.userId = extractUserId(payload);
    req.email = extractEmail(payload);
    req.googleId = extractGoogleId(payload);

    logger.debug('Optional auth token validated', { userId: req.userId });
  } catch (error) {
    // Validation failed, but don't require auth, just continue
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.debug('Optional auth validation skipped', { error: errorMessage });
  }

  next();
}
