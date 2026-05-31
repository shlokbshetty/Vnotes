/**
 * Rate Limiter Tests
 * Validates rate limiting middleware for auth endpoints
 * 
 * Requirements: 10.10, 13.8
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import { oauthLimiter, logoutLimiter } from '../src/middlewares/rateLimiter';

describe('Rate Limiter Middleware', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Test OAuth endpoint
    app.post('/auth/oauth', oauthLimiter, (req, res) => {
      res.json({ success: true, message: 'OAuth endpoint' });
    });

    // Test logout endpoint
    app.post('/auth/logout', logoutLimiter, (req, res) => {
      res.json({ success: true, message: 'Logout endpoint' });
    });
  });

  describe('OAuth Rate Limiter', () => {
    it('should allow requests within limit (5 per 5 minutes)', async () => {
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post('/auth/oauth')
          .send({ code: `test_code_${i}` });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });

    it('should return 429 when rate limit exceeded', async () => {
      // Make 5 requests (at limit)
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/auth/oauth')
          .send({ code: `test_code_${i}` });
      }

      // 6th request should be rate limited
      const response = await request(app)
        .post('/auth/oauth')
        .send({ code: 'test_code_exceed' });

      expect(response.status).toBe(429);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(response.body.message).toContain('Too many OAuth attempts');
    });

    it('should include retryAfter in rate limit response', async () => {
      // Exceed rate limit
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/auth/oauth')
          .send({ code: `test_code_${i}` });
      }

      // Check last response (rate limited)
      const response = await request(app)
        .post('/auth/oauth')
        .send({ code: 'test_code_check' });

      expect(response.status).toBe(429);
      expect(response.body.retryAfter).toBeDefined();
      expect(typeof response.body.retryAfter).toBe('number');
      expect(response.body.retryAfter).toBeGreaterThan(0);
    });

    it('should include RateLimit headers in response', async () => {
      const response = await request(app)
        .post('/auth/oauth')
        .send({ code: 'test_code' });

      expect(response.status).toBe(200);
      // Check for rate limit headers
      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
      expect(response.headers['ratelimit-reset']).toBeDefined();
    });
  });

  describe('Logout Rate Limiter', () => {
    it('should allow requests within limit (10 per hour)', async () => {
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .post('/auth/logout')
          .send();

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });

    it('should return 429 when rate limit exceeded', async () => {
      // Make 10 requests (at limit)
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/auth/logout')
          .send();
      }

      // 11th request should be rate limited
      const response = await request(app)
        .post('/auth/logout')
        .send();

      expect(response.status).toBe(429);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(response.body.message).toContain('Too many logout attempts');
    });

    it('should include retryAfter in rate limit response', async () => {
      // Exceed rate limit
      for (let i = 0; i < 11; i++) {
        await request(app)
          .post('/auth/logout')
          .send();
      }

      // Check last response (rate limited)
      const response = await request(app)
        .post('/auth/logout')
        .send();

      expect(response.status).toBe(429);
      expect(response.body.retryAfter).toBeDefined();
      expect(typeof response.body.retryAfter).toBe('number');
      expect(response.body.retryAfter).toBeGreaterThan(0);
    });

    it('should return 429 with appropriate message for logout', async () => {
      // Exceed logout limit
      for (let i = 0; i < 11; i++) {
        await request(app)
          .post('/auth/logout')
          .send();
      }

      const response = await request(app)
        .post('/auth/logout')
        .send();

      expect(response.status).toBe(429);
      expect(response.body.message).toContain('logout');
    });
  });

  describe('Rate Limit Configuration', () => {
    it('OAuth limiter should allow 5 max requests per window', async () => {
      // OAuth limiter is configured for 5 requests max
      let successCount = 0;
      let rateLimitedCount = 0;

      for (let i = 0; i < 7; i++) {
        const response = await request(app)
          .post('/auth/oauth')
          .send({ code: `code_${i}` });

        if (response.status === 200) {
          successCount++;
        } else if (response.status === 429) {
          rateLimitedCount++;
        }
      }

      expect(successCount).toBe(5);
      expect(rateLimitedCount).toBeGreaterThan(0);
    });

    it('Logout limiter should allow 10 max requests per window', async () => {
      // Logout limiter is configured for 10 requests max
      let successCount = 0;
      let rateLimitedCount = 0;

      for (let i = 0; i < 12; i++) {
        const response = await request(app)
          .post('/auth/logout')
          .send();

        if (response.status === 200) {
          successCount++;
        } else if (response.status === 429) {
          rateLimitedCount++;
        }
      }

      expect(successCount).toBe(10);
      expect(rateLimitedCount).toBeGreaterThan(0);
    });
  });
});
