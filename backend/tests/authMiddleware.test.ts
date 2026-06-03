/**
 * Authentication Middleware Tests
 * 
 * Unit tests for the authMiddleware that validates Bearer tokens
 * on protected endpoints.
 */

import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../src/middlewares/authMiddleware';
import * as authService from '../src/services/authService';
import * as sessionStore from '../src/utils/sessionStore';
import { logger } from '../src/utils/logger';

// Test utilities
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, error?: string) {
  const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
  console.log(`${status} - ${name}`);
  if (error) {
    console.log(`  ${colors.red}Error: ${error}${colors.reset}`);
  }
  results.push({ name, passed, error });
}

// Mock Request and Response objects
function createMockRequest(overrides: any = {}): Request {
  return {
    headers: {},
    path: '/test',
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

/**
 * TEST 1: Missing Authorization Header
 * Should return 401 when no Authorization header is provided
 */
async function testMissingAuthorizationHeader() {
  try {
    const req = createMockRequest({ headers: {} });
    const res = createMockResponse();
    const nextFn = jest.fn();

    authMiddleware(req, res, nextFn);

    const passed = 
      res.statusCode === 401 && 
      res.jsonData.success === false &&
      res.jsonData.code === 'MISSING_AUTH_HEADER' &&
      nextFn.mock.calls.length === 0;

    logTest('Missing Authorization Header returns 401', passed);
  } catch (error) {
    logTest('Missing Authorization Header returns 401', false, String(error));
  }
}

/**
 * TEST 2: Malformed Authorization Header - No Bearer prefix
 * Should return 400 for malformed Bearer token format
 */
async function testMalformedAuthHeaderNoBearerPrefix() {
  try {
    const req = createMockRequest({ headers: { authorization: 'InvalidPrefix token123' } });
    const res = createMockResponse();
    const nextFn = jest.fn();

    authMiddleware(req, res, nextFn);

    const passed = 
      res.statusCode === 400 && 
      res.jsonData.success === false &&
      res.jsonData.code === 'MALFORMED_AUTH_HEADER' &&
      nextFn.mock.calls.length === 0;

    logTest('Malformed Auth Header (no Bearer prefix) returns 400', passed);
  } catch (error) {
    logTest('Malformed Auth Header (no Bearer prefix) returns 400', false, String(error));
  }
}

/**
 * TEST 3: Malformed Authorization Header - Too many parts
 * Should return 400 for too many parts in Authorization header
 */
async function testMalformedAuthHeaderTooManyParts() {
  try {
    const req = createMockRequest({ headers: { authorization: 'Bearer token1 token2' } });
    const res = createMockResponse();
    const nextFn = jest.fn();

    authMiddleware(req, res, nextFn);

    const passed = 
      res.statusCode === 400 && 
      res.jsonData.success === false &&
      res.jsonData.code === 'MALFORMED_AUTH_HEADER' &&
      nextFn.mock.calls.length === 0;

    logTest('Malformed Auth Header (too many parts) returns 400', passed);
  } catch (error) {
    logTest('Malformed Auth Header (too many parts) returns 400', false, String(error));
  }
}

/**
 * TEST 4: Case-insensitive Bearer
 * Should accept bearer (lowercase) as well as Bearer
 */
async function testCaseInsensitiveBearer() {
  try {
    // Generate a valid token
    const token = authService.generateSessionToken('google123', 'user123', 'user@example.com');
    
    const req = createMockRequest({ 
      headers: { authorization: `bearer ${token}` } // lowercase bearer
    });
    const res = createMockResponse();
    const nextFn = jest.fn();

    authMiddleware(req, res, nextFn);

    const passed = 
      req.userId === 'user123' &&
      req.email === 'user@example.com' &&
      req.googleId === 'google123' &&
      nextFn.mock.calls.length === 1;

    logTest('Bearer token (lowercase) accepted', passed);
  } catch (error) {
    logTest('Bearer token (lowercase) accepted', false, String(error));
  }
}

/**
 * TEST 5: Valid Token
 * Should extract user info and call next() with valid token
 */
async function testValidToken() {
  try {
    const token = authService.generateSessionToken('google456', 'user456', 'test@example.com');
    
    const req = createMockRequest({ 
      headers: { authorization: `Bearer ${token}` } 
    });
    const res = createMockResponse();
    const nextFn = jest.fn();

    authMiddleware(req, res, nextFn);

    const passed = 
      req.userId === 'user456' &&
      req.email === 'test@example.com' &&
      req.googleId === 'google456' &&
      nextFn.mock.calls.length === 1 &&
      res.statusCode === 200; // Default status, not changed

    logTest('Valid Bearer token processed successfully', passed);
  } catch (error) {
    logTest('Valid Bearer token processed successfully', false, String(error));
  }
}

/**
 * TEST 6: Expired Token
 * Should return 401 for expired token
 */
async function testExpiredToken() {
  try {
    // Create token with 0 expiration (immediately expired)
    // We'll need to manually craft this since the service uses current time + expiration
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-not-secure';
    
    const expiredPayload = {
      sub: 'google789',
      user_id: 'user789',
      email: 'expired@example.com',
      iat: Math.floor(Date.now() / 1000) - 1000,
      exp: Math.floor(Date.now() / 1000) - 100, // Expired 100 seconds ago
      iss: 'vnotes-backend',
    };

    const expiredToken = jwt.sign(expiredPayload, JWT_SECRET);
    
    const req = createMockRequest({ 
      headers: { authorization: `Bearer ${expiredToken}` } 
    });
    const res = createMockResponse();
    const nextFn = jest.fn();

    authMiddleware(req, res, nextFn);

    const passed = 
      res.statusCode === 401 && 
      res.jsonData.success === false &&
      res.jsonData.code === 'TOKEN_EXPIRED' &&
      nextFn.mock.calls.length === 0;

    logTest('Expired token returns 401', passed);
  } catch (error) {
    logTest('Expired token returns 401', false, String(error));
  }
}

/**
 * TEST 7: Invalid Token Signature
 * Should return 401 for token with invalid signature
 */
async function testInvalidTokenSignature() {
  try {
    const jwt = require('jsonwebtoken');
    const wrongSecret = 'wrong-secret-key';
    
    // Create token with valid secret, but try to verify with wrong secret
    const tokenWithWrongSecret = jwt.sign(
      {
        sub: 'google999',
        user_id: 'user999',
        email: 'invalid@example.com',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
        iss: 'vnotes-backend',
      },
      wrongSecret
    );
    
    const req = createMockRequest({ 
      headers: { authorization: `Bearer ${tokenWithWrongSecret}` } 
    });
    const res = createMockResponse();
    const nextFn = jest.fn();

    authMiddleware(req, res, nextFn);

    const passed = 
      res.statusCode === 401 && 
      res.jsonData.success === false &&
      (res.jsonData.code === 'INVALID_TOKEN' || res.jsonData.code === 'TOKEN_VALIDATION_FAILED') &&
      nextFn.mock.calls.length === 0;

    logTest('Invalid token signature returns 401', passed);
  } catch (error) {
    logTest('Invalid token signature returns 401', false, String(error));
  }
}

/**
 * TEST 8: Revoked Token
 * Should return 401 for revoked token
 */
async function testRevokedToken() {
  try {
    const token = authService.generateSessionToken('google555', 'user555', 'revoked@example.com');
    
    // Revoke the token
    sessionStore.revokeSession(token, 'user555');
    
    const req = createMockRequest({ 
      headers: { authorization: `Bearer ${token}` } 
    });
    const res = createMockResponse();
    const nextFn = jest.fn();

    authMiddleware(req, res, nextFn);

    const passed = 
      res.statusCode === 401 && 
      res.jsonData.success === false &&
      res.jsonData.code === 'TOKEN_REVOKED' &&
      nextFn.mock.calls.length === 0;

    logTest('Revoked token returns 401', passed);
  } catch (error) {
    logTest('Revoked token returns 401', false, String(error));
  }
}

/**
 * TEST 9: User context attached to request
 * Verify userId, email, and googleId are attached to request
 */
async function testUserContextAttachedToRequest() {
  try {
    const token = authService.generateSessionToken('google111', 'user111', 'context@example.com');
    
    const req = createMockRequest({ 
      headers: { authorization: `Bearer ${token}` } 
    });
    const res = createMockResponse();
    const nextFn = jest.fn();

    authMiddleware(req, res, nextFn);

    const passed = 
      req.userId === 'user111' &&
      req.email === 'context@example.com' &&
      req.googleId === 'google111';

    logTest('User context attached to request object', passed);
  } catch (error) {
    logTest('User context attached to request object', false, String(error));
  }
}

/**
 * TEST 10: Response includes timestamp
 * Verify error responses include timestamp
 */
async function testResponseIncludesTimestamp() {
  try {
    const req = createMockRequest({ headers: {} });
    const res = createMockResponse();
    const nextFn = jest.fn();

    authMiddleware(req, res, nextFn);

    const passed = 
      res.jsonData.timestamp !== undefined &&
      typeof res.jsonData.timestamp === 'string' &&
      res.jsonData.timestamp.length > 0;

    logTest('Error response includes timestamp', passed);
  } catch (error) {
    logTest('Error response includes timestamp', false, String(error));
  }
}

// Property-based test utilities
function generateRandomToken(validSignature = true): string {
  if (validSignature) {
    const randomId = Math.random().toString(36).substr(2, 9);
    return authService.generateSessionToken(
      `google-${randomId}`,
      `user-${randomId}`,
      `user${randomId}@example.com`
    );
  } else {
    return 'invalid.token.here';
  }
}

/**
 * PROPERTY TEST 1: Bearer Token Extraction
 * FOR ANY Authorization header with Bearer token format,
 * middleware SHALL extract the token correctly
 */
async function propertyTestBearerTokenExtraction() {
  try {
    const testCases = [
      { input: 'Bearer validtoken123', shouldFail: false },
      { input: 'bearer validtoken456', shouldFail: false },
      { input: 'BEARER validtoken789', shouldFail: false }, // Should fail - case sensitive for scheme
      { input: 'Token validtoken000', shouldFail: true },
      { input: 'Bearer token1 token2', shouldFail: true },
      { input: 'Bearer', shouldFail: true },
      { input: '', shouldFail: true },
    ];

    let allPassed = true;

    for (const testCase of testCases) {
      const req = createMockRequest({ 
        headers: { authorization: testCase.input } 
      });
      const res = createMockResponse();
      const nextFn = jest.fn();

      authMiddleware(req, res, nextFn);

      if (testCase.shouldFail) {
        if (!(res.statusCode === 400 || res.statusCode === 401)) {
          allPassed = false;
          break;
        }
      } else {
        // For valid Bearer prefix, should either process or validate token
        if (res.statusCode === 400 && res.jsonData.code === 'MALFORMED_AUTH_HEADER') {
          allPassed = false;
          break;
        }
      }
    }

    logTest('PROPERTY: Bearer token extraction for all formats', allPassed);
  } catch (error) {
    logTest('PROPERTY: Bearer token extraction for all formats', false, String(error));
  }
}

/**
 * PROPERTY TEST 2: Protected Endpoint Authorization
 * FOR ANY protected endpoint, valid token SHALL allow passage,
 * invalid/missing token SHALL return 401/400
 */
async function propertyTestProtectedEndpointAuthorization() {
  try {
    // Test with valid token
    const validToken = authService.generateSessionToken('test-google', 'test-user', 'test@example.com');
    const validReq = createMockRequest({ headers: { authorization: `Bearer ${validToken}` } });
    const validRes = createMockResponse();
    const validNext = jest.fn();

    authMiddleware(validReq, validRes, validNext);
    const validPassed = validNext.mock.calls.length === 1;

    // Test with missing token
    const missingReq = createMockRequest({ headers: {} });
    const missingRes = createMockResponse();
    const missingNext = jest.fn();

    authMiddleware(missingReq, missingRes, missingNext);
    const missingPassed = missingRes.statusCode === 401 && missingNext.mock.calls.length === 0;

    // Test with invalid token
    const invalidReq = createMockRequest({ headers: { authorization: 'Bearer invalid.token.here' } });
    const invalidRes = createMockResponse();
    const invalidNext = jest.fn();

    authMiddleware(invalidReq, invalidRes, invalidNext);
    const invalidPassed = invalidRes.statusCode === 401 && invalidNext.mock.calls.length === 0;

    const passed = validPassed && missingPassed && invalidPassed;
    logTest('PROPERTY: Protected endpoint authorization enforcement', passed);
  } catch (error) {
    logTest('PROPERTY: Protected endpoint authorization enforcement', false, String(error));
  }
}

/**
 * PROPERTY TEST 3: Session Token Extraction from All Valid Tokens
 * FOR ANY generated session token, the user_id, email, and googleId
 * SHALL be correctly extracted and attached to request
 */
async function propertyTestSessionTokenExtraction() {
  try {
    const testUsers = [
      { googleId: 'google1', userId: 'user1', email: 'user1@example.com' },
      { googleId: 'google2', userId: 'user2', email: 'user2@example.com' },
      { googleId: 'google3', userId: 'user3', email: 'user3@example.com' },
    ];

    let allPassed = true;

    for (const user of testUsers) {
      const token = authService.generateSessionToken(user.googleId, user.userId, user.email);
      const req = createMockRequest({ headers: { authorization: `Bearer ${token}` } });
      const res = createMockResponse();
      const nextFn = jest.fn();

      authMiddleware(req, res, nextFn);

      if (req.userId !== user.userId || req.email !== user.email || req.googleId !== user.googleId) {
        allPassed = false;
        break;
      }
    }

    logTest('PROPERTY: Session token extraction for all valid tokens', allPassed);
  } catch (error) {
    logTest('PROPERTY: Session token extraction for all valid tokens', false, String(error));
  }
}

// Note: Using basic mocking for Jest since full jest setup is not configured
const jest = {
  fn: () => {
    const mockFn = function() {};
    mockFn.mock = { calls: [] };
    return function(...args: any[]) {
      mockFn.mock.calls.push(args);
    };
  }
};

// Main test runner
async function runTests() {
  console.log(`\n${colors.blue}=== Authentication Middleware Test Suite ===${colors.reset}\n`);

  // Unit tests
  console.log(`${colors.yellow}Unit Tests:${colors.reset}`);
  await testMissingAuthorizationHeader();
  await testMalformedAuthHeaderNoBearerPrefix();
  await testMalformedAuthHeaderTooManyParts();
  await testCaseInsensitiveBearer();
  await testValidToken();
  await testExpiredToken();
  await testInvalidTokenSignature();
  await testRevokedToken();
  await testUserContextAttachedToRequest();
  await testResponseIncludesTimestamp();

  console.log(`\n${colors.yellow}Property-Based Tests:${colors.reset}`);
  await propertyTestBearerTokenExtraction();
  await propertyTestProtectedEndpointAuthorization();
  await propertyTestSessionTokenExtraction();

  // Print summary
  console.log(`\n${colors.blue}=== Test Summary ===${colors.reset}\n`);
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);

  console.log(`Total Tests: ${total}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${total - passed}${colors.reset}`);
  console.log(`Success Rate: ${percentage}%\n`);

  if (passed === total) {
    console.log(`${colors.green}✓ All tests passed!${colors.reset}\n`);
  } else {
    console.log(`${colors.red}✗ Some tests failed. Review errors above.${colors.reset}\n`);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests };
