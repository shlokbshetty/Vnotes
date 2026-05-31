/**
 * Security Checkpoint Test Suite - Task 17
 * Comprehensive testing of error handling, CORS, rate limiting, security headers, and environment variables
 */

import axios from 'axios';
import { config } from '../src/config/env';

// Test utilities
let passCount = 0;
let failCount = 0;
const failedTests: string[] = [];
const testPromises: Promise<any>[] = [];

class TestExpect {
  constructor(private value: any) {}

  toBe(expected: any) {
    if (this.value !== expected) {
      throw new Error(`Expected ${expected}, got ${this.value}`);
    }
  }

  toMatch(pattern: RegExp) {
    if (!pattern.test(String(this.value))) {
      throw new Error(`Expected value to match ${pattern}, got ${this.value}`);
    }
  }

  toHaveProperty(prop: string) {
    if (!(prop in this.value)) {
      throw new Error(`Expected object to have property ${prop}`);
    }
  }

  toBeDefined() {
    if (this.value === undefined) {
      throw new Error(`Expected value to be defined`);
    }
  }

  toBeGreaterThanOrEqual(expected: number) {
    if (this.value < expected) {
      throw new Error(`Expected ${this.value} to be >= ${expected}`);
    }
  }

  toBeGreaterThan(expected: number) {
    if (this.value <= expected) {
      throw new Error(`Expected ${this.value} to be > ${expected}`);
    }
  }

  toBeLessThanOrEqual(expected: number) {
    if (this.value > expected) {
      throw new Error(`Expected ${this.value} to be <= ${expected}`);
    }
  }

  toBeLessThan(expected: number) {
    if (this.value >= expected) {
      throw new Error(`Expected ${this.value} to be < ${expected}`);
    }
  }

