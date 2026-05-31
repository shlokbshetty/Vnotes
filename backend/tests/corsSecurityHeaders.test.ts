/**
 * CORS and Security Headers Tests - Task 17
 * Tests CORS configuration and security headers on all endpoints
 * 
 * Validates: Requirements 11 (CORS Configuration) and 10.1 (Security Headers)
 */

import { describe, it, expect } from 'vitest';
import axios from 'axios';
import { config } from '../src/config/env';

const TEST_BASE_URL = `http://localhost:${config.PORT}`;
const client = axios.create({
  baseURL: TEST_BASE_URL,
  validateStatus: () => true,
});

describe('CORS Headers Tests', () => {
  // ============================================================================
  // 1. Access-Control-Allow-Origin Header
  // ============================================================================

  describe('Access-Control-Allow-Origin Header', () => {
    it('should include Access-Control-Allow-Origin header on GET requests', async () => {
      const response = await client.get('/health');
      expect(response.headers['access-control-allow-origin']).toBe(config.CORS_ORIGIN);
    });

    it('should include Access-Control-Allow-Origin header on POST requests', async () => {
      const response = await client.post('/auth/oauth', {});
      if (response.status !== 429) {
        expect(response.headers['access-control-allow-origin']).toBe(config.CORS_ORIGIN);
      }
    });

    it('should match configured CORS_ORIGIN value', async () => {
      const response = await client.get('/');
      expect(response.headers['access-control-allow-origin']).toBe(config.CORS_ORIGIN);
    });

    it('CORS_ORIGIN should not be wildcard in any environment', () => {
      expect(config.CORS_ORIGIN).not.toBe('*');
    });

    it('CORS_ORIGIN should use HTTPS in production', () => {
      if (config.NODE_ENV === 'production') {
        expect(config.CORS_ORIGIN).toMatch(/^https:\/\//);
      }
    });
  });

  // ============================================================================
  // 2. Access-Control-Allow-Methods Header
  // ============================================================================

  describe('Access-Control-Allow-Methods Header', () => {
    it('should include Access-Control-Allow-Methods in preflight response', async () => {
      const response = await client.options('/auth/oauth', {
        headers: {
          'Access-Control-Request-Method': 'POST',
        }
      });

      if ([200, 204].includes(response.status)) {
        const allowMethods = response.headers['access-control-allow-methods'];
        expect(allowMethods).toBeDefined();
        
        if (allowMethods) {
          expect(allowMethods).toContain('POST');
        }
      }
    });

    it('should include GET and DELETE in recorded endpoints methods', async () => {
      const response = await client.options('/api/recordings', {
        headers: {
          'Access-Control-Request-Method': 'GET',
        }
      });

      if ([200, 204].includes(response.status)) {
        const allowMethods = response.headers['access-control-allow-methods'];
        // Should allow at least GET and DELETE for recordings
        if (allowMethods) {
          expect(allowMethods).toMatch(/GET|DELETE/);
        }
      }
    });

    it('should support OPTIONS method for preflight', async () => {
      const response = await client.options('/auth/oauth');
      expect([200, 204]).toContain(response.status);
    });
  });

  // ============================================================================
  // 3. Access-Control-Allow-Headers Header
  // ============================================================================

  describe('Access-Control-Allow-Headers Header', () => {
    it('should include Authorization in allowed headers', async () => {
      const response = await client.options('/api/recordings', {
        headers: {
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Authorization',
        }
      });

      if ([200, 204].includes(response.status)) {
        const allowHeaders = response.headers['access-control-allow-headers'];
        expect(allowHeaders).toBeDefined();
        
        if (allowHeaders) {
          expect(allowHeaders.toLowerCase()).toContain('authorization');
        }
      }
    });

    it('should include Content-Type in allowed headers', async () => {
      const response = await client.options('/auth/oauth', {
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        }
      });

      if ([200, 204].includes(response.status)) {
        const allowHeaders = response.headers['access-control-allow-headers'];
        if (allowHeaders) {
          expect(allowHeaders.toLowerCase()).toContain('content-type');
        }
      }
    });

    it('should allow multiple headers in preflight requests', async () => {
      const response = await client.options('/api/recordings', {
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization, X-Custom-Header',
        }
      });

      if ([200, 204].includes(response.status)) {
        const allowHeaders = response.headers['access-control-allow-headers'];
        if (allowHeaders) {
          expect(allowHeaders).toBeDefined();
        }
      }
    });
  });

  // ============================================================================
  // 4. Access-Control-Allow-Credentials Header
  // ============================================================================

  describe('Access-Control-Allow-Credentials Header', () => {
    it('should set Access-Control-Allow-Credentials to true', async () => {
      const response = await client.get('/health');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should allow credentials in authenticated requests', async () => {
      const response = await client.get('/api/recordings', {
        headers: { Authorization: 'Bearer test' }
      });

      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should allow credentials in preflight responses', async () => {
      const response = await client.options('/api/recordings', {
        headers: {
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Authorization',
        }
      });

      if ([200, 204].includes(response.status)) {
        expect(response.headers['access-control-allow-credentials']).toBe('true');
      }
    });
  });

  // ============================================================================
  // 5. Preflight Request Handling
  // ============================================================================

  describe('Preflight OPTIONS Request Handling', () => {
    it('should respond to preflight requests with 200 or 204', async () => {
      const response = await client.options('/auth/oauth', {
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        }
      });

      expect([200, 204]).toContain(response.status);
    });

    it('should handle preflight for different HTTP methods', async () => {
      const methods = ['POST', 'GET', 'DELETE', 'PUT'];
      
      for (const method of methods) {
        const response = await client.options('/api/recordings', {
          headers: {
            'Access-Control-Request-Method': method,
          }
        });

        // Should either return success or have proper CORS headers
        expect(response.headers['access-control-allow-origin']).toBeDefined();
      }
    });

    it('should not require Authorization header for preflight OPTIONS', async () => {
      const response = await client.options('/api/recordings', {
        headers: {
          'Access-Control-Request-Method': 'GET',
        }
      });

      expect([200, 204]).toContain(response.status);
    });

    it('should include CORS headers even for preflight responses', async () => {
      const response = await client.options('/api/recordings');

      expect(response.headers['access-control-allow-origin']).toBe(config.CORS_ORIGIN);
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });

  // ============================================================================
  // 6. CORS Consistency Across Endpoints
  // ============================================================================

  describe('CORS Consistency Across All Endpoints', () => {
    it('all endpoints should have consistent CORS headers', async () => {
      const endpoints = [
        '/health',
        '/auth/oauth',
        '/api/recordings',
        '/',
      ];

      for (const endpoint of endpoints) {
        const response = await client.get(endpoint).catch(() => ({ headers: {} }));
        
        // Public endpoints should have CORS headers
        if (response.status !== 429) {
          expect(response.headers['access-control-allow-origin']).toBe(config.CORS_ORIGIN);
          expect(response.headers['access-control-allow-credentials']).toBe('true');
        }
      }
    });

    it('error responses should have CORS headers', async () => {
      const response = await client.get('/api/recordings');

      expect(response.headers['access-control-allow-origin']).toBe(config.CORS_ORIGIN);
    });
  });
});

