import { useState, useEffect } from 'react';

interface RecordingControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  time: number;
}

const RecordingControls = ({ isRecording, onToggleRecording, time }: RecordingControlsProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-[2] flex flex-col items-center justify-center bg-surface-container-lowest rounded-[2rem] border-outline-variant shadow-sm relative overflow-hidden rounded-none">
      {isRecording && (
        <div className="absolute top-8 left-8 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-error recording-pulse"></div>
          <span className="font-label-sm text-label-sm text-error uppercase font-bold tracking-widest">Recording in Progress</span>
        </div>
      )}

      <div className="flex flex-col items-center gap-stack-lg">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl"></div>
          <div className={`z-10 w-48 h-48 rounded-full bg-surface-container-lowest border-8 border-outline-variant flex flex-col items-center justify-center shadow-2xl ${isRecording ? 'recording-pulse' : ''}`}>
            <span className="font-headline-xl text-headline-xl text-on-surface">{formatTime(time)}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">MM:SS</span>
          </div>
        </div>

        {/* Waveform */}
        <div className="h-24 flex items-center justify-center gap-1 px-8">
          {Array.from({ length: 12 }, (_, i) => (
            <div 
              key={i}
              className={`w-1.5 bg-primary rounded-full ${isRecording ? 'waveform-bar' : ''}`}
              style={{ height: isRecording ? '20px' : '8px' }}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-12 flex items-center gap-10">
        <button className="flex flex-col items-center gap-2 group">
          <div className="w-16 h-16 rounded-full border border-outline-variant bg-surface-container flex items-center justify-center hover:bg-surface-variant transition-all">
            <span className="material-symbols-outlined text-3xl text-on-surface">pause</span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Pause</span>
        </button>

        <button 
          onClick={onToggleRecording}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-24 h-24 rounded-full bg-error shadow-xl flex items-center justify-center hover:scale-105 transition-all">
            {isRecording ? (
              <div className="w-8 h-8 bg-white rounded-sm"></div>
            ) : (
              <span className="material-symbols-outlined text-4xl text-white">mic</span>
            )}
          </div>
          <span className="font-label-sm text-label-sm text-on-surface font-bold">
            {isRecording ? 'Stop & Save' : 'Start Recording'}
          </span>
        </button>

        <button className="flex flex-col items-center gap-2 group">
          <div className="w-16 h-16 rounded-full border border-outline-variant bg-surface-container flex items-center justify-center hover:bg-surface-variant transition-all">
            <span className="material-symbols-outlined text-3xl text-on-surface">bookmark</span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Key Moment</span>
        </button>
      </div>
    </div>
  );
};

export default RecordingControls;