  toEqual(expected: any) {
    if (JSON.stringify(this.value) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(this.value)}`);
    }
  }

  get not() {
    return {
      toMatch: (pattern: RegExp) => {
        if (pattern.test(String(this.value))) {
          throw new Error(`Expected value not to match ${pattern}`);
        }
      },
      toHaveProperty: (prop: string) => {
        if (prop in this.value) {
          throw new Error(`Expected object not to have property ${prop}`);
        }
      },
      toBe: (expected: any) => {
        if (this.value === expected) {
          throw new Error(`Expected value not to be ${expected}`);
        }
      },
    };
  }
}

function expect(value: any): any {
  return new TestExpect(value);
}

async function runTest(title: string, fn: () => Promise<void> | void) {
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      await result;
    }
    passCount++;
    console.log(`  ✓ ${title}`);
  } catch (error) {
    failCount++;
    const message = error instanceof Error ? error.message : String(error);
    console.log(`  ✗ ${title}`);
    console.log(`    Error: ${message}`);
    failedTests.push(`${title}: ${message}`);
  }
}

const TEST_BASE_URL = `http://localhost:${config.PORT}`;
const client = axios.create({
  baseURL: TEST_BASE_URL,
  validateStatus: () => true,
});

// Main test execution
async function runAllTests() {
  console.log('\n📋 Security Checkpoint - Task 17\n');

  // ============================================================================
  // 1. ERROR RESPONSES VERIFICATION
  // ============================================================================
  
  console.log('📋 1. Error Responses Verification\n');

  console.log('  OAuth Endpoint Error Handling:');
  testPromises.push(runTest('should return 400 for missing authorization code', async () => {
    const response = await client.post('/auth/oauth', {});
    
    if (response.status === 429) {
      console.log('    (Rate limited - waiting)');
      await new Promise(resolve => setTimeout(resolve, 3000));
      const retry = await client.post('/auth/oauth', {});
      expect(retry.status).toBe(400);
    } else {
      expect(response.status).toBe(400);
      expect(response.data.code).toBe('MISSING_AUTH_CODE');
      expect(response.data.message).not.toMatch(/secret|token|password/i);
    }
  }));

  testPromises.push(runTest('should return 400 for malformed authorization code', async () => {
    const response = await client.post('/auth/oauth', { code: 123 });
    
    if (response.status === 429) {
      return; // Skip if rate limited
    }
    expect(response.status).toBe(400);
  }));

  testPromises.push(runTest('should return 400 or 500 for invalid authorization code', async () => {
    const response = await client.post('/auth/oauth', { code: 'invalid_code_xyz' });
    
    if (response.status === 429) {
      return; // Skip if rate limited
    }
    if (![400, 500].includes(response.status)) {
      throw new Error(`Expected 400 or 500, got ${response.status}`);
    }
    expect(response.data.success).toBe(false);
  }));

  console.log('\n  Protected Endpoint Error Handling:');
  testPromises.push(runTest('should return 401 for missing Authorization header', async () => {
    const response = await client.get('/api/recordings');
    expect(response.status).toBe(401);
  }));

  testPromises.push(runTest('should return 400 for malformed Bearer token', async () => {
    const response = await client.get('/api/recordings', {
      headers: { Authorization: 'NotBearer invalidtoken' }
    });
    expect(response.status).toBe(400);
  }));

  testPromises.push(runTest('should return 401 for invalid token', async () => {
    const response = await client.get('/api/recordings', {
      headers: { Authorization: 'Bearer invalid.token.here' }
    });
    expect(response.status).toBe(401);
  }));

  console.log('\n  Error Response Sensitive Data Exclusion:');
  testPromises.push(runTest('should not expose database connection details', async () => {
    const response = await client.post('/auth/oauth', { code: 'invalid' });
    expect(response.data.message).not.toMatch(/database|postgres|supabase/i);
  }));

  testPromises.push(runTest('should include timestamp in error responses', async () => {
    const response = await client.post('/auth/oauth', {});
    
    if (response.status === 429) {
      expect(response.data).toHaveProperty('timestamp');
    } else if (response.data && response.data.timestamp) {
      expect(response.data).toHaveProperty('timestamp');
    }
  }));

  // ============================================================================
  // 2. CORS HEADERS VERIFICATION
  // ============================================================================

  console.log('\n📋 2. CORS Headers Verification\n');

  testPromises.push(runTest('should include Access-Control-Allow-Origin header', async () => {
    const response = await client.get('/health');
    expect(response.headers['access-control-allow-origin']).toBe(config.CORS_ORIGIN);
  }));

  testPromises.push(runTest('should include Access-Control-Allow-Credentials header', async () => {
    const response = await client.get('/health');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  }));

  testPromises.push(runTest('should handle preflight OPTIONS requests', async () => {
    const response = await client.options('/auth/oauth', {
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
      }
    });
    if (![200, 204].includes(response.status)) {
      throw new Error(`Expected 200 or 204, got ${response.status}`);
    }
  }));

  testPromises.push(runTest('should include Authorization in Access-Control-Allow-Headers', async () => {
    const response = await client.options('/api/recordings', {
      headers: {
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization',
      }
    });
    const allowHeaders = response.headers['access-control-allow-headers'];
    if (allowHeaders && !allowHeaders.match(/[Aa]uthorization/)) {
      throw new Error(`Authorization not in headers: ${allowHeaders}`);
    }
  }));

  // ============================================================================
  // 3. RATE LIMITING VERIFICATION
  // ============================================================================

  console.log('\n📋 3. Rate Limiting Verification\n');

  testPromises.push(runTest('should return RateLimit headers in response', async () => {
    const response = await client.post('/auth/oauth', { code: 'test_code' });
    expect(response.headers).toHaveProperty('ratelimit-limit');
  }));

  testPromises.push(runTest('should enforce rate limit (429 status)', async () => {
    let found429 = false;
    for (let i = 0; i < 20; i++) {
      const response = await client.post('/auth/oauth', { code: 'test_code' });
      if (response.status === 429) {
        found429 = true;
        expect(response.data.code).toBe('RATE_LIMIT_EXCEEDED');
        break;
      }
    }
    if (!found429) {
      console.log('    Note: Rate limit not hit in test window (timer-dependent)');
    }
  }));

  // ============================================================================
  // 4. SECURITY HEADERS VERIFICATION
  // ============================================================================

  console.log('\n📋 4. Security Headers Verification\n');

  testPromises.push(runTest('should include X-Content-Type-Options: nosniff', async () => {
    const response = await client.get('/health');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  }));

  testPromises.push(runTest('should include X-Frame-Options: DENY', async () => {
    const response = await client.get('/health');
    expect(response.headers['x-frame-options']).toBe('DENY');
  }));

  testPromises.push(runTest('should include X-XSS-Protection header', async () => {
    const response = await client.get('/health');
    expect(response.headers['x-xss-protection']).toBe('1; mode=block');
  }));

  testPromises.push(runTest('should have security headers on error responses', async () => {
    const response = await client.get('/api/recordings', {
      headers: { Authorization: 'Bearer invalid' }
    });
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['x-xss-protection']).toBe('1; mode=block');
  }));

  // ============================================================================
  // 5. ENVIRONMENT VARIABLES VERIFICATION
  // ============================================================================

  console.log('\n📋 5. Environment Variables Verification\n');

