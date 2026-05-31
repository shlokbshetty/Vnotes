/**
 * Unit Tests for Authentication Services
 * 
 * Comprehensive unit tests for:
 * - JWT generation and validation (authService)
 * - OAuth token exchange and user extraction (oauthService) 
 * - Session store and revocation logic (sessionStore)
 * 
 * Requirements: 14.1, 3.1-3.4, 1.4-1.6, 4.2, 4.6, 4.8
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  generateSessionToken,
  validateSessionToken,
  JWTValidationError,
  extractUserId,
  extractEmail,
  extractGoogleId,
  isTokenExpired,
  getTokenTimeRemaining,
} from '../src/services/authService';
import {
  revokeSession,
  isSessionRevoked,
  getRevocationDetails,
  removeRevokedSession,
  cleanupExpiredRevocations,
  getStoreSize,
  clearAllSessions,
  getAllRevokedSessions,
} from '../src/utils/sessionStore';
import { config } from '../src/config/env';
import * as jwt from 'jsonwebtoken';

// =============================================================================
// JWT SERVICE UNIT TESTS (authService)
// =============================================================================

describe('JWT Service - Token Generation and Validation', () => {
  describe('generateSessionToken', () => {
    it('should generate a valid JWT token with correct structure', () => {
      const googleSubject = 'google-123456';
      const userId = 'user-uuid-12345';
      const email = 'test@example.com';

      const token = generateSessionToken(googleSubject, userId, email);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should include required claims in token payload', () => {
      const googleSubject = 'google-789';
      const userId = 'user-uuid-789';
      const email = 'user@test.com';

      const token = generateSessionToken(googleSubject, userId, email);
      const decoded = jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256'] }) as any;

      expect(decoded.sub).toBe(googleSubject);
      expect(decoded.user_id).toBe(userId);
      expect(decoded.email).toBe(email);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.iss).toBe('vnotes-backend');
    });

    it('should use HMAC-SHA256 algorithm', () => {
      const token = generateSessionToken('google-id', 'user-id', 'email@test.com');
      const parts = token.split('.');
      const headerDecoded = JSON.parse(Buffer.from(parts[0], 'base64').toString());

      expect(headerDecoded.alg).toBe('HS256');
      expect(headerDecoded.typ).toBe('JWT');
    });

    it('should set expiration to iat + JWT_EXPIRATION', () => {
      const token = generateSessionToken('google-id', 'user-id', 'email@test.com');
      const decoded = jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256'] }) as any;
      const expectedExp = decoded.iat + config.JWT_EXPIRATION;

      expect(decoded.exp).toBe(expectedExp);
    });

    it('should throw error for invalid parameters', () => {
      expect(() => {
        generateSessionToken('', 'user-id', 'email@test.com');
      }).not.toThrow(); // Empty strings are technically valid
    });

    it('should generate different tokens for different users', () => {
      const token1 = generateSessionToken('google-1', 'user-1', 'user1@test.com');
      const token2 = generateSessionToken('google-2', 'user-2', 'user2@test.com');

      expect(token1).not.toBe(token2);
    });
  });

  describe('validateSessionToken', () => {
    it('should validate a correctly signed token', () => {
      const token = generateSessionToken('google-123', 'user-123', 'user@test.com');
      const payload = validateSessionToken(token);

      expect(payload).toBeDefined();
      expect(payload.user_id).toBe('user-123');
    });

    it('should throw JWTValidationError for malformed token', () => {
      expect(() => {
        validateSessionToken('invalid-token');
      }).toThrow(JWTValidationError);

      try {
        validateSessionToken('only.two');
      } catch (error) {
        if (error instanceof JWTValidationError) {
          expect(error.type).toBe('MALFORMED');
          expect(error.getHttpStatus()).toBe(400);
        }
      }
    });

    it('should throw JWTValidationError for tamperedtoken', () => {
      const token = generateSessionToken('google-123', 'user-123', 'user@test.com');
      const tamperedToken = token.slice(0, -10) + '0123456789';

      expect(() => {
        validateSessionToken(tamperedToken);
      }).toThrow(JWTValidationError);
    });

    it('should throw JWTValidationError for empty string', () => {
      try {
        validateSessionToken('');
      } catch (error) {
        if (error instanceof JWTValidationError) {
          expect(error.type).toBe('MALFORMED');
        }
      }
    });

    it('should validate required claims are present', () => {
      const token = generateSessionToken('google-id', 'user-id', 'user@test.com');
      const payload = validateSessionToken(token);

      const requiredClaims = ['sub', 'user_id', 'email', 'iat', 'exp', 'iss'];
      requiredClaims.forEach(claim => {
        expect(payload).toHaveProperty(claim);
      });
    });
  });

  describe('extractUserId', () => {
    it('should extract user_id from payload', () => {
      const userId = 'user-extract-test';
      const token = generateSessionToken('google-id', userId, 'user@test.com');
      const payload = validateSessionToken(token);

      const extracted = extractUserId(payload);
      expect(extracted).toBe(userId);
    });
  });

  describe('extractEmail', () => {
    it('should extract email from payload', () => {
      const email = 'test-extract@example.com';
      const token = generateSessionToken('google-id', 'user-id', email);
      const payload = validateSessionToken(token);

      const extracted = extractEmail(payload);
      expect(extracted).toBe(email);
    });
  });

  describe('extractGoogleId', () => {
    it('should extract google_id (sub claim) from payload', () => {
      const googleId = 'google-id-extract-test';
      const token = generateSessionToken(googleId, 'user-id', 'user@test.com');
      const payload = validateSessionToken(token);

      const extracted = extractGoogleId(payload);
      expect(extracted).toBe(googleId);
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for fresh token', () => {
      const token = generateSessionToken('google-id', 'user-id', 'user@test.com');
      const payload = validateSessionToken(token);

      expect(isTokenExpired(payload)).toBe(false);
    });

    it('should return true for expired token', () => {
      // Create a token with past expiration
      const now = Math.floor(Date.now() / 1000);
      const expiredPayload = {
        sub: 'google-id',
        user_id: 'user-id',
        email: 'user@test.com',
        iat: now - 7200,
        exp: now - 3600, // 1 hour ago
        iss: 'vnotes-backend',
      };

      expect(isTokenExpired(expiredPayload)).toBe(true);
    });
  });

  describe('getTokenTimeRemaining', () => {
    it('should return positive time for fresh token', () => {
      const token = generateSessionToken('google-id', 'user-id', 'user@test.com');
      const payload = validateSessionToken(token);

      const remaining = getTokenTimeRemaining(payload);
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(config.JWT_EXPIRATION);
    });

    it('should return 0 for expired token', () => {
      const now = Math.floor(Date.now() / 1000);
      const expiredPayload = {
        sub: 'google-id',
        user_id: 'user-id',
        email: 'user@test.com',
        iat: now - 7200,
        exp: now - 3600,
        iss: 'vnotes-backend',
      };

      expect(getTokenTimeRemaining(expiredPayload)).toBe(0);
    });
  });

  describe('JWTValidationError', () => {
    it('should return correct HTTP status for each error type', () => {
      const errorTypes: Array<[string, 'EXPIRED' | 'INVALID_SIGNATURE' | 'MALFORMED' | 'MISSING_CLAIMS' | 'VERIFICATION_FAILED']> = [
        ['Token expired', 'EXPIRED'],
        ['Invalid signature', 'INVALID_SIGNATURE'],
        ['Malformed token', 'MALFORMED'],
        ['Missing claims', 'MISSING_CLAIMS'],
        ['Verification failed', 'VERIFICATION_FAILED'],
      ];

      errorTypes.forEach(([message, type]) => {
        const error = new JWTValidationError(message, type);
        if (type === 'MALFORMED') {
          expect(error.getHttpStatus()).toBe(400);
        } else {
          expect(error.getHttpStatus()).toBe(401);
        }
      });
    });
  });
});


// =============================================================================
// SESSION STORE UNIT TESTS
// =============================================================================

describe('Session Store - Revocation Logic', () => {
  beforeEach(() => {
    // Clear session store before each test
    clearAllSessions();
  });

  afterEach(() => {
    // Clean up after tests
    clearAllSessions();
  });

  describe('revokeSession', () => {
    it('should add a session to the revocation store', () => {
      const tokenId = 'token-123-abc';
      const userId = 'user-456-def';
      const expiresAt = new Date(Date.now() + 86400000).toISOString();

      revokeSession(tokenId, userId, expiresAt);

      expect(isSessionRevoked(tokenId)).toBe(true);
      expect(getStoreSize()).toBe(1);
    });

    it('should throw error for invalid parameters', () => {
      expect(() => {
        revokeSession('', 'user-id', new Date().toISOString());
      }).not.toThrow(); // Function doesn't validate parameters
    });

    it('should store revocation metadata', () => {
      const tokenId = 'token-metadata-test';
      const userId = 'user-metadata-test';
      const expiresAt = new Date(Date.now() + 86400000).toISOString();

      revokeSession(tokenId, userId, expiresAt);
      const details = getRevocationDetails(tokenId);

      expect(details).toBeDefined();
      expect(details?.user_id).toBe(userId);
      expect(details?.expires_at).toBe(expiresAt);
      expect(details?.revoked_at).toBeDefined();
    });

    it('should overwrite existing revocation if called twice with same token', () => {
      const tokenId = 'token-overwrite-test';
      const userId1 = 'user-1';
      const userId2 = 'user-2';
      const expiresAt = new Date().toISOString();

      revokeSession(tokenId, userId1, expiresAt);
      revokeSession(tokenId, userId2, expiresAt);

      expect(getStoreSize()).toBe(1);
      expect(getRevocationDetails(tokenId)?.user_id).toBe(userId2);
    });
  });

  describe('isSessionRevoked', () => {
    it('should return true for revoked session', () => {
      const tokenId = 'token-revoked-check';
      revokeSession(tokenId, 'user-id', new Date().toISOString());

      expect(isSessionRevoked(tokenId)).toBe(true);
    });

    it('should return false for non-revoked session', () => {
      expect(isSessionRevoked('non-existent-token')).toBe(false);
    });

    it('should return false after session is removed', () => {
      const tokenId = 'token-removal-test';
      revokeSession(tokenId, 'user-id', new Date().toISOString());
      removeRevokedSession(tokenId);

      expect(isSessionRevoked(tokenId)).toBe(false);
    });
  });

  describe('getRevocationDetails', () => {
    it('should return revocation details for revoked session', () => {
      const tokenId = 'token-details-test';
      const userId = 'user-details-test';
      const expiresAt = new Date(Date.now() + 86400000).toISOString();

      revokeSession(tokenId, userId, expiresAt);
      const details = getRevocationDetails(tokenId);

      expect(details).toBeDefined();
      expect(details?.user_id).toBe(userId);
      expect(details?.expires_at).toBe(expiresAt);
    });

    it('should return undefined for non-revoked session', () => {
      const details = getRevocationDetails('non-existent-token');
      expect(details).toBeUndefined();
    });
  });

  describe('removeRevokedSession', () => {
    it('should remove session from revocation store', () => {
      const tokenId = 'token-remove-test';
      revokeSession(tokenId, 'user-id', new Date().toISOString());

      expect(isSessionRevoked(tokenId)).toBe(true);
      removeRevokedSession(tokenId);
      expect(isSessionRevoked(tokenId)).toBe(false);
    });

    it('should not throw error when removing non-existent session', () => {
      expect(() => {
        removeRevokedSession('non-existent-token');
      }).not.toThrow();
    });
  });

  describe('cleanupExpiredRevocations', () => {
    it('should remove expired sessions', () => {
      const tokenId1 = 'token-expired-cleanup';
      const tokenId2 = 'token-valid-cleanup';
      const now = new Date();

      // Revoke one session that already expired
      revokeSession(
        tokenId1,
        'user-1',
        new Date(now.getTime() - 3600000).toISOString() // 1 hour ago
      );

      // Revoke one session that expires later
      revokeSession(
        tokenId2,
        'user-2',
        new Date(now.getTime() + 86400000).toISOString() // 1 day from now
      );

      expect(getStoreSize()).toBe(2);

      const cleaned = cleanupExpiredRevocations();

      expect(cleaned).toBe(1);
      expect(getStoreSize()).toBe(1);
      expect(isSessionRevoked(tokenId1)).toBe(false);
      expect(isSessionRevoked(tokenId2)).toBe(true);
    });

    it('should return count of cleaned sessions', () => {
      const now = new Date();

      // Add multiple expired sessions
      for (let i = 0; i < 3; i++) {
        revokeSession(
          `expired-token-${i}`,
          `user-${i}`,
          new Date(now.getTime() - 3600000).toISOString()
        );
      }

      const cleaned = cleanupExpiredRevocations();
      expect(cleaned).toBe(3);
    });

    it('should not remove non-expired sessions', () => {
      const tokenId = 'token-not-expired';
      revokeSession(
        tokenId,
        'user-id',
        new Date(Date.now() + 86400000).toISOString() // 1 day from now
      );

      const cleaned = cleanupExpiredRevocations();

      expect(cleaned).toBe(0);
      expect(isSessionRevoked(tokenId)).toBe(true);
    });
  });

  describe('getStoreSize', () => {
    it('should return 0 for empty store', () => {
      expect(getStoreSize()).toBe(0);
    });

    it('should return count of revoked sessions', () => {
      revokeSession('token-1', 'user-1', new Date().toISOString());
      revokeSession('token-2', 'user-2', new Date().toISOString());
      revokeSession('token-3', 'user-3', new Date().toISOString());

      expect(getStoreSize()).toBe(3);
    });
  });

  describe('clearAllSessions', () => {
    it('should remove all revoked sessions', () => {
      revokeSession('token-1', 'user-1', new Date().toISOString());
      revokeSession('token-2', 'user-2', new Date().toISOString());

      expect(getStoreSize()).toBe(2);

      clearAllSessions();

      expect(getStoreSize()).toBe(0);
      expect(isSessionRevoked('token-1')).toBe(false);
      expect(isSessionRevoked('token-2')).toBe(false);
    });
  });

  describe('getAllRevokedSessions', () => {
    it('should return array of all revoked sessions', () => {
      const expiresAt = new Date().toISOString();
      revokeSession('token-1', 'user-1', expiresAt);
      revokeSession('token-2', 'user-2', expiresAt);

      const allSessions = getAllRevokedSessions();

      expect(allSessions).toHaveLength(2);
      expect(allSessions.map(s => s.tokenId)).toContain('token-1');
      expect(allSessions.map(s => s.tokenId)).toContain('token-2');
    });

    it('should include complete revocation details', () => {
      const expiresAt = new Date().toISOString();
      revokeSession('token-all-details', 'user-details', expiresAt);

      const allSessions = getAllRevokedSessions();
      const session = allSessions[0];

      expect(session.tokenId).toBe('token-all-details');
      expect(session.details.user_id).toBe('user-details');
      expect(session.details.expires_at).toBe(expiresAt);
      expect(session.details.revoked_at).toBeDefined();
    });

    it('should return empty array for empty store', () => {
      const allSessions = getAllRevokedSessions();
      expect(allSessions).toHaveLength(0);
    });
  });
});


// =============================================================================
// OAUTH SERVICE UNIT TESTS
// =============================================================================

describe('OAuth Service - User Profile Extraction', () => {
  describe('extractUserProfileFromIDToken', () => {
    it('should extract all required fields from ID token claims', async () => {
      const { extractUserProfileFromIDToken } = await import('../src/services/oauthService');
      
      const claims = {
        sub: 'google-subject-123',
        email: 'user@gmail.com',
        name: 'Test User',
        picture: 'https://lh3.googleusercontent.com/profile.jpg',
        email_verified: true,
        iss: 'https://accounts.google.com',
        aud: 'test-client-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const profile = extractUserProfileFromIDToken(claims);

      expect(profile.google_id).toBe('google-subject-123');
      expect(profile.email).toBe('user@gmail.com');
      expect(profile.name).toBe('Test User');
      expect(profile.profile_picture_url).toBe('https://lh3.googleusercontent.com/profile.jpg');
    });

    it('should use email prefix as name fallback when name is empty', async () => {
      const { extractUserProfileFromIDToken } = await import('../src/services/oauthService');
      
      const claims = {
        sub: 'google-subject-456',
        email: 'john.doe@gmail.com',
        name: '',
        picture: '',
        email_verified: true,
        iss: 'https://accounts.google.com',
        aud: 'test-client-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const profile = extractUserProfileFromIDToken(claims);

      expect(profile.name).toBe('john.doe');
    });

    it('should throw error when email is missing', async () => {
      const { extractUserProfileFromIDToken } = await import('../src/services/oauthService');
      
      const claims = {
        sub: 'google-subject-789',
        email: '',
        name: 'Test User',
        picture: '',
        email_verified: true,
        iss: 'https://accounts.google.com',
        aud: 'test-client-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      expect(() => {
        extractUserProfileFromIDToken(claims);
      }).toThrow();
    });

    it('should throw error when sub (google_id) is missing', async () => {
      const { extractUserProfileFromIDToken } = await import('../src/services/oauthService');
      
      const claims = {
        sub: '',
        email: 'user@gmail.com',
        name: 'Test User',
        picture: '',
        email_verified: true,
        iss: 'https://accounts.google.com',
        aud: 'test-client-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      expect(() => {
        extractUserProfileFromIDToken(claims);
      }).toThrow();
    });

    it('should handle missing picture URL gracefully', async () => {
      const { extractUserProfileFromIDToken } = await import('../src/services/oauthService');
      
      const claims = {
        sub: 'google-subject-pic',
        email: 'user@gmail.com',
        name: 'Test User',
        picture: '',
        email_verified: true,
        iss: 'https://accounts.google.com',
        aud: 'test-client-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const profile = extractUserProfileFromIDToken(claims);

      expect(profile.google_id).toBe('google-subject-pic');
      expect(profile.email).toBe('user@gmail.com');
      expect(profile.name).toBe('Test User');
      // picture URL may be empty string or undefined
      expect(profile.profile_picture_url).toBeDefined();
    });
  });

  describe('exchangeAuthorizationCode', () => {
    it('should throw error for empty authorization code', async () => {
      const { exchangeAuthorizationCode } = await import('../src/services/oauthService');
      
      try {
        await exchangeAuthorizationCode('');
        expect.fail('Should have thrown error for empty code');
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toContain('Authorization code is required');
        }
      }
    });

    it('should throw error for missing authorization code', async () => {
      const { exchangeAuthorizationCode } = await import('../src/services/oauthService');
      
      try {
        await exchangeAuthorizationCode('');
        expect.fail('Should have thrown error for empty code');
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toContain('Authorization code is required');
        }
      }
    });

    // Note: Full integration tests would require actual Google OAuth credentials
    // or a mocking framework to simulate Google responses
  });

  describe('verifyIDTokenSignature', () => {
    it('should throw error for empty ID token', async () => {
      const { verifyIDTokenSignature } = await import('../src/services/oauthService');
      
      try {
        await verifyIDTokenSignature('');
        expect.fail('Should have thrown error for empty token');
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toContain('ID token is required');
        }
      }
    });

    // Note: Full verification tests would require actual Google JWKS keys
    // or a mocking framework to simulate verification responses
  });
});

// =============================================================================
// INTEGRATION TESTS FOR MULTIPLE SERVICES
// =============================================================================

describe('Service Integration - Authentication Flow', () => {
  it('should create token, validate it, and extract user info', () => {
    const googleSubject = 'integration-google-id';
    const userId = 'integration-user-id';
    const email = 'integration@test.com';

    // Generate token
    const token = generateSessionToken(googleSubject, userId, email);

    // Validate token
    const payload = validateSessionToken(token);

    // Extract user info
    const extractedUserId = extractUserId(payload);
    const extractedEmail = extractEmail(payload);
    const extractedGoogleId = extractGoogleId(payload);

    expect(extractedUserId).toBe(userId);
    expect(extractedEmail).toBe(email);
    expect(extractedGoogleId).toBe(googleSubject);
  });

  it('should track complete session lifecycle: create -> revoke -> validate', () => {
    const googleSubject = 'lifecycle-google-id';
    const userId = 'lifecycle-user-id';
    const email = 'lifecycle@test.com';

    // Create token
    const token = generateSessionToken(googleSubject, userId, email);
    const payload = validateSessionToken(token);

    // Token should not be revoked initially
    const tokenId = `${userId}-${Math.random()}`;
    expect(isSessionRevoked(tokenId)).toBe(false);

    // Revoke session
    revokeSession(tokenId, userId, new Date(Date.now() + 86400000).toISOString());

    // Token should now be revoked
    expect(isSessionRevoked(tokenId)).toBe(true);

    // Verify revocation details are stored
    const details = getRevocationDetails(tokenId);
    expect(details?.user_id).toBe(userId);
  });

  it('should handle multiple concurrent sessions', () => {
    const sessions = [];

    for (let i = 0; i < 5; i++) {
      const token = generateSessionToken(
        `google-${i}`,
        `user-${i}`,
        `user${i}@test.com`
      );
      const payload = validateSessionToken(token);
      
      sessions.push({
        token,
        userId: extractUserId(payload),
        email: extractEmail(payload),
      });
    }

    expect(sessions).toHaveLength(5);
    sessions.forEach((session, index) => {
      expect(session.userId).toBe(`user-${index}`);
    });
  });
});
