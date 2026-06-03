/**
 * RecordingsListPanel — searchable list of RecordingListItem rows
 */

import { useMemo, useState } from 'react';
import RecordingListItem, {
  RecordingListItemProps,
  RecordingStatus,
  RecordingTag,
} from './RecordingListItem';
import { Recording } from '../types';

function mapRecording(rec: Recording, userId: string): Omit<RecordingListItemProps, 'isActive' | 'onSelect'> {
  const status: RecordingStatus =
    (rec as Recording & { status?: RecordingStatus }).status ?? 'completed';
  const tags: RecordingTag[] = (rec as Recording & { tags?: RecordingTag[] }).tags ?? [];

  return {
    id: rec.id,
    filename: rec.filename,
    originalName: rec.originalName,
    duration: rec.duration,
    size: rec.size,
    type: rec.type,
    userId,
    createdAt: rec.createdAt,
    isPinned: (rec as Recording & { isPinned?: boolean }).isPinned ?? false,
    tags,
    status,
  };
}

interface RecordingsListPanelProps {
  recordings: Recording[];
  userId?: string;
  activeId?: string;
  onSelect: (id: string) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function RecordingsListPanel({
  recordings,
  userId = '',
  activeId,
  onSelect,
  loading = false,
  error = null,
  onRetry,
}: RecordingsListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return recordings;
    const q = searchQuery.toLowerCase();
    return recordings.filter(
      (r) =>
        r.originalName.toLowerCase().includes(q) ||
        r.filename.toLowerCase().includes(q)
    );
  }, [recordings, searchQuery]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-neutral-400">
        <span className="font-mono text-xs tracking-wider">Loading recordings…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-sm text-neutral-300">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded bg-primary-accent px-4 py-2 font-mono text-xs font-semibold text-slate-900"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-surface-container-lowest border-r border-white/10 select-none">
      {/* Search Input Area */}
      <div className="p-4 border-b border-white/10">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-base">search</span>
          <input
            type="search"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary rounded-lg pl-9 pr-3 text-body-md placeholder:text-on-surface-variant/40 h-9 transition-all text-on-surface outline-none"
            aria-label="Search recordings"
          />
        </div>
      </div>

      {/* Header section (Recent / filter list) */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
        <h2 className="text-[10px] font-label-mono text-on-surface-variant uppercase tracking-wider font-bold">Recent</h2>
        <span className="material-symbols-outlined text-on-surface-variant hover:text-on-surface cursor-pointer text-base">filter_list</span>
      </div>

      {/* List items block */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pt-1" role="listbox">
        {filtered.length === 0 ? (
          <p className="p-6 text-center text-sm text-neutral-500 font-label-mono italic">No recordings found</p>
        ) : (
          filtered.map((rec) => (
            <RecordingListItem
              key={rec.id}
              {...mapRecording(rec, userId)}
              isActive={activeId === rec.id}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
