/**
 * Rate Limiting Middleware
 * Implements rate limiting for authentication endpoints to prevent brute-force attacks and DDoS
 * 
 * Requirements: 10.10, 13.8
 */

import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';

/**
 * Rate limiter for OAuth endpoint
 * Limit: 5 attempts per IP per 5 minutes
 * 
 * Requirement 10.10: OAuth endpoints should be rate-limited
 */
export const oauthLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 attempts per IP
  message: 'Too many OAuth attempts from this IP, please try again after 5 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req: Request, res: Response) => {
    // Don't log health checks
    return req.path === '/health';
  },
  handler: (req: Request, res: Response) => {
    logger.warn('OAuth rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    const resetTime = (req as any).rateLimit?.resetTime;
    const retryAfter = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 300;
    
    res.status(429).json({
      success: false,
      message: 'Too many OAuth attempts from this IP, please try again after 5 minutes',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter,
    });
  },
});

/**
 * Rate limiter for logout endpoint
 * Limit: 10 attempts per IP per hour
 * 
 * Requirement 10.10: Logout endpoints should be rate-limited to prevent abuse
 */
export const logoutLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per IP
  message: 'Too many logout attempts from this IP, please try again after 1 hour',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req: Request, res: Response) => {
    // Don't log health checks
    return req.path === '/health';
  },
  handler: (req: Request, res: Response) => {
    logger.warn('Logout rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    const resetTime = (req as any).rateLimit?.resetTime;
    const retryAfter = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 3600;
    
    res.status(429).json({
      success: false,
      message: 'Too many logout attempts from this IP, please try again after 1 hour',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter,
    });
  },
});
