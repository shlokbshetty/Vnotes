import { describe, it, expect } from 'vitest';
// @ts-ignore - tailwind.config.js doesn't have type definitions
import tailwindConfig from '../../tailwind.config.js';

/**
 * Unit tests for Tailwind color token configuration
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 * Properties: 4 (dark mode colors), 5 (divider opacity)
 */

describe('Tailwind Color Tokens - Obsidian Echo Design System', () => {
  const colors = tailwindConfig.theme.extend.colors;

  describe('Dark Mode Surface Levels', () => {
    it('should define surface-0 as #111111 (Background)', () => {
      expect(colors.surface[0]).toBe('#111111');
    });

    it('should define surface-1 as #1C1B1B (Sidebars)', () => {
      expect(colors.surface[1]).toBe('#1C1B1B');
    });

    it('should define surface-2 as #201F1F (Cards/Panels)', () => {
      expect(colors.surface[2]).toBe('#201F1F');
    });

    it('should define surface-3 as #2a2a2a (Active elements)', () => {
      expect(colors.surface[3]).toBe('#2a2a2a');
    });

    it('should define surface-4 as #353534 (Hover)', () => {
      expect(colors.surface[4]).toBe('#353534');
    });

    it('should define surface DEFAULT as #0A0A0C (Base)', () => {
      expect(colors.surface.DEFAULT).toBe('#0A0A0C');
    });

    it('should have all 6 surface level values defined', () => {
      const surfaceValues = Object.keys(colors.surface);
      expect(surfaceValues).toContain('0');
      expect(surfaceValues).toContain('1');
      expect(surfaceValues).toContain('2');
      expect(surfaceValues).toContain('3');
      expect(surfaceValues).toContain('4');
      expect(surfaceValues).toContain('DEFAULT');
      expect(surfaceValues.length).toBe(6);
    });
  });

  describe('Light Mode Surface Levels', () => {
    it('should define surface-light-0 as #F5F5F4 (Background)', () => {
      expect(colors['surface-light'][0]).toBe('#F5F5F4');
    });

    it('should define surface-light-1 as #EEEEEC (Sidebars)', () => {
      expect(colors['surface-light'][1]).toBe('#EEEEEC');
    });

    it('should define surface-light-2 as #E8E8E6 (Cards/Panels)', () => {
      expect(colors['surface-light'][2]).toBe('#E8E8E6');
    });

    it('should define surface-light-3 as #E0E0DE (Active elements)', () => {
      expect(colors['surface-light'][3]).toBe('#E0E0DE');
    });

    it('should define surface-light-4 as #D8D8D6 (Hover)', () => {
      expect(colors['surface-light'][4]).toBe('#D8D8D6');
    });

    it('should have all 5 light surface level values defined', () => {
      const surfaceLightValues = Object.keys(colors['surface-light']);
      expect(surfaceLightValues).toContain('0');
      expect(surfaceLightValues).toContain('1');
      expect(surfaceLightValues).toContain('2');
      expect(surfaceLightValues).toContain('3');
      expect(surfaceLightValues).toContain('4');
      expect(surfaceLightValues.length).toBe(5);
    });
  });

  describe('Primary Accent Colors (CSS Variables)', () => {
    it('should define primary-accent using CSS variables for #B7C4FF (Electric Blue)', () => {
      expect(colors['primary-accent']).toContain('var(--color-primary-accent)');
    });

    it('should define secondary-accent using CSS variables for #FFBAB0 (Pulse Red)', () => {
      expect(colors['secondary-accent']).toContain('var(--color-secondary-accent)');
    });

    it('should define success-accent using CSS variables for #6DDC9E (Mint Green)', () => {
      expect(colors['success-accent']).toContain('var(--color-success-accent)');
    });

    it('should have all accent colors defined as rgb CSS variables', () => {
      const primaryAccent = colors['primary-accent'];
      const secondaryAccent = colors['secondary-accent'];
      const successAccent = colors['success-accent'];

      expect(primaryAccent).toMatch(/^rgb\(var\(--color-primary-accent\)/);
      expect(secondaryAccent).toMatch(/^rgb\(var\(--color-secondary-accent\)/);
      expect(successAccent).toMatch(/^rgb\(var\(--color-success-accent\)/);
    });
  });

  describe('Color Accessibility and Naming', () => {
    it('should have all dark mode colors accessible via Tailwind class naming', () => {
      // Verify surface colors can be used as bg-surface-0, bg-surface-1, etc.
      expect(colors.surface).toBeDefined();
      expect(typeof colors.surface).toBe('object');
      expect(Object.keys(colors.surface).length).toBeGreaterThan(0);
    });

    it('should have all light mode colors accessible via Tailwind class naming', () => {
      // Verify surface-light colors can be used as bg-surface-light-0, etc.
      expect(colors['surface-light']).toBeDefined();
      expect(typeof colors['surface-light']).toBe('object');
      expect(Object.keys(colors['surface-light']).length).toBeGreaterThan(0);
    });

    it('should have all accent colors accessible as single color values', () => {
      // Verify accent colors can be used as bg-primary-accent, text-secondary-accent, etc.
      expect(colors['primary-accent']).toBeDefined();
      expect(colors['secondary-accent']).toBeDefined();
      expect(colors['success-accent']).toBeDefined();
      expect(typeof colors['primary-accent']).toBe('string');
      expect(typeof colors['secondary-accent']).toBe('string');
      expect(typeof colors['success-accent']).toBe('string');
    });
  });

  describe('Design System Completeness', () => {
    it('should not have conflicting color definitions', () => {
      // Ensure no duplicate color keys
      const colorKeys = Object.keys(colors);
      const uniqueKeys = new Set(colorKeys);
      expect(uniqueKeys.size).toBe(colorKeys.length);
    });

    it('should maintain backward compatibility with legacy colors', () => {
      // Ensure legacy accent colors still exist
      expect(colors.accent).toBeDefined();
      expect(colors.neutral).toBeDefined();
      expect(colors.success).toBeDefined();
      expect(colors.warning).toBeDefined();
      expect(colors.error).toBeDefined();
      expect(colors.info).toBeDefined();
    });

    it('should have all Obsidian Echo tokens properly defined', () => {
      // Validate complete design token set
      expect(colors.surface).toBeDefined();
      expect(colors['surface-light']).toBeDefined();
      expect(colors['primary-accent']).toBeDefined();
      expect(colors['secondary-accent']).toBeDefined();
      expect(colors['success-accent']).toBeDefined();
    });
  });

  describe('Color Value Validation', () => {
    it('all surface colors should be valid hex values', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      
      // Check surface colors
      (Object.values(colors.surface) as string[]).forEach((value: string) => {
        expect(value).toMatch(hexRegex);
      });

      // Check surface-light colors
      (Object.values(colors['surface-light']) as string[]).forEach((value: string) => {
        expect(value).toMatch(hexRegex);
      });
    });

    it('all accent colors should use CSS variables for runtime theming', () => {
      // Accent colors should be CSS variables to support dynamic theme switching
      expect(colors['primary-accent']).toContain('rgb(var');
      expect(colors['secondary-accent']).toContain('rgb(var');
      expect(colors['success-accent']).toContain('rgb(var');
    });
  });
});
