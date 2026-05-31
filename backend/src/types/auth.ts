/**
 * Authentication Types
 * 
 * Defines TypeScript interfaces for authentication-related data structures,
 * including JWT payloads, user profiles, and session information.
 */

/**
 * JWT Token Payload Structure
 * Contains claims extracted from session tokens
 */
export interface JWTPayload {
  sub: string;              // Google subject identifier
  user_id: string;          // VNotes user UUID
  email: string;            // User email address
  iat: number;              // Issued at timestamp (seconds)
  exp: number;              // Expiration timestamp (seconds)
  iss: string;              // Issuer claim (backend identifier)
}

/**
 * User Profile Information
 * Represents a VNotes user's profile data
 */
export interface UserProfile {
  user_id: string;
  google_id: string;
  email: string;
  name: string;
  profile_picture_url?: string;
  account_created_timestamp: string;
  last_login_timestamp: string;
}

/**
 * OAuth ID Token Claims (from Google)
 * Extracted from Google's ID token
 */
export interface GoogleIDTokenClaims {
  sub: string;              // Google subject identifier
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
}

/**
 * Session Token Response
 * Returned to frontend after successful OAuth
 */
export interface SessionTokenResponse {
  success: boolean;
  sessionToken?: string;
  user?: UserProfile;
  expiresIn?: number;
  message?: string;
  code?: string;
  timestamp?: string;
}

/**
 * Revoked Session Entry
 * Tracks revoked tokens for immediate invalidation
 */
export interface RevokedSessionEntry {
  revoked_at: string;
  user_id: string;
  expires_at: string;
}

/**
 * Auth Middleware Context
 * Attached to request object after successful authentication
 */
export interface AuthContext {
  userId: string;
  email: string;
  googleId: string;
}

/**
 * Error Response Format
 * Standardized error response structure
 */
export interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  timestamp: string;
}

/**
 * JWT Validation Error Types
 * Used to distinguish between different authentication failure scenarios
 */
export type JWTErrorType = 'EXPIRED' | 'INVALID_SIGNATURE' | 'MALFORMED' | 'MISSING_CLAIMS' | 'VERIFICATION_FAILED';

/**
 * Success Response Format
 * Base structure for successful API responses
 */
export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  timestamp?: string;
}
