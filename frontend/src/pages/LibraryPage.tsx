/**
 * Library Page - Refactored with New Workspace Layout
 * Uses 3-panel layout: Sidebar | List Panel | Main Editor Panel
 */

import { useState, useEffect, useMemo } from 'react';
import Workspace from '../components/Workspace/Workspace';
import SidebarContent from '../components/Workspace/Sidebar';
import ListPanel, { ListItem } from '../components/Workspace/ListPanel';
import EditorPanel, { Recording } from '../components/Editor/EditorPanel';
import RecordingDock from '../components/RecordingDock/RecordingDock';
import { useRecordings } from '../hooks/useRecordings';

const LibraryPage = () => {
  const { recordings, fetchRecordings } = useRecordings();
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | undefined>();
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    fetchRecordings();
    const interval = setInterval(fetchRecordings, 3000);
    return () => clearInterval(interval);
  }, [fetchRecordings]);

  // Convert recordings to sidebar items
  const sidebarItems = useMemo(() => [
    {
      id: 'all-notes',
      label: 'All Notes',
      count: recordings.length,
      onClick: () => {},
    },
    {
      id: 'recordings',
      label: 'Recordings',
      count: recordings.length,
      onClick: () => {},
    },
  ], [recordings.length]);

  // Convert recordings to list items
  const listItems: ListItem[] = useMemo(() =>
    recordings.map(rec => ({
      id: rec.id,
      title: rec.originalName || 'Untitled',
      date: new Date(rec.createdAt).toLocaleDateString(),
      duration: `${Math.floor(rec.duration / 60)}:${(rec.duration % 60).toString().padStart(2, '0')} min`,
      type: 'recording' as const,
      tags: [],
    })),
    [recordings]
  );

  const selectedRecording = recordings.find(r => r.id === selectedRecordingId);
  const currentRecording: Recording = selectedRecording ? {
    id: selectedRecording.id,
    title: selectedRecording.originalName || 'Untitled',
    content: selectedRecording.transcription || '',
    date: new Date(selectedRecording.createdAt).toLocaleDateString(),
    duration: selectedRecording.duration,
    currentTime,
    isPlaying,
    isRecording,
    tags: [],
  } : {
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
    <>
      <Workspace
        sidebar={
          <SidebarContent
            items={sidebarItems}
            activeItemId="all-notes"
            onNavigate={() => {}}
          />
        }
        listPanel={
          <ListPanel
            items={listItems}
            activeItemId={selectedRecordingId}
            onSelectItem={setSelectedRecordingId}
            showSearch={true}
          />
        }
        mainPanel={
          selectedRecording ? (
            <EditorPanel
              recording={currentRecording}
              onUpdate={(updates) => {
                if (updates.title) {
                  // Handle title update
                }
              }}
              onPlayPause={setIsPlaying}
              onSeek={setCurrentTime}
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#9CA3AF',
            }}>
              <p>Select a recording to view details</p>
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
    </>
  );
};

export default LibraryPage;
