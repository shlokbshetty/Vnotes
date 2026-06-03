/**
 * OAuth Service
 * 
 * Handles Google OAuth 2.0 token exchange and ID token verification.
 * - Exchanges authorization codes for tokens
 * - Verifies ID token signatures
 * - Extracts user profile data from tokens
 * - Handles OAuth errors
 * 
 * Requirements: 1.2, 1.3, 2.1, 2.2
 */

import { getGoogleAuthClient } from '../config/oauth';
import { GoogleIDTokenClaims } from '../types/auth';
import { logger } from '../utils/logger';

/**
 * Token Exchange Response from Google
 */
export interface TokenExchangeResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

/**
 * Verified ID Token with Claims
 */
export interface VerifiedIDToken {
  claims: GoogleIDTokenClaims;
  token: string;
}

/**
 * Exchange an authorization code for tokens from Google
 * 
 * This implements the authorization code flow where:
 * 1. User authenticates with Google and grants permission
 * 2. Google redirects with an authorization code
 * 3. Backend exchanges code for tokens via Google's token endpoint
 * 
 * Requirements: 1.2, 1.3, 2.1, 2.2
 * 
 * @param authorizationCode - The authorization code from Google
 * @returns Token exchange response with access_token and id_token
 * @throws Error if token exchange fails
 */
export async function exchangeAuthorizationCode(
  authorizationCode: string
): Promise<TokenExchangeResponse> {
  try {
    if (!authorizationCode) {
      logger.error('Authorization code is required for token exchange');
      throw new Error('Authorization code is required');
    }

    logger.info('Attempting to exchange authorization code for tokens');

    // Get the Google OAuth client
    const client = getGoogleAuthClient();

    // Exchange the authorization code for tokens
    // getToken() calls Google's token endpoint with the authorization code
    const { tokens } = await client.getToken(authorizationCode);

    // Validate that we received the expected tokens
    if (!tokens.id_token) {
      logger.error('Google token exchange succeeded but id_token was not returned');
      throw new Error('ID token not received from Google');
    }

    if (!tokens.access_token) {
      logger.error('Google token exchange succeeded but access_token was not returned');
      throw new Error('Access token not received from Google');
    }

    logger.info('Successfully exchanged authorization code for tokens');

    // Return the tokens
    return {
      access_token: tokens.access_token,
      id_token: tokens.id_token,
      token_type: tokens.token_type || 'Bearer',
      expires_in: tokens.expiry_date
        ? Math.floor((tokens.expiry_date - Date.now()) / 1000)
        : 3600,
      scope: tokens.scope,
    };
  } catch (error) {
    // Handle specific Google OAuth errors
    if (error instanceof Error) {
      const errorMessage = error.message;

      // Log the error with context - including full error object for debugging
      logger.error('Authorization code exchange failed', {
        error: errorMessage,
        code: authorizationCode?.substring(0, 10) + '***',
        fullError: JSON.stringify(error, null, 2),
        stack: error.stack,
      });

      // Categorize the error for better error responses
      if (errorMessage.includes('invalid_grant')) {
        // Authorization code is invalid, expired, or already used
        throw new Error('invalid_grant: Authorization code is invalid or expired');
      } else if (errorMessage.includes('invalid_client')) {
        // OAuth client credentials are invalid
        logger.error('OAuth client credentials are invalid - check GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET');
        throw new Error('OAuth configuration error');
      } else if (errorMessage.includes('redirect_uri_mismatch')) {
        // Redirect URI doesn't match configured URI
        logger.error('Redirect URI mismatch - check GOOGLE_OAUTH_CALLBACK_URI configuration');
        throw new Error('OAuth configuration error');
      } else if (errorMessage.includes('Network')) {
        // Network error communicating with Google
        throw new Error('network_error: Failed to reach Google OAuth service');
      } else {
        // Generic token exchange error
        throw new Error(`Token exchange failed: ${errorMessage}`);
      }
    } else {
      logger.error('Unexpected error during token exchange', { error });
      throw new Error('Token exchange failed: Unknown error');
    }
  }
}

/**
 * Verify an ID token's signature using Google's public keys
 * 
 * This validates that:
 * 1. The token was signed by Google (signature verification)
 * 2. The token hasn't been modified (integrity check)
 * 3. The token hasn't expired
 * 4. The token was issued for our application (audience check)
 * 
 * Requirements: 1.4, 1.5, 1.6
 * 
 * @param idToken - The ID token to verify
 * @returns Verified token with decoded claims
 * @throws Error if verification fails
 */
