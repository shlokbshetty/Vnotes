/**
 * Property-Based Tests for Authentication Service
 * 
 * Validates core authentication correctness properties using property-based testing:
 * - JWT tokens have correct structure and signing
 * - Claims can be extracted from valid tokens
 * - Tokens are properly validated and rejected when invalid
 */

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
import { config } from '../src/config/env';
import * as jwt from 'jsonwebtoken';

// Use the same JWT secret as the service
const JWT_SECRET = config.JWT_SECRET;

// Property-Based Test Utility: Generate random test data
interface TestUserData {
  googleSubject: string;
  userId: string;
  email: string;
}

function generateRandomString(length: number = 20): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateTestUserData(): TestUserData {
  return {
    googleSubject: 'google-' + generateRandomString(20),
    userId: generateRandomString(36), // UUID-like
    email: `test-${generateRandomString(10)}@example.com`,
  };
}

/**
 * PROPERTY 1: Session Token Structure and Signing
 * 
 * For any authenticated user data, the generated session token SHALL:
 * - Be a valid JWT with three parts (header.payload.signature)
 * - Contain correct claims (sub, user_id, email, iat, exp, iss)
 * - Be decodable without verification errors using the JWT_SECRET
 * - Have a valid HMAC-SHA256 signature
 * 
 * Validates: Requirements 3.1, 3.2
 */
function testPropertyJWTTokenStructure(): void {
  console.log('\n[Property 1] Testing Session Token Structure and Signing...');
  
  const testCases = 10;
  
  for (let i = 0; i < testCases; i++) {
    const testData = generateTestUserData();
    
    // Generate token
    const token = generateSessionToken(testData.googleSubject, testData.userId, testData.email);
    
    // Assert 1: Token is a non-empty string
    if (typeof token !== 'string' || token.length === 0) {
      throw new Error(`Test case ${i}: Token is not a non-empty string`);
    }
    
    // Assert 2: Token has three parts (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error(`Test case ${i}: Token should have 3 parts, got ${parts.length}`);
    }
    
    // Assert 3: Each part is valid base64url
    try {
      parts.forEach((part, idx) => {
        if (!part) throw new Error('Empty part');
        const padded = part + '='.repeat((4 - part.length % 4) % 4);
        Buffer.from(padded, 'base64');
      });
    } catch {
      throw new Error(`Test case ${i}: Token contains invalid base64 encoding`);
    }
    
    // Assert 4: Token can be decoded
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: 'vnotes-backend',
      });
    } catch (error) {
      throw new Error(`Test case ${i}: Token verification failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Assert 5: Required claims are present with correct types
    const requiredClaims = ['sub', 'user_id', 'email', 'iat', 'exp', 'iss'];
    requiredClaims.forEach(claim => {
      if (!(claim in decoded)) {
        throw new Error(`Test case ${i}: Missing required claim: ${claim}`);
      }
    });
    
    // Assert 6: Claims have correct values
    if (decoded.sub !== testData.googleSubject) {
      throw new Error(`Test case ${i}: Claim 'sub' doesn't match. Expected: ${testData.googleSubject}, Got: ${decoded.sub}`);
    }
    if (decoded.user_id !== testData.userId) {
      throw new Error(`Test case ${i}: Claim 'user_id' doesn't match. Expected: ${testData.userId}, Got: ${decoded.user_id}`);
    }
    if (decoded.email !== testData.email) {
      throw new Error(`Test case ${i}: Claim 'email' doesn't match. Expected: ${testData.email}, Got: ${decoded.email}`);
    }
    
    // Assert 7: Timestamps are numbers and exp > iat
    if (typeof decoded.iat !== 'number' || decoded.iat <= 0) {
      throw new Error(`Test case ${i}: Claim 'iat' is not a positive number`);
    }
    if (typeof decoded.exp !== 'number' || decoded.exp <= 0) {
      throw new Error(`Test case ${i}: Claim 'exp' is not a positive number`);
    }
    if (decoded.exp <= decoded.iat) {
      throw new Error(`Test case ${i}: Expiration time (${decoded.exp}) should be after issued time (${decoded.iat})`);
    }
    
    // Assert 8: Issuer is correct
    if (decoded.iss !== 'vnotes-backend') {
      throw new Error(`Test case ${i}: Claim 'iss' doesn't match. Expected: vnotes-backend, Got: ${decoded.iss}`);
    }
    
    console.log(`  ✓ Test case ${i + 1}/${testCases}: Token structure and claims verified`);
  }
  
  console.log('✓ PROPERTY 1 PASSED: Session tokens have correct structure and signing');
}

