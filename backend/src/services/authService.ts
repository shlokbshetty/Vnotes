/**
 * Authentication Service
 * 
 * Handles JWT token generation, validation, and user authentication logic.
 * - Generates session tokens with user claims
 * - Validates token signatures and expiration
 * - Extracts user information from tokens
 */

import * as jwt from 'jsonwebtoken';
import { JWTPayload, UserProfile, ErrorResponse } from '../types/auth';
import { logger } from '../utils/logger';
import { config } from '../config/env';

// Use configuration from env.ts
const JWT_SECRET = config.JWT_SECRET;
const JWT_EXPIRATION = config.JWT_EXPIRATION;
const JWT_ISSUER = 'vnotes-backend';

/**
 * Generate a JWT session token for an authenticated user
 * 
 * @param googleSubject - Google's subject identifier
 * @param userId - VNotes user UUID (from Supabase)
 * @param email - User's email address
 * @returns JWT token string
 * @throws Error if token generation fails
 */
export function generateSessionToken(
  googleSubject: string,
  userId: string,
  email: string
): string {
  try {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + JWT_EXPIRATION;

    const payload: JWTPayload = {
      sub: googleSubject,
      user_id: userId,
      email: email,
      iat: now,
      exp: expiresAt,
      iss: JWT_ISSUER,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      algorithm: 'HS256',
    });

    logger.info('Session token generated for user', { userId, email });
    return token;
  } catch (error) {
    logger.error('Failed to generate session token', { error });
    throw new Error('Session token generation failed');
  }
}

/**
 * Custom error class for JWT validation failures
 * Distinguishes between different error types for HTTP response mapping
 */
export class JWTValidationError extends Error {
  constructor(
    message: string,
    public readonly type: 'EXPIRED' | 'INVALID_SIGNATURE' | 'MALFORMED' | 'MISSING_CLAIMS' | 'VERIFICATION_FAILED'
  ) {
    super(message);
    this.name = 'JWTValidationError';
  }

  /**
   * Get HTTP status code for this error type
   */
  getHttpStatus(): number {
    switch (this.type) {
      case 'EXPIRED':
        return 401; // Unauthorized - token expired
      case 'INVALID_SIGNATURE':
        return 401; // Unauthorized - signature verification failed
      case 'MALFORMED':
        return 400; // Bad Request - token format is wrong
      case 'MISSING_CLAIMS':
        return 401; // Unauthorized - required claims missing
      case 'VERIFICATION_FAILED':
        return 401; // Unauthorized - general verification failure
      default:
        return 401;
    }
  }
}

/**
 * Validate JWT token structure (format, not signature)
 * 
 * @param token - JWT token string to validate
 * @throws JWTValidationError if token format is invalid
 */
function validateTokenStructure(token: string): void {
  if (!token || typeof token !== 'string') {
    throw new JWTValidationError('Token must be a non-empty string', 'MALFORMED');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new JWTValidationError('Token must have three parts (header.payload.signature)', 'MALFORMED');
  }

  // Validate that each part is valid base64
  try {
    parts.forEach((part, index) => {
      if (!part) {
        throw new Error('Empty part');
      }
      // Base64 URL decode - add padding if needed
      const padded = part + '='.repeat((4 - part.length % 4) % 4);
      Buffer.from(padded, 'base64').toString('utf-8');
    });
  } catch (error) {
    throw new JWTValidationError('Token contains invalid base64 encoding', 'MALFORMED');
  }
}

/**
 * Validate required claims exist in JWT payload
 * 
 * @param payload - Decoded JWT payload
 * @throws JWTValidationError if required claims are missing
 */
