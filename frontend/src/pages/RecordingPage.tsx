import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import RecordingControls from '../components/RecordingControls';
import TranscriptPanel from '../components/TranscriptPanel';

const RecordingPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        await uploadRecording(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
      setTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const uploadRecording = async (audioBlob: Blob) => {
    try {
      setIsUploading(true);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `recording-${timestamp}.wav`;
      
      const audioFile = new File([audioBlob], filename, { type: 'audio/wav' });
      
      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await fetch('http://localhost:3001/api/recordings/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Recording uploaded successfully:', result);
        alert('Recording saved successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to save recording. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

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