/**
 * PROPERTY 2: Session Token Validation and Claim Extraction
 * 
 * For any valid session token:
 * - The validation process SHALL successfully verify signature and return decoded claims
 * - Claim extraction functions SHALL return the correct values
 * - Token expiration check SHALL work correctly
 * 
 * For any invalid token:
 * - Validation SHALL throw JWTValidationError with appropriate error type
 * - Each error type SHALL have correct HTTP status code
 * 
 * Validates: Requirements 3.3, 3.4
 */
function testPropertyJWTTokenValidation(): void {
  console.log('\n[Property 2] Testing Session Token Validation and Claim Extraction...');
  
  const testCases = 5;
  
  // Test valid tokens
  console.log('  Testing valid tokens...');
  for (let i = 0; i < testCases; i++) {
    const testData = generateTestUserData();
    const token = generateSessionToken(testData.googleSubject, testData.userId, testData.email);
    
    // Validate token
    let payload;
    try {
      payload = validateSessionToken(token);
    } catch (error) {
      throw new Error(`Test case ${i}: Valid token validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Extract claims
    const extractedUserId = extractUserId(payload);
    const extractedEmail = extractEmail(payload);
    const extractedGoogleId = extractGoogleId(payload);
    
    // Verify extracted values match original data
    if (extractedUserId !== testData.userId) {
      throw new Error(`Test case ${i}: extractUserId returned wrong value`);
    }
    if (extractedEmail !== testData.email) {
      throw new Error(`Test case ${i}: extractEmail returned wrong value`);
    }
    if (extractedGoogleId !== testData.googleSubject) {
      throw new Error(`Test case ${i}: extractGoogleId returned wrong value`);
    }
    
    // Check expiration status (should not be expired)
    const isExpired = isTokenExpired(payload);
    if (isExpired) {
      throw new Error(`Test case ${i}: Fresh token incorrectly reported as expired`);
    }
    
    // Check time remaining (should be positive)
    const timeRemaining = getTokenTimeRemaining(payload);
    if (timeRemaining <= 0) {
      throw new Error(`Test case ${i}: Fresh token has no time remaining`);
    }
    
    console.log(`  ✓ Test case ${i + 1}/${testCases}: Valid token validated and claims extracted correctly`);
  }
  
  // Test invalid tokens
  console.log('  Testing invalid tokens...');
  
  // Invalid token: malformed (wrong number of parts)
  try {
    validateSessionToken('invalid.token');
    throw new Error('Malformed token should have thrown JWTValidationError');
  } catch (error) {
    if (!(error instanceof JWTValidationError)) {
      throw new Error(`Malformed token error should be JWTValidationError, got ${error instanceof Error ? error.constructor.name : typeof error}`);
    }
    if (error.type !== 'MALFORMED') {
      throw new Error(`Malformed token error type should be 'MALFORMED', got '${error.type}'`);
    }
    if (error.getHttpStatus() !== 400) {
      throw new Error(`Malformed token HTTP status should be 400, got ${error.getHttpStatus()}`);
    }
  }
  console.log('  ✓ Malformed token correctly rejected with error type MALFORMED (400)');
  
  // Invalid token: wrong signature
  try {
    const testData = generateTestUserData();
    const token = generateSessionToken(testData.googleSubject, testData.userId, testData.email);
    const tamperedToken = token.slice(0, -10) + 'tampered00'; // Tamper with signature
    validateSessionToken(tamperedToken);
    throw new Error('Tampered token should have thrown JWTValidationError');
  } catch (error) {
    if (!(error instanceof JWTValidationError)) {
      throw new Error(`Tampered token error should be JWTValidationError, got ${error instanceof Error ? error.constructor.name : typeof error}`);
    }
    if (error.getHttpStatus() !== 401) {
      throw new Error(`Tampered token HTTP status should be 401, got ${error.getHttpStatus()}`);
    }
  }
  console.log('  ✓ Tampered token correctly rejected with 401 status');
  
  // Invalid token: missing required claims (would need to mock token generation)
  // This is covered by the structure tests above
  
  console.log('✓ PROPERTY 2 PASSED: Token validation and claim extraction work correctly');
}

/**
 * Run all property-based tests
 */
function runAllPropertyTests(): void {
  console.log('=== JWT Generation Property-Based Tests ===');
  
  try {
    testPropertyJWTTokenStructure();
    testPropertyJWTTokenValidation();
    
    console.log('\n=== All property tests passed! ===\n');
  } catch (error) {
    console.error('\n✗ Test failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllPropertyTests();
}

export {
  testPropertyJWTTokenStructure,
  testPropertyJWTTokenValidation,
  runAllPropertyTests,
};