function validateRequiredClaims(payload: any): void {
  const requiredClaims = ['sub', 'user_id', 'email', 'iat', 'exp', 'iss'];
  
  for (const claim of requiredClaims) {
    if (!(claim in payload)) {
      logger.warn('Missing required claim in token', { claim, payload });
      throw new JWTValidationError(`Token missing required claim: ${claim}`, 'MISSING_CLAIMS');
    }
  }

  // Validate claim types
  if (typeof payload.sub !== 'string' || !payload.sub) {
    throw new JWTValidationError('Token claim "sub" must be a non-empty string', 'MISSING_CLAIMS');
  }
  if (typeof payload.user_id !== 'string' || !payload.user_id) {
    throw new JWTValidationError('Token claim "user_id" must be a non-empty string', 'MISSING_CLAIMS');
  }
  if (typeof payload.email !== 'string' || !payload.email) {
    throw new JWTValidationError('Token claim "email" must be a non-empty string', 'MISSING_CLAIMS');
  }
  if (typeof payload.iat !== 'number' || payload.iat <= 0) {
    throw new JWTValidationError('Token claim "iat" must be a positive number', 'MISSING_CLAIMS');
  }
  if (typeof payload.exp !== 'number' || payload.exp <= 0) {
    throw new JWTValidationError('Token claim "exp" must be a positive number', 'MISSING_CLAIMS');
  }
  if (typeof payload.iss !== 'string' || !payload.iss) {
    throw new JWTValidationError('Token claim "iss" must be a non-empty string', 'MISSING_CLAIMS');
  }
}

/**
 * Validate a JWT session token
 * 
 * Performs comprehensive validation including:
 * - Token structure (3 parts separated by dots)
 * - Token signature against JWT_SECRET
 * - Token expiration time
 * - Required claims structure and types
 * - Issuer claim
 * 
 * @param token - JWT token string to validate
 * @returns Decoded payload if valid
 * @throws JWTValidationError with specific error type for different failure modes
 */
export function validateSessionToken(token: string): JWTPayload {
  try {
    // Step 1: Validate token structure
    validateTokenStructure(token);

    // Step 2: Verify signature and decode
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: JWT_ISSUER,
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('Token expired', { expiredAt: error.expiredAt });
        throw new JWTValidationError('Token has expired', 'EXPIRED');
      } else if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Invalid token signature or verification failed', { message: error.message });
        if (error.message.includes('invalid signature')) {
          throw new JWTValidationError('Token signature verification failed', 'INVALID_SIGNATURE');
        }
        throw new JWTValidationError('Token verification failed', 'VERIFICATION_FAILED');
      }
      throw error;
    }

    // Step 3: Validate required claims
    validateRequiredClaims(decoded);

    return decoded as JWTPayload;
  } catch (error) {
    if (error instanceof JWTValidationError) {
      throw error;
    }
    logger.error('Unexpected error during token validation', { error });
    throw new JWTValidationError('Token validation failed', 'VERIFICATION_FAILED');
  }
}

/**
 * Extract user_id from a validated JWT payload
 * 
 * @param payload - Decoded JWT payload
 * @returns User ID string
 */
export function extractUserId(payload: JWTPayload): string {
  return payload.user_id;
}

/**
 * Extract email from a validated JWT payload
 * 
 * @param payload - Decoded JWT payload
 * @returns Email string
 */
export function extractEmail(payload: JWTPayload): string {
  return payload.email;
}

/**
 * Extract Google ID from a validated JWT payload
 * 
 * @param payload - Decoded JWT payload
 * @returns Google subject identifier
 */
export function extractGoogleId(payload: JWTPayload): string {
  return payload.sub;
}

/**
 * Check if a token is expired
 * 
 * @param payload - Decoded JWT payload
 * @returns True if token is expired, false otherwise
 */
export function isTokenExpired(payload: JWTPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Get remaining time until token expiration
 * 
 * @param payload - Decoded JWT payload
 * @returns Remaining time in seconds (0 if expired)
 */
export function getTokenTimeRemaining(payload: JWTPayload): number {
  const now = Math.floor(Date.now() / 1000);
  const remaining = payload.exp - now;
  return Math.max(0, remaining);
}

/**
 * Create a session token response object
 * 
 * @param token - JWT session token
 * @param user - User profile information
 * @returns Formatted response object
 */
export function createSessionResponse(token: string, user: UserProfile) {
  return {
    success: true,
    sessionToken: token,
    user: {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      profile_picture_url: user.profile_picture_url,
    },
    expiresIn: JWT_EXPIRATION,
  };
}

/**
 * Create an error response object
 * 
 * @param message - User-facing error message
 * @param code - Error code for client-side handling
 * @returns Formatted error response
 */
export function createErrorResponse(message: string, code?: string): ErrorResponse {
  return {
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
  };
}
