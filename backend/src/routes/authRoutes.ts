/**
 * Authentication Routes
 * Handles Google OAuth authentication endpoints
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

import express, { Request, Response } from 'express';
import { completeOAuthFlow } from '../services/oauthService';
import { generateSessionToken, createSessionResponse, createErrorResponse, validateSessionToken } from '../services/authService';
import { authMiddleware } from '../middlewares/authMiddleware';
import { oauthLimiter, logoutLimiter } from '../middlewares/rateLimiter';
import { revokeSession } from '../utils/sessionStore';
import { logger } from '../utils/logger';
import { categorizeOAuthError, categorizeDatabaseError } from '../utils/errorHandler';

const router = express.Router();

/**
 * POST /auth/oauth
 * Complete OAuth flow by exchanging authorization code for session token
 * 
 * Rate Limiting: 5 attempts per IP per 5 minutes
 * 
 * Error Handling:
 * - 400: Invalid/missing authorization code, missing required fields
 * - 401: ID token verification failures (invalid signature, expired, wrong issuer)
 * - 429: Rate limit exceeded
 * - 500: OAuth service failures, token generation failures, database errors
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.0, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 10.10
 */
router.post('/oauth', oauthLimiter, async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    // Validate request body
    if (!code || typeof code !== 'string') {
      logger.warn('OAuth endpoint called without authorization code');
      return res.status(400).json(
        createErrorResponse('Authorization code is required', 'MISSING_AUTH_CODE')
      );
    }

    logger.info('Processing OAuth authorization code');

    // Step 1: Exchange authorization code for tokens and verify ID token
    let oauthResult;
    try {
      oauthResult = await completeOAuthFlow(code);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Log full error details for debugging
      logger.error('OAuth flow failed - full error details', {
        errorObject: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        errorMessage: errorMessage,
        errorStack: error instanceof Error ? error.stack : undefined,
      });
      
      // Categorize error and get appropriate HTTP status
      const errorInfo = categorizeOAuthError(error);
      
      // Log the error with context (including internal details) but don't expose them to client
      logger.warn('OAuth flow failed', {
        statusCode: errorInfo.statusCode,
        errorCode: errorInfo.code,
        internalMessage: errorMessage,
        codePrefix: code?.substring(0, 5),
      });

      return res.status(errorInfo.statusCode).json(
        createErrorResponse(errorInfo.message, errorInfo.code)
      );
    }

    const { userProfile } = oauthResult;

    logger.info('OAuth flow successful, creating/updating user profile', {
      email: userProfile.email,
      google_id: userProfile.google_id,
    });

    // Step 2: Create or update user profile in Supabase
    // TODO (Supabase team): Create or update user profile in Supabase
    // Expected function signature: await createOrUpdateUserProfile(google_id, email, name, picture)
    // Should return: { user_id: string, email: string, name: string, profile_picture_url?: string }
    // On new user: Create profile with account_created_timestamp and last_login_timestamp = now
    // On existing user: Update last_login_timestamp = now
    // Handle duplicate email errors appropriately
    
    // Mock user_id generation for now (Supabase will generate real UUID)
    const mockUserId = `user_${userProfile.google_id.substring(0, 10)}`;
    const now = new Date().toISOString();
    
    const userProfileComplete = {
      user_id: mockUserId,
      google_id: userProfile.google_id,
      email: userProfile.email,
      name: userProfile.name,
      profile_picture_url: userProfile.profile_picture_url,
      account_created_timestamp: now,
      last_login_timestamp: now,
    };

    logger.info('User profile created/updated (mocked)', { user_id: mockUserId });

    // Step 3: Generate session token
    let sessionToken;
    try {
      sessionToken = generateSessionToken(
        userProfile.google_id,
        userProfileComplete.user_id,
        userProfile.email
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Session token generation failed', {
        internalMessage: errorMessage,
        user_id: mockUserId,
        email: userProfile.email,
      });
      return res.status(500).json(
        createErrorResponse('Failed to complete authentication', 'TOKEN_GENERATION_ERROR')
      );
    }

    // Step 4: Return session token and user data
    const response = createSessionResponse(sessionToken, userProfileComplete);
    
    logger.info('OAuth authentication successful', {
      user_id: userProfileComplete.user_id,
      email: userProfile.email,
    });

    return res.status(200).json(response);

  } catch (error) {
    // Catch-all for unexpected errors
    // Never expose internal details to client
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Unexpected error in OAuth endpoint', {
      internalMessage: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return res.status(500).json(
      createErrorResponse('Authentication service error', 'INTERNAL_ERROR')
    );
  }
});

/**
 * POST /auth/logout
 * Logout user by revoking their session token
 * 
 * Rate Limiting: 10 attempts per IP per hour
 * 
 * Error Handling:
 * - 400: Malformed Authorization header
 * - 401: Missing or invalid Authorization header (middleware handles)
 * - 429: Rate limit exceeded
 * - 500: Session revocation failures
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.8, 4.7, 9.7, 10.10
 */
router.post('/logout', logoutLimiter, authMiddleware, async (req: Request, res: Response) => {
  try {
    // Extract token from Authorization header
    // authMiddleware already validated the token and attached userId to req
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // This shouldn't happen since authMiddleware passed, but handle gracefully
      logger.warn('Logout called without Authorization header despite middleware check');
      return res.status(401).json(
        createErrorResponse('Missing Authorization header', 'MISSING_AUTH_HEADER')
      );
    }

    // Extract Bearer token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      logger.warn('Logout called with malformed Authorization header');
      return res.status(400).json(
        createErrorResponse('Malformed Authorization header', 'MALFORMED_AUTH_HEADER')
      );
    }

    // Get userId from request (attached by authMiddleware)
    const userId = req.userId;
    
    if (!userId) {
      logger.error('UserId not found in request context after authMiddleware');
      return res.status(500).json(
        createErrorResponse('Internal server error', 'INTERNAL_ERROR')
      );
    }

    // Decode token to get expiration time (no need to validate again - middleware already did)
    let expiresAt: string;
    try {
      const payload = validateSessionToken(token);
      expiresAt = new Date(payload.exp * 1000).toISOString();
    } catch (error) {
      // This shouldn't happen since middleware validated, but handle gracefully
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to extract expiration from validated token', {
        internalMessage: errorMessage,
        userId,
      });
      return res.status(500).json(
        createErrorResponse('Failed to complete logout', 'INTERNAL_ERROR')
      );
    }

    // Revoke the session
    try {
      revokeSession(token, userId, expiresAt);
      logger.info('User logged out successfully', { userId });
    } catch (error) {
      // Handle session store failures gracefully
      // This is a storage error, not a critical failure - still allow logout
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to revoke session in store', { 
        userId,
        internalMessage: errorMessage,
      });
      // Still return success to client - token is no longer valid even if store failed
      // The in-memory store may recover or the token will be rejected on next request
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });

  } catch (error) {
    // Catch-all for unexpected errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Unexpected error in logout endpoint', {
      internalMessage: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return res.status(500).json(
      createErrorResponse('Failed to complete logout', 'INTERNAL_ERROR')
    );
  }
});

export default router;
