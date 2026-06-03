/**
 * Recording Card - Editorial Design
 * Minimal, focused card for displaying recording metadata and playback
 */

import { Recording } from '../types';
import { formatDate, formatDuration, formatBytes, extractFileType, getMediaIcon } from '../utils/formatters';

interface RecordingCardProps {
  recording: Recording;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

const RecordingCard = ({ recording, onDelete, isDeleting = false }: RecordingCardProps) => {
  const handleDelete = () => {
    if (onDelete && confirm('Delete this recording? This action cannot be undone.')) {
      onDelete(recording.id);
    }
  };

  return (
    <div className="card p-lg hover:shadow-md transition-smooth group">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {/* Media Preview */}
        <div className="md:col-span-1">
          <div className="w-full aspect-square bg-neutral-800 rounded-lg flex items-center justify-center overflow-hidden border border-neutral-700">
            {recording.isVideo ? (
              <video 
                src={`http://localhost:3001/uploads/${recording.filename}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-5xl text-neutral-600 group-hover:text-accent-500 transition-smooth">
                {getMediaIcon(recording.isVideo)}
              </span>
            )}
          </div>
        </div>

        {/* Metadata & Controls */}
        <div className="md:col-span-2 flex flex-col justify-between">
          {/* Title & Type */}
          <div>
            <h3 className="font-display font-semibold text-lg text-neutral-50 mb-md truncate group-hover:text-accent-400 transition-smooth">
              {recording.originalName}
            </h3>
            
            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-lg">
              {[
                { label: 'Duration', value: formatDuration(recording.duration), icon: 'timer' },
                { label: 'Size', value: formatBytes(recording.size), icon: 'storage' },
                { label: 'Type', value: extractFileType(recording.type), icon: getMediaIcon(recording.isVideo) },
                { label: 'Date', value: formatDate(recording.createdAt), icon: 'calendar_today' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="text-xs">
                  <p className="text-neutral-500 uppercase tracking-wider font-semibold mb-xs">{label}</p>
                  <div className="flex items-center gap-xs text-neutral-200">
                    <span className="material-symbols-outlined text-base">{icon}</span>
                    <span className="font-mono text-sm">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Media Player */}
          <div className="mb-md">
            {recording.isVideo ? (
              <video 
                controls 
                src={`http://localhost:3001/uploads/${recording.filename}`}
                className="w-full max-w-md rounded-lg bg-neutral-800 border border-neutral-700"
              >
                Your browser does not support the video element.
              </video>
            ) : (
              <audio 
                controls 
                src={`http://localhost:3001/uploads/${recording.filename}`}
                className="w-full max-w-md rounded-lg bg-neutral-800 border border-neutral-700"
              >
                Your browser does not support the audio element.
              </audio>
            )}
          </div>

          {/* Action Buttons */}
          {onDelete && (
            <div className="flex gap-md">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-md py-sm text-error text-sm font-medium hover:bg-error hover:bg-opacity-10 rounded-lg transition-smooth disabled:opacity-50 flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordingCard;
