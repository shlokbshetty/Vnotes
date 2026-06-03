/**
 * RecordingListItem — list row with metadata, tags, and transcription status
 */

export type RecordingStatus = 'transcribing' | 'completed';

export interface RecordingTag {
  label: string;
  color: 'blue' | 'green' | 'red' | 'amber' | 'violet';
}

export interface RecordingListItemProps {
  id: string;
  filename: string;
  originalName: string;
  duration: number;
  size: number;
  type: string;
  userId: string;
  createdAt: string;
  isPinned?: boolean;
  tags?: RecordingTag[];
  status?: RecordingStatus;
  isActive?: boolean;
  onSelect?: (id: string) => void;
}

const TAG_COLORS: Record<RecordingTag['color'], string> = {
  blue: 'bg-blue-400/10 text-blue-300',
  green: 'bg-success-accent/10 text-success-accent',
  red: 'bg-secondary-accent/10 text-secondary-accent',
  amber: 'bg-amber-400/10 text-amber-300',
  violet: 'bg-violet-400/10 text-violet-300',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function RecordingListItem({
  id,
  originalName,
  duration,
  size,
  createdAt,
  isPinned = false,
  tags = [],
  status = 'completed',
  isActive = false,
  onSelect,
}: RecordingListItemProps) {
  const isTranscribing = status === 'transcribing';

  return (
    <button
      type="button"
      data-testid={`recording-list-item-${id}`}
      onClick={() => onSelect?.(id)}
      className={`
        w-full text-left transition-all duration-200 relative overflow-hidden p-4 rounded-xl flex flex-col gap-2 mb-3
        ${
          isActive 
            ? 'bg-surface-container border border-primary/30 hover:border-primary/50 shadow-lg' 
            : 'bg-surface-container-low border border-white/5 hover:border-white/10 hover:bg-surface-container/30'
        }
        ${isTranscribing ? 'opacity-50' : 'opacity-100'}
      `}
    >
      {/* Top right ambient highlight glow for active items */}
      {isActive && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 blur-2xl rounded-full pointer-events-none"></div>
      )}

      <div className="flex justify-between items-start gap-3 w-full">
        <h3 className="font-headline-sm text-on-surface leading-tight font-semibold line-clamp-2 flex-1">
          {isPinned && (
            <span className="material-symbols-outlined text-primary text-sm mr-1.5 align-middle select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
              push_pin
            </span>
          )}
          {originalName}
        </h3>
        
        {isTranscribing ? (
          <span
            data-testid="transcribing-badge"
            className="flex items-center gap-1 font-mono text-[9px] tracking-wider text-primary select-none shrink-0"
          >
            <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border border-primary border-t-transparent" />
            LIVE
          </span>
        ) : (
          <>
            <span data-testid="completed-badge" className="sr-only">Completed</span>
            {isActive && (
              <div className="flex gap-1 items-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                <span className="text-[9px] text-primary uppercase tracking-widest font-bold font-label-mono">Playing</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bento metadata tags */}
      <div data-testid="recording-metadata" className="flex flex-wrap gap-2 text-[10px] font-label-mono font-mono text-on-surface-variant/80">
        <span className="bg-surface-variant/50 px-2 py-0.5 rounded border border-white/5 font-label-mono shrink-0">
          {formatDate(createdAt)}
        </span>
        <span className="bg-surface-variant/50 px-2 py-0.5 rounded border border-white/5 font-label-mono shrink-0">
          {formatDuration(duration)}
        </span>
        <span className="bg-surface-variant/50 px-2 py-0.5 rounded border border-white/5 font-label-mono shrink-0">
          {formatSize(size)}
        </span>
      </div>

      {/* Custom tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1" data-testid="recording-tags">
          {tags.map((tag) => (
            <span
              key={`${id}-${tag.label}`}
              className={`rounded px-1.5 py-0.5 text-[9px] font-label-mono tracking-wider ${TAG_COLORS[tag.color] || 'bg-primary/10 text-primary'}`}
            >
              #{tag.label}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