export async function verifyIDTokenSignature(idToken: string): Promise<VerifiedIDToken> {
  try {
    if (!idToken) {
      logger.error('ID token is required for verification');
      throw new Error('ID token is required');
    }

    logger.info('Verifying ID token signature');

    // Get the Google OAuth client
    const client = getGoogleAuthClient();

    // Verify the token signature using Google's public keys
    // getPayload() automatically:
    // - Fetches Google's public JWKS keys
    // - Verifies the signature
    // - Validates expiration
    // - Validates issuer
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
    });

    // Extract the claims from the verified token
    const payload = ticket.getPayload();

    if (!payload) {
      logger.error('ID token verification returned empty payload');
      throw new Error('Invalid ID token payload');
    }

    // Cast payload to our GoogleIDTokenClaims interface
    const claims: GoogleIDTokenClaims = {
      sub: payload.sub || '',
      email: payload.email || '',
      name: payload.name || '',
      picture: payload.picture,
      email_verified: payload.email_verified,
      iss: payload.iss || '',
      aud: payload.aud || '',
      iat: payload.iat || 0,
      exp: payload.exp || 0,
    };

    // Validate required claims
    if (!claims.sub || !claims.email) {
      logger.error('ID token missing required claims (sub or email)', {
        hasSub: !!claims.sub,
        hasEmail: !!claims.email,
      });
      throw new Error('ID token missing required claims');
    }

    logger.info('ID token signature verified successfully', {
      sub: claims.sub,
      email: claims.email,
    });

    return {
      claims,
      token: idToken,
    };
  } catch (error) {
    // Handle specific verification errors
    if (error instanceof Error) {
      const errorMessage = error.message;

      logger.warn('ID token verification failed', { error: errorMessage });

      // Categorize the error for better error responses
      if (errorMessage.includes('invalid signature')) {
        throw new Error('invalid_signature: Token signature verification failed');
      } else if (errorMessage.includes('Token expired')) {
        throw new Error('token_expired: ID token has expired');
      } else if (errorMessage.includes('invalid audience')) {
        logger.error('ID token audience mismatch - check GOOGLE_OAUTH_CLIENT_ID configuration');
        throw new Error('invalid_audience: Token audience does not match');
      } else if (errorMessage.includes('invalid issuer')) {
        throw new Error('invalid_issuer: Token issuer is invalid');
      } else {
        throw error;
      }
    } else {
      logger.error('Unexpected error during ID token verification', { error });
      throw new Error('ID token verification failed: Unknown error');
    }
  }
}

/**
 * Extract user profile data from a verified ID token
 * 
 * Pulls out the user information we need for profile creation:
 * - Google subject ID (unique identifier)
 * - Email address
 * - Full name
 * - Profile picture URL
 * 
 * Requirements: 1.5
 * 
 * @param idTokenClaims - The verified ID token claims
 * @returns User profile data extracted from claims
 */
export function extractUserProfileFromIDToken(idTokenClaims: GoogleIDTokenClaims): {
  google_id: string;
  email: string;
  name: string;
  profile_picture_url?: string;
} {
  // Validate required fields
  if (!idTokenClaims.sub || !idTokenClaims.email) {
    throw new Error('ID token is missing required fields (sub or email)');
  }

  return {
    google_id: idTokenClaims.sub,
    email: idTokenClaims.email,
    name: idTokenClaims.name || idTokenClaims.email.split('@')[0], // Fallback to email prefix if no name
    profile_picture_url: idTokenClaims.picture,
  };
}

/**
 * Complete OAuth token exchange and verification flow
 * 
 * This is a convenience function that:
 * 1. Exchanges the authorization code for tokens
 * 2. Verifies the ID token signature
 * 3. Extracts user profile data
 * 
 * This is the main entry point for the OAuth callback handler.
 * 
 * @param authorizationCode - The authorization code from Google
 * @returns User profile data and tokens
 * @throws Error if any step fails
 */
export async function completeOAuthFlow(authorizationCode: string): Promise<{
  userProfile: {
    google_id: string;
    email: string;
    name: string;
    profile_picture_url?: string;
  };
  tokens: TokenExchangeResponse;
}> {
  try {
    logger.info('Starting OAuth flow for authorization code');

    // Step 1: Exchange authorization code for tokens
    const tokens = await exchangeAuthorizationCode(authorizationCode);

    // Step 2: Verify ID token signature
    const verifiedToken = await verifyIDTokenSignature(tokens.id_token);

    // Step 3: Extract user profile from verified token
    const userProfile = extractUserProfileFromIDToken(verifiedToken.claims);

    logger.info('OAuth flow completed successfully', {
      email: userProfile.email,
      google_id: userProfile.google_id,
    });

    return {
      userProfile,
      tokens,
    };
  } catch (error) {
    logger.error('OAuth flow failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
