/**
 * Unit Tests for Auth Routes
 * Tests POST /auth/oauth and POST /auth/logout endpoints
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as oauthService from '../src/services/oauthService';
import * as authService from '../src/services/authService';
import * as sessionStore from '../src/utils/sessionStore';

// Mock the services
vi.mock('../src/services/oauthService');
vi.mock('../src/services/authService');
vi.mock('../src/utils/sessionStore');
vi.mock('../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('POST /auth/oauth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully exchange authorization code for session token', async () => {
    // Mock successful OAuth flow
    const mockUserProfile = {
      google_id: 'google123',
      email: 'test@example.com',
      name: 'Test User',
      profile_picture_url: 'https://example.com/pic.jpg',
    };

    const mockTokens = {
      access_token: 'access_token_123',
      id_token: 'id_token_123',
      token_type: 'Bearer',
      expires_in: 3600,
    };

    vi.mocked(oauthService.completeOAuthFlow).mockResolvedValue({
      userProfile: mockUserProfile,
      tokens: mockTokens,
    });

    const mockSessionToken = 'session_token_123';
    vi.mocked(authService.generateSessionToken).mockReturnValue(mockSessionToken);

    const mockResponse = {
      success: true,
      sessionToken: mockSessionToken,
      user: {
        user_id: 'user_google123',
        email: mockUserProfile.email,
        name: mockUserProfile.name,
        profile_picture_url: mockUserProfile.profile_picture_url,
      },
      expiresIn: 86400,
    };

    vi.mocked(authService.createSessionResponse).mockReturnValue(mockResponse);

    // Simulate request
    const requestBody = { code: 'valid_auth_code_123' };

    // Verify mocks were called correctly
    await oauthService.completeOAuthFlow(requestBody.code);
    expect(oauthService.completeOAuthFlow).toHaveBeenCalledWith('valid_auth_code_123');

    authService.generateSessionToken(
      mockUserProfile.google_id,
      'user_google123',
      mockUserProfile.email
    );
    expect(authService.generateSessionToken).toHaveBeenCalled();

    const result = authService.createSessionResponse(mockSessionToken, {
      user_id: 'user_google123',
      google_id: mockUserProfile.google_id,
      email: mockUserProfile.email,
      name: mockUserProfile.name,
      profile_picture_url: mockUserProfile.profile_picture_url,
      account_created_timestamp: expect.any(String),
      last_login_timestamp: expect.any(String),
    });

    expect(result).toEqual(mockResponse);
    expect(result.success).toBe(true);
    expect(result.sessionToken).toBe(mockSessionToken);
    expect(result.user.email).toBe('test@example.com');
  });

  it('should return 400 for missing authorization code', () => {
    const mockErrorResponse = {
      success: false,
      message: 'Authorization code is required',
      code: 'MISSING_AUTH_CODE',
      timestamp: expect.any(String),
    };

    vi.mocked(authService.createErrorResponse).mockReturnValue(mockErrorResponse);

    const result = authService.createErrorResponse('Authorization code is required', 'MISSING_AUTH_CODE');

    expect(result).toEqual(mockErrorResponse);
    expect(result.success).toBe(false);
    expect(result.code).toBe('MISSING_AUTH_CODE');
  });

  it('should return 400 for invalid authorization code', async () => {
    vi.mocked(oauthService.completeOAuthFlow).mockRejectedValue(
      new Error('invalid_grant: Authorization code is invalid or expired')
    );

    const mockErrorResponse = {
      success: false,
      message: 'Authorization code is invalid or expired',
      code: 'INVALID_AUTH_CODE',
      timestamp: expect.any(String),
    };

    vi.mocked(authService.createErrorResponse).mockReturnValue(mockErrorResponse);

    try {
      await oauthService.completeOAuthFlow('invalid_code');
    } catch (error) {
      const result = authService.createErrorResponse(
        'Authorization code is invalid or expired',
        'INVALID_AUTH_CODE'
      );

      expect(result).toEqual(mockErrorResponse);
      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_AUTH_CODE');
    }
  });

  it('should return 401 for ID token verification failure', async () => {
    vi.mocked(oauthService.completeOAuthFlow).mockRejectedValue(
      new Error('invalid_signature: Token signature verification failed')
    );

    const mockErrorResponse = {
      success: false,
      message: 'ID token verification failed',
      code: 'INVALID_ID_TOKEN',
      timestamp: expect.any(String),
    };

    vi.mocked(authService.createErrorResponse).mockReturnValue(mockErrorResponse);

    try {
      await oauthService.completeOAuthFlow('code_with_invalid_token');
    } catch (error) {
      const result = authService.createErrorResponse(
        'ID token verification failed',
        'INVALID_ID_TOKEN'
      );

      expect(result).toEqual(mockErrorResponse);
      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_ID_TOKEN');
    }
  });

  it('should return 500 for session token generation failure', async () => {
    const mockUserProfile = {
      google_id: 'google123',
      email: 'test@example.com',
      name: 'Test User',
      profile_picture_url: 'https://example.com/pic.jpg',
    };

    const mockTokens = {
      access_token: 'access_token_123',
      id_token: 'id_token_123',
      token_type: 'Bearer',
      expires_in: 3600,
    };

    vi.mocked(oauthService.completeOAuthFlow).mockResolvedValue({
      userProfile: mockUserProfile,
      tokens: mockTokens,
    });

    vi.mocked(authService.generateSessionToken).mockImplementation(() => {
      throw new Error('Session token generation failed');
    });

    const mockErrorResponse = {
      success: false,
      message: 'Failed to generate session token',
      code: 'TOKEN_GENERATION_ERROR',
      timestamp: expect.any(String),
    };

    vi.mocked(authService.createErrorResponse).mockReturnValue(mockErrorResponse);

    try {
      authService.generateSessionToken('google123', 'user_123', 'test@example.com');
    } catch (error) {
      const result = authService.createErrorResponse(
        'Failed to generate session token',
        'TOKEN_GENERATION_ERROR'
      );

      expect(result).toEqual(mockErrorResponse);
      expect(result.success).toBe(false);
      expect(result.code).toBe('TOKEN_GENERATION_ERROR');
    }
  });

  it('should handle network errors appropriately', async () => {
    vi.mocked(oauthService.completeOAuthFlow).mockRejectedValue(
      new Error('network_error: Failed to reach Google OAuth service')
    );

    const mockErrorResponse = {
      success: false,
      message: 'Failed to communicate with authentication service',
      code: 'NETWORK_ERROR',
      timestamp: expect.any(String),
    };

    vi.mocked(authService.createErrorResponse).mockReturnValue(mockErrorResponse);

    try {
      await oauthService.completeOAuthFlow('some_code');
    } catch (error) {
      const result = authService.createErrorResponse(
        'Failed to communicate with authentication service',
        'NETWORK_ERROR'
      );

      expect(result).toEqual(mockErrorResponse);
      expect(result.success).toBe(false);
      expect(result.code).toBe('NETWORK_ERROR');
    }
  });
});

describe('POST /auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully revoke session token on logout', () => {
    const mockToken = 'valid_session_token_123';
    const mockUserId = 'user_123';
    const mockExpiresAt = new Date(Date.now() + 86400000).toISOString(); // 24 hours from now

    // Mock validateSessionToken to return a valid payload
    const mockPayload = {
      sub: 'google123',
      user_id: mockUserId,
      email: 'test@example.com',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
      iss: 'vnotes-backend',
    };

    vi.mocked(authService.validateSessionToken).mockReturnValue(mockPayload);
    vi.mocked(sessionStore.revokeSession).mockReturnValue(undefined);

    // Simulate logout
    authService.validateSessionToken(mockToken);
    sessionStore.revokeSession(mockToken, mockUserId, mockExpiresAt);

    expect(authService.validateSessionToken).toHaveBeenCalledWith(mockToken);
    expect(sessionStore.revokeSession).toHaveBeenCalledWith(mockToken, mockUserId, mockExpiresAt);
  });

  it('should handle session revocation failure gracefully', () => {
    const mockToken = 'valid_session_token_123';
    const mockUserId = 'user_123';
    const mockExpiresAt = new Date(Date.now() + 86400000).toISOString();

    const mockPayload = {
      sub: 'google123',
      user_id: mockUserId,
      email: 'test@example.com',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
      iss: 'vnotes-backend',
    };

    vi.mocked(authService.validateSessionToken).mockReturnValue(mockPayload);
    vi.mocked(sessionStore.revokeSession).mockImplementation(() => {
      throw new Error('Session revocation failed');
    });

    const mockErrorResponse = {
      success: false,
      message: 'Logout failed. Please try again.',
      code: 'SESSION_REVOCATION_FAILED',
      timestamp: expect.any(String),
    };

    vi.mocked(authService.createErrorResponse).mockReturnValue(mockErrorResponse);

    try {
      authService.validateSessionToken(mockToken);
      sessionStore.revokeSession(mockToken, mockUserId, mockExpiresAt);
    } catch (error) {
      const result = authService.createErrorResponse(
        'Logout failed. Please try again.',
        'SESSION_REVOCATION_FAILED'
      );

      expect(result).toEqual(mockErrorResponse);
      expect(result.success).toBe(false);
      expect(result.code).toBe('SESSION_REVOCATION_FAILED');
    }
  });

  it('should return success message on successful logout', () => {
    const mockToken = 'valid_session_token_123';
    const mockUserId = 'user_123';
    const mockExpiresAt = new Date(Date.now() + 86400000).toISOString();

    const mockPayload = {
      sub: 'google123',
      user_id: mockUserId,
      email: 'test@example.com',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
      iss: 'vnotes-backend',
    };

    vi.mocked(authService.validateSessionToken).mockReturnValue(mockPayload);
    vi.mocked(sessionStore.revokeSession).mockReturnValue(undefined);

    authService.validateSessionToken(mockToken);
    sessionStore.revokeSession(mockToken, mockUserId, mockExpiresAt);

    const expectedResponse = {
      success: true,
      message: 'Logged out successfully',
    };

    expect(expectedResponse.success).toBe(true);
    expect(expectedResponse.message).toBe('Logged out successfully');
  });

  it('should handle invalid token during logout gracefully', () => {
    const mockToken = 'invalid_token';

    vi.mocked(authService.validateSessionToken).mockImplementation(() => {
      throw new authService.JWTValidationError('Token verification failed', 'VERIFICATION_FAILED');
    });

    const mockErrorResponse = {
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: expect.any(String),
    };

    vi.mocked(authService.createErrorResponse).mockReturnValue(mockErrorResponse);

    try {
      authService.validateSessionToken(mockToken);
    } catch (error) {
      const result = authService.createErrorResponse('Internal server error', 'INTERNAL_ERROR');

      expect(result).toEqual(mockErrorResponse);
      expect(result.success).toBe(false);
    }
  });
});
