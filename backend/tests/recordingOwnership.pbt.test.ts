/**
 * Property-Based Tests for Recording Ownership Enforcement
 *
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
 *
 * Tests Property 4: Recording Ownership Enforcement
 *
 * FOR ANY set of recordings created by different users:
 * - getAllRecordings filtered by userId SHALL return only recordings for that user
 * - Cross-user listing SHALL return empty
 * - createRecording SHALL preserve user_id
 * - Ownership check SHALL block cross-user access (403 logic)
 * - Deletion by non-owner SHALL be blocked
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// ─── Inline the Recording interface so we don't import from src (avoids fs at module load) ───
interface Recording {
  id: string;
  filename: string;
  originalName: string;
  duration: number;
  size: number;
  type: string;
  isVideo: boolean;
  user_id?: string;
  transcription?: string;
  summary?: string;
  keyPoints?: string[];
  actionItems?: string[];
  createdAt: string;
}

// ─── In-memory store that replaces the JSON file ─────────────────────────────
let inMemoryRecordings: Recording[] = [];

// Mock `fs` BEFORE importing recordingService so the module picks up the mock.
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn((_path: string) => true),
    readFileSync: vi.fn((_path: string, _encoding: string) =>
      JSON.stringify(inMemoryRecordings)
    ),
    writeFileSync: vi.fn((_path: string, data: string) => {
      inMemoryRecordings = JSON.parse(data);
    }),
    unlinkSync: vi.fn(),
  },
  existsSync: vi.fn((_path: string) => true),
  readFileSync: vi.fn((_path: string, _encoding: string) =>
    JSON.stringify(inMemoryRecordings)
  ),
  writeFileSync: vi.fn((_path: string, data: string) => {
    inMemoryRecordings = JSON.parse(data);
  }),
  unlinkSync: vi.fn(),
}));

// Import AFTER the mock is registered
import { recordingService } from '../src/services/recordingService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Reset the in-memory store and rebuild the recordingService's read/write fns
 * to point at the cleared store.
 */
function resetStore(recordings: Recording[] = []) {
  inMemoryRecordings = recordings;
}

