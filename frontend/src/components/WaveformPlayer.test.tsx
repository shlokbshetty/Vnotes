import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WaveformPlayer, { BAR_COUNT } from './WaveformPlayer';

describe('WaveformPlayer', () => {
  it('generates exactly 120 bars', () => {
    render(<WaveformPlayer duration={120} currentTime={0} onSeek={vi.fn()} />);
    const bars = screen.getAllByTestId(/^waveform-bar-/);
    expect(bars).toHaveLength(BAR_COUNT);
  });

  it('colors bars before playhead as muted gray with opacity-50', () => {
    render(<WaveformPlayer duration={120} currentTime={0} onSeek={vi.fn()} />);
    const bar = screen.getByTestId('waveform-bar-50');
    expect(bar.className).toContain('opacity-50');
    expect(bar.className).toContain('bg-neutral-500');
  });

  it('colors bars at and past playhead as primary-accent with opacity-100', () => {
    render(<WaveformPlayer duration={120} currentTime={60} onSeek={vi.fn()} />);
    const bar = screen.getByTestId('waveform-bar-10');
    expect(bar.className).toContain('bg-primary-accent');
    expect(bar.className).toContain('opacity-100');
  });

  it('renders playhead indicator with glow shadow', () => {
    render(<WaveformPlayer duration={120} currentTime={30} onSeek={vi.fn()} />);
    const playhead = screen.getByTestId('waveform-playhead');
    expect(playhead.className).toContain('shadow-');
    expect(playhead.className).toContain('bg-primary-accent');
  });

  it('calls onSeek when a bar is clicked', () => {
    const onSeek = vi.fn();
    render(<WaveformPlayer duration={120} currentTime={0} onSeek={onSeek} />);
    fireEvent.click(screen.getByTestId('waveform-bar-60'));
    expect(onSeek).toHaveBeenCalledWith(60);
  });
});
