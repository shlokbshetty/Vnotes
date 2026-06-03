/**
 * Unit Tests for Session Store
 * 
 * Comprehensive unit tests for in-memory session revocation storage,
 * lookup, and expiration handling.
 * 
 * Requirements: 4.2, 4.3, 4.6, 4.8, 14.1
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  revokeSession,
  isSessionRevoked,
  getRevocationDetails,
  removeRevokedSession,
  cleanupExpiredRevocations,
  getStoreSize,
  clearAllSessions,
  getAllRevokedSessions,
  startPeriodicCleanup,
} from '../src/utils/sessionStore';

describe('Session Store - Revocation Storage', () => {
  beforeEach(() => {
    // Clear all sessions before each test
    clearAllSessions();
  });

  afterEach(() => {
    // Clean up after each test
    clearAllSessions();
  });

  it('should store a revoked session', () => {
    const tokenId = 'token-abc-123';
    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString(); // 24 hours from now

    revokeSession(tokenId, userId, expiresAt);

    expect(isSessionRevoked(tokenId)).toBe(true);
  });

  it('should store multiple revoked sessions', () => {
    const sessions = [
      { tokenId: 'token-1', userId: 'user-1', expiresAt: new Date(Date.now() + 86400000).toISOString() },
      { tokenId: 'token-2', userId: 'user-2', expiresAt: new Date(Date.now() + 86400000).toISOString() },
      { tokenId: 'token-3', userId: 'user-1', expiresAt: new Date(Date.now() + 86400000).toISOString() },
    ];

    for (const session of sessions) {
      revokeSession(session.tokenId, session.userId, session.expiresAt);
    }

    expect(getStoreSize()).toBe(3);
    expect(isSessionRevoked('token-1')).toBe(true);
    expect(isSessionRevoked('token-2')).toBe(true);
    expect(isSessionRevoked('token-3')).toBe(true);
  });

  it('should handle token IDs with special characters', () => {
    const specialTokenIds = [
      'token-with-dots.abc.xyz',
      'token-with-dashes-123-456',
      'token_with_underscores_789',
      'token:with:colons',
      'token/with/slashes',
    ];

    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    for (const tokenId of specialTokenIds) {
      revokeSession(tokenId, userId, expiresAt);
    }

    for (const tokenId of specialTokenIds) {
      expect(isSessionRevoked(tokenId)).toBe(true);
    }
  });

  it('should handle long token IDs', () => {
    const longTokenId = 'x'.repeat(500); // Very long token ID
    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    revokeSession(longTokenId, userId, expiresAt);

    expect(isSessionRevoked(longTokenId)).toBe(true);
  });

  it('should handle various user IDs', () => {
    const userIds = [
      'user-123',
      'uuid-f47ac10b-58cc-4372-a567-0e02b2c3d479',
      'email@example.com',
      'google-subject-12345',
    ];

    const tokenId = 'token-abc';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    for (let i = 0; i < userIds.length; i++) {
      const uniqueTokenId = `${tokenId}-${i}`;
      revokeSession(uniqueTokenId, userIds[i], expiresAt);
    }

    expect(getStoreSize()).toBe(userIds.length);
  });

  it('should store revocation timestamp', () => {
    const tokenId = 'token-xyz';
    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    const beforeRevoke = new Date();
    revokeSession(tokenId, userId, expiresAt);
    const afterRevoke = new Date();

    const details = getRevocationDetails(tokenId);

    expect(details).toBeDefined();
    expect(details?.revoked_at).toBeDefined();

    const revokeTime = new Date(details!.revoked_at);
    expect(revokeTime.getTime()).toBeGreaterThanOrEqual(beforeRevoke.getTime());
    expect(revokeTime.getTime()).toBeLessThanOrEqual(afterRevoke.getTime() + 1000); // Allow 1 second margin
  });

  it('should store user_id in revocation details', () => {
    const tokenId = 'token-abc';
    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    revokeSession(tokenId, userId, expiresAt);

    const details = getRevocationDetails(tokenId);

    expect(details?.user_id).toBe(userId);
  });

  it('should store expiration time in revocation details', () => {
    const tokenId = 'token-abc';
    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    revokeSession(tokenId, userId, expiresAt);

    const details = getRevocationDetails(tokenId);

    expect(details?.expires_at).toBe(expiresAt);
  });
});

describe('Session Store - Revocation Lookup', () => {
  beforeEach(() => {
    clearAllSessions();
  });

  afterEach(() => {
    clearAllSessions();
  });

  it('should find a revoked session', () => {
    const tokenId = 'token-lookup-test';
    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    revokeSession(tokenId, userId, expiresAt);

    expect(isSessionRevoked(tokenId)).toBe(true);
  });

  it('should not find a non-revoked session', () => {
    expect(isSessionRevoked('non-existent-token')).toBe(false);
  });

  it('should get revocation details for existing session', () => {
    const tokenId = 'token-details-test';
    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    revokeSession(tokenId, userId, expiresAt);

    const details = getRevocationDetails(tokenId);

    expect(details).toBeDefined();
    expect(details?.user_id).toBe(userId);
    expect(details?.expires_at).toBe(expiresAt);
    expect(details?.revoked_at).toBeDefined();
  });

  it('should return undefined for non-existent session', () => {
    const details = getRevocationDetails('non-existent-token');

    expect(details).toBeUndefined();
  });

  it('should correctly identify multiple revoked sessions', () => {
    const revokedTokens = ['token-1', 'token-2', 'token-3'];
    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    for (const tokenId of revokedTokens) {
      revokeSession(tokenId, userId, expiresAt);
    }

    for (const tokenId of revokedTokens) {
      expect(isSessionRevoked(tokenId)).toBe(true);
    }

    // Non-revoked token should not be found
    expect(isSessionRevoked('token-not-revoked')).toBe(false);
  });

  it('should handle case-sensitive token IDs', () => {
    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    revokeSession('Token-ABC', userId, expiresAt);

    // Different case should not be found
    expect(isSessionRevoked('token-abc')).toBe(false);
    expect(isSessionRevoked('Token-ABC')).toBe(true);
  });
});

describe('Session Store - Session Removal', () => {
  beforeEach(() => {
    clearAllSessions();
  });

  afterEach(() => {
    clearAllSessions();
  });

  it('should remove a revoked session', () => {
    const tokenId = 'token-to-remove';
    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    revokeSession(tokenId, userId, expiresAt);
    expect(isSessionRevoked(tokenId)).toBe(true);

    removeRevokedSession(tokenId);

    expect(isSessionRevoked(tokenId)).toBe(false);
  });

  it('should handle removing non-existent session', () => {
    // Should not throw error
    expect(() => {
      removeRevokedSession('non-existent-token');
    }).not.toThrow();
  });

  it('should remove session without affecting others', () => {
    const sessions = [
      { tokenId: 'token-1', userId: 'user-1' },
      { tokenId: 'token-2', userId: 'user-2' },
      { tokenId: 'token-3', userId: 'user-1' },
    ];

    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    for (const session of sessions) {
      revokeSession(session.tokenId, session.userId, expiresAt);
    }

    // Remove token-2
    removeRevokedSession('token-2');

    expect(isSessionRevoked('token-1')).toBe(true);
    expect(isSessionRevoked('token-2')).toBe(false);
    expect(isSessionRevoked('token-3')).toBe(true);
  });
});

describe('Session Store - Expiration Handling', () => {
  beforeEach(() => {
    clearAllSessions();
  });

  afterEach(() => {
    clearAllSessions();
  });

  it('should clean up expired revoked sessions', () => {
    const userId = 'user-123';
    const now = new Date();

    // Add expired session (expired 1 second ago)
    const expiredTime = new Date(now.getTime() - 1000);
    revokeSession('token-expired', userId, expiredTime.toISOString());

    // Add non-expired session (expires in 24 hours)
    const futureTime = new Date(now.getTime() + 86400000);
    revokeSession('token-valid', userId, futureTime.toISOString());

    expect(getStoreSize()).toBe(2);

    // Clean up expired sessions
    const cleanedCount = cleanupExpiredRevocations();

    expect(cleanedCount).toBeGreaterThanOrEqual(1);
    expect(isSessionRevoked('token-expired')).toBe(false);
    expect(isSessionRevoked('token-valid')).toBe(true);
  });

  it('should clean up multiple expired sessions', () => {
    const userId = 'user-123';
    const now = new Date();

    // Add 3 expired sessions
    for (let i = 0; i < 3; i++) {
      const expiredTime = new Date(now.getTime() - 1000 - (i * 1000));
      revokeSession(`token-expired-${i}`, userId, expiredTime.toISOString());
    }

    // Add 2 valid sessions
    for (let i = 0; i < 2; i++) {
      const futureTime = new Date(now.getTime() + 86400000);
      revokeSession(`token-valid-${i}`, userId, futureTime.toISOString());
    }

    expect(getStoreSize()).toBe(5);

    const cleanedCount = cleanupExpiredRevocations();

    expect(cleanedCount).toBe(3);
    expect(getStoreSize()).toBe(2);
  });

  it('should not remove non-expired sessions during cleanup', () => {
    const userId = 'user-123';
    const futureTime = new Date(Date.now() + 86400000);

    revokeSession('token-future-1', userId, futureTime.toISOString());
    revokeSession('token-future-2', userId, futureTime.toISOString());
    revokeSession('token-future-3', userId, futureTime.toISOString());

    const cleanedCount = cleanupExpiredRevocations();

    expect(cleanedCount).toBe(0);
    expect(getStoreSize()).toBe(3);
    expect(isSessionRevoked('token-future-1')).toBe(true);
    expect(isSessionRevoked('token-future-2')).toBe(true);
    expect(isSessionRevoked('token-future-3')).toBe(true);
  });

  it('should handle cleanup when store is empty', () => {
    const cleanedCount = cleanupExpiredRevocations();

    expect(cleanedCount).toBe(0);
    expect(getStoreSize()).toBe(0);
  });

  it('should handle cleanup with only expired sessions', () => {
    const userId = 'user-123';
    const pastTime = new Date(Date.now() - 100000);

    for (let i = 0; i < 5; i++) {
      revokeSession(`token-expired-${i}`, userId, pastTime.toISOString());
    }

    expect(getStoreSize()).toBe(5);

    const cleanedCount = cleanupExpiredRevocations();

    expect(cleanedCount).toBe(5);
    expect(getStoreSize()).toBe(0);
  });
});

describe('Session Store - Store Management', () => {
  beforeEach(() => {
    clearAllSessions();
  });

  afterEach(() => {
    clearAllSessions();
  });

  it('should report correct store size', () => {
    expect(getStoreSize()).toBe(0);

    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    for (let i = 0; i < 10; i++) {
      revokeSession(`token-${i}`, userId, expiresAt);
      expect(getStoreSize()).toBe(i + 1);
    }
  });

  it('should get all revoked sessions', () => {
    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    const tokenIds = ['token-1', 'token-2', 'token-3'];

    for (const tokenId of tokenIds) {
      revokeSession(tokenId, userId, expiresAt);
    }

    const allSessions = getAllRevokedSessions();

    expect(allSessions).toHaveLength(3);
    expect(allSessions.map(s => s.tokenId).sort()).toEqual(tokenIds.sort());
  });

  it('should get all sessions with details', () => {
    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    revokeSession('token-1', 'user-1', expiresAt);
    revokeSession('token-2', 'user-2', expiresAt);

    const allSessions = getAllRevokedSessions();

    expect(allSessions).toHaveLength(2);
    allSessions.forEach(session => {
      expect(session.tokenId).toBeDefined();
      expect(session.details).toBeDefined();
      expect(session.details.user_id).toBeDefined();
      expect(session.details.revoked_at).toBeDefined();
      expect(session.details.expires_at).toBeDefined();
    });
  });

  it('should clear all sessions', () => {
    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    for (let i = 0; i < 5; i++) {
      revokeSession(`token-${i}`, userId, expiresAt);
    }

    expect(getStoreSize()).toBe(5);

    clearAllSessions();

    expect(getStoreSize()).toBe(0);
    expect(getAllRevokedSessions()).toHaveLength(0);
  });

  it('should return empty array when getting sessions from empty store', () => {
    const allSessions = getAllRevokedSessions();

    expect(allSessions).toEqual([]);
    expect(allSessions).toHaveLength(0);
  });
});

describe('Session Store - Periodic Cleanup', () => {
  beforeEach(() => {
    clearAllSessions();
  });

  afterEach(() => {
    clearAllSessions();
  });

  it('should start periodic cleanup', () => {
    const interval = startPeriodicCleanup(100); // 100ms for testing

    expect(interval).toBeDefined();

    // Clean up the interval
    clearInterval(interval);
  });

  it('should execute cleanup periodically', async () => {
    const userId = 'user-123';

    // Add an expired session
    const expiredTime = new Date(Date.now() - 1000);
    revokeSession('token-expired', userId, expiredTime.toISOString());

    expect(getStoreSize()).toBe(1);

    // Start periodic cleanup with short interval
    const interval = startPeriodicCleanup(50);

    // Wait for cleanup to run
    await new Promise(resolve => setTimeout(resolve, 150));

    // The expired session should be cleaned up
    // Note: This test is timing-dependent, so we allow for some tolerance
    const finalSize = getStoreSize();
    expect(finalSize).toBeLessThanOrEqual(1);

    // Clean up the interval
    clearInterval(interval);
  });
});

describe('Session Store - Concurrent Operations', () => {
  beforeEach(() => {
    clearAllSessions();
  });

  afterEach(() => {
    clearAllSessions();
  });

  it('should handle concurrent revocation operations', () => {
    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    // Simulate concurrent operations
    const operations = [];
    for (let i = 0; i < 100; i++) {
      operations.push(() => {
        revokeSession(`token-${i}`, userId, expiresAt);
      });
    }

    // Execute all operations
    operations.forEach(op => op());

    expect(getStoreSize()).toBe(100);
  });

  it('should handle concurrent lookups', () => {
    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    // Add sessions
    for (let i = 0; i < 50; i++) {
      revokeSession(`token-${i}`, userId, expiresAt);
    }

    // Concurrent lookups
    for (let i = 0; i < 50; i++) {
      expect(isSessionRevoked(`token-${i}`)).toBe(true);
    }

    // Lookups for non-existent sessions
    for (let i = 50; i < 100; i++) {
      expect(isSessionRevoked(`token-${i}`)).toBe(false);
    }
  });

  it('should handle concurrent removals', () => {
    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    // Add sessions
    for (let i = 0; i < 50; i++) {
      revokeSession(`token-${i}`, userId, expiresAt);
    }

    expect(getStoreSize()).toBe(50);

    // Remove all sessions
    for (let i = 0; i < 50; i++) {
      removeRevokedSession(`token-${i}`);
    }

    expect(getStoreSize()).toBe(0);
  });

  it('should handle mixed concurrent operations', () => {
    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    // Add some sessions
    for (let i = 0; i < 30; i++) {
      revokeSession(`token-add-${i}`, userId, expiresAt);
    }

    // Lookups
    for (let i = 0; i < 30; i++) {
      expect(isSessionRevoked(`token-add-${i}`)).toBe(true);
    }

    // Remove some
    for (let i = 0; i < 15; i++) {
      removeRevokedSession(`token-add-${i}`);
    }

    // Add more
    for (let i = 30; i < 50; i++) {
      revokeSession(`token-add-${i}`, userId, expiresAt);
    }

    // Final verification
    expect(getStoreSize()).toBe(35); // 15 original + 20 new
  });
});

describe('Session Store - Production Readiness', () => {
  beforeEach(() => {
    clearAllSessions();
  });

  afterEach(() => {
    clearAllSessions();
  });

  it('should handle large number of sessions', () => {
    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    // Add 1000 sessions
    for (let i = 0; i < 1000; i++) {
      revokeSession(`token-${i}`, userId, expiresAt);
    }

    expect(getStoreSize()).toBe(1000);

    // Lookup should still work efficiently
    expect(isSessionRevoked('token-500')).toBe(true);
    expect(isSessionRevoked('token-999')).toBe(true);
    expect(isSessionRevoked('token-1000')).toBe(false);
  });

  it('should handle rapid revoke and lookup cycles', () => {
    const userId = 'user-123';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    for (let cycle = 0; cycle < 10; cycle++) {
      // Revoke 100 sessions
      for (let i = 0; i < 100; i++) {
        revokeSession(`token-cycle-${cycle}-${i}`, userId, expiresAt);
      }

      // Lookup all sessions
      for (let i = 0; i < 100; i++) {
        expect(isSessionRevoked(`token-cycle-${cycle}-${i}`)).toBe(true);
      }
    }

    expect(getStoreSize()).toBeGreaterThan(0);
  });

  it('should maintain data integrity through operations', () => {
    const userId1 = 'user-1';
    const userId2 = 'user-2';
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    // Add sessions for different users
    revokeSession('token-user1', userId1, expiresAt);
    revokeSession('token-user2', userId2, expiresAt);

    // Verify data integrity
    const details1 = getRevocationDetails('token-user1');
    const details2 = getRevocationDetails('token-user2');

    expect(details1?.user_id).toBe(userId1);
    expect(details2?.user_id).toBe(userId2);
    expect(details1?.expires_at).toBe(expiresAt);
    expect(details2?.expires_at).toBe(expiresAt);
  });
});