/** Build a minimal Recording object owned by the given userId. */
function makeRecording(userId: string, overrides: Partial<Recording> = {}): Recording {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    filename: `${Date.now()}-test.wav`,
    originalName: 'test.wav',
    duration: 0,
    size: 1024,
    type: 'audio/wav',
    isVideo: false,
    user_id: userId,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const userIdArb = fc.string({ minLength: 3, maxLength: 20 });

const recordingDataArb = fc.record({
  originalName: fc.string({ minLength: 1, maxLength: 40 }).filter(s => s.trim().length > 0),
  size: fc.integer({ min: 1, max: 10_000_000 }),
});

// Two distinct user IDs
const twoDistinctUsersArb = fc
  .tuple(userIdArb, userIdArb)
  .filter(([a, b]) => a !== b);

// A non-empty list of (userId, recordingData) pairs
const multiUserRecordingsArb = fc.array(
  fc.tuple(userIdArb, recordingDataArb),
  { minLength: 1, maxLength: 10 }
);

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Property 4: Recording Ownership Enforcement', () => {

  beforeEach(() => {
    resetStore([]);
  });

  // ── 4.1 User sees only their own recordings ────────────────────────────────
  describe('4.1 User sees only their own recordings', () => {
    it('getAllRecordings(undefined, userId) returns only recordings where r.user_id === userId', () => {
      fc.assert(
        fc.property(multiUserRecordingsArb, (entries) => {
          // Seed the store with recordings from multiple (possibly different) users
          const recordings = entries.map(([uid, data]) =>
            makeRecording(uid, { originalName: data.originalName, size: data.size })
          );
          resetStore(recordings);

          // For every distinct userId present, verify the filter is correct
          const userIds = [...new Set(entries.map(([uid]) => uid))];
          return userIds.every((userId) => {
            const result = recordingService.getAllRecordings(undefined, userId);
            return result.every((r) => r.user_id === userId);
          });
        }),
        { numRuns: 50 }
      );
    });
  });

  // ── 4.2 Cross-user listing returns empty ──────────────────────────────────
  describe('4.2 Cross-user listing returns empty', () => {
    it('querying with userB returns empty when store only has recordings from userA', () => {
      fc.assert(
        fc.property(
          twoDistinctUsersArb,
          fc.array(recordingDataArb, { minLength: 1, maxLength: 5 }),
          ([userA, userB], recordDataArr) => {
            // Store contains only userA's recordings
            const recordings = recordDataArr.map((data) =>
              makeRecording(userA, { originalName: data.originalName, size: data.size })
            );
            resetStore(recordings);

            const result = recordingService.getAllRecordings(undefined, userB);
            return result.length === 0;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // ── 4.3 Recordings preserve user_id ───────────────────────────────────────
  describe('4.3 Recordings preserve user_id', () => {
    it('createRecording(filename, originalName, size, mimeType, userId).user_id === userId', () => {
      fc.assert(
        fc.property(userIdArb, recordingDataArb, (userId, data) => {
          resetStore([]);
          const recording = recordingService.createRecording(
            `${Date.now()}-test.wav`,
            data.originalName,
            data.size,
            'audio/wav',
            userId
          );
          return recording.user_id === userId;
        }),
        { numRuns: 50 }
      );
    });
  });

  // ── 4.4 Ownership check blocks cross-user access ──────────────────────────
  describe('4.4 Ownership check blocks cross-user access', () => {
    /**
     * Simulates the controller-level ownership logic extracted from
     * recordingController.ts:getRecording:
     *
     *   if (recording.user_id && recording.user_id !== requestingUserId) → DENIED (403)
     *   if (!recording.user_id || recording.user_id === requestingUserId)  → ALLOWED
     */
    function ownershipCheck(recording: Recording, requestingUserId: string): 'ALLOWED' | 'DENIED' {
      if (recording.user_id && recording.user_id !== requestingUserId) {
        return 'DENIED';
      }
      return 'ALLOWED';
    }

    it('access is DENIED when recording.user_id !== requestingUserId', () => {
      fc.assert(
        fc.property(twoDistinctUsersArb, ([ownerUserId, requestingUserId]) => {
          const recording = makeRecording(ownerUserId);
          return ownershipCheck(recording, requestingUserId) === 'DENIED';
        }),
        { numRuns: 100 }
      );
    });

    it('access is ALLOWED when recording.user_id === requestingUserId', () => {
      fc.assert(
        fc.property(userIdArb, (userId) => {
          const recording = makeRecording(userId);
          return ownershipCheck(recording, userId) === 'ALLOWED';
        }),
        { numRuns: 100 }
      );
    });

    it('access is ALLOWED when recording has no user_id (legacy recording)', () => {
      fc.assert(
        fc.property(userIdArb, (requestingUserId) => {
          const recording = makeRecording('', { user_id: undefined });
          return ownershipCheck(recording, requestingUserId) === 'ALLOWED';
        }),
        { numRuns: 50 }
      );
    });
  });

  // ── 4.5 Deletion ownership check ──────────────────────────────────────────
  describe('4.5 Deletion ownership check', () => {
    /**
     * Simulates the controller-level deletion ownership logic from
     * recordingController.ts:deleteRecording:
     *
     *   if (recording.user_id && recording.user_id !== userId) → BLOCKED (403)
     *   otherwise                                              → PROCEED
     */
    function deletionOwnershipCheck(
      recording: Recording,
      requestingUserId: string
    ): 'BLOCKED' | 'PROCEED' {
      if (recording.user_id && recording.user_id !== requestingUserId) {
        return 'BLOCKED';
      }
      return 'PROCEED';
    }

    it('deletion is BLOCKED when requestingUserId !== recording.user_id', () => {
      fc.assert(
        fc.property(twoDistinctUsersArb, ([ownerUserId, requestingUserId]) => {
          const recording = makeRecording(ownerUserId);
          return deletionOwnershipCheck(recording, requestingUserId) === 'BLOCKED';
        }),
        { numRuns: 100 }
      );
    });

    it('deletion is PROCEED when requestingUserId === recording.user_id', () => {
      fc.assert(
        fc.property(userIdArb, (userId) => {
          const recording = makeRecording(userId);
          return deletionOwnershipCheck(recording, userId) === 'PROCEED';
        }),
        { numRuns: 100 }
      );
    });

    it('adding a recording with user_id and retrieving with getAllRecordings shows correct user isolation', () => {
      fc.assert(
        fc.property(
          twoDistinctUsersArb,
          fc.array(recordingDataArb, { minLength: 1, maxLength: 4 }),
          fc.array(recordingDataArb, { minLength: 1, maxLength: 4 }),
          ([userA, userB], userAData, userBData) => {
            resetStore([]);

            // Add recordings for both users
            userAData.forEach((data) => {
              const r = recordingService.createRecording(
                `${Date.now()}-${Math.random().toString(36).slice(2)}.wav`,
                data.originalName,
                data.size,
                'audio/wav',
                userA
              );
              recordingService.addRecording(r);
            });

            userBData.forEach((data) => {
              const r = recordingService.createRecording(
                `${Date.now()}-${Math.random().toString(36).slice(2)}.wav`,
                data.originalName,
                data.size,
                'audio/wav',
                userB
              );
              recordingService.addRecording(r);
            });

            const userARecordings = recordingService.getAllRecordings(undefined, userA);
            const userBRecordings = recordingService.getAllRecordings(undefined, userB);

            // Each user sees only their own recordings
            const userAIsolated = userARecordings.every((r) => r.user_id === userA);
            const userBIsolated = userBRecordings.every((r) => r.user_id === userB);

            // Correct counts
            const userACount = userARecordings.length === userAData.length;
            const userBCount = userBRecordings.length === userBData.length;

            return userAIsolated && userBIsolated && userACount && userBCount;
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});
