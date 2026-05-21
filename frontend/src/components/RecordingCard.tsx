/**
 * Recording Card Component
 * Displays individual recording with metadata and playback
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
    if (onDelete && confirm('Are you sure you want to delete this recording?')) {
      onDelete(recording.id);
    }
  };

  return (
    <div className="bg-surface border border-outline-variant p-6 rounded-xl flex flex-col md:flex-row gap-6 note-card-shadow transition-all hover:border-primary cursor-pointer group">
      <div className="flex-shrink-0 w-full md:w-48 h-32 bg-surface-container-high rounded-lg flex items-center justify-center border border-outline-variant overflow-hidden">
        {recording.isVideo ? (
          <video 
            src={`http://localhost:3001/uploads/${recording.filename}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary transition-colors">
            {getMediaIcon(recording.isVideo)}
          </span>
        )}
      </div>
      
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-headline-lg-mobile text-on-surface truncate">{recording.originalName}</h3>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold">
              {recording.isVideo ? 'Video' : 'Audio'}
            </span>
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-error hover:bg-error-container rounded-lg transition-all disabled:opacity-50"
                title="Delete recording"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="flex gap-4 mb-3 flex-wrap">
          <div className="flex items-center gap-1 text-on-surface-variant font-label-sm">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            {formatDate(recording.createdAt)}
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant font-label-sm">
            <span className="material-symbols-outlined text-[18px]">timer</span>
            {formatDuration(recording.duration)}
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant font-label-sm">
            <span className="material-symbols-outlined text-[18px]">storage</span>
            {formatBytes(recording.size)}
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant font-label-sm">
            <span className="material-symbols-outlined text-[18px]">{getMediaIcon(recording.isVideo)}</span>
            {extractFileType(recording.type)}
          </div>
        </div>
        
        {/* Media Player */}
        <div className="mb-3">
          {recording.isVideo ? (
            <video 
              controls 
              src={`http://localhost:3001/uploads/${recording.filename}`}
              className="w-full max-w-md rounded-lg"
            >
              Your browser does not support the video element.
            </video>
          ) : (
            <audio 
              controls 
              src={`http://localhost:3001/uploads/${recording.filename}`}
              className="w-full max-w-md"
            >
              Your browser does not support the audio element.
            </audio>
          )}
        </div>
        
        <p className="text-on-surface-variant font-body-md text-sm">
          Recorded on {formatDate(recording.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default RecordingCard;