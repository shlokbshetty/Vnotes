/**
 * Property-Based Tests for ID Token Signature Verification
 *
 * **Validates: Requirements 1.4, 1.5, 1.6**
 *
 * Tests Property 3: ID Token Signature Verification
 *
 * FOR ANY ID token from Google's OAuth flow:
 * - Valid tokens MUST pass claim extraction without errors
 * - Tampered/empty tokens MUST be rejected
 * - Tokens with missing required fields MUST be rejected
 * - Extracted profile fields MUST match the token claims exactly
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  verifyIDTokenSignature,
  extractUserProfileFromIDToken,
  completeOAuthFlow,
  VerifiedIDToken,
} from '../src/services/oauthService';
import { GoogleIDTokenClaims } from '../src/types/auth';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates a well-formed GoogleIDTokenClaims object with valid, non-empty
 * sub and email fields. Name is optional in the real protocol but we always
 * supply it here so we can assert the round-trip.
 */
const validClaimsArb: fc.Arbitrary<GoogleIDTokenClaims> = fc.record({
  sub: fc.string({ minLength: 8, maxLength: 40 }).filter(s => s.trim().length > 0),
  email: fc.emailAddress(),
  name: fc.string({ minLength: 1, maxLength: 60 }),
  picture: fc.oneof(
    fc.constant(undefined),
    fc.webUrl()
  ),
  email_verified: fc.oneof(fc.constant(true), fc.constant(false), fc.constant(undefined)),
  iss: fc.constant('https://accounts.google.com'),
  aud: fc.string({ minLength: 5, maxLength: 50 }),
  iat: fc.integer({ min: 1_000_000, max: 2_000_000_000 }),
  exp: fc.integer({ min: 2_000_000_001, max: 3_000_000_000 }),
});

/**
 * Claims where `sub` is empty — must be rejected.
 */
const missingSubClaimsArb: fc.Arbitrary<GoogleIDTokenClaims> = validClaimsArb.map(
  claims => ({ ...claims, sub: '' })
);

/**
 * Claims where `email` is empty — must be rejected.
 */
const missingEmailClaimsArb: fc.Arbitrary<GoogleIDTokenClaims> = validClaimsArb.map(
  claims => ({ ...claims, email: '' })
);

/**
 * String values that are obviously not valid JWTs: they may have < 3 parts,
 * wrong prefixes, non-base64 payloads, etc.
 */
const invalidTokenStringArb: fc.Arbitrary<string> = fc.oneof(
  fc.constant(''),
  fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('.')),
  fc.tuple(
    fc.string({ minLength: 1, maxLength: 10 }),
    fc.string({ minLength: 1, maxLength: 10 })
  ).map(([a, b]) => `${a}.${b}`), // Only two parts (not a valid JWT)
  fc.constantFrom(
    'not.a.jwt',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.tampered',
    'xxx.yyy.zzz',
    'a.b.c.d.e'
  )
);

// ---------------------------------------------------------------------------
// Property 3: ID Token Signature Verification
// ---------------------------------------------------------------------------

