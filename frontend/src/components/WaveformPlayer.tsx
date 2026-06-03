/**
 * WaveformPlayer — 120-bar audio timeline visualization
 */

import { useMemo } from 'react';

const BAR_COUNT = 120;

export interface WaveformPlayerProps {
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
}

function barHeight(index: number): number {
  const wave = Math.sin(index * 0.35) * 0.35 + Math.cos(index * 0.12) * 0.25;
  return 20 + Math.abs(wave) * 60;
}

export default function WaveformPlayer({ duration, currentTime, onSeek }: WaveformPlayerProps) {
  const playheadIndex = useMemo(() => {
    if (duration <= 0) return 0;
    return Math.min(BAR_COUNT - 1, Math.floor((currentTime / duration) * BAR_COUNT));
  }, [currentTime, duration]);

  const bars = useMemo(
    () => Array.from({ length: BAR_COUNT }, (_, i) => ({ index: i, height: barHeight(i) })),
    []
  );

  const handleBarClick = (index: number) => {
    if (duration <= 0) return;
    onSeek(index * (duration / BAR_COUNT));
  };

  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      data-testid="waveform-player"
      className="relative w-full rounded border border-black/[0.12] bg-surface-2 px-3 py-4 dark:border-white/[0.08]"
    >
      <div className="relative flex h-24 w-full items-end justify-between gap-[1px]">
        {bars.map(({ index, height }) => {
          const isPastPlayhead = index <= playheadIndex;
          return (
            <button
              key={index}
              type="button"
              data-testid={`waveform-bar-${index}`}
              aria-label={`Seek to ${index}`}
              onClick={() => handleBarClick(index)}
              className={`
                min-w-0 flex-1 rounded-sm transition-all duration-200
                ${
                  isPastPlayhead
                    ? 'bg-primary-accent opacity-100'
                    : 'bg-neutral-500 opacity-50'
                }
              `}
              style={{ height: `${height}%` }}
            />
          );
        })}

        <div
          data-testid="waveform-playhead"
          className="pointer-events-none absolute top-0 bottom-0 w-0.5 -translate-x-1/2 animate-pulse bg-primary-accent shadow-[0_0_12px_rgba(183,196,255,0.8)]"
          style={{ left: `${playheadPercent}%` }}
        />
      </div>
    </div>
  );
}

export { BAR_COUNT };