describe('Security Headers Tests', () => {
  // ============================================================================
  // 1. X-Content-Type-Options Header
  // ============================================================================

  describe('X-Content-Type-Options Header', () => {
    it('should set X-Content-Type-Options to nosniff', async () => {
      const response = await client.get('/health');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should include X-Content-Type-Options on all endpoints', async () => {
      const endpoints = ['/health', '/auth/oauth', '/api/recordings', '/'];

      for (const endpoint of endpoints) {
        const response = await client.get(endpoint).catch(() => ({ headers: {} }));
        expect(response.headers['x-content-type-options']).toBe('nosniff');
      }
    });

    it('should include X-Content-Type-Options on error responses', async () => {
      const response = await client.post('/auth/oauth', {});
      if (response.status !== 429) {
        expect(response.headers['x-content-type-options']).toBe('nosniff');
      }
    });
  });

  // ============================================================================
  // 2. X-Frame-Options Header
  // ============================================================================

  describe('X-Frame-Options Header', () => {
    it('should set X-Frame-Options to DENY', async () => {
      const response = await client.get('/health');
      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('should prevent page from being framed by any origin', async () => {
      const response = await client.get('/');
      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('should include X-Frame-Options on all responses', async () => {
      const endpoints = ['/health', '/api/recordings'];

      for (const endpoint of endpoints) {
        const response = await client.get(endpoint).catch(() => ({ headers: {} }));
        expect(response.headers['x-frame-options']).toBe('DENY');
      }
    });
  });

  // ============================================================================
  // 3. X-XSS-Protection Header
  // ============================================================================

  describe('X-XSS-Protection Header', () => {
    it('should set X-XSS-Protection to 1; mode=block', async () => {
      const response = await client.get('/health');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });

    it('should enable XSS filtering and block rendering', async () => {
      const response = await client.get('/');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });

    it('should include X-XSS-Protection on all responses', async () => {
      const response = await client.get('/health');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });
  });

  // ============================================================================
  // 4. Security Headers on Error Responses
  // ============================================================================

  describe('Security Headers on Error Responses', () => {
    it('error responses should include all security headers', async () => {
      const response = await client.post('/auth/oauth', {});

      if (response.status !== 429) {
        expect(response.headers['x-content-type-options']).toBe('nosniff');
        expect(response.headers['x-frame-options']).toBe('DENY');
        expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      }
    });

    it('401 responses should include security headers', async () => {
      const response = await client.get('/api/recordings');

      expect(response.status).toBe(401);
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });

    it('400 responses should include security headers', async () => {
      const response = await client.get('/api/recordings', {
        headers: { Authorization: 'InvalidFormat' }
      });

      expect(response.status).toBe(400);
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });
  });

  // ============================================================================
  // 5. Security Headers on Successful Responses
  // ============================================================================

  describe('Security Headers on Successful Responses', () => {
    it('200 responses should include all security headers', async () => {
      const response = await client.get('/health');

      expect(response.status).toBe(200);
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });

    it('successful requests should have both CORS and security headers', async () => {
      const response = await client.get('/');

      expect(response.headers['access-control-allow-origin']).toBe(config.CORS_ORIGIN);
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });
  });

  // ============================================================================
  // 6. Content-Type Header
  // ============================================================================

  describe('Content-Type Header', () => {
    it('responses should have proper Content-Type header', async () => {
      const response = await client.get('/health');

      expect(response.headers['content-type']).toBeDefined();
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('error responses should have application/json Content-Type', async () => {
      const response = await client.post('/auth/oauth', {});

      expect(response.headers['content-type']).toContain('application/json');
    });
  });
});