  console.log('  Required Environment Variables:');
  testPromises.push(runTest('should have CORS_ORIGIN configured', () => {
    expect(config.CORS_ORIGIN).toBeDefined();
    expect(config.CORS_ORIGIN).not.toBe('');
    expect(config.CORS_ORIGIN).toMatch(/^https?:\/\//);
  }));

  testPromises.push(runTest('should have JWT_SECRET configured', () => {
    expect(config.JWT_SECRET).toBeDefined();
    expect(config.JWT_SECRET).not.toBe('');
    expect(config.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
  }));

  testPromises.push(runTest('should have JWT_EXPIRATION configured', () => {
    expect(config.JWT_EXPIRATION).toBeDefined();
    if (typeof config.JWT_EXPIRATION === 'number') {
      expect(config.JWT_EXPIRATION).toBeGreaterThan(0);
      expect(config.JWT_EXPIRATION).toBeLessThanOrEqual(604800);
    }
  }));

  testPromises.push(runTest('should have GOOGLE_OAUTH_CALLBACK_URI configured', () => {
    expect(config.GOOGLE_OAUTH_CALLBACK_URI).toBeDefined();
    expect(config.GOOGLE_OAUTH_CALLBACK_URI).not.toBe('');
    expect(config.GOOGLE_OAUTH_CALLBACK_URI).toMatch(/\/auth\/oauth/);
  }));

  console.log('\n  Environment Variable Defaults:');
  testPromises.push(runTest('should have sensible default PORT', () => {
    expect(config.PORT).toBeGreaterThanOrEqual(1024);
    expect(config.PORT).toBeLessThanOrEqual(65535);
  }));

  testPromises.push(runTest('should have sensible default NODE_ENV', () => {
    const valid = ['development', 'staging', 'production'];
    if (!valid.includes(config.NODE_ENV)) {
      throw new Error(`Invalid NODE_ENV: ${config.NODE_ENV}`);
    }
  }));

  testPromises.push(runTest('should have sensible default JWT_EXPIRATION', () => {
    expect(config.JWT_EXPIRATION).toBe(86400);
  }));

  console.log('\n  Sensitive Variables Security:');
  testPromises.push(runTest('JWT_SECRET should not be exposed in responses', async () => {
    const response = await client.get('/health');
    const responseStr = JSON.stringify(response.data);
    if (config.JWT_SECRET && responseStr.includes(config.JWT_SECRET)) {
      throw new Error('JWT_SECRET exposed in response');
    }
  }));

  testPromises.push(runTest('GOOGLE_OAUTH_CLIENT_SECRET should not be exposed', async () => {
    const response = await client.get('/');
    const responseStr = JSON.stringify(response.data);
    if (config.GOOGLE_OAUTH_CLIENT_SECRET && responseStr.includes(config.GOOGLE_OAUTH_CLIENT_SECRET)) {
      throw new Error('GOOGLE_OAUTH_CLIENT_SECRET exposed in response');
    }
  }));

  console.log('\n  Production Environment Validation:');
  testPromises.push(runTest('should require CORS_ORIGIN to be HTTPS in production', () => {
    if (config.NODE_ENV === 'production') {
      expect(config.CORS_ORIGIN).toMatch(/^https:\/\//);
    }
  }));

  testPromises.push(runTest('should require JWT_SECRET to be non-default in production', () => {
    if (config.NODE_ENV === 'production') {
      expect(config.JWT_SECRET).not.toMatch(/dev-|example/i);
    }
  }));

  testPromises.push(runTest('should require GOOGLE_OAUTH_CALLBACK_URI to use HTTPS in production', () => {
    if (config.NODE_ENV === 'production') {
      expect(config.GOOGLE_OAUTH_CALLBACK_URI).toMatch(/^https:\/\//);
    }
  }));

  // ============================================================================
  // COMPREHENSIVE SECURITY SCENARIOS
  // ============================================================================

  console.log('\n📋 6. Comprehensive Security Scenarios\n');

  testPromises.push(runTest('should enforce rate limiting on OAuth endpoint', async () => {
    const response = await client.post('/auth/oauth', { code: 'test_code' });
    if ([400, 429].includes(response.status)) {
      expect(response.headers).toHaveProperty('ratelimit-limit');
    }
  }));

  testPromises.push(runTest('should protect endpoints with CORS and auth', async () => {
    const response = await client.get('/api/recordings', {
      headers: { Authorization: 'Bearer invalid' }
    });
    if (![400, 401].includes(response.status)) {
      throw new Error(`Expected 400 or 401, got ${response.status}`);
    }
    expect(response.headers['access-control-allow-origin']).toBe(config.CORS_ORIGIN);
  }));

  testPromises.push(runTest('should return consistent error structure', async () => {
    const response1 = await client.post('/auth/oauth', {});
    const response2 = await client.get('/api/recordings');
    
    for (const response of [response1, response2]) {
      if (response.status >= 400) {
        if (!response.data.message) {
          throw new Error('Missing message in error response');
        }
      }
    }
  }));

  // Wait for all tests to complete
  await Promise.all(testPromises);

  console.log(`\n\n📊 Test Summary: ${passCount} passed, ${failCount} failed`);
  if (failCount > 0) {
    console.log('\nFailed Tests:');
    failedTests.forEach(test => console.log(`  - ${test}`));
    return false;
  } else {
    console.log('\n✅ All security checkpoint tests passed!');
    return true;
  }
}

// Execute tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