describe('Property 3: ID Token Signature Verification', () => {

  /**
   * 3.1 Empty token is always rejected
   *
   * FOR ANY call to verifyIDTokenSignature with an empty string,
   * the function SHALL throw an error mentioning "required".
   */
  describe('3.1 Empty token is rejected', () => {
    it('should throw an error containing "required" for an empty id token', async () => {
      await expect(verifyIDTokenSignature('')).rejects.toThrow(/required/i);
    });
  });

  /**
   * 3.2 Invalid / tampered token strings are rejected
   *
   * FOR ANY non-empty string that is not a genuine Google-signed JWT,
   * verifyIDTokenSignature SHALL throw (signature verification will fail,
   * network error included — the function must never silently succeed).
   *
   * Note: In a CI environment without real Google credentials, the function
   * may throw a network error OR a verification error — both are acceptable
   * rejections.
   */
  describe('3.2 Non-empty invalid tokens are rejected', () => {
    it('should reject any clearly invalid token string', async () => {
      await fc.assert(
        fc.asyncProperty(
          invalidTokenStringArb.filter(s => s.length > 0),
          async (invalidToken) => {
            let threw = false;
            try {
              await verifyIDTokenSignature(invalidToken);
            } catch {
              threw = true;
            }
            return threw;
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * 3.3 Valid claims produce correctly mapped user profile
   *
   * FOR ANY GoogleIDTokenClaims with non-empty sub and email,
   * extractUserProfileFromIDToken SHALL return a profile where:
   *  - google_id === claims.sub
   *  - email     === claims.email
   *  - name      === claims.name  (or the email prefix when name is falsy)
   *  - profile_picture_url === claims.picture (or undefined)
   *
   * **Validates: Requirements 1.5**
   */
  describe('3.3 Valid claims are correctly mapped to user profile', () => {
    it('should extract google_id, email, name, and picture from any valid claims object', () => {
      fc.assert(
        fc.property(validClaimsArb, (claims) => {
          const profile = extractUserProfileFromIDToken(claims);

          // google_id must always equal sub
          if (profile.google_id !== claims.sub) return false;
          // email must always equal claims.email
          if (profile.email !== claims.email) return false;
          // name: if claims.name is truthy use it, otherwise fall back to email prefix
          const expectedName = claims.name || claims.email.split('@')[0];
          if (profile.name !== expectedName) return false;
          // picture is optional
          if (profile.profile_picture_url !== claims.picture) return false;

          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * 3.4 Missing sub throws an error about required fields
   *
   * FOR ANY claims object where sub is empty,
   * extractUserProfileFromIDToken SHALL throw containing "required fields".
   *
   * **Validates: Requirements 1.6**
   */
  describe('3.4 Claims with missing sub are rejected', () => {
    it('should throw "required fields" when sub is empty', () => {
      fc.assert(
        fc.property(missingSubClaimsArb, (claims) => {
          let threw = false;
          let errorMsg = '';
          try {
            extractUserProfileFromIDToken(claims);
          } catch (err) {
            threw = true;
            errorMsg = err instanceof Error ? err.message : String(err);
          }
          return threw && errorMsg.toLowerCase().includes('required fields');
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * 3.5 Missing email throws an error about required fields
   *
   * FOR ANY claims object where email is empty,
   * extractUserProfileFromIDToken SHALL throw containing "required fields".
   *
   * **Validates: Requirements 1.6**
   */
  describe('3.5 Claims with missing email are rejected', () => {
    it('should throw "required fields" when email is empty', () => {
      fc.assert(
        fc.property(missingEmailClaimsArb, (claims) => {
          let threw = false;
          let errorMsg = '';
          try {
            extractUserProfileFromIDToken(claims);
          } catch (err) {
            threw = true;
            errorMsg = err instanceof Error ? err.message : String(err);
          }
          return threw && errorMsg.toLowerCase().includes('required fields');
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * 3.6 Profile extraction is deterministic (same input → same output)
   *
   * FOR ANY valid claims object, calling extractUserProfileFromIDToken twice
   * SHALL return identical profile objects.
   *
   * **Validates: Requirements 1.5**
   */
  describe('3.6 Profile extraction is deterministic', () => {
    it('should return identical profiles for the same claims input', () => {
      fc.assert(
        fc.property(validClaimsArb, (claims) => {
          const profile1 = extractUserProfileFromIDToken(claims);
          const profile2 = extractUserProfileFromIDToken(claims);

          return (
            profile1.google_id === profile2.google_id &&
            profile1.email === profile2.email &&
            profile1.name === profile2.name &&
            profile1.profile_picture_url === profile2.profile_picture_url
          );
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * 3.7 Sub value is preserved exactly — no transformation
   *
   * FOR ANY valid claims object, the extracted google_id SHALL be byte-for-byte
   * equal to the original sub value (no trimming, encoding, or other mutation).
   *
   * **Validates: Requirements 1.5**
   */
  describe('3.7 Sub value is preserved without transformation', () => {
    it('should store sub in google_id without any modification', () => {
      fc.assert(
        fc.property(validClaimsArb, (claims) => {
          const profile = extractUserProfileFromIDToken(claims);
          return profile.google_id === claims.sub;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * 3.8 Name falls back to email prefix when claims.name is absent
   *
   * FOR ANY claims where name is an empty string,
   * the extracted profile name SHALL equal the part of email before '@'.
   *
   * **Validates: Requirements 1.5**
   */
  describe('3.8 Name falls back to email prefix when name is empty', () => {
    it('should use the email prefix as the name when name is empty', () => {
      fc.assert(
        fc.property(
          validClaimsArb.map(c => ({ ...c, name: '' })),
          (claims) => {
            const profile = extractUserProfileFromIDToken(claims);
            const expectedName = claims.email.split('@')[0];
            return profile.name === expectedName;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * 3.9 verifyIDTokenSignature and completeOAuthFlow are callable functions
   *
   * Structural check: the exported symbols that form the ID-token
   * verification contract MUST exist and be functions.
   *
   * **Validates: Requirements 1.4**
   */
  describe('3.9 Service exports exist and are functions', () => {
    it('verifyIDTokenSignature should be a function', () => {
      expect(typeof verifyIDTokenSignature).toBe('function');
    });

    it('extractUserProfileFromIDToken should be a function', () => {
      expect(typeof extractUserProfileFromIDToken).toBe('function');
    });

    it('completeOAuthFlow should be a function', () => {
      expect(typeof completeOAuthFlow).toBe('function');
    });
  });
});
