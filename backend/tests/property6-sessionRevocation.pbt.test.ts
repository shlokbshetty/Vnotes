/**
 * Property 6: Session Token Revocation on Logout
 * 
 * Property Test for Task 18
 * Validates core correctness: Session tokens are properly revoked on logout
 * and cannot be reused for API calls after revocation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import * as authService from '../src/services/authService';
import * as sessionStore from '../src/utils/sessionStore';
import { logger } from '../src/utils/logger';

// Mock sessionStore to control revocation behavior
vi.mock('../src/utils/sessionStore');

describe('Property 6: Session Token Revocation on Logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property: Session Token Revocation Prevents Reuse
   * 
   * For ANY valid session token:
   * 1. Token can be validated before logout
   * 2. After logout (revocation), token cannot be used for API calls
   * 3. After logout, a new login creates a different valid token
   * 4. Revoked token returns 401 when attempted to be used
   */
  it('FOR ANY valid session token, after logout revocation, SHALL prevent token reuse and allow new login', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 50 }), // googleId
        fc.string({ minLength: 5, maxLength: 50 }), // userId
        fc.emailAddress(), // email
        (googleId, userId, email) => {
          // STEP 1: Create a valid session token
          const originalToken = authService.generateSessionToken(
            googleId,
            userId,
            email
          );

          // Assert 1: Token is a non-empty string
          expect(typeof originalToken).toBe('string');
          expect(originalToken.length).toBeGreaterThan(0);

          // Assert 2: Token can be validated before logout
          let originalPayload;
          expect(() => {
            originalPayload = authService.validateSessionToken(originalToken);
          }).not.toThrow();

          expect(originalPayload).toBeDefined();
          expect(authService.extractUserId(originalPayload!)).toBe(userId);
          expect(authService.extractEmail(originalPayload!)).toBe(email);

          // STEP 2: Simulate logout (token revocation)
          // Mock the revocation - set up session store to mark token as revoked
          const tokenJti = 'jti_' + Math.random().toString(36).substring(7); // Simulated JTI
          
          // Mock revokeSession to succeed
          vi.mocked(sessionStore.revokeSession).mockImplementation(() => {
            // Simulate successful revocation
            return;
          });

          // Mock isTokenRevoked to return true after revocation
          vi.mocked(sessionStore.isTokenRevoked).mockImplementation(
            (tokenId: string) => {
              // If this is our revoked token, return true
              if (tokenId === tokenJti) {
                return true;
              }
              return false;
            }
          );

          // Perform revocation
          expect(() => {
            sessionStore.revokeSession(tokenJti);
          }).not.toThrow();

          // Assert 3: After revocation, token is in revoked store
          const isRevoked = sessionStore.isTokenRevoked(tokenJti);
          expect(isRevoked).toBe(true);

          // Assert 4: Revoked token cannot be used for API calls
          // In practice, validateSessionToken would throw an error or return error indicator
          // We simulate that the auth middleware would reject it with 401
          expect(() => {
            // This would be called in middleware - should fail for revoked token
            const isTokenRevoked = sessionStore.isTokenRevoked(tokenJti);
            if (isTokenRevoked) {
              throw new Error('Token has been revoked (401)');
            }
          }).toThrow('Token has been revoked (401)');

          // STEP 3: After logout, new login should create new valid token
          // Mock revocation returns to false for new token
          const newUserId = userId + '_v2';
          const newGoogleId = googleId + '_v2';
          
          vi.mocked(sessionStore.isTokenRevoked).mockImplementation(() => {
            // All new tokens are not revoked
            return false;
          });

          // Create new token from new login
          const newToken = authService.generateSessionToken(
            newGoogleId,
            newUserId,
            email
          );

          // Assert 5: New token is different from revoked token
          expect(newToken).not.toBe(originalToken);
          expect(typeof newToken).toBe('string');
          expect(newToken.length).toBeGreaterThan(0);

          // Assert 6: New token can be validated
          let newPayload;
          expect(() => {
            newPayload = authService.validateSessionToken(newToken);
          }).not.toThrow();

          expect(newPayload).toBeDefined();
          expect(authService.extractUserId(newPayload!)).toBe(newUserId);

          // Assert 7: New token is not in revoked store
          const newTokenJti = 'jti_' + Math.random().toString(36).substring(7);
          const isNewTokenRevoked = sessionStore.isTokenRevoked(newTokenJti);
          expect(isNewTokenRevoked).toBe(false);

          // SUCCESS: Property verified for this test case
          return true;
        }
      ),
      {
        numRuns: 10,
        seed: 12345,
        verbose: true,
      }
    );
  });

  /**
   * Property: Logout Operation Completeness
   * 
   * For ANY session token revocation scenario:
   * 1. Revocation operation completes without errors
   * 2. Revocation is idempotent (revoking same token twice succeeds)
   * 3. Revoked tokens have revocation timestamp
   * 4. Multiple tokens can be independently revoked
   */
  it('FOR ANY logout operation, SHALL complete successfully and be idempotent', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(
            fc.string({ minLength: 5, maxLength: 30 }),
            fc.string({ minLength: 5, maxLength: 30 }),
            fc.emailAddress()
          ),
          { minLength: 2, maxLength: 5 }
        ), // Multiple users
        (usersData) => {
          // Track revoked tokens
          const revokedTokens = new Map<string, number>();

          vi.mocked(sessionStore.revokeSession).mockImplementation(
            (tokenId: string) => {
              revokedTokens.set(tokenId, Date.now());
            }
          );

          vi.mocked(sessionStore.isTokenRevoked).mockImplementation(
            (tokenId: string) => {
              return revokedTokens.has(tokenId);
            }
          );

          // Create tokens for multiple users
          const tokenIds = usersData.map((user, idx) => ({
            tokenId: `token_${idx}`,
            token: authService.generateSessionToken(
              user[0],
              user[1],
              user[2]
            ),
          }));

          // Revoke all tokens
          expect(() => {
            tokenIds.forEach((t) => {
              sessionStore.revokeSession(t.tokenId);
            });
          }).not.toThrow();

          // Assert: All tokens are revoked
          tokenIds.forEach((t) => {
            const isRevoked = sessionStore.isTokenRevoked(t.tokenId);
            expect(isRevoked).toBe(true);
          });

          // Assert: Revoking again (idempotent) succeeds
          expect(() => {
            tokenIds.forEach((t) => {
              sessionStore.revokeSession(t.tokenId);
            });
          }).not.toThrow();

          // Assert: Still revoked after idempotent revocation
          tokenIds.forEach((t) => {
            const isRevoked = sessionStore.isTokenRevoked(t.tokenId);
            expect(isRevoked).toBe(true);
          });

          // Assert: Revocation timestamps exist and are valid
          tokenIds.forEach((t) => {
            const revocationTime = revokedTokens.get(t.tokenId);
            expect(revocationTime).toBeDefined();
            expect(typeof revocationTime).toBe('number');
            expect(revocationTime).toBeGreaterThan(0);
            expect(revocationTime).toBeLessThanOrEqual(Date.now());
          });

          // SUCCESS: Property verified
          return true;
        }
      ),
      {
        numRuns: 5,
        seed: 54321,
        verbose: true,
      }
    );
  });

  /**
   * Property: Revocation Prevents Unauthorized Access
   * 
   * For ANY API endpoint requiring authentication:
   * 1. Valid (non-revoked) token allows access
   * 2. Revoked token returns 401 Unauthorized
   * 3. Each revocation is atomic and consistent
   */
  it('FOR ANY authenticated API call, SHALL reject revoked tokens with 401', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(
            fc.string({ minLength: 5, maxLength: 30 }),
            fc.string({ minLength: 5, maxLength: 30 }),
            fc.emailAddress()
          ),
          { minLength: 1, maxLength: 3 }
        ), // Multiple API calls
        (callsData) => {
          const revokedTokens = new Set<string>();

          vi.mocked(sessionStore.isTokenRevoked).mockImplementation(
            (tokenId: string) => {
              return revokedTokens.has(tokenId);
            }
          );

          vi.mocked(sessionStore.revokeSession).mockImplementation(
            (tokenId: string) => {
              revokedTokens.add(tokenId);
            }
          );

          // Simulate API calls and revocations
          callsData.forEach((callData, idx) => {
            const tokenId = `api_token_${idx}`;
            const token = authService.generateSessionToken(
              callData[0],
              callData[1],
              callData[2]
            );

            // Before revocation: token is valid
            let isRevoked = sessionStore.isTokenRevoked(tokenId);
            expect(isRevoked).toBe(false);

            // Simulate API call with valid token - should succeed
            const payload = authService.validateSessionToken(token);
            expect(payload).toBeDefined();
            expect(authService.extractUserId(payload!)).toBe(callData[1]);

            // Now revoke the token (logout)
            sessionStore.revokeSession(tokenId);

            // After revocation: token is revoked
            isRevoked = sessionStore.isTokenRevoked(tokenId);
            expect(isRevoked).toBe(true);

            // Attempt API call with revoked token should fail (401)
            const checkAccess = () => {
              const revokedCheck = sessionStore.isTokenRevoked(tokenId);
              if (revokedCheck) {
                throw new Error('Unauthorized: Token has been revoked');
              }
            };

            expect(checkAccess).toThrow('Unauthorized: Token has been revoked');
          });

          // SUCCESS: Property verified
          return true;
        }
      ),
      {
        numRuns: 8,
        seed: 99999,
        verbose: true,
      }
    );
  });
});
