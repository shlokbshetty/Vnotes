/**
 * Recording Page — SideNavBar + list + editor with WaveformPlayer
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import AppPageShell from '../components/AppPageShell';
import Workspace from '../components/Workspace/Workspace';
import RecordingsListPanel from '../components/RecordingsListPanel';
import EditorPanel, { Recording } from '../components/Editor/EditorPanel';
import RecordingDock from '../components/RecordingDock/RecordingDock';
import { useRecording } from '../hooks/useRecording';
import { useRecordings } from '../hooks/useRecordings';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import './RecordingPage.css';

const RecordingPage = () => {
  const { user } = useAuth();
  const {
    isRecording,
    time,
    startRecording,
    stopRecording,
    uploadRecording,
    resetRecording,
    setError,
  } = useRecording();

  const { recordings, loading, error, fetchRecordings, addRecording } = useRecordings();
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
        title: 'Start recording to begin',
        content:
          'Click the record button in the dock at the top to start a new recording, or select one from your library.',
        date: new Date().toLocaleDateString(),
        duration: 0,
        currentTime: 0,
        isPlaying: false,
        isRecording,
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
        } catch {
          // Error handled in hook
        }
      }
    } else {
      await startRecording();
    }
  }, [isRecording, stopRecording, uploadRecording, resetRecording, startRecording, addRecording]);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        setError(null);
        const recording = await apiService.uploadRecording(file);
        addRecording(recording);
        setSelectedRecordingId(recording.id);
      } catch {
        setError('Failed to upload file. Please try again.');
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [addRecording, setError]
  );

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
          <div className="recording-page-container flex h-full flex-col bg-background relative">
            <div className="min-h-0 flex-1">
              <EditorPanel
                recording={currentRecording}
                onUpdate={() => {}}
                onPlayPause={setIsPlaying}
                onSeek={setCurrentTime}
              />
            </div>

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
    </AppPageShell>
  );
};

export default RecordingPage;
