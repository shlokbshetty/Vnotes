import React from 'react';

interface WaveformProps {
  data?: number[];
  progress: number;
  isDragging: boolean;
}

/**
 * Waveform Visualization
 * 
 * Features:
 * - Bar-based amplitude visualization
 * - Blue gradient coloring
 * - Progress indicator overlay
 * - Smooth animations
 */
const Waveform: React.FC<WaveformProps> = ({
  data,
  progress,
  isDragging,
}) => {
  // Generate mock waveform if no data provided
  const generateMockWaveform = (bars: number = 100): number[] => {
    return Array.from({ length: bars }, () =>
      Math.random() * 70 + 20 // 20-90% height range
    );
  };

  const waveformData = data || generateMockWaveform();
  const barWidth = Math.max(2, 100 / waveformData.length);

  return (
    <svg
      className="waveform-svg"
      viewBox={`0 0 100 80`}
      preserveAspectRatio="none"
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      <defs>
        <linearGradient id="waveform-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="waveform-gradient-played" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="1" />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="100" height="80" fill="#111827" />

      {/* Waveform bars */}
      {waveformData.map((amplitude, index) => {
        const x = (index / waveformData.length) * 100;
        const barHeight = (amplitude / 100) * 60; // Max 60px height
        const centerY = 40;
        const y = centerY - barHeight / 2;

        const isPlayed = x < progress;
        const gradientId = isPlayed ? 'waveform-gradient-played' : 'waveform-gradient';

        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill={`url(#${gradientId})`}
            rx="1"
            style={{
              opacity: isPlayed ? 1 : 0.7,
              transition: isDragging ? 'none' : 'opacity 100ms ease-out',
            }}
          />
        );
      })}
    </svg>
  );
};

export default Waveform;
