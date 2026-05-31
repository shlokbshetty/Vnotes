/**
 * Google OAuth Configuration Module
 * 
 * This module configures and initializes the Google OAuth 2.0 client
 * for backend server-side token exchange and ID token verification.
 * 
 * Requirements: 13.1, 13.2, 13.4
 */

import { OAuth2Client } from 'google-auth-library';

/**
 * Validate that required OAuth environment variables are set
 * @throws Error if required environment variables are missing
 */
function validateOAuthConfig(): void {
  const requiredVars = ['GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET', 'GOOGLE_OAUTH_CALLBACK_URI'];
  const missing: string[] = [];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required OAuth environment variables: ${missing.join(', ')}. ` +
      'Please set these in your .env file before starting the application.'
    );
  }
}

/**
 * OAuth Configuration Object
 * 
 * Stores Google OAuth credentials and endpoints
 * Implements Requirements 13.1, 13.2, 13.4
 */
export const oauthConfig = {
  // Google OAuth Credentials (from environment)
  clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
  callbackUri: process.env.GOOGLE_OAUTH_CALLBACK_URI || '',

  // Google OAuth Endpoints (public Google endpoints)
  endpoints: {
    // Authorization endpoint where user logs in to their Google account
    authorization: 'https://accounts.google.com/o/oauth2/v2/auth',
    // Token endpoint where backend exchanges auth code for tokens
    token: 'https://oauth2.googleapis.com/token',
    // JWKS endpoint for fetching Google's public keys for ID token verification
    jwks: 'https://www.googleapis.com/oauth2/v3/certs',
    // Revocation endpoint for invalidating tokens
    revocation: 'https://oauth2.googleapis.com/revoke',
  },

  // OAuth scopes required by the application
  scopes: [
    'openid', // Required for OpenID Connect
    'email', // User's email address
    'profile', // User's profile information (name, picture, etc.)
  ],

  // Validate configuration on module load
  isValid: (): boolean => {
    try {
      validateOAuthConfig();
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Initialize and return the Google OAuth 2.0 Client
 * 
 * This client is used to:
 * - Exchange authorization codes for tokens (POST /auth/oauth)
 * - Verify and decode ID tokens
 * - Validate token signatures against Google's public keys
 * 
 * @returns Configured OAuth2Client instance
 * @throws Error if required environment variables are not set
 */
export function initializeGoogleAuthClient(): OAuth2Client {
  // Validate that required configuration is present
  try {
    validateOAuthConfig();
  } catch (error) {
    console.error('OAuth configuration validation failed:', error instanceof Error ? error.message : String(error));
    throw error;
  }

  // Create and return OAuth2Client with credentials
  // The client will be used to exchange authorization codes for tokens
  const client = new OAuth2Client({
    clientId: oauthConfig.clientId,
    clientSecret: oauthConfig.clientSecret,
    redirectUri: oauthConfig.callbackUri,
  });

  return client;
}

/**
 * OAuth2Client instance - initialized once at application startup
 * This singleton instance is used throughout the application for:
 * - Token exchange (converting auth codes to tokens)
 * - ID token verification (validating Google's ID tokens)
 * - Token introspection
 */
let googleAuthClient: OAuth2Client | null = null;

/**
 * Get the singleton Google OAuth2 Client instance
 * Lazily initializes on first call
 * 
 * @returns The OAuth2Client instance
 */
export function getGoogleAuthClient(): OAuth2Client {
  if (!googleAuthClient) {
    googleAuthClient = initializeGoogleAuthClient();
  }
  return googleAuthClient;
}

export default oauthConfig;
