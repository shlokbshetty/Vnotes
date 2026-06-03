/**
 * User Routes
 * Handles user profile endpoints
 * 
 * Error Handling:
 * - 401: Missing/invalid authentication (handled by middleware)
 * - 500: Database/Supabase errors - returns generic message without exposing details
 * 
 * Requirements: 5.2, 5.4, 5.5, 9.5, 9.6
 */

import express, { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createErrorResponse } from '../services/authService';
import { categorizeDatabaseError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * GET /api/user/profile
 * Returns the authenticated user's profile data.
 * 
 * Error Handling:
 * - 401: Missing/invalid authentication (middleware)
 * - 500: Profile retrieval errors - generic message without database details
 *
 * Requirements: 5.2, 5.4, 5.5, 9.5
 */
router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const email = req.email;
    const googleId = req.googleId;

    // authMiddleware guarantees these are present, but guard defensively
    if (!userId || !email) {
      logger.error('User context missing after authMiddleware', { userId, email });
      return res.status(401).json(
        createErrorResponse('Authentication context is missing', 'MISSING_AUTH_CONTEXT')
      );
    }

    logger.info('Fetching user profile', { userId });

    // TODO (Supabase team): Query user profile from Supabase
    // Expected: await getUserProfileById(req.userId)
    // Should return: { user_id, email, name, profile_picture_url, account_created_timestamp, last_login_timestamp }
    // On error: Log full error internally, return generic 500 to client

    try {
      // This will be replaced with real Supabase query
      // For now, mock the response
      
      // Example error handling pattern:
      // const { data: profile, error } = await supabase
      //   .from('user_profiles')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .single();
      // 
      // if (error) {
      //   const errorInfo = categorizeDatabaseError(error);
      //   logger.error('Failed to retrieve user profile from Supabase', {
      //     userId,
      //     statusCode: errorInfo.statusCode,
      //     code: errorInfo.code,
      //     internalMessage: error.message,
      //   });
      //   return res.status(errorInfo.statusCode).json(
      //     createErrorResponse(errorInfo.message, errorInfo.code)
      //   );
      // }

      // Mock response using data available from JWT claims until Supabase is integrated
      const userProfile = {
        user_id: userId,
        email: email,
        // name and profile_picture_url are not stored in the JWT — Supabase will provide them
        name: null as string | null,
        profile_picture_url: null as string | null,
        account_created_timestamp: null as string | null,
        last_login_timestamp: null as string | null,
      };

      logger.info('User profile returned (mocked)', { userId });

      return res.status(200).json({
        success: true,
        user: userProfile,
      });
    } catch (error) {
      // Handle Supabase/database errors
      const errorInfo = categorizeDatabaseError(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      logger.error('Failed to retrieve user profile', {
        userId,
        statusCode: errorInfo.statusCode,
        code: errorInfo.code,
        internalMessage: errorMessage,
      });

      return res.status(errorInfo.statusCode).json(
        createErrorResponse(errorInfo.message, errorInfo.code)
      );
    }

  } catch (error) {
    // Catch-all for unexpected errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Unexpected error in GET /api/user/profile', {
      internalMessage: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return res.status(500).json(
      createErrorResponse('Failed to retrieve user profile', 'PROFILE_FETCH_ERROR')
    );
  }
});

export default router;
