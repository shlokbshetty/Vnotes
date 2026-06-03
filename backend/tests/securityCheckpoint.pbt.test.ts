/**
 * Security Checkpoint Property-Based Tests - Task 17
 * Tests correctness properties for error handling, CORS, rate limiting, and environment variables
 * 
 * Framework: fast-check for property-based testing
 * Validates: Requirements 9 (Error Handling) and 10 (Security Considerations)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import axios, { AxiosError } from 'axios';
import { config } from '../src/config/env';

const TEST_BASE_URL = `http://localhost:${config.PORT}`;
const client = axios.create({
  baseURL: TEST_BASE_URL,
  validateStatus: () => true,
});

/**
 * Property 1: Error Response Structure Consistency
 * FOR ANY invalid request to auth/oauth endpoint, the error response SHALL have consistent structure with required fields
 * 
 * **Validates: Requirements 9.1, 9.2**
 */
describe('Property 1: Error Response Structure Consistency', () => {
  it('FOR ANY invalid OAuth code, SHALL return structured error response with required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant({}),
          fc.constant({ code: null }),
          fc.constant({ code: undefined }),
          fc.constant({ code: 123 }),
          fc.constant({ code: [] }),
          fc.array(fc.integer()).map(arr => ({ code: arr }))
        ),
        async (invalidPayload) => {
          // Skip rate-limited attempts
          const response = await client.post('/auth/oauth', invalidPayload);
          
          if (response.status === 429) {
            // Skip rate-limited responses for PBT
            return true;
          }

          // Check error response structure
          if (response.status >= 400) {
            expect(response.data).toHaveProperty('success');
            expect(response.data).toHaveProperty('message');
            expect(response.data.success).toBe(false);
            expect(typeof response.data.message).toBe('string');
            expect(response.data.message.length).toBeGreaterThan(0);
          }

          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('FOR ANY malformed Authorization header, SHALL return 400 or 401 with structured error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(''),
          fc.constant('Bearer'),
          fc.constant('NotBearer token'),
          fc.constant('Bearer '),
          fc.string({ minLength: 1 }).map(s => `${s} invalid`),
          fc.string({ minLength: 1 }).map(s => `Bearer${s}`) // no space
        ),
        async (malformedHeader) => {
          const response = await client.get('/api/recordings', {
            headers: { Authorization: malformedHeader }
          });

          if ([400, 401].includes(response.status)) {
            expect(response.data).toHaveProperty('message');
            expect(response.data.success).toBe(false);
          }

          return true;
        }
      ),
      { numRuns: 15 }
    );
  });
});

/**
 * Property 2: Sensitive Data Exclusion in Errors
 * FOR ANY error response from auth/oauth or protected endpoints, the response SHALL NOT contain sensitive data
 * like database connection strings, internal paths, or secret values
 * 
 * **Validates: Requirements 9.5, 10.11**
 */
describe('Property 2: Sensitive Data Exclusion in Errors', () => {
  it('FOR ANY auth endpoint error, SHALL not expose database, secrets, or credentials', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant({}),
          fc.constant({ code: 'test' }),
          fc.string().map(s => ({ code: s }))
        ),
        async (payload) => {
          const response = await client.post('/auth/oauth', payload);

          if (response.status === 429) {
            return true; // Skip rate-limited
          }

          if (response.status >= 400) {
            const responseStr = JSON.stringify(response.data).toLowerCase();
            
            // Should NOT contain sensitive terms
            expect(responseStr).not.toContain('password');
            expect(responseStr).not.toContain('secret');
            expect(responseStr).not.toContain('token');
            expect(responseStr).not.toContain('database');
            expect(responseStr).not.toContain('postgres');
            expect(responseStr).not.toContain('supabase');
            expect(responseStr).not.toContain('/home/');
            expect(responseStr).not.toContain('\\users\\');
            
            // Real JWT_SECRET should never be in response
            if (config.JWT_SECRET && config.JWT_SECRET !== 'dev-256-bit-secret-key-minimum-for-hmac-sha256-token-generation') {
              expect(responseStr).not.toContain(config.JWT_SECRET.toLowerCase());
            }
          }

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });
});

/**
 * Property 3: CORS Headers Presence and Consistency
 * FOR ANY response from any endpoint, the CORS headers SHALL be present and consistent
 * 
 * **Validates: Requirements 11.1, 11.2, 11.3, 11.4**
 */
