/**
 * Recording Page - Refactored with New Workspace Layout
 * Uses 3-panel layout: Sidebar | List Panel | Main Editor Panel
 * Recording controls moved to top dock
 */

import { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import Workspace from '../components/Workspace/Workspace';
import SidebarContent from '../components/Workspace/Sidebar';
import ListPanel, { ListItem } from '../components/Workspace/ListPanel';
import EditorPanel, { Recording } from '../components/Editor/EditorPanel';
import RecordingDock from '../components/RecordingDock/RecordingDock';
import { useRecording } from '../hooks/useRecording';
import { useRecordings } from '../hooks/useRecordings';
import { apiService } from '../services/api';
import './RecordingPage.css';

const RecordingPage = () => {
  const {
    isRecording,
    time,
    isUploading,
    startRecording,
    stopRecording,
    uploadRecording,
    resetRecording,
    setError
  } = useRecording();

  const { recordings, addRecording, fetchRecordings } = useRecordings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | undefined>();
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(time);

  useEffect(() => {
    setRecordingTime(time);
  }, [time]);

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
    isRecording: isRecording,
    tags: [],
  } : {
    id: '',
    title: 'Start recording to begin',
    content: 'Click the record button in the dock at the top to start a new recording, or select one from your library.',
    date: new Date().toLocaleDateString(),
    duration: 0,
    currentTime: 0,
    isPlaying: false,
    isRecording: isRecording,
  };

  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      const audioBlob = stopRecording();
      if (audioBlob) {
        try {
          const recording = await uploadRecording(audioBlob);
          addRecording(recording);
          setSelectedRecordingId(recording.id);
          resetRecording();
        } catch (err) {
          // Error handled in hook
        }
      }
    } else {
      await startRecording();
    }
  }, [isRecording, stopRecording, uploadRecording, resetRecording, startRecording, addRecording]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const recording = await apiService.uploadRecording(file);
      addRecording(recording);
      setSelectedRecordingId(recording.id);
    } catch (err) {
      setError('Failed to upload file. Please try again.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addRecording, setError]);

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
          <div className="recording-page-container">
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

            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isRecording || isUploading}
              className="recording-page-upload-button"
              title="Upload audio or video file"
            >
              📁 Upload File
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              aria-label="Upload recording file"
            />
          </div>
        }
      />

      {isRecording && (
        <RecordingDock
          isRecording={isRecording}
          recordingTime={recordingTime}
          onRecord={handleToggleRecording}
          onStop={handleToggleRecording}
        />
      )}
    </>
  );
};

export default RecordingPage;