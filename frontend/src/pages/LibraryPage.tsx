/**
 * Library Page - Editorial Design
 * Grid of recordings with metadata and playback
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import RecordingCard from '../components/RecordingCard';
import { useRecordings } from '../hooks/useRecordings';
import { getUserFriendlyMessage } from '../utils/errorHandler';

const LibraryPage = () => {
  const navigate = useNavigate();
  const { recordings, loading, error, fetchRecordings, deleteRecording, setError } = useRecordings();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchRecordings();
    const interval = setInterval(fetchRecordings, 3000);
    return () => clearInterval(interval);
  }, [fetchRecordings]);

  const handleDeleteRecording = async (id: string) => {
    if (!confirm('Delete this recording? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteRecording(id);
    } catch (err) {
      // Error handled in hook
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex w-full h-full">
      <Sidebar />
      
      <main className="flex-grow flex flex-col min-w-0 overflow-y-auto bg-neutral-950">
        <div className="p-xl max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-xl">
            <div>
              <h1 className="text-4xl font-display font-bold text-neutral-50">Library</h1>
              <p className="text-neutral-400 mt-sm">{recordings.length} recording{recordings.length !== 1 ? 's' : ''}</p>
            </div>
            <button 
              onClick={fetchRecordings}
              disabled={loading}
              className="px-lg py-md border border-neutral-700 rounded-lg font-medium text-sm text-neutral-300 hover:bg-neutral-900 hover-lift disabled:opacity-50 transition-smooth flex items-center gap-md"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              Refresh
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-md bg-error bg-opacity-10 border border-error border-opacity-30 rounded-lg text-error text-sm mb-xl flex items-center justify-between slide-down">
              <span>{getUserFriendlyMessage(error)}</span>
              <button 
                onClick={() => setError(null)}
                className="text-error hover:opacity-70 transition-smooth"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )}

          {/* Recordings Grid */}
          <div className="space-y-lg">
            {loading && recordings.length === 0 ? (
              <div className="text-center py-2xl">
                <div className="inline-block w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mb-md"></div>
                <p className="text-neutral-400">Loading your recordings...</p>
              </div>
            ) : recordings.length === 0 ? (
              <div className="text-center py-2xl">
                <span className="material-symbols-outlined text-6xl text-neutral-700 block mb-md">mic_off</span>
                <p className="text-neutral-300 text-lg mb-md font-medium">No recordings yet</p>
                <p className="text-neutral-400 mb-xl">Start recording to see your audio files here</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-lg py-md bg-accent-600 text-neutral-50 rounded-lg font-semibold text-sm hover-lift transition-smooth"
                >
                  Start Recording
                </button>
              </div>
            ) : (
              recordings.map(recording => (
                <RecordingCard 
                  key={recording.id} 
                  recording={recording} 
                  onDelete={handleDeleteRecording}
                  isDeleting={isDeleting}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => navigate('/')}
        className="fixed bottom-lg right-lg w-16 h-16 bg-accent-600 text-neutral-50 rounded-full shadow-lg flex items-center justify-center hover:bg-accent-700 hover:shadow-xl hover:scale-110 active:scale-95 transition-smooth z-50"
        title="Start recording"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>
    </div>
  );
};

export default LibraryPage;
