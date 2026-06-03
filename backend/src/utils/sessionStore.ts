/**
 * Session Store Utility
 * 
 * In-memory session management for tracking revoked tokens.
 * Allows immediate invalidation of sessions on logout.
 * 
 * Note: In production, consider using Redis or a persistent store
 * for scalability across multiple server instances.
 */

import { RevokedSessionEntry } from '../types/auth';
import { logger } from './logger';

// In-memory store of revoked sessions
// Key: token (or token identifier), Value: revocation info
const revokedSessions: Map<string, RevokedSessionEntry> = new Map();

/**
 * Add a token to the revocation list
 * 
 * @param tokenIdentifier - Unique identifier for the token (can be jti claim or token hash)
 * @param userId - User ID who owned the token
 * @param expiresAt - When the token expires (used for cleanup)
 */
export function revokeSession(
  tokenIdentifier: string,
  userId: string,
  expiresAt: string
): void {
  try {
    const entry: RevokedSessionEntry = {
      revoked_at: new Date().toISOString(),
      user_id: userId,
      expires_at: expiresAt,
    };

    revokedSessions.set(tokenIdentifier, entry);
    logger.info('Session revoked', { userId, tokenIdentifier });
  } catch (error) {
    logger.error('Failed to revoke session', { error });
    throw new Error('Session revocation failed');
  }
}

/**
 * Check if a token has been revoked
 * 
 * @param tokenIdentifier - Token identifier to check
 * @returns True if token is revoked, false otherwise
 */
export function isSessionRevoked(tokenIdentifier: string): boolean {
  return revokedSessions.has(tokenIdentifier);
}

/**
 * Get revocation details for a token
 * 
 * @param tokenIdentifier - Token identifier to look up
 * @returns Revocation details if revoked, undefined otherwise
 */
export function getRevocationDetails(tokenIdentifier: string): RevokedSessionEntry | undefined {
  return revokedSessions.get(tokenIdentifier);
}

/**
 * Remove a token from the revocation list (cleanup after expiration)
 * 
 * @param tokenIdentifier - Token identifier to remove
 */
export function removeRevokedSession(tokenIdentifier: string): void {
  revokedSessions.delete(tokenIdentifier);
  logger.debug('Revoked session removed from store', { tokenIdentifier });
}

/**
 * Clean up expired revoked sessions
 * Removes entries where expiration time has passed
 * 
 * @returns Number of sessions cleaned up
 */
export function cleanupExpiredRevocations(): number {
  const now = new Date();
  let cleanedCount = 0;

  for (const [tokenId, entry] of revokedSessions.entries()) {
    if (new Date(entry.expires_at) < now) {
      revokedSessions.delete(tokenId);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    logger.info('Cleaned up expired revoked sessions', { count: cleanedCount });
  }

  return cleanedCount;
}

/**
 * Get current size of revoked sessions store
 * Useful for monitoring and debugging
 * 
 * @returns Number of revoked sessions in store
 */
export function getStoreSize(): number {
  return revokedSessions.size;
}

/**
 * Clear all revoked sessions (use with caution)
 * Typically only used for testing or manual maintenance
 */
export function clearAllSessions(): void {
  const count = revokedSessions.size;
  revokedSessions.clear();
  logger.warn('All revoked sessions cleared', { count });
}

/**
 * Get all revoked sessions (for debugging/monitoring)
 * 
 * @returns Array of all revoked session entries
 */
export function getAllRevokedSessions(): Array<{ tokenId: string; details: RevokedSessionEntry }> {
  const sessions: Array<{ tokenId: string; details: RevokedSessionEntry }> = [];
  
  for (const [tokenId, details] of revokedSessions.entries()) {
    sessions.push({ tokenId, details });
  }
  
  return sessions;
}

/**
 * Start periodic cleanup of expired sessions (optional)
 * Runs cleanup every hour by default
 * 
 * @param intervalMs - How often to run cleanup in milliseconds (default: 3600000 = 1 hour)
 * @returns Interval ID (can be used with clearInterval to stop cleanup)
 */
export function startPeriodicCleanup(intervalMs: number = 3600000): NodeJS.Timer {
  logger.info('Starting periodic session cleanup', { intervalMs });
  
  return setInterval(() => {
    const cleaned = cleanupExpiredRevocations();
    logger.debug('Periodic cleanup executed', { sessionsRemoved: cleaned });
  }, intervalMs);
}
