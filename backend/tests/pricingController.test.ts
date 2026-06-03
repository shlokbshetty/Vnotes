/**
 * Unit tests for pricing controller
 */

import { describe, it, expect } from 'vitest';
import { getPricingData } from '../src/controllers/pricingController';

describe('pricingController', () => {
  const data = getPricingData();

  it('returns tiers array with at least 2 elements', () => {
    expect(Array.isArray(data.tiers)).toBe(true);
    expect(data.tiers.length).toBeGreaterThanOrEqual(2);
  });

  it('each tier has required fields', () => {
    for (const tier of data.tiers) {
      expect(tier.id).toBeTruthy();
      expect(tier.name).toBeTruthy();
      expect(typeof tier.price).toBe('number');
      expect(tier.description).toBeTruthy();
      expect(Array.isArray(tier.features)).toBe(true);
      expect(tier.features.length).toBeGreaterThan(0);
      expect(tier.cta).toBeTruthy();
    }
  });

  it('marks Pro tier with isPopular: true', () => {
    const pro = data.tiers.find((t) => t.id === 'pro');
    expect(pro).toBeDefined();
    expect(pro?.isPopular).toBe(true);
  });

  it('has complete comparison object structure', () => {
    expect(Array.isArray(data.comparison.features)).toBe(true);
    expect(data.comparison.features.length).toBeGreaterThan(0);
    expect(data.comparison.tiers).toBeDefined();
    expect(Array.isArray(data.comparison.tiers.free)).toBe(true);
    expect(Array.isArray(data.comparison.tiers.pro)).toBe(true);
    expect(data.comparison.tiers.free.length).toBe(data.comparison.features.length);
    expect(data.comparison.tiers.pro.length).toBe(data.comparison.features.length);
  });
});
