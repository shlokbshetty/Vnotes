/**
 * Recording Page
 * Main page for recording audio or uploading existing files
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
          // Error is already handled in the hook
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

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addRecording, setError]);

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 flex overflow-hidden bg-background h-full">
          <div className="flex-[2] flex flex-col items-center justify-center bg-surface-container-lowest rounded-[2rem] border-outline-variant shadow-sm relative overflow-hidden rounded-none">
            {/* Recording Controls */}
            <RecordingControls 
              isRecording={isRecording}
              onToggleRecording={handleToggleRecording}
              time={time}
              isUploading={isUploading}
              error={error}
              onDismissError={() => setError(null)}
            />

            {/* Upload File Button */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isRecording || isUploading}
                className="px-6 py-3 bg-secondary text-on-secondary rounded-lg font-label-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
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

      {/* Background Decoration Elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px] pointer-events-none z-[-1]"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-white/5 rounded-full blur-[100px] pointer-events-none z-[-1]"></div>
    </>
  );
};

export default RecordingPage;