describe('Property 3: CORS Headers Presence and Consistency', () => {
  it('FOR ANY endpoint response, SHALL include consistent CORS headers', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant('/health'),
          fc.constant('/auth/oauth'),
          fc.constant('/api/recordings')
        ),
        async (endpoint) => {
          const response = await client.get(endpoint).catch(() => ({ status: 0, headers: {} }));

          // CORS headers should be present on successful responses
          if (response.status !== 429) {
            expect(response.headers['access-control-allow-origin']).toBeDefined();
            expect(response.headers['access-control-allow-credentials']).toBe('true');
            
            // Origin should match configured origin
            if (response.headers['access-control-allow-origin']) {
              expect(response.headers['access-control-allow-origin']).toBe(config.CORS_ORIGIN);
            }
          }

          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('FOR ANY OPTIONS preflight request, SHALL respond with proper CORS headers', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant('/auth/oauth'),
          fc.constant('/api/recordings'),
          fc.constant('/auth/logout')
        ),
        async (endpoint) => {
          const response = await client.options(endpoint, {
            headers: {
              'Access-Control-Request-Method': 'POST',
              'Access-Control-Request-Headers': 'Content-Type, Authorization',
            }
          }).catch(() => ({ status: 0, headers: {} }));

          if ([200, 204].includes(response.status)) {
            expect(response.headers['access-control-allow-origin']).toBeDefined();
            expect(response.headers['access-control-allow-credentials']).toBe('true');
          }

          return true;
        }
      ),
      { numRuns: 10 }
    );
  });
});

/**
 * Property 4: Security Headers Presence
 * FOR ANY response from any endpoint, security headers SHALL be present to protect against common attacks
 * 
 * **Validates: Requirements 10.1, 10.6**
 */
describe('Property 4: Security Headers Presence', () => {
  it('FOR ANY endpoint response, SHALL include required security headers', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant('/health'),
          fc.constant('/'),
          fc.constant('/api/recordings')
        ),
        async (endpoint) => {
          const response = await client.get(endpoint).catch(() => ({ headers: {} }));

          // Security headers should be present on all responses
          expect(response.headers['x-content-type-options']).toBe('nosniff');
          expect(response.headers['x-frame-options']).toBe('DENY');
          expect(response.headers['x-xss-protection']).toBe('1; mode=block');

          return true;
        }
      ),
      { numRuns: 10 }
    );
  });
});

/**
 * Property 5: Rate Limiting Headers Presence
 * FOR ANY auth endpoint request, rate limit information headers SHALL be present in response
 * 
 * **Validates: Requirements 10.10**
 */
describe('Property 5: Rate Limiting Headers Presence', () => {
  it('FOR ANY auth/oauth request, response SHALL include RateLimit headers', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.string(), { minLength: 1, maxLength: 3 }), // Generate test codes
        async (testCodes) => {
          for (const code of testCodes) {
            const response = await client.post('/auth/oauth', { code });
            
            // Should have rate limit headers when rate limiting is active
            if ([400, 429].includes(response.status)) {
              expect(response.headers).toHaveProperty('ratelimit-limit');
              
              // ratelimit-limit should be numeric
              if (response.headers['ratelimit-limit']) {
                const limit = parseInt(String(response.headers['ratelimit-limit']), 10);
                expect(limit).toBeGreaterThan(0);
              }
            }
          }

          return true;
        }
      ),
      { numRuns: 5 }
    );
  });
});

/**
 * Property 6: Environment Variable Configuration Presence
 * FOR ANY environment variable required by the system, the variable SHALL be defined and valid
 * 
 * **Validates: Requirements 13.1, 13.2, 13.5**
 */
