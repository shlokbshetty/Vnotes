import React, { useState, useEffect } from 'react';
import './RecordingDock.css';

interface RecordingDockProps {
  isRecording: boolean;
  recordingTime: number; // in seconds
  waveformBars?: number[];
  onRecord?: () => void;
  onStop?: () => void;
}

/**
 * Recording Dock Component
 * 
 * Features:
 * - Non-intrusive recording UI (top bar or floating dock)
 * - Live waveform visualization (small)
 * - Timer display (HH:MM:SS)
 * - Record/Stop buttons
 * - Pulse animation during recording
 * - Positioned at top with fixed z-index
 * 
 * Does NOT obscure editor content
 */
const RecordingDock: React.FC<RecordingDockProps> = ({
  isRecording,
  recordingTime,
  waveformBars = [],
  onRecord,
  onStop,
}) => {
  const [formattedTime, setFormattedTime] = useState('00:00:00');

  useEffect(() => {
    const hours = Math.floor(recordingTime / 3600);
    const minutes = Math.floor((recordingTime % 3600) / 60);
    const seconds = Math.floor(recordingTime % 60);

    const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    setFormattedTime(formatted);
  }, [recordingTime]);

  // Generate mock waveform if none provided
  const generateMockWaveform = (): number[] => {
    return Array.from({ length: 20 }, () => Math.random() * 100);
  };

  const bars = waveformBars.length > 0 ? waveformBars : generateMockWaveform();

  if (!isRecording) {
    return null; // Don't show dock when not recording
  }

  return (
    <div className="recording-dock">
      <div className="recording-dock-content">
        {/* Status Indicator */}
        <div className="recording-dock-status">
          <span className="recording-indicator pulse"></span>
          <span className="recording-label">Recording</span>
        </div>

        {/* Live Waveform */}
        <div className="recording-dock-waveform">
          <svg viewBox="0 0 100 32" preserveAspectRatio="none">
            <defs>
              <linearGradient id="dock-waveform-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="1" />
                <stop offset="100%" stopColor="#DC2626" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {bars.map((amplitude, index) => (
              <rect
                key={index}
                x={(index / bars.length) * 100}
                y={16 - (amplitude / 200) * 16}
                width={100 / bars.length}
                height={(amplitude / 100) * 16}
                fill="url(#dock-waveform-gradient)"
                rx="0.5"
                opacity="0.8"
              />
            ))}
          </svg>
        </div>

        {/* Timer */}
        <div className="recording-dock-timer">
          <span className="recording-time">{formattedTime}</span>
        </div>

        {/* Control Buttons */}
        <div className="recording-dock-controls">
          <button
            className="recording-dock-button record-active"
            onClick={onRecord}
            title="Pause recording"
            aria-label="Pause recording"
          >
            ⏸
          </button>

          <button
            className="recording-dock-button stop"
            onClick={onStop}
            title="Stop recording"
            aria-label="Stop recording"
          >
            ⏹
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordingDock;
