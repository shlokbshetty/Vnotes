/**
 * Library Page — SideNavBar + recordings list + editor
 */

import { useState, useEffect } from 'react';
import AppPageShell from '../components/AppPageShell';
import Workspace from '../components/Workspace/Workspace';
import RecordingsListPanel from '../components/RecordingsListPanel';
import EditorPanel, { Recording } from '../components/Editor/EditorPanel';
import RecordingDock from '../components/RecordingDock/RecordingDock';
import { useRecordings } from '../hooks/useRecordings';
import { useAuth } from '../contexts/AuthContext';

const LibraryPage = () => {
  const { user } = useAuth();
  const { recordings, loading, error, fetchRecordings } = useRecordings();
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | undefined>();
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    fetchRecordings();
    const interval = setInterval(fetchRecordings, 3000);
    return () => clearInterval(interval);
  }, [fetchRecordings]);

  const selectedRecording = recordings.find((r) => r.id === selectedRecordingId);
  const currentRecording: Recording = selectedRecording
    ? {
        id: selectedRecording.id,
        title: selectedRecording.originalName || 'Untitled',
        content: selectedRecording.transcription || '',
        date: new Date(selectedRecording.createdAt).toLocaleDateString(),
        duration: selectedRecording.duration,
        currentTime,
        isPlaying,
        isRecording,
        tags: [],
      }
    : {
        id: '',
        title: 'Select a recording',
        content: '',
        date: '',
        duration: 0,
        currentTime: 0,
        isPlaying: false,
        isRecording: false,
      };

  return (
    <AppPageShell>
      <Workspace
        hideSidebar
        listPanel={
          <RecordingsListPanel
            recordings={recordings}
            userId={user?.user_id ?? ''}
            activeId={selectedRecordingId}
            onSelect={setSelectedRecordingId}
            loading={loading}
            error={error}
            onRetry={fetchRecordings}
          />
        }
        mainPanel={
          selectedRecording ? (
            <div className="flex h-full flex-col bg-background">
              <div className="min-h-0 flex-1">
                <EditorPanel
                  recording={currentRecording}
                  onUpdate={() => {}}
                  onPlayPause={setIsPlaying}
                  onSeek={setCurrentTime}
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-on-surface-variant font-label-mono p-8 select-none bg-background">
              <span className="material-symbols-outlined text-4xl mb-3 text-primary opacity-60">graphic_eq</span>
              <span>Select a note from the list to view</span>
            </div>
          )
        }
      />

      {isRecording && (
        <RecordingDock
          isRecording={isRecording}
          recordingTime={0}
          onRecord={() => setIsRecording(false)}
          onStop={() => setIsRecording(false)}
        />
      )}
    </AppPageShell>
  );
};

export default LibraryPage;
