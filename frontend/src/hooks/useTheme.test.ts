/**
 * Tests for useTheme hook
 * Validates that the hook is properly exported and accessible
 */

import { describe, it, expect } from 'vitest';
import { useTheme } from './useTheme';

describe('useTheme hook export', () => {
  it('should export useTheme hook from the hooks module', () => {
    // This test validates that the hook is properly exported and defined
    expect(useTheme).toBeDefined();
    expect(typeof useTheme).toBe('function');
  });
});