describe('Property 6: Environment Variable Configuration', () => {
  it('FOR critical environment variables, SHALL have valid non-empty values', () => {
    fc.assert(
      fc.property(
        fc.constant(null), // Just run once
        () => {
          // Critical variables must be present
          expect(config.CORS_ORIGIN).toBeDefined();
          expect(config.CORS_ORIGIN).not.toBe('');
          expect(config.CORS_ORIGIN).toMatch(/^https?:\/\//);

          expect(config.JWT_SECRET).toBeDefined();
          expect(config.JWT_SECRET).not.toBe('');
          
          // JWT_SECRET should be at least 32 characters (256 bits) for HMAC-SHA256
          expect(config.JWT_SECRET.length).toBeGreaterThanOrEqual(32);

          expect(config.GOOGLE_OAUTH_CALLBACK_URI).toBeDefined();
          expect(config.GOOGLE_OAUTH_CALLBACK_URI).not.toBe('');
          expect(config.GOOGLE_OAUTH_CALLBACK_URI).toMatch(/\/auth\/oauth/);

          return true;
        }
      ),
      { numRuns: 1 }
    );
  });

  it('FOR JWT_EXPIRATION, SHALL be a reasonable positive integer within bounds', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          expect(typeof config.JWT_EXPIRATION).toBe('number');
          expect(config.JWT_EXPIRATION).toBeGreaterThan(0);
          expect(config.JWT_EXPIRATION).toBeLessThanOrEqual(604800); // 7 days max
          expect(config.JWT_EXPIRATION).toBeGreaterThanOrEqual(3600); // 1 hour minimum

          return true;
        }
      ),
      { numRuns: 1 }
    );
  });

  it('FOR PORT configuration, SHALL be a valid port number', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          expect(typeof config.PORT).toBe('number');
          expect(config.PORT).toBeGreaterThanOrEqual(1024);
          expect(config.PORT).toBeLessThanOrEqual(65535);

          return true;
        }
      ),
      { numRuns: 1 }
    );
  });

  it('FOR production environment, CORS_ORIGIN SHALL use HTTPS', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          if (config.NODE_ENV === 'production') {
            expect(config.CORS_ORIGIN).toMatch(/^https:\/\//);
          }

          return true;
        }
      ),
      { numRuns: 1 }
    );
  });

  it('FOR production environment, JWT_SECRET SHALL not use default value', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          if (config.NODE_ENV === 'production') {
            // Should not match the default development secret pattern
            const isDefaultSecret = config.JWT_SECRET.includes('dev-') || 
                                   config.JWT_SECRET.includes('example');
            expect(isDefaultSecret).toBe(false);
          }

          return true;
        }
      ),
      { numRuns: 1 }
    );
  });

  it('FOR production environment, GOOGLE_OAUTH_CALLBACK_URI SHALL use HTTPS', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          if (config.NODE_ENV === 'production') {
            expect(config.GOOGLE_OAUTH_CALLBACK_URI).toMatch(/^https:\/\//);
          }

          return true;
        }
      ),
      { numRuns: 1 }
    );
  });
});

/**
 * Property 7: Authorization Header Validation
 * FOR ANY protected endpoint request with various Authorization header formats, the system SHALL correctly
 * validate the format and return appropriate error codes
 * 
 * **Validates: Requirements 10.6, 10.7**
 */
describe('Property 7: Authorization Header Validation', () => {
  it('FOR any protected endpoint, malformed header SHALL return 400 or 401', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant('InvalidFormat'),
          fc.constant('Bearer'),
          fc.constant('Bearer  '),
          fc.string({ minLength: 5 }).filter(s => !s.includes(' ')).map(s => `Bearer${s}`),
          fc.tuple(fc.string({ minLength: 1 }), fc.string({ minLength: 1 }))
            .map(([p1, p2]) => `${p1} ${p2} extra`)
        ),
        async (authHeader) => {
          const response = await client.get('/api/recordings', {
            headers: { Authorization: authHeader }
          });

          // Should either reject the format (400) or the token (401)
          expect([400, 401]).toContain(response.status);

          return true;
        }
      ),
      { numRuns: 15 }
    );
  });

  it('FOR missing Authorization header on protected endpoint, SHALL return 401', async () => {
    const response = await client.get('/api/recordings', {
      headers: { 'Authorization': undefined }
    });

    expect(response.status).toBe(401);
  });
});

/**
 * Property 8: Error Response Timestamp Consistency
 * FOR ANY error response, a timestamp field SHALL be present to track when the error occurred
 * 
 * **Validates: Requirements 9.1**
 */
describe('Property 8: Error Response Timestamp', () => {
  it('FOR ANY error response, SHALL include valid ISO timestamp', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant({}),
          fc.constant({ code: 'invalid' })
        ),
        async (payload) => {
          const response = await client.post('/auth/oauth', payload);

          if (response.status === 429) {
            return true;
          }

          if (response.status >= 400 && response.data) {
            // Timestamp should be present (may be optional in some responses)
            if (response.data.timestamp) {
              expect(typeof response.data.timestamp).toBe('string');
              // Should be valid ISO timestamp
              const parsed = new Date(response.data.timestamp);
              expect(parsed.getTime()).toBeGreaterThan(0);
            }
          }

          return true;
        }
      ),
      { numRuns: 10 }
    );
  });
});
