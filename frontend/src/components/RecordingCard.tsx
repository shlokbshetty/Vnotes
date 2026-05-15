import { Recording } from '../types';

interface RecordingCardProps {
  recording: Recording;
  onDelete?: (id: string) => void;
}

const RecordingCard = ({ recording, onDelete }: RecordingCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this recording?')) {
      onDelete(recording.id);
    }
  };

  return (
    <div className="bg-surface border border-outline-variant p-6 rounded-xl flex flex-col md:flex-row gap-6 note-card-shadow transition-all hover:border-primary cursor-pointer group">
      <div className="flex-shrink-0 w-full md:w-48 h-32 bg-surface-container-high rounded-lg flex items-center justify-center border border-outline-variant overflow-hidden">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary transition-colors">
          audio_file
        </span>
      </div>
      
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-headline-lg-mobile text-on-surface truncate">{recording.originalName}</h3>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold">
              Audio
            </span>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-2 text-error hover:bg-error-container rounded-lg transition-all"
                title="Delete recording"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="flex gap-4 mb-3">
          <div className="flex items-center gap-1 text-on-surface-variant font-label-sm">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            {formatDate(recording.createdAt)}
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant font-label-sm">
            <span className="material-symbols-outlined text-[18px]">timer</span>
            {formatDuration(recording.duration)}
          </div>
        </div>
        
        {/* Audio Player */}
        <div className="mb-3">
          <audio 
            controls 
            src={`http://localhost:3001/uploads/${recording.filename}`}
            className="w-full max-w-md"
          >
            Your browser does not support the audio element.
          </audio>
        </div>
        
        <p className="text-on-surface-variant font-body-md text-sm">
          Recorded on {formatDate(recording.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default RecordingCard;