import React from 'react';
import './PlaybackControls.css';

interface PlaybackControlsProps {
  isPlaying: boolean;
  isRecording: boolean;
  onPlayPause: (isPlaying: boolean) => void;
  onRecord?: () => void;
  onStop?: () => void;
}

/**
 * Playback Controls
 * 
 * Features:
 * - Play/pause toggle
 * - Record button (red)
 * - Stop button (when recording)
 * - Split/mark controls (placeholder)
 */
const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  isRecording,
  onPlayPause,
  onRecord,
  onStop,
}) => {
  return (
    <div className="playback-controls">
      {/* Record Button */}
      <button
        className={`playback-button playback-button-record ${isRecording ? 'recording' : ''}`}
        onClick={onRecord}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        title={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <span className="playback-icon">●</span>
      </button>

      {/* Play/Pause Button */}
      <button
        className="playback-button playback-button-play"
        onClick={() => onPlayPause(!isPlaying)}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        <span className="playback-icon">
          {isPlaying ? '⏸' : '▶'}
        </span>
      </button>

      {/* Stop Button (shown when recording) */}
      {isRecording && (
        <button
          className="playback-button playback-button-stop"
          onClick={onStop}
          aria-label="Stop recording"
          title="Stop recording"
        >
          <span className="playback-icon">⏹</span>
        </button>
      )}

      {/* Split/Mark Button (placeholder) */}
      <button
        className="playback-button playback-button-split"
        title="Mark split point"
        aria-label="Mark split point"
        disabled
      >
        <span className="playback-icon">|</span>
      </button>
    </div>
  );
};

export default PlaybackControls;
