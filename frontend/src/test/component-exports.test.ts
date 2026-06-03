import { describe, it, expect } from 'vitest';

describe('Component exports', () => {
  it('imports SideNavBar without error', async () => {
    const mod = await import('../components/SideNavBar');
    expect(mod.default).toBeDefined();
  });

  it('imports ThemeToggle without error', async () => {
    const mod = await import('../components/ThemeToggle');
    expect(mod.default).toBeDefined();
  });

  it('imports PricingCard without error', async () => {
    const mod = await import('../components/PricingCard');
    expect(mod.default).toBeDefined();
  });

  it('imports RecordingListItem without error', async () => {
    const mod = await import('../components/RecordingListItem');
    expect(mod.default).toBeDefined();
  });

  it('imports WaveformPlayer without error', async () => {
    const mod = await import('../components/WaveformPlayer');
    expect(mod.default).toBeDefined();
  });
});
