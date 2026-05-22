/**
 * Library Page
 * Displays all recordings with playback and management
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
    // Auto-refresh every 3 seconds to show new recordings
    const interval = setInterval(fetchRecordings, 3000);
    return () => clearInterval(interval);
  }, [fetchRecordings]);

  const handleDeleteRecording = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recording?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteRecording(id);
    } catch (err) {
      // Error is already handled in the hook
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Sidebar />
      
      <main className="flex-grow flex flex-col min-w-0 overflow-y-auto">
        <div className="p-margin-desktop space-y-stack-lg max-w-container-max mx-auto w-full pb-32">
          {/* Filters & Stats Bento Grid */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            <div className="md:col-span-8 bg-surface p-6 rounded-xl border border-outline-variant note-card-shadow flex items-center justify-between">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Total Recordings</p>
                <h3 className="font-headline-lg text-headline-lg text-primary">
                  {recordings.length} <span className="text-body-md font-normal text-on-surface-variant">recordings</span>
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={fetchRecordings}
                  disabled={loading}
                  className="px-4 py-2 border border-outline-variant rounded-lg font-label-sm text-label-sm text-on-surface flex items-center gap-2 hover:bg-surface-container transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">refresh</span>
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="md:col-span-4 bg-primary text-on-primary p-6 rounded-xl border border-outline-variant note-card-shadow flex flex-col justify-center">
              <p className="font-label-sm text-label-sm opacity-80 mb-1 uppercase">Active Recording</p>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile font-bold">None currently</h3>
              </div>
            </div>
          </section>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-lg flex items-center justify-between">
              <span>{getUserFriendlyMessage(error)}</span>
              <button 
                onClick={() => setError(null)}
                className="text-on-error-container hover:opacity-70"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )}

          {/* Recordings Grid */}
          <section className="grid grid-cols-1 gap-8">
            {loading && recordings.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-on-surface-variant">Loading recordings...</p>
              </div>
            ) : recordings.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">mic_off</span>
                <p className="text-on-surface-variant text-lg mb-2">No recordings yet</p>
                <p className="text-on-surface-variant">Start recording to see your audio files here</p>
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
          </section>
        </div>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => navigate('/')}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-[60] hover:bg-primary-container"
      >
        <span className="material-symbols-outlined">add</span>
      </button>
    </>
  );
};

export default LibraryPage;