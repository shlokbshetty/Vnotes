/**
 * Recording Page
 * Main page for recording audio
 */

import { useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import RecordingControls from '../components/RecordingControls';
import TranscriptPanel from '../components/TranscriptPanel';
import { useRecording } from '../hooks/useRecording';
import { getUserFriendlyMessage } from '../utils/errorHandler';

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

  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      const audioBlob = stopRecording();
      if (audioBlob) {
        try {
          await uploadRecording(audioBlob);
          resetRecording();
        } catch (err) {
          // Error is already handled in the hook
        }
      }
    } else {
      await startRecording();
    }
  }, [isRecording, stopRecording, uploadRecording, resetRecording, startRecording]);

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 flex overflow-hidden bg-background h-full">
          <RecordingControls 
            isRecording={isRecording}
            onToggleRecording={handleToggleRecording}
            time={time}
            isUploading={isUploading}
            error={error}
            onDismissError={() => setError(null)}
          />
          <TranscriptPanel />
        </div>
      </main>

      {/* Background Decoration Elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px] pointer-events-none z-[-1]"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-white/5 rounded-full blur-[100px] pointer-events-none z-[-1]"></div>
    </>
  );
};

export default RecordingPage;