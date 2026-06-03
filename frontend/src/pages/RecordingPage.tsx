/**
 * Recording Page - Editorial Design
 * Main recording interface with transcript panel
 */

import { useCallback, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import RecordingControls from '../components/RecordingControls';
import TranscriptPanel from '../components/TranscriptPanel';
import { useRecording } from '../hooks/useRecording';
import { useRecordings } from '../hooks/useRecordings';
import { apiService } from '../services/api';
import { Recording } from '../types';

const RecordingPage = () => {
  const {
    isRecording,
    time,
    isUploading,
    error,
    startRecording,
    stopRecording,
    uploadRecording,
    resetRecording,
    setError
  } = useRecording();

  const { addRecording } = useRecordings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);

  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      const audioBlob = stopRecording();
      if (audioBlob) {
        try {
          const recording = await uploadRecording(audioBlob);
          addRecording(recording);
          setSelectedRecording(recording);
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
      setSelectedRecording(recording);
    } catch (err) {
      setError('Failed to upload file. Please try again.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addRecording, setError]);

  return (
    <div className="flex w-full h-full">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex gap-0 overflow-hidden">
          {/* Recording Controls - Main Area */}
          <div className="flex-[2] flex flex-col items-center justify-center bg-neutral-900 relative overflow-hidden">
            <RecordingControls 
              isRecording={isRecording}
              onToggleRecording={handleToggleRecording}
              time={time}
              isUploading={isUploading}
              error={error}
              onDismissError={() => setError(null)}
            />

            {/* Upload Button */}
            <div className="mt-xl flex gap-md">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isRecording || isUploading}
                className="px-lg py-md bg-accent-600 text-neutral-50 rounded-lg font-semibold text-sm hover-lift hover:bg-accent-700 disabled:opacity-50 transition-smooth flex items-center gap-md"
              >
                <span className="material-symbols-outlined">upload_file</span>
                Upload File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Transcript Panel */}
          <TranscriptPanel recording={selectedRecording} />
        </div>
      </main>
    </div>
  );
};

export default RecordingPage;