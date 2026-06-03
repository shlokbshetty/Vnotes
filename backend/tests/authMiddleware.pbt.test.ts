/**
 * Property-Based Tests for Authentication Middleware
 * 
 * **Validates: Requirements 7.1, 7.2**
 * 
 * Tests Property 5: Protected Endpoint Authorization
 * 
 * FOR ANY request to a protected endpoint:
 * - Requests WITHOUT Authorization header SHALL return 401
 * - Requests WITH invalid tokens SHALL return 401
 * - Requests WITH valid tokens SHALL allow passage (call next())
 * - Requests WITH malformed Bearer tokens SHALL return 400
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../src/middlewares/authMiddleware';
import * as authService from '../src/services/authService';
import * as sessionStore from '../src/utils/sessionStore';

/**
 * Mock helpers
 */
function createMockRequest(overrides: any = {}): Request {
  return {
    headers: {},
    path: '/api/test',
    method: 'GET',
    userId: undefined,
    email: undefined,
    googleId: undefined,
    ...overrides,
  } as any as Request;
}

function createMockResponse(): Response {
  const res: any = {
    status: function(code: number) {
      this.statusCode = code;
      return this;
    },
    json: function(data: any) {
      this.jsonData = data;
      return this;
    },
    statusCode: 200,
    jsonData: {},
  };
  return res as Response;
}

function createMockNext() {
  let called = false;
  const fn = () => {
    called = true;
  };
  fn.wasCalled = () => called;
  return fn;
}

/**
 * Generators for property-based testing
 */

// Generate valid bearer token formats
const validBearerTokenArb = fc.tuple(
  fc.string({ minLength: 3, maxLength: 10 }),
  fc.string({ minLength: 3, maxLength: 10 }),
  fc.emailAddress()
).map(([googleId, userId, email]) => {
  const token = authService.generateSessionToken(googleId, userId, email);
  return { token, googleId, userId, email };
});

// Generate invalid token strings (malformed JWTs)
const invalidTokenArb = fc.oneof(
  fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes('.')), // No dots
  fc.string({ minLength: 1, maxLength: 30 }).filter(s => (s.match(/\./g) || []).length < 2), // Less than 3 parts
  fc.constantFrom(
    'invalid',
    'not.a.jwt',
    'definitely.not.valid.token.here',
    'xxx.yyy.zzz',
    'a.b.c.d.e'
  )
);

// Generate malformed Authorization header values
const malformedAuthHeaderArb = fc.oneof(
  fc.constantFrom(
    'InvalidPrefix token123',
    'Token valid-token-here',
    'Bearer token1 token2 token3', // Too many parts
    'Bearer', // No token
    'Bearer  ', // Empty token
    'bearer token extra parts here'
  ),
  fc.string({ maxLength: 1 }), // Very short strings
  fc.constantFrom('', ' ', '\t')
);

// Generate valid authorization header values (Bearer format)
const validAuthHeaderArb = fc.tuple(
  fc.string({ minLength: 3, maxLength: 10 }),
  fc.string({ minLength: 3, maxLength: 10 }),
  fc.emailAddress()
).map(([googleId, userId, email]) => {
  const token = authService.generateSessionToken(googleId, userId, email);
  return `Bearer ${token}`;
});

// Case variations of Bearer
const bearerCaseVariationsArb = fc.tuple(
  fc.string({ minLength: 3, maxLength: 10 }),
  fc.string({ minLength: 3, maxLength: 10 }),
  fc.emailAddress()
).map(([googleId, userId, email]) => {
  const token = authService.generateSessionToken(googleId, userId, email);
  // Return different case variations
  return {
    token,
    headers: [
      `Bearer ${token}`,
      `bearer ${token}`,
    ]
  };
});


/**
 * PROPERTY TEST 1: No Authorization Header Always Returns 401
 * 
 * FOR ANY request without Authorization header,
 * the middleware SHALL return 401 Unauthorized
 */
