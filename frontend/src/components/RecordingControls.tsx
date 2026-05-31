/**
 * Recording Controls - Editorial Design
 * Main recording interface with timer and waveform visualization
 */

import { formatTime } from '../utils/formatters';

interface RecordingControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  time: number;
  isUploading?: boolean;
  error?: string | null;
  onDismissError?: () => void;
}

const RecordingControls = ({ 
  isRecording, 
  onToggleRecording, 
  time, 
  isUploading = false,
  error,
  onDismissError
}: RecordingControlsProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-xl px-xl py-xl relative">
      {/* Status Indicator */}
      {isRecording && (
        <div className="absolute top-lg left-lg flex items-center gap-md">
          <div className="w-3 h-3 rounded-full bg-accent-500 recording-pulse"></div>
          <span className="text-xs font-semibold text-accent-400 uppercase tracking-widest">Recording</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-lg right-lg bg-error bg-opacity-10 border border-error border-opacity-30 px-md py-sm rounded-lg flex items-center gap-sm max-w-xs text-error text-sm slide-down">
          <span>{error}</span>
          {onDismissError && (
            <button onClick={onDismissError} className="ml-md">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>
      )}

      {/* Timer Display */}
      <div className="flex flex-col items-center gap-lg">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className={`absolute inset-0 bg-accent-600 rounded-full blur-3xl opacity-10 ${isRecording ? 'recording-pulse' : ''}`}></div>
          <div className={`z-10 w-48 h-48 rounded-full bg-neutral-800 border-4 border-neutral-700 flex flex-col items-center justify-center shadow-lg ${isRecording ? 'recording-pulse' : ''}`}>
            <div className="text-5xl font-display font-bold text-neutral-50">{formatTime(time)}</div>
            <div className="text-xs text-neutral-500 uppercase tracking-widest mt-sm">Recording Time</div>
          </div>
        </div>

        {/* Waveform Visualization */}
        {isRecording && (
          <div className="flex items-center justify-center gap-1 px-xl h-20">
            {Array.from({ length: 12 }, (_, i) => (
              <div 
                key={i}
                className="w-1.5 waveform-bar rounded-full"
              />
            ))}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-xl mt-xl">
        {/* Pause Button (Placeholder) */}
        <button className="flex flex-col items-center gap-sm group hover-lift">
          <div className="w-14 h-14 rounded-full border-2 border-neutral-700 bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-smooth">
            <span className="material-symbols-outlined text-neutral-300 text-2xl">pause</span>
          </div>
          <span className="text-xs text-neutral-500 font-medium">Pause</span>
        </button>

        {/* Record/Stop Button (Primary) */}
        <button 
          onClick={onToggleRecording}
          className="flex flex-col items-center gap-sm group hover-lift"
          disabled={isUploading}
        >
          <div className={`w-20 h-20 rounded-full bg-accent-600 hover:bg-accent-700 shadow-lg flex items-center justify-center transition-smooth transform ${isUploading ? 'opacity-50 scale-95' : 'group-hover:scale-110'}`}>
            {isUploading ? (
              <div className="w-6 h-6 border-2 border-neutral-50 border-t-transparent rounded-full animate-spin"></div>
            ) : isRecording ? (
              <div className="w-7 h-7 bg-neutral-50 rounded-sm"></div>
            ) : (
              <span className="material-symbols-outlined text-4xl text-neutral-50">mic</span>
            )}
          </div>
          <span className="text-xs font-semibold text-neutral-200 text-center">
            {isUploading ? 'Saving...' : isRecording ? 'Stop' : 'Record'}
          </span>
        </button>

        {/* Bookmark Button (Placeholder) */}
        <button className="flex flex-col items-center gap-sm group hover-lift">
          <div className="w-14 h-14 rounded-full border-2 border-neutral-700 bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-smooth">
            <span className="material-symbols-outlined text-neutral-300 text-2xl">bookmark</span>
          </div>
          <span className="text-xs text-neutral-500 font-medium">Mark</span>
        </button>
      </div>
    </div>
  );
};

export default RecordingControls;