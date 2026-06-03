import React, { useState, useRef } from 'react';
import Waveform from './Waveform';
import PlaybackControls from './PlaybackControls';
import './Timeline.css';

interface TimelineProps {
  duration: number; // in seconds
  currentTime: number;
  isPlaying: boolean;
  isRecording?: boolean;
  onPlayPause: (isPlaying: boolean) => void;
  onSeek: (time: number) => void;
  onRecord?: () => void;
  onStop?: () => void;
  waveformData?: number[]; // Array of amplitude values (0-100)
}

/**
 * Media Timeline Component
 * 
 * Features:
 * - Interactive waveform visualization
 * - Playback progress bar with scrubbing
 * - Timestamps (00:00, 00:10, etc.)
 * - Play/pause controls
 * - Record button
 * - Smooth drag scrubbing
 * - Hover preview
 */
const Timeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  isPlaying,
  isRecording = false,
  onPlayPause,
  onSeek,
  onRecord,
  onStop,
  waveformData,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    updateSeek(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateSeek(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;

    onSeek(newTime);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate timestamp markers
  const timelineMarkers = [];
  const markerInterval = duration > 60 ? 10 : 5;
  for (let i = 0; i <= duration; i += markerInterval) {
    timelineMarkers.push(i);
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <span className="timeline-current-time">{formatTime(currentTime)}</span>
        <span className="timeline-duration">{formatTime(duration)}</span>
      </div>

      {/* Waveform and Progress */}
      <div
        ref={containerRef}
        className="timeline-progress-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        role="slider"
        tabIndex={0}
        aria-label="Seek timeline"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
      >
        {/* Waveform */}
        <Waveform
          data={waveformData}
          progress={progressPercentage}
          isDragging={isDragging}
        />

        {/* Progress Bar Overlay */}
        <div
          className={`timeline-progress-bar ${isDragging ? 'dragging' : ''}`}
          style={{ width: `${progressPercentage}%` }}
          ref={progressRef}
        />
      </div>

      {/* Timestamp Labels */}
      <div className="timeline-markers">
        {timelineMarkers.map((time) => (
          <div
            key={time}
            className="timeline-marker"
            style={{
              left: `${(time / duration) * 100}%`,
            }}
          >
            <span className="timeline-marker-label">{formatTime(time)}</span>
          </div>
        ))}
      </div>

      {/* Playback Controls */}
      <PlaybackControls
        isPlaying={isPlaying}
        isRecording={isRecording}
        onPlayPause={onPlayPause}
        onRecord={onRecord}
        onStop={onStop}
      />
    </div>
  );
};

export default Timeline;
