/**
 * useRecordings Hook
 * Custom hook for managing recordings state and API calls
 */

import { useState, useCallback } from 'react';
import { Recording } from '../types';
import { apiService } from '../services/api';
import { logError } from '../utils/errorHandler';

export const useRecordings = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecordings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getRecordings();
      setRecordings(data);
    } catch (err) {
      const message = 'Failed to load recordings';
      logError('useRecordings.fetchRecordings', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRecording = useCallback(async (id: string) => {
    try {
      await apiService.deleteRecording(id);
      setRecordings(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      const message = 'Failed to delete recording';
      logError('useRecordings.deleteRecording', err);
      setError(message);
      throw err;
    }
  }, []);

  const addRecording = useCallback((recording: Recording) => {
    setRecordings(prev => [recording, ...prev]);
  }, []);

  return {
    recordings,
    loading,
    error,
    fetchRecordings,
    deleteRecording,
    addRecording,
    setError
  };
};
