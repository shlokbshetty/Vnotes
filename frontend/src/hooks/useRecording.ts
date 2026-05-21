/**
 * useRecording Hook
 * Custom hook for managing recording state and operations
 */

import { useState, useRef, useCallback } from 'react';
import { apiService } from '../services/api';
import { logError } from '../utils/errorHandler';

export const useRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        audioChunksRef.current = chunks;
      };

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = chunks;
      recorder.start();
      setIsRecording(true);
      setTime(0);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      const message = 'Could not access microphone. Please check permissions.';
      logError('useRecording.startRecording', err);
      setError(message);
    }
  }, []);

  const stopRecording = useCallback((): Blob | null => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      // Get audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      
      // Stop all tracks to release microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

      return audioBlob;
    }
    return null;
  }, []);

  const uploadRecording = useCallback(async (audioBlob: Blob) => {
    try {
      setIsUploading(true);
      setError(null);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `recording-${timestamp}.wav`;
      const audioFile = new File([audioBlob], filename, { type: 'audio/wav' });

      const recording = await apiService.uploadRecording(audioFile);
      return recording;
    } catch (err) {
      const message = 'Failed to save recording. Please try again.';
      logError('useRecording.uploadRecording', err);
      setError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const resetRecording = useCallback(() => {
    setTime(0);
    setError(null);
    audioChunksRef.current = [];
  }, []);

  return {
    isRecording,
    time,
    isUploading,
    error,
    startRecording,
    stopRecording,
    uploadRecording,
    resetRecording,
    setError
  };
};