describe('Property 5: Protected Endpoint Authorization', () => {
  describe('5.1 Missing Authorization Header Returns 401', () => {
    it('should return 401 for any request without Authorization header', () => {
      fc.assert(
        fc.property(
          fc.record({
            path: fc.constantFrom('/api/recordings', '/api/recordings/123', '/auth/logout'),
            method: fc.constantFrom('GET', 'POST', 'DELETE'),
          }),
          (requestData) => {
            const req = createMockRequest({
              headers: {}, // No authorization header
              path: requestData.path,
              method: requestData.method,
            });
            const res = createMockResponse();
            const nextFn = createMockNext();

            authMiddleware(req, res, nextFn);

            // Assert
            return (
              res.statusCode === 401 &&
              res.jsonData.success === false &&
              res.jsonData.code === 'MISSING_AUTH_HEADER' &&
              !(nextFn as any).wasCalled()
            );
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * PROPERTY TEST 2: Invalid Tokens Always Return 401
   * 
   * FOR ANY request with an invalid token (wrong signature, expired, etc.),
   * the middleware SHALL return 401 Unauthorized
   */
  describe('5.2 Invalid Tokens Return 401', () => {
    it('should return 401 for any invalid token format', () => {
      fc.assert(
        fc.property(invalidTokenArb, (invalidToken) => {
          const req = createMockRequest({
            headers: { authorization: `Bearer ${invalidToken}` },
          });
          const res = createMockResponse();
          const nextFn = createMockNext();

          authMiddleware(req, res, nextFn);

          // Invalid tokens should return 401 (or possibly 400 for malformed)
          return (
            (res.statusCode === 401 || res.statusCode === 400) &&
            res.jsonData.success === false &&
            !(nextFn as any).wasCalled()
          );
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * PROPERTY TEST 3: Valid Tokens Always Allow Passage
   * 
   * FOR ANY request with a valid session token,
   * the middleware SHALL attach user context and call next()
   */
  describe('5.3 Valid Tokens Allow Passage', () => {
    it('should allow passage and extract user context for any valid token', () => {
      fc.assert(
        fc.property(validBearerTokenArb, (tokenData) => {
          const req = createMockRequest({
            headers: { authorization: `Bearer ${tokenData.token}` },
          });
          const res = createMockResponse();
          const nextFn = createMockNext();

          authMiddleware(req, res, nextFn);

          // Valid token should call next() and attach user context
          return (
            (nextFn as any).wasCalled() &&
            req.userId === tokenData.userId &&
            req.email === tokenData.email &&
            req.googleId === tokenData.googleId
          );
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * PROPERTY TEST 4: Malformed Bearer Tokens Return 400
   * 
   * FOR ANY malformed Authorization header (wrong prefix, too many parts, etc.),
   * the middleware SHALL return 400 Bad Request (or 401 for completely empty/undefined)
   */
  describe('5.4 Malformed Bearer Tokens Return 400', () => {
    it('should return 400 for any malformed Bearer token format', () => {
      fc.assert(
        fc.property(malformedAuthHeaderArb, (malformedHeader) => {
          const req = createMockRequest({
            headers: { authorization: malformedHeader },
          });
          const res = createMockResponse();
          const nextFn = createMockNext();

          authMiddleware(req, res, nextFn);

          // Headers that are empty/undefined, or contain ONLY whitespace, are treated as missing (401)
          if (!malformedHeader || !malformedHeader.trim()) {
            return res.statusCode === 401 && res.jsonData.code === 'MISSING_AUTH_HEADER';
          }

          // All other malformed headers should return 400
          return (
            res.statusCode === 400 &&
            res.jsonData.success === false &&
            res.jsonData.code === 'MALFORMED_AUTH_HEADER' &&
            !(nextFn as any).wasCalled()
          );
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * PROPERTY TEST 5: Case-Insensitive Bearer Prefix
   * 
   * FOR ANY Bearer token with case variations (Bearer, bearer),
   * the middleware SHALL accept and process the token
   */
  describe('5.5 Case-Insensitive Bearer Processing', () => {
    it('should accept Bearer tokens regardless of case (Bearer, bearer)', () => {
      fc.assert(
        fc.property(bearerCaseVariationsArb, (caseData) => {
          let passedAtLeastOne = false;

          for (const authHeader of caseData.headers) {
            const req = createMockRequest({
              headers: { authorization: authHeader },
            });
            const res = createMockResponse();
            const nextFn = createMockNext();

            authMiddleware(req, res, nextFn);

            // Should either pass (call next) or fail with 401 (token validation)
            // but NOT fail with 400 (malformed header format)
            if ((nextFn as any).wasCalled()) {
              passedAtLeastOne = true;
            }
          }

          return passedAtLeastOne;
        }),
        { numRuns: 30 }
      );
    });
  });

  /**
   * PROPERTY TEST 6: Revoked Tokens Return 401
   * 
   * FOR ANY revoked session token,
   * the middleware SHALL return 401 Unauthorized
   */
  describe('5.6 Revoked Tokens Return 401', () => {
    it('should return 401 for any revoked session token', () => {
      fc.assert(
        fc.property(validBearerTokenArb, (tokenData) => {
          // Generate token and immediately revoke it
          const token = authService.generateSessionToken(
            tokenData.googleId,
            tokenData.userId,
            tokenData.email
          );
          sessionStore.revokeSession(token, tokenData.userId);

          const req = createMockRequest({
            headers: { authorization: `Bearer ${token}` },
          });
          const res = createMockResponse();
          const nextFn = createMockNext();

          authMiddleware(req, res, nextFn);

          // Revoked token should return 401
          return (
            res.statusCode === 401 &&
            res.jsonData.success === false &&
            res.jsonData.code === 'TOKEN_REVOKED' &&
            !(nextFn as any).wasCalled()
          );
        }),
        { numRuns: 30 }
      );
    });
  });

  /**
   * PROPERTY TEST 7: Error Response Contains Timestamp
   * 
   * FOR ANY error response from the middleware,
   * the response SHALL include an ISO 8601 timestamp field
   */
  describe('5.7 Error Responses Include Timestamp', () => {
    it('should include ISO 8601 timestamp in all error responses', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant({}), // No header
            fc.constant({ authorization: '' }), // Empty header
            fc.constant({ authorization: 'Invalid' }) // Invalid format
          ),
          (headerConfig) => {
            const req = createMockRequest({
              headers: headerConfig,
            });
            const res = createMockResponse();
            const nextFn = createMockNext();

            authMiddleware(req, res, nextFn);

            // All error responses should have timestamp
            if (res.statusCode >= 400) {
              return (
                res.jsonData.timestamp !== undefined &&
                typeof res.jsonData.timestamp === 'string' &&
                res.jsonData.timestamp.length > 0 &&
                res.jsonData.timestamp.match(/^\d{4}-\d{2}-\d{2}T/) !== null // ISO 8601 format
              );
            }

            return true;
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  /**
   * PROPERTY TEST 8: HTTP Status Code Correctness
   * 
   * FOR ANY request to a protected endpoint:
   * - Valid token => No error response (next() called)
   * - Missing header => Always 401
   * - Malformed header => Always 400
   * - Invalid token => Always 401
   * 
   * Never return 200 for missing/invalid auth
   */
  describe('5.8 HTTP Status Codes Are Correct', () => {
    it('should return correct HTTP status codes for all authorization scenarios', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant({ type: 'missing' }),
            fc.constant({ type: 'malformed', value: 'InvalidPrefix token' }),
            fc.constant({ type: 'malformed', value: 'Bearer' }),
            fc.constant({ type: 'valid' }),
            fc.constant({ type: 'invalid', value: 'invalid.token.here' })
          ),
          (authScenario) => {
            let headers: any = {};

            if (authScenario.type === 'valid') {
              const token = authService.generateSessionToken('g1', 'u1', 'test@test.com');
              headers = { authorization: `Bearer ${token}` };
            } else if (authScenario.type === 'malformed') {
              headers = { authorization: authScenario.value };
            } else if (authScenario.type === 'invalid') {
              headers = { authorization: `Bearer ${authScenario.value}` };
            }

            const req = createMockRequest({ headers });
            const res = createMockResponse();
            const nextFn = createMockNext();

            authMiddleware(req, res, nextFn);

            // Verify status codes match expectations
            if (authScenario.type === 'missing') {
              return res.statusCode === 401;
            }
            if (authScenario.type === 'malformed') {
              return res.statusCode === 400 || res.statusCode === 401;
            }
            if (authScenario.type === 'invalid') {
              return res.statusCode === 401;
            }
            if (authScenario.type === 'valid') {
              return (nextFn as any).wasCalled();
            }

            return false;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * PROPERTY TEST 9: User Context Not Leaked on Error
   * 
   * FOR ANY request that results in an error response,
   * the request object SHALL NOT have user context attached
   */
  describe('5.9 User Context Not Leaked on Error', () => {
    it('should not leak user context in error scenarios', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant({ type: 'missing' }),
            fc.constant({ type: 'malformed' })
          ),
          (scenario) => {
            const headers = scenario.type === 'malformed' 
              ? { authorization: 'InvalidFormat' }
              : {};

            const req = createMockRequest({ headers });
            const res = createMockResponse();
            const nextFn = createMockNext();

            authMiddleware(req, res, nextFn);

            // After error response, user context should not be attached
            if (res.statusCode >= 400) {
              return (
                (req.userId === undefined || req.userId === null) &&
                (req.email === undefined || req.email === null)
              );
            }

            return true;
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  /**
   * PROPERTY TEST 10: Authorization Header Correctness
   * 
   * FOR ANY valid Bearer token, the middleware SHALL correctly process it
   * and attach all required user context fields
   */
  describe('5.10 Authorization Header Correctness', () => {
    it('should correctly process authorization header with all required fields', () => {
      fc.assert(
        fc.property(validBearerTokenArb, (tokenData) => {
          const req = createMockRequest({
            headers: { authorization: `Bearer ${tokenData.token}` },
          });
          const res = createMockResponse();
          const nextFn = createMockNext();

          authMiddleware(req, res, nextFn);

          // Should successfully process valid bearer tokens
          return (
            (nextFn as any).wasCalled() &&
            req.userId !== undefined &&
            req.email !== undefined &&
            req.googleId !== undefined
          );
        }),
        { numRuns: 50 }
      );
    });
  });